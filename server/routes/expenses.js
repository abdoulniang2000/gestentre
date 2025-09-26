const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/expenses/:site? - Récupérer les dépenses
router.get('/:site?', async (req, res) => {
  try {
    const { site } = req.params;
    let query = `
      SELECT e.*, u.nom as user_nom, u.email as user_email
      FROM expenses e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.deleted_at IS NULL
    `;
    const params = [];

    if (site) {
      query += ' AND e.site = ?';
      params.push(site);
    }

    query += ' ORDER BY e.created_at DESC';

    const expenses = await executeQuery(query, params);

    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dépenses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/expenses/:site - Créer une dépense
router.post('/:site', async (req, res) => {
  try {
    const { site } = req.params;
    const { titre, description, montant, categorie, date_depense, justificatif } = req.body;
    const userId = req.user.id;

    if (!titre || !montant || !date_depense) {
      return res.status(400).json({
        success: false,
        message: 'Les champs titre, montant et date_depense sont obligatoires'
      });
    }

    const result = await executeQuery(
      `INSERT INTO expenses (user_id, titre, description, montant, categorie, date_depense, justificatif, site, statut, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', NOW(), NOW())`,
      [userId, titre, description || '', montant, categorie || '', date_depense, justificatif || '', site]
    );

    const newExpense = await executeQuery(
      `SELECT e.*, u.nom as user_nom, u.email as user_email
       FROM expenses e
       LEFT JOIN users u ON e.user_id = u.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newExpense[0],
      message: 'Dépense créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la dépense:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/expenses/:id/approve - Approuver une dépense
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      'UPDATE expenses SET statut = "approuve", updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Dépense approuvée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'approbation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/expenses/:id/reject - Rejeter une dépense
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      'UPDATE expenses SET statut = "rejete", updated_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Dépense rejetée'
    });
  } catch (error) {
    console.error('Erreur lors du rejet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/expenses/:id - Supprimer une dépense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      'UPDATE expenses SET deleted_at = NOW() WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Dépense supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;