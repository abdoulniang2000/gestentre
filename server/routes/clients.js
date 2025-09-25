const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/clients - Récupérer tous les clients
router.get('/', async (req, res) => {
  try {
    const clients = await executeQuery(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/clients/:id - Récupérer un client par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clients = await executeQuery(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );

    if (clients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    res.json({
      success: true,
      data: clients[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/clients - Créer un nouveau client
router.post('/', async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      telephone,
      adresse,
      ville,
      code_postal,
      pays,
      type_client
    } = req.body;

    // Validation des données requises
    if (!nom || !prenom || !email || !telephone || !adresse || !ville || !code_postal || !pays || !type_client) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingClients = await executeQuery(
      'SELECT id FROM clients WHERE email = ?',
      [email]
    );

    if (existingClients.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un client avec cet email existe déjà'
      });
    }

    const result = await executeQuery(
      `INSERT INTO clients (nom, prenom, email, telephone, adresse, ville, code_postal, pays, type_client, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [nom, prenom, email, telephone, adresse, ville, code_postal, pays, type_client]
    );

    // Récupérer le client créé
    const newClient = await executeQuery(
      'SELECT * FROM clients WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newClient[0],
      message: 'Client créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/clients/:id - Mettre à jour un client
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      prenom,
      email,
      telephone,
      adresse,
      ville,
      code_postal,
      pays,
      type_client
    } = req.body;

    // Vérifier si le client existe
    const existingClients = await executeQuery(
      'SELECT id FROM clients WHERE id = ?',
      [id]
    );

    if (existingClients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Vérifier si l'email existe déjà pour un autre client
    if (email) {
      const emailClients = await executeQuery(
        'SELECT id FROM clients WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailClients.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Un autre client avec cet email existe déjà'
        });
      }
    }

    await executeQuery(
      `UPDATE clients SET 
       nom = COALESCE(?, nom),
       prenom = COALESCE(?, prenom),
       email = COALESCE(?, email),
       telephone = COALESCE(?, telephone),
       adresse = COALESCE(?, adresse),
       ville = COALESCE(?, ville),
       code_postal = COALESCE(?, code_postal),
       pays = COALESCE(?, pays),
       type_client = COALESCE(?, type_client),
       updated_at = NOW()
       WHERE id = ?`,
      [nom, prenom, email, telephone, adresse, ville, code_postal, pays, type_client, id]
    );

    // Récupérer le client mis à jour
    const updatedClient = await executeQuery(
      'SELECT * FROM clients WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedClient[0],
      message: 'Client mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/clients/:id - Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le client existe
    const existingClients = await executeQuery(
      'SELECT id FROM clients WHERE id = ?',
      [id]
    );

    if (existingClients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Vérifier s'il y a des commandes liées à ce client
    const commandes = await executeQuery(
      'SELECT id FROM commandes WHERE client_id = ?',
      [id]
    );

    if (commandes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce client car il a des commandes associées'
      });
    }

    await executeQuery('DELETE FROM clients WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;