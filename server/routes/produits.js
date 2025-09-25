const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/produits - Récupérer tous les produits
router.get('/', async (req, res) => {
  try {
    const produits = await executeQuery(
      'SELECT * FROM produits ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: produits
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// GET /api/produits/:id - Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const produits = await executeQuery(
      'SELECT * FROM produits WHERE id = ?',
      [id]
    );

    if (produits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      data: produits[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/produits - Créer un nouveau produit
router.post('/', async (req, res) => {
  try {
    const {
      nom,
      description,
      prix_unitaire,
      stock_actuel,
      stock_minimum,
      categorie,
      unite_mesure,
      active
    } = req.body;

    // Validation des données requises
    if (!nom || !prix_unitaire || !categorie || stock_actuel === undefined || stock_minimum === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Les champs nom, prix_unitaire, categorie, stock_actuel et stock_minimum sont obligatoires'
      });
    }

    const result = await executeQuery(
      `INSERT INTO produits (nom, description, prix_unitaire, stock_actuel, stock_minimum, categorie, unite_mesure, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [nom, description || '', prix_unitaire, stock_actuel, stock_minimum, categorie, unite_mesure || 'unité', active !== undefined ? active : true]
    );

    // Récupérer le produit créé
    const newProduit = await executeQuery(
      'SELECT * FROM produits WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newProduit[0],
      message: 'Produit créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/produits/:id - Mettre à jour un produit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nom,
      description,
      prix_unitaire,
      stock_actuel,
      stock_minimum,
      categorie,
      unite_mesure,
      active
    } = req.body;

    // Vérifier si le produit existe
    const existingProduits = await executeQuery(
      'SELECT id FROM produits WHERE id = ?',
      [id]
    );

    if (existingProduits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    await executeQuery(
      `UPDATE produits SET 
       nom = COALESCE(?, nom),
       description = COALESCE(?, description),
       prix_unitaire = COALESCE(?, prix_unitaire),
       stock_actuel = COALESCE(?, stock_actuel),
       stock_minimum = COALESCE(?, stock_minimum),
       categorie = COALESCE(?, categorie),
       unite_mesure = COALESCE(?, unite_mesure),
       active = COALESCE(?, active),
       updated_at = NOW()
       WHERE id = ?`,
      [nom, description, prix_unitaire, stock_actuel, stock_minimum, categorie, unite_mesure, active, id]
    );

    // Récupérer le produit mis à jour
    const updatedProduit = await executeQuery(
      'SELECT * FROM produits WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedProduit[0],
      message: 'Produit mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/produits/:id - Supprimer un produit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le produit existe
    const existingProduits = await executeQuery(
      'SELECT id FROM produits WHERE id = ?',
      [id]
    );

    if (existingProduits.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier s'il y a des détails de commande liés à ce produit
    const commandeDetails = await executeQuery(
      'SELECT id FROM commande_details WHERE produit_id = ?',
      [id]
    );

    if (commandeDetails.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer ce produit car il est utilisé dans des commandes'
      });
    }

    await executeQuery('DELETE FROM produits WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;