const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const produitRoutes = require('./routes/produits');
const commandeRoutes = require('./routes/commandes');
const employeRoutes = require('./routes/employes');
const factureRoutes = require('./routes/factures');
const interventionRoutes = require('./routes/interventions');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Origines spécifiques
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/employes', employeRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/dashboard', dashboardRoutes);


// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API gestentre fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await testConnection();
    
    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 API disponible sur: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();