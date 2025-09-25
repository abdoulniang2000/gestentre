const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/employes - Récupérer tous les employés
router.get('/', async (req, res) => {
  try {
    const employes = await executeQuery(
      'SELECT * FROM employes ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: employes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/employes/:id - Récupérer un employé par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const employes = await executeQuery(
      'SELECT * FROM employes WHERE id = ?',
      [id]
    );

    if (employes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    res.json({
      success: true,
      data: employes[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/employes - Créer un nouvel employé
router.post('/', async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      telephone,
      poste,
      departement,
      salaire,
      date_embauche,
      statut
    } = req.body;

    // Validation des données requises
    if (!nom || !prenom || !email || !telephone || !poste || !departement || !salaire || !date_embauche) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    // Vérifier si l'email existe déjà
    const existingEmployes = await executeQuery(
      'SELECT id FROM employes WHERE email = ?',
      [email]
    );

    if (existingEmployes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un employé avec cet email existe déjà'
      });
    }

    const result = await executeQuery(
      `INSERT INTO employes (nom, prenom, email, telephone, poste, departement, salaire, date_embauche, statut, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [nom, prenom, email, telephone, poste, departement, salaire, date_embauche, statut || 'actif']
    );

    // Récupérer l'employé créé
    const newEmploye = await executeQuery(
      'SELECT * FROM employes WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newEmploye[0],
      message: 'Employé créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/employes/:id - Mettre à jour un employé
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      prenom,
      email,
      telephone,
      poste,
      departement,
      salaire,
      date_embauche,
      statut
    } = req.body;

    // Vérifier si l'employé existe
    const existingEmployes = await executeQuery(
      'SELECT id FROM employes WHERE id = ?',
      [id]
    );

    if (existingEmployes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    // Vérifier si l'email existe déjà pour un autre employé
    if (email) {
      const emailEmployes = await executeQuery(
        'SELECT id FROM employes WHERE email = ? AND id != ?',
        [email, id]
      );

      if (emailEmployes.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Un autre employé avec cet email existe déjà'
        });
      }
    }

    await executeQuery(
      `UPDATE employes SET 
       nom = COALESCE(?, nom),
       prenom = COALESCE(?, prenom),
       email = COALESCE(?, email),
       telephone = COALESCE(?, telephone),
       poste = COALESCE(?, poste),
       departement = COALESCE(?, departement),
       salaire = COALESCE(?, salaire),
       date_embauche = COALESCE(?, date_embauche),
       statut = COALESCE(?, statut),
       updated_at = NOW()
       WHERE id = ?`,
      [nom, prenom, email, telephone, poste, departement, salaire, date_embauche, statut, id]
    );

    // Récupérer l'employé mis à jour
    const updatedEmploye = await executeQuery(
      'SELECT * FROM employes WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedEmploye[0],
      message: 'Employé mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/employes/:id - Supprimer un employé
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'employé existe
    const existingEmployes = await executeQuery(
      'SELECT id FROM employes WHERE id = ?',
      [id]
    );

    if (existingEmployes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }

    // Vérifier s'il y a des interventions liées à cet employé
    const interventions = await executeQuery(
      'SELECT id FROM interventions WHERE employe_id = ?',
      [id]
    );

    if (interventions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cet employé car il a des interventions associées'
      });
    }

    await executeQuery('DELETE FROM employes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Employé supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;