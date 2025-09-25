const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/interventions - Récupérer toutes les interventions
router.get('/', async (req, res) => {
  try {
    const interventions = await executeQuery(`
      SELECT i.*, 
             c.nom as client_nom, c.prenom as client_prenom, c.email as client_email, c.telephone as client_telephone,
             e.nom as employe_nom, e.prenom as employe_prenom, e.poste as employe_poste
      FROM interventions i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN employes e ON i.employe_id = e.id
      ORDER BY i.date_intervention DESC, i.heure_debut DESC
    `);

    res.json({
      success: true,
      data: interventions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des interventions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/interventions/:id - Récupérer une intervention par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const interventions = await executeQuery(`
      SELECT i.*, 
             c.nom as client_nom, c.prenom as client_prenom, c.email as client_email, c.telephone as client_telephone,
             e.nom as employe_nom, e.prenom as employe_prenom, e.poste as employe_poste
      FROM interventions i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN employes e ON i.employe_id = e.id
      WHERE i.id = ?
    `, [id]);

    if (interventions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Intervention non trouvée'
      });
    }

    res.json({
      success: true,
      data: interventions[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'intervention:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/interventions - Créer une nouvelle intervention
router.post('/', async (req, res) => {
  try {
    const {
      client_id,
      employe_id,
      titre,
      description,
      date_intervention,
      heure_debut,
      heure_fin,
      statut,
      priorite,
      cout,
      notes
    } = req.body;

    // Validation des données requises
    if (!client_id || !employe_id || !titre || !date_intervention || !heure_debut) {
      return res.status(400).json({
        success: false,
        message: 'Les champs client_id, employe_id, titre, date_intervention et heure_debut sont obligatoires'
      });
    }

    // Vérifier que le client existe
    const clients = await executeQuery('SELECT id FROM clients WHERE id = ?', [client_id]);
    if (clients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Vérifier que l'employé existe
    const employes = await executeQuery('SELECT id FROM employes WHERE id = ?', [employe_id]);
    if (employes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    const result = await executeQuery(
      `INSERT INTO interventions (client_id, employe_id, titre, description, date_intervention, heure_debut, heure_fin, statut, priorite, cout, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [client_id, employe_id, titre, description || '', date_intervention, heure_debut, heure_fin || null, statut || 'planifiee', priorite || 'normale', cout || 0, notes || '']
    );

    // Récupérer l'intervention créée
    const newIntervention = await executeQuery(`
      SELECT i.*, 
             c.nom as client_nom, c.prenom as client_prenom, c.email as client_email, c.telephone as client_telephone,
             e.nom as employe_nom, e.prenom as employe_prenom, e.poste as employe_poste
      FROM interventions i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN employes e ON i.employe_id = e.id
      WHERE i.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      data: newIntervention[0],
      message: 'Intervention créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'intervention:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/interventions/:id - Mettre à jour une intervention
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_id,
      employe_id,
      titre,
      description,
      date_intervention,
      heure_debut,
      heure_fin,
      statut,
      priorite,
      cout,
      notes
    } = req.body;

    // Vérifier si l'intervention existe
    const existingInterventions = await executeQuery(
      'SELECT id FROM interventions WHERE id = ?',
      [id]
    );

    if (existingInterventions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Intervention non trouvée'
      });
    }

    await executeQuery(
      `UPDATE interventions SET 
       client_id = COALESCE(?, client_id),
       employe_id = COALESCE(?, employe_id),
       titre = COALESCE(?, titre),
       description = COALESCE(?, description),
       date_intervention = COALESCE(?, date_intervention),
       heure_debut = COALESCE(?, heure_debut),
       heure_fin = COALESCE(?, heure_fin),
       statut = COALESCE(?, statut),
       priorite = COALESCE(?, priorite),
       cout = COALESCE(?, cout),
       notes = COALESCE(?, notes),
       updated_at = NOW()
       WHERE id = ?`,
      [client_id, employe_id, titre, description, date_intervention, heure_debut, heure_fin, statut, priorite, cout, notes, id]
    );

    // Récupérer l'intervention mise à jour
    const updatedIntervention = await executeQuery(`
      SELECT i.*, 
             c.nom as client_nom, c.prenom as client_prenom, c.email as client_email, c.telephone as client_telephone,
             e.nom as employe_nom, e.prenom as employe_prenom, e.poste as employe_poste
      FROM interventions i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN employes e ON i.employe_id = e.id
      WHERE i.id = ?
    `, [id]);

    res.json({
      success: true,
      data: updatedIntervention[0],
      message: 'Intervention mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'intervention:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/interventions/:id - Supprimer une intervention
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'intervention existe
    const existingInterventions = await executeQuery(
      'SELECT id FROM interventions WHERE id = ?',
      [id]
    );

    if (existingInterventions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Intervention non trouvée'
      });
    }

    await executeQuery('DELETE FROM interventions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Intervention supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'intervention:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;