const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/work-locations - Récupérer tous les lieux de travail
router.get('/', async (req, res) => {
  try {
    const locations = await executeQuery(
      'SELECT * FROM work_locations WHERE is_active = TRUE ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des lieux:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/work-locations - Créer un lieu de travail
router.post('/', async (req, res) => {
  try {
    const { name, address, latitude, longitude, radius, type } = req.body;

    if (!name || !latitude || !longitude || !radius) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name, latitude, longitude et radius sont obligatoires'
      });
    }

    const result = await executeQuery(
      `INSERT INTO work_locations (name, address, latitude, longitude, radius, type, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
      [name, address || '', latitude, longitude, radius, type || 'bureau']
    );

    const newLocation = await executeQuery(
      'SELECT * FROM work_locations WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newLocation[0],
      message: 'Lieu de travail créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du lieu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;