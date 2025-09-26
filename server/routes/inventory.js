const express = require('express');
const { executeQuery } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// GET /api/inventory - Récupérer tous les articles d'inventaire
router.get('/', async (req, res) => {
  try {
    const items = await executeQuery(
      'SELECT * FROM inventory_items ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inventaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/inventory - Créer un article d'inventaire
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      reference,
      category_id,
      quantity,
      unit,
      prix_achat,
      prix_vente,
      seuil_alerte,
      fournisseur,
      emplacement
    } = req.body;

    if (!name || !quantity || !unit || !seuil_alerte) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name, quantity, unit et seuil_alerte sont obligatoires'
      });
    }

    const result = await executeQuery(
      `INSERT INTO inventory_items (name, description, reference, category_id, quantity, unit, prix_achat, prix_vente, seuil_alerte, fournisseur, emplacement, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, description || '', reference || '', category_id || null, quantity, unit, prix_achat || 0, prix_vente || 0, seuil_alerte, fournisseur || '', emplacement || '']
    );

    const newItem = await executeQuery(
      'SELECT * FROM inventory_items WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newItem[0],
      message: 'Article d\'inventaire créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'article:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// PUT /api/inventory/:id - Mettre à jour un article
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      reference,
      category_id,
      quantity,
      unit,
      prix_achat,
      prix_vente,
      seuil_alerte,
      fournisseur,
      emplacement
    } = req.body;

    await executeQuery(
      `UPDATE inventory_items SET 
       name = COALESCE(?, name),
       description = COALESCE(?, description),
       reference = COALESCE(?, reference),
       category_id = COALESCE(?, category_id),
       quantity = COALESCE(?, quantity),
       unit = COALESCE(?, unit),
       prix_achat = COALESCE(?, prix_achat),
       prix_vente = COALESCE(?, prix_vente),
       seuil_alerte = COALESCE(?, seuil_alerte),
       fournisseur = COALESCE(?, fournisseur),
       emplacement = COALESCE(?, emplacement),
       updated_at = NOW()
       WHERE id = ?`,
      [name, description, reference, category_id, quantity, unit, prix_achat, prix_vente, seuil_alerte, fournisseur, emplacement, id]
    );

    const updatedItem = await executeQuery(
      'SELECT * FROM inventory_items WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedItem[0],
      message: 'Article mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// DELETE /api/inventory/:id - Supprimer un article
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery('DELETE FROM inventory_items WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Article supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/inventory/:id/update-quantity - Mettre à jour la quantité
router.post('/:id/update-quantity', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    await executeQuery(
      'UPDATE inventory_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [quantity, id]
    );

    const updatedItem = await executeQuery(
      'SELECT * FROM inventory_items WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedItem[0],
      message: 'Quantité mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la quantité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

// POST /api/inventory/outbound - Sortie de stock
router.post('/outbound', async (req, res) => {
  try {
    const { item_id, quantity, reason } = req.body;

    // Vérifier le stock disponible
    const item = await executeQuery(
      'SELECT * FROM inventory_items WHERE id = ?',
      [item_id]
    );

    if (item.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article non trouvé'
      });
    }

    if (item[0].quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuffisant'
      });
    }

    // Mettre à jour la quantité
    const newQuantity = item[0].quantity - quantity;
    await executeQuery(
      'UPDATE inventory_items SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [newQuantity, item_id]
    );

    res.json({
      success: true,
      message: 'Sortie de stock enregistrée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la sortie de stock:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;