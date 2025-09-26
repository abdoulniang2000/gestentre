import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, Download, Upload, Eye } from 'lucide-react';
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

  const handleView = (produit: Produit) => {
    // Implémentez la visualisation détaillée
    console.log('Voir produit:', produit);
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

  const getStockStatus = (stockActuel: number, stockMinimum: number) => {
    if (stockActuel === 0) {
      return { badge: 'bg-danger', text: 'text-danger', label: 'Rupture' };
    } else if (stockActuel <= stockMinimum) {
      return { badge: 'bg-warning', text: 'text-warning', label: 'Stock faible' };
    } else {
      return { badge: 'bg-success', text: 'text-success', label: 'En stock' };
    }
  };

  const columns = [
    {
      key: 'nom',
      label: 'Produit',
      render: (_value: string, row: Produit) => (
        <div>
          <div className="fw-semibold d-flex align-items-center">
            <Package className="text-muted me-2" size={16} />
            {row.nom}
          </div>
          <div className="text-muted small">{row.categorie}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <div className="text-muted small" style={{ maxWidth: '200px' }}>
          {value || '-'}
        </div>
      ),
    },
    {
      key: 'prix_unitaire',
      label: 'Prix unitaire',
      render: (value: number, row: Produit) => (
        <div>
          <div className="fw-bold text-dark">{value.toFixed(2)} €</div>
          <div className="text-muted small">par {row.unite_mesure}</div>
        </div>
      ),
    },
    {
      key: 'stock_actuel',
      label: 'Stock',
      render: (value: number, row: Produit) => {
        const status = getStockStatus(value, row.stock_minimum);
        return (
          <div>
            <div className={`fw-bold ${status.text}`}>
              {value} {row.unite_mesure}
            </div>
            <div className="d-flex align-items-center small">
              <span className={`badge ${status.badge} me-1`}>
                {status.label}
              </span>
              {value <= row.stock_minimum && value > 0 && (
                <AlertTriangle className="text-warning" size={12} />
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'active',
      label: 'Statut',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'bg-success' : 'bg-secondary'}`}>
          {value ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Produit) => (
        <div className="gap-1 d-flex">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => handleView(row)}
            className="btn-sm"
          >
            <Eye size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline-warning"
            onClick={() => handleEdit(row)}
            className="btn-sm"
          >
            <Edit size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => handleDelete(row.id)}
            className="btn-sm"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="py-4 container-fluid">
      {/* En-tête de page */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="mb-1 h3 fw-bold text-dark">Produits</h2>
          <p className="mb-0 text-muted">Gestion du catalogue produits</p>
        </div>
        <div className="gap-2 d-flex">
          <Button variant="outline-secondary" className="d-flex align-items-center">
            <Download className="me-2" size={16} />
            Exporter
          </Button>
          <Button variant="outline-secondary" className="d-flex align-items-center">
            <Upload className="me-2" size={16} />
            Importer
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="d-flex align-items-center"
          >
            <Plus className="me-2" size={16} />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Indicateurs rapides */}
      <div className="mb-4 row">
        <div className="col-md-3">
          <div className="border-0 card bg-primary bg-opacity-10">
            <div className="py-3 text-center card-body">
              <Package className="mb-1 text-primary" size={20} />
              <h5 className="mb-0 fw-bold">{produits.length}</h5>
              <small className="text-muted">Total produits</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-success bg-opacity-10">
            <div className="py-3 text-center card-body">
              <Package className="mb-1 text-success" size={20} />
              <h5 className="mb-0 fw-bold">{produits.filter(p => p.active).length}</h5>
              <small className="text-muted">Produits actifs</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-warning bg-opacity-10">
            <div className="py-3 text-center card-body">
              <AlertTriangle className="mb-1 text-warning" size={20} />
              <h5 className="mb-0 fw-bold">
                {produits.filter(p => p.stock_actuel <= p.stock_minimum && p.stock_actuel > 0).length}
              </h5>
              <small className="text-muted">Stocks faibles</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-danger bg-opacity-10">
            <div className="py-3 text-center card-body">
              <AlertTriangle className="mb-1 text-danger" size={20} />
              <h5 className="mb-0 fw-bold">
                {produits.filter(p => p.stock_actuel === 0).length}
              </h5>
              <small className="text-muted">En rupture</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="border-0 shadow-sm card">
        <div className="p-0 card-body">
          <Table columns={columns} data={produits} loading={loading} />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduit ? 'Modifier le produit' : 'Nouveau produit'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="nom" className="form-label fw-semibold">
                Nom du produit *
              </label>
              <input
                id="nom"
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="form-control"
                placeholder="Nom du produit"
              />
            </div>

            <div className="col-12">
              <label htmlFor="description" className="form-label fw-semibold">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="form-control"
                placeholder="Description du produit"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="categorie" className="form-label fw-semibold">
                Catégorie *
              </label>
              <input
                id="categorie"
                type="text"
                required
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="form-control"
                placeholder="Catégorie"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="unite_mesure" className="form-label fw-semibold">
                Unité de mesure *
              </label>
              <select
                id="unite_mesure"
                required
                value={formData.unite_mesure}
                onChange={(e) => setFormData({ ...formData, unite_mesure: e.target.value })}
                className="form-select"
              >
                <option value="unité">Unité</option>
                <option value="kg">Kilogramme</option>
                <option value="litre">Litre</option>
                <option value="mètre">Mètre</option>
                <option value="m²">Mètre carré</option>
                <option value="m³">Mètre cube</option>
              </select>
            </div>

            <div className="col-md-4">
              <label htmlFor="prix_unitaire" className="form-label fw-semibold">
                Prix unitaire (€) *
              </label>
              <input
                id="prix_unitaire"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.prix_unitaire}
                onChange={(e) => setFormData({ ...formData, prix_unitaire: parseFloat(e.target.value) || 0 })}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="stock_actuel" className="form-label fw-semibold">
                Stock actuel *
              </label>
              <input
                id="stock_actuel"
                type="number"
                min="0"
                required
                value={formData.stock_actuel}
                onChange={(e) => setFormData({ ...formData, stock_actuel: parseInt(e.target.value) || 0 })}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="stock_minimum" className="form-label fw-semibold">
                Stock minimum *
              </label>
              <input
                id="stock_minimum"
                type="number"
                min="0"
                required
                value={formData.stock_minimum}
                onChange={(e) => setFormData({ ...formData, stock_minimum: parseInt(e.target.value) || 0 })}
                className="form-control"
              />
            </div>

            <div className="col-12">
              <div className="form-check">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="form-check-input"
                />
                <label htmlFor="active" className="form-check-label fw-semibold">
                  Produit actif
                </label>
              </div>
            </div>
          </div>

          <div className="gap-2 pt-3 mt-4 d-flex justify-content-end border-top">
            <Button type="button" variant="outline-secondary" onClick={handleCloseModal}>
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