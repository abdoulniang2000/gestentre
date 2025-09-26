const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/salary-advances - Récupérer toutes les avances
router.get('/', async (req, res) => {
  try {
    const advances = await executeQuery(`
      SELECT sa.*, u.nom as user_nom, u.email as user_email,
             au.nom as approved_by_nom
      FROM salary_advances sa
      LEFT JOIN users u ON sa.user_id = u.id
      LEFT JOIN users au ON sa.approved_by_id = au.id
      ORDER BY sa.created_at DESC
    `);

    res.json({
      success: true,
      data: advances
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avances:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/salary-advances - Créer une demande d'avance
router.post('/', async (req, res) => {
  try {
    const { montant, motif } = req.body;
    const userId = req.user.id;

    if (!montant || !motif) {
      return res.status(400).json({
        success: false,
        message: 'Les champs montant et motif sont obligatoires'
      });
    }

    const result = await executeQuery(
      `INSERT INTO salary_advances (user_id, montant, motif, date_demande, statut, created_at, updated_at)
       VALUES (?, ?, ?, CURDATE(), 'en_attente', NOW(), NOW())`,
      [userId, montant, motif]
    );

    const newAdvance = await executeQuery(
      `SELECT sa.*, u.nom as user_nom, u.email as user_email
       FROM salary_advances sa
       LEFT JOIN users u ON sa.user_id = u.id
       WHERE sa.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newAdvance[0],
      message: 'Demande d\'avance créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la demande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/salary-advances/:id/approve - Approuver une avance
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes_admin } = req.body;

    await executeQuery(
      `UPDATE salary_advances SET 
       statut = 'approuve',
       approved_at = NOW(),
       approved_by_id = ?,
       notes_admin = ?,
       updated_at = NOW()
       WHERE id = ?`,
      [req.user.id, notes_admin || '', id]
    );

    res.json({
      success: true,
      message: 'Avance approuvée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/salary-advances/:id/refuse - Refuser une avance
router.post('/:id/refuse', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes_admin } = req.body;

    await executeQuery(
      `UPDATE salary_advances SET 
       statut = 'refuse',
       approved_by_id = ?,
       notes_admin = ?,
       updated_at = NOW()
       WHERE id = ?`,
      [req.user.id, notes_admin || '', id]
    );

    res.json({
      success: true,
      message: 'Avance refusée'
    });
  } catch (error) {
    console.error('Erreur lors du refus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;