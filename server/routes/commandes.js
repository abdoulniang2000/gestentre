const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/commandes - Récupérer toutes les commandes
router.get('/', async (req, res) => {
  try {
    const commandes = await executeQuery(`
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.email as client_email
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.created_at DESC
    `);

    res.json({
      success: true,
      data: commandes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/commandes/:id - Récupérer une commande par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const commandes = await executeQuery(`
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.email as client_email
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = ?
    `, [id]);

    if (commandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Récupérer les détails de la commande
    const details = await executeQuery(`
      SELECT cd.*, p.nom as produit_nom, p.description as produit_description
      FROM commande_details cd
      LEFT JOIN produits p ON cd.produit_id = p.id
      WHERE cd.commande_id = ?
    `, [id]);

    const commande = commandes[0];
    commande.details = details;

    res.json({
      success: true,
      data: commande
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/commandes - Créer une nouvelle commande
router.post('/', async (req, res) => {
  try {
    const {
      client_id,
      numero_commande,
      date_commande,
      statut,
      montant_total,
      notes,
      details
    } = req.body;

    // Validation des données requises
    if (!client_id || !date_commande || montant_total === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Les champs client_id, date_commande et montant_total sont obligatoires'
      });
    }

    // Générer un numéro de commande si non fourni
    let finalNumeroCommande = numero_commande;
    if (!finalNumeroCommande) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      finalNumeroCommande = `CMD-${year}${month}${day}-${random}`;
    }

    // Vérifier que le client existe
    const clients = await executeQuery('SELECT id FROM clients WHERE id = ?', [client_id]);
    if (clients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    const result = await executeQuery(
      `INSERT INTO commandes (client_id, numero_commande, date_commande, statut, montant_total, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [client_id, finalNumeroCommande, date_commande, statut || 'en_attente', montant_total, notes || '']
    );

    const commandeId = result.insertId;

    // Ajouter les détails de la commande si fournis
    if (details && Array.isArray(details)) {
      for (const detail of details) {
        await executeQuery(
          `INSERT INTO commande_details (commande_id, produit_id, quantite, prix_unitaire, sous_total, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [commandeId, detail.produit_id, detail.quantite, detail.prix_unitaire, detail.sous_total]
        );
      }
    }

    // Récupérer la commande créée
    const newCommande = await executeQuery(`
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.email as client_email
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = ?
    `, [commandeId]);

    res.status(201).json({
      success: true,
      data: newCommande[0],
      message: 'Commande créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/commandes/:id - Mettre à jour une commande
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      numero_commande,
      date_commande,
      statut,
      montant_total,
      notes
    } = req.body;

    // Vérifier si la commande existe
    const existingCommandes = await executeQuery(
      'SELECT id FROM commandes WHERE id = ?',
      [id]
    );

    if (existingCommandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    await executeQuery(
      `UPDATE commandes SET 
       client_id = COALESCE(?, client_id),
       numero_commande = COALESCE(?, numero_commande),
       date_commande = COALESCE(?, date_commande),
       statut = COALESCE(?, statut),
       montant_total = COALESCE(?, montant_total),
       notes = COALESCE(?, notes),
       updated_at = NOW()
       WHERE id = ?`,
      [client_id, numero_commande, date_commande, statut, montant_total, notes, id]
    );

    // Récupérer la commande mise à jour
    const updatedCommande = await executeQuery(`
      SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom, cl.email as client_email
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.id = ?
    `, [id]);

    res.json({
      success: true,
      data: updatedCommande[0],
      message: 'Commande mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/commandes/:id - Supprimer une commande
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la commande existe
    const existingCommandes = await executeQuery(
      'SELECT id FROM commandes WHERE id = ?',
      [id]
    );

    if (existingCommandes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    // Vérifier s'il y a des factures liées à cette commande
    const factures = await executeQuery(
      'SELECT id FROM factures WHERE commande_id = ?',
      [id]
    );

    if (factures.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cette commande car elle a des factures associées'
      });
    }

    // Supprimer d'abord les détails de la commande
    await executeQuery('DELETE FROM commande_details WHERE commande_id = ?', [id]);
    
    // Puis supprimer la commande
    await executeQuery('DELETE FROM commandes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Commande supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;