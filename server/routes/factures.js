const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/factures - Récupérer toutes les factures
router.get('/', async (req, res) => {
  try {
    const factures = await executeQuery(`
      SELECT f.*, c.numero_commande, c.client_id,
             cl.nom as client_nom, cl.prenom as client_prenom, cl.email as client_email
      FROM factures f
      LEFT JOIN commandes c ON f.commande_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY f.created_at DESC
    `);

    res.json({
      success: true,
      data: factures
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/factures/:id - Récupérer une facture par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const factures = await executeQuery(`
      SELECT f.*, c.numero_commande, c.client_id,
             cl.nom as client_nom, cl.prenom as client_prenom, cl.email as client_email
      FROM factures f
      LEFT JOIN commandes c ON f.commande_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE f.id = ?
    `, [id]);

    if (factures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    res.json({
      success: true,
      data: factures[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/factures - Créer une nouvelle facture
router.post('/', async (req, res) => {
  try {
    const {
      commande_id,
      numero_facture,
      date_facture,
      date_echeance,
      montant_ht,
      tva,
      montant_ttc,
      statut
    } = req.body;

    // Validation des données requises
    if (!commande_id || !date_facture || montant_ht === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Les champs commande_id, date_facture et montant_ht sont obligatoires'
      });
    }

    // Générer un numéro de facture si non fourni
    let finalNumeroFacture = numero_facture;
    if (!finalNumeroFacture) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      finalNumeroFacture = `FAC-${year}${month}-${random}`;
    }

    // Calculer la date d'échéance si non fournie (30 jours par défaut)
    let finalDateEcheance = date_echeance;
    if (!finalDateEcheance) {
      const echeance = new Date(date_facture);
      echeance.setDate(echeance.getDate() + 30);
      finalDateEcheance = echeance.toISOString().split('T')[0];
    }

    // Calculer le montant TTC si non fourni
    const finalTva = tva || 20;
    const finalMontantTtc = montant_ttc || (montant_ht * (1 + finalTva / 100));

    // Vérifier que la commande existe
    const commandes = await executeQuery('SELECT id FROM commandes WHERE id = ?', [commande_id]);
    if (commandes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    const result = await executeQuery(
      `INSERT INTO factures (commande_id, numero_facture, date_facture, date_echeance, montant_ht, tva, montant_ttc, statut, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [commande_id, finalNumeroFacture, date_facture, finalDateEcheance, montant_ht, finalTva, finalMontantTtc, statut || 'brouillon']
    );

    // Récupérer la facture créée
    const newFacture = await executeQuery(`
      SELECT f.*, c.numero_commande, c.client_id,
             cl.nom as client_nom, cl.prenom as client_prenom, cl.email as client_email
      FROM factures f
      LEFT JOIN commandes c ON f.commande_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE f.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newFacture[0],
      message: 'Facture créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/factures/:id - Mettre à jour une facture
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      commande_id,
      numero_facture,
      date_facture,
      date_echeance,
      montant_ht,
      tva,
      montant_ttc,
      statut
    } = req.body;

    // Vérifier si la facture existe
    const existingFactures = await executeQuery(
      'SELECT id FROM factures WHERE id = ?',
      [id]
    );

    if (existingFactures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    await executeQuery(
      `UPDATE factures SET 
       commande_id = COALESCE(?, commande_id),
       numero_facture = COALESCE(?, numero_facture),
       date_facture = COALESCE(?, date_facture),
       date_echeance = COALESCE(?, date_echeance),
       montant_ht = COALESCE(?, montant_ht),
       tva = COALESCE(?, tva),
       montant_ttc = COALESCE(?, montant_ttc),
       statut = COALESCE(?, statut),
       updated_at = NOW()
       WHERE id = ?`,
      [commande_id, numero_facture, date_facture, date_echeance, montant_ht, tva, montant_ttc, statut, id]
    );

    // Récupérer la facture mise à jour
    const updatedFacture = await executeQuery(`
      SELECT f.*, c.numero_commande, c.client_id,
             cl.nom as client_nom, cl.prenom as client_prenom, cl.email as client_email
      FROM factures f
      LEFT JOIN commandes c ON f.commande_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE f.id = ?
    `, [id]);

    res.json({
      success: true,
      data: updatedFacture[0],
      message: 'Facture mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/factures/:id - Supprimer une facture
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la facture existe
    const existingFactures = await executeQuery(
      'SELECT id FROM factures WHERE id = ?',
      [id]
    );

    if (existingFactures.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facture non trouvée'
      });
    }

    // Vérifier s'il y a des paiements liés à cette facture
    const paiements = await executeQuery(
      'SELECT id FROM paiements WHERE facture_id = ?',
      [id]
    );

    if (paiements.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cette facture car elle a des paiements associés'
      });
    }

    await executeQuery('DELETE FROM factures WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;