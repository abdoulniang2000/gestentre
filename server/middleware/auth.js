const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token d\'accès requis' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token décodé:', decoded);
    
    // Vérifier si l'utilisateur existe toujours
    const users = await executeQuery(
      'SELECT id, nom, email, role FROM users WHERE id = ? AND active = 1',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non trouvé ou inactif' 
      });
    }

    console.log('Utilisateur authentifié:', users[0]);
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token invalide' 
    });
  }
};

module.exports = { authenticateToken };