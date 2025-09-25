const mysql = require('mysql2');
require('dotenv').config();

// Configuration de la connexion MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestentre',
  port: process.env.DB_PORT || 3306,
  connectTimeout: 60000, // Seule cette option est valide pour les connexions
  // Retirez acquireTimeout, timeout, reconnect qui ne sont pas valides
};

// Créer une fonction pour obtenir une nouvelle connexion
const getConnection = () => {
  return mysql.createConnection(dbConfig);
};

// Fonction pour exécuter des requêtes avec une nouvelle connexion à chaque fois
const executeQuery = async (sql, params = []) => {
  const connection = getConnection();
  
  return new Promise((resolve, reject) => {
    connection.execute(sql, params, (error, results) => {
      connection.end(); // Fermer la connexion après usage
      
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Tester la connexion
const testConnection = async () => {
  try {
    const connection = getConnection();
    await connection.promise().execute('SELECT 1');
    console.log('✅ Connexion MySQL établie avec succès');
    connection.end();
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = {
  executeQuery,
  testConnection
};