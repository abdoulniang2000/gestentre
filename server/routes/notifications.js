const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/notifications - Récupérer toutes les notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await executeQuery(`
      SELECT n.*, u.nom as user_nom
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/notifications/:id/read - Marquer comme lu
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;