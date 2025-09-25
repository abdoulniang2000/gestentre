const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/dashboard/stats - Récupérer les statistiques du dashboard
router.get('/stats', async (req, res) => {
  try {
    // Récupérer les statistiques principales
    const [
      clientsCount,
      commandesCount,
      employesCount,
      facturesCount,
      interventionsCount,
      chiffreAffaires,
      commandesRecentes,
      interventionsRecentes
    ] = await Promise.all([
      executeQuery('SELECT COUNT(*) as count FROM clients'),
      executeQuery('SELECT COUNT(*) as count FROM commandes'),
      executeQuery('SELECT COUNT(*) as count FROM employes WHERE statut = "actif"'),
      executeQuery('SELECT COUNT(*) as count FROM factures'),
      executeQuery('SELECT COUNT(*) as count FROM interventions WHERE statut = "planifiee"'),
      executeQuery('SELECT SUM(montant_ttc) as total FROM factures WHERE statut = "payee"'),
      executeQuery(`
        SELECT c.*, cl.nom as client_nom, cl.prenom as client_prenom 
        FROM commandes c 
        LEFT JOIN clients cl ON c.client_id = cl.id 
        ORDER BY c.created_at DESC 
        LIMIT 5
      `),
      executeQuery(`
        SELECT i.*, c.nom as client_nom, c.prenom as client_prenom, e.nom as employe_nom, e.prenom as employe_prenom
        FROM interventions i
        LEFT JOIN clients c ON i.client_id = c.id
        LEFT JOIN employes e ON i.employe_id = e.id
        WHERE i.date_intervention >= CURDATE()
        ORDER BY i.date_intervention ASC, i.heure_debut ASC
        LIMIT 5
      `)
    ]);

    // Statistiques par statut de commande
    const commandesParStatut = await executeQuery(`
      SELECT statut, COUNT(*) as count 
      FROM commandes 
      GROUP BY statut
    `);

    // Statistiques par priorité d'intervention
    const interventionsParPriorite = await executeQuery(`
      SELECT priorite, COUNT(*) as count 
      FROM interventions 
      WHERE statut != 'terminee' AND statut != 'annulee'
      GROUP BY priorite
    `);

    // Factures en retard
    const facturesEnRetard = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM factures 
      WHERE date_echeance < CURDATE() AND statut != 'payee'
    `);

    // Produits en stock faible
    const produitsStockFaible = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM produits 
      WHERE stock_actuel <= stock_minimum AND active = 1
    `);

    const stats = {
      totalClients: clientsCount[0].count,
      totalCommandes: commandesCount[0].count,
      totalEmployes: employesCount[0].count,
      totalFactures: facturesCount[0].count,
      interventionsPlanifiees: interventionsCount[0].count,
      chiffreAffaires: chiffreAffaires[0].total || 0,
      facturesEnRetard: facturesEnRetard[0].count,
      produitsStockFaible: produitsStockFaible[0].count,
      commandesParStatut: commandesParStatut.reduce((acc, item) => {
        acc[item.statut] = item.count;
        return acc;
      }, {}),
      interventionsParPriorite: interventionsParPriorite.reduce((acc, item) => {
        acc[item.priorite] = item.count;
        return acc;
      }, {}),
      commandesRecentes: commandesRecentes,
      interventionsRecentes: interventionsRecentes
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/dashboard/activities - Récupérer les activités récentes
router.get('/activities', async (req, res) => {
  try {
    const activities = [];

    // Commandes récentes
    const commandesRecentes = await executeQuery(`
      SELECT 'commande' as type, c.id, c.numero_commande as reference, c.created_at, 
             CONCAT(cl.nom, ' ', cl.prenom) as client_nom
      FROM commandes c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    // Factures récentes
    const facturesRecentes = await executeQuery(`
      SELECT 'facture' as type, f.id, f.numero_facture as reference, f.created_at,
             CONCAT(cl.nom, ' ', cl.prenom) as client_nom
      FROM factures f
      LEFT JOIN commandes c ON f.commande_id = c.id
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY f.created_at DESC
      LIMIT 10
    `);

    // Interventions récentes
    const interventionsRecentes = await executeQuery(`
      SELECT 'intervention' as type, i.id, i.titre as reference, i.created_at,
             CONCAT(cl.nom, ' ', cl.prenom) as client_nom
      FROM interventions i
      LEFT JOIN clients cl ON i.client_id = cl.id
      WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY i.created_at DESC
      LIMIT 10
    `);

    // Combiner toutes les activités
    activities.push(...commandesRecentes, ...facturesRecentes, ...interventionsRecentes);

    // Trier par date de création
    activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: activities.slice(0, 20) // Limiter à 20 activités
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des activités:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;