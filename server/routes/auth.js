const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database'); // Modifier cette ligne
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur
    const users = await executeQuery(
      'SELECT id, nom, email, password, role FROM users WHERE email = ? AND active = 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Mettre à jour la dernière connexion
    await executeQuery( // Modifier cette ligne
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user.id,
      nom: user.nom,
      email: user.email,
      role: user.role
    };

    res.json({
      success: true,
      data: {
        user: userData,
        token: token
      },
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route pour obtenir les informations de l'utilisateur connecté
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// Route de déconnexion (optionnelle - côté client principalement)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Ici vous pourriez ajouter une logique pour invalider le token
    // Par exemple, l'ajouter à une blacklist en base de données
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;