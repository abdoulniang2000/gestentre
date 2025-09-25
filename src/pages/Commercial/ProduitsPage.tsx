import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { produitService } from '../../services/api';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import type { Produit } from '../../types';

const ProduitsPage: React.FC = () => {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix_unitaire: 0,
    stock_actuel: 0,
    stock_minimum: 0,
    categorie: '',
    unite_mesure: 'unité',
    active: true,
  });

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      const response = await produitService.getAll();
      if (response.success && response.data) {
        setProduits(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduit) {
        await produitService.update(editingProduit.id, formData);
      } else {
        await produitService.create(formData);
      }
      await loadProduits();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (produit: Produit) => {
    setEditingProduit(produit);
    setFormData({
      nom: produit.nom,
      description: produit.description,
      prix_unitaire: produit.prix_unitaire,
      stock_actuel: produit.stock_actuel,
      stock_minimum: produit.stock_minimum,
      categorie: produit.categorie,
      unite_mesure: produit.unite_mesure,
      active: produit.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await produitService.delete(id);
        await loadProduits();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduit(null);
    setFormData({
      nom: '',
      description: '',
      prix_unitaire: 0,
      stock_actuel: 0,
      stock_minimum: 0,
      categorie: '',
      unite_mesure: 'unité',
      active: true,
    });
  };

  const columns = [
    {
      key: 'nom',
      label: 'Produit',
      render: (_value: string, row: Produit) => (
        <div>
          <div className="font-medium flex items-center">
            <Package className="w-4 h-4 mr-2 text-gray-400" />
            {row.nom}
          </div>
          <div className="text-sm text-gray-500">{row.categorie}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {value}
        </div>
      ),
    },
    {
      key: 'prix_unitaire',
      label: 'Prix unitaire',
      render: (value: number, row: Produit) => (
        <div>
          <div className="font-medium">{value.toFixed(2)} €</div>
          <div className="text-sm text-gray-500">par {row.unite_mesure}</div>
        </div>
      ),
    },
    {
      key: 'stock_actuel',
      label: 'Stock',
      render: (value: number, row: Produit) => (
        <div>
          <div className={`font-medium ${value <= row.stock_minimum ? 'text-red-600' : 'text-green-600'}`}>
            {value} {row.unite_mesure}
          </div>
          {value <= row.stock_minimum && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Stock faible
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'active',
      label: 'Statut',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Produit) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(row)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Produits</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      <Table columns={columns} data={produits} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <input
                type="text"
                required
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité de mesure *
              </label>
              <select
                required
                value={formData.unite_mesure}
                onChange={(e) => setFormData({ ...formData, unite_mesure: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unité">Unité</option>
                <option value="kg">Kilogramme</option>
                <option value="litre">Litre</option>
                <option value="mètre">Mètre</option>
                <option value="m²">Mètre carré</option>
                <option value="m³">Mètre cube</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix unitaire (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.prix_unitaire}
                onChange={(e) => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock actuel *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock_actuel}
                onChange={(e) => setFormData({ ...formData, stock_actuel: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock minimum *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock_minimum}
                onChange={(e) => setFormData({ ...formData, stock_minimum: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Produit actif
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingProduit ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProduitsPage;