const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/attendance - Récupérer tous les pointages
router.get('/', async (req, res) => {
  try {
    const attendances = await executeQuery(`
      SELECT a.*, u.nom as user_nom, u.email as user_email,
             wl.name as work_location_name
      FROM attendance a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN work_locations wl ON a.work_location_id = wl.id
      ORDER BY a.date DESC, a.check_in DESC
    `);

    res.json({
      success: true,
      data: attendances
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pointages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/attendance/check-in - Pointer l'arrivée
router.post('/check-in', async (req, res) => {
  try {
    const { latitude, longitude, location_name } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Vérifier s'il y a déjà un pointage aujourd'hui
    const existingAttendance = await executeQuery(
      'SELECT id FROM attendance WHERE user_id = ? AND date = ?',
      [userId, today]
    );

    if (existingAttendance.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà pointé aujourd\'hui'
      });
    }

    const result = await executeQuery(
      `INSERT INTO attendance (user_id, date, check_in, check_in_location, check_in_lat, check_in_lng, created_at, updated_at)
       VALUES (?, ?, NOW(), ?, ?, ?, NOW(), NOW())`,
      [userId, today, location_name || '', latitude, longitude]
    );

    const newAttendance = await executeQuery(
      'SELECT * FROM attendance WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newAttendance[0],
      message: 'Pointage d\'arrivée enregistré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du pointage d\'arrivée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/attendance/check-out - Pointer la sortie
router.post('/check-out', async (req, res) => {
  try {
    const { latitude, longitude, location } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Trouver le pointage d'aujourd'hui
    const attendance = await executeQuery(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ? AND check_out IS NULL',
      [userId, today]
    );

    if (attendance.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun pointage d\'arrivée trouvé pour aujourd\'hui'
      });
    }

    // Calculer les heures travaillées
    const checkIn = new Date(`${today}T${attendance[0].check_in}`);
    const checkOut = new Date();
    const totalHours = (checkOut - checkIn) / (1000 * 60 * 60);

    await executeQuery(
      `UPDATE attendance SET 
       check_out = NOW(),
       check_out_location = ?,
       check_out_lat = ?,
       check_out_lng = ?,
       total_hours = ?,
       updated_at = NOW()
       WHERE id = ?`,
      [location || '', latitude, longitude, totalHours, attendance[0].id]
    );

    const updatedAttendance = await executeQuery(
      'SELECT * FROM attendance WHERE id = ?',
      [attendance[0].id]
    );

    res.json({
      success: true,
      data: updatedAttendance[0],
      message: 'Pointage de sortie enregistré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du pointage de sortie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/attendance/justify-late - Justifier un retard
router.post('/justify-late', async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    await executeQuery(
      `UPDATE attendance SET 
       notes = ?,
       updated_at = NOW()
       WHERE user_id = ? AND date = ?`,
      [reason, userId, today]
    );

    res.json({
      success: true,
      message: 'Justification de retard enregistrée'
    });
  } catch (error) {
    console.error('Erreur lors de la justification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;