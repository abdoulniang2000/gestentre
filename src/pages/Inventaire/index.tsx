import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Package, TriangleAlert as AlertTriangle, Minus, RefreshCw } from 'lucide-react';
import { inventoryService } from '../../services/api';
import type { InventoryItem } from '../../types';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';

const InventairePage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantityChange, setQuantityChange] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reference: '',
    quantity: 0,
    unit: 'unité',
    prix_achat: 0,
    prix_vente: 0,
    seuil_alerte: 5,
    fournisseur: '',
    emplacement: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await inventoryService.getAll();
      if (response.success && response.data) {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      if (editingItem) {
        await inventoryService.update(editingItem.id, formDataToSend);
      } else {
        await inventoryService.create(formDataToSend);
      }
      await loadItems();
      handleCloseModal();
      alert('Article sauvegardé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      reference: item.reference || '',
      quantity: item.quantity,
      unit: item.unit,
      prix_achat: item.prix_achat || 0,
      prix_vente: item.prix_vente || 0,
      seuil_alerte: item.seuil_alerte,
      fournisseur: item.fournisseur || '',
      emplacement: item.emplacement || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await inventoryService.delete(id);
        await loadItems();
        alert('Article supprimé !');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleQuantityUpdate = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantityChange(0);
    setIsQuantityModalOpen(true);
  };

  const handleQuantitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const newQuantity = selectedItem.quantity + quantityChange;
      if (newQuantity < 0) {
        alert('La quantité ne peut pas être négative');
        return;
      }

      await inventoryService.updateQuantity(selectedItem.id, newQuantity);
      await loadItems();
      setIsQuantityModalOpen(false);
      alert('Quantité mise à jour !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de la quantité');
    }
  };

  const handleOutbound = async (item: InventoryItem, quantity: number) => {
    try {
      await inventoryService.outbound(item.id, quantity, 'Sortie manuelle');
      await loadItems();
      alert('Sortie de stock enregistrée !');
    } catch (error) {
      console.error('Erreur lors de la sortie:', error);
      alert('Erreur lors de la sortie de stock');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      reference: '',
      quantity: 0,
      unit: 'unité',
      prix_achat: 0,
      prix_vente: 0,
      seuil_alerte: 5,
      fournisseur: '',
      emplacement: '',
    });
  };

  const getStockStatus = (quantity: number, seuil: number) => {
    if (quantity === 0) {
      return { color: 'text-danger', label: 'Rupture', icon: AlertTriangle };
    } else if (quantity <= seuil) {
      return { color: 'text-warning', label: 'Stock faible', icon: AlertTriangle };
    } else {
      return { color: 'text-success', label: 'En stock', icon: Package };
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Article',
      render: (value: string, row: InventoryItem) => (
        <div>
          <div className="fw-semibold d-flex align-items-center">
            <Package className="text-muted me-2" size={16} />
            {value}
          </div>
          <div className="text-muted small">{row.reference}</div>
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
      key: 'quantity',
      label: 'Stock',
      render: (value: number, row: InventoryItem) => {
        const status = getStockStatus(value, row.seuil_alerte);
        const StatusIcon = status.icon;
        return (
          <div>
            <div className={`fw-bold ${status.color} d-flex align-items-center`}>
              <StatusIcon className="me-1" size={16} />
              {value} {row.unit}
            </div>
            <div className="text-muted small">Seuil: {row.seuil_alerte}</div>
          </div>
        );
      },
    },
    {
      key: 'prix_vente',
      label: 'Prix',
      render: (value: number, row: InventoryItem) => (
        <div>
          <div className="fw-bold text-success">
            {value ? `${value.toFixed(2)} €` : '-'}
          </div>
          <div className="text-muted small">
            Achat: {row.prix_achat ? `${row.prix_achat.toFixed(2)} €` : '-'}
          </div>
        </div>
      ),
    },
    {
      key: 'fournisseur',
      label: 'Fournisseur',
      render: (value: string) => (
        <span className="text-muted small">{value || '-'}</span>
      ),
    },
    {
      key: 'emplacement',
      label: 'Emplacement',
      render: (value: string) => (
        <span className="badge bg-info">{value || 'Non défini'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: InventoryItem) => (
        <div className="gap-1 d-flex">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => handleQuantityUpdate(row)}
            className="btn-sm"
            title="Modifier quantité"
          >
            <RefreshCw size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline-warning"
            onClick={() => handleEdit(row)}
            className="btn-sm"
            title="Modifier"
          >
            <Edit size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => handleDelete(row.id)}
            className="btn-sm"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const lowStockItems = items.filter(item => item.quantity <= item.seuil_alerte);
  const outOfStockItems = items.filter(item => item.quantity === 0);

  return (
    <div className="py-4 container-fluid">
      {/* En-tête */}
      <div className="mb-4 d-flex align-items-center">
        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" 
             style={{ width: '60px', height: '60px' }}>
          <Package className="text-white" size={28} />
        </div>
        <div>
          <h1 className="mb-1 h2 fw-bold text-dark">Inventaire</h1>
          <p className="mb-0 text-muted">Gérez votre stock et vos articles</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div></div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="d-flex align-items-center"
        >
          <Plus className="me-2" size={16} />
          Nouvel article
        </Button>
      </div>

      {/* Statistiques */}
      <div className="mb-4 row">
        <div className="col-md-3">
          <div className="border-0 card bg-primary bg-opacity-10">
            <div className="py-3 text-center card-body">
              <Package className="mb-1 text-primary" size={20} />
              <h5 className="mb-0 fw-bold">{items.length}</h5>
              <small className="text-muted">Total articles</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-success bg-opacity-10">
            <div className="py-3 text-center card-body">
              <Package className="mb-1 text-success" size={20} />
              <h5 className="mb-0 fw-bold">
                {items.filter(item => item.quantity > item.seuil_alerte).length}
              </h5>
              <small className="text-muted">En stock</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-warning bg-opacity-10">
            <div className="py-3 text-center card-body">
              <AlertTriangle className="mb-1 text-warning" size={20} />
              <h5 className="mb-0 fw-bold">{lowStockItems.length}</h5>
              <small className="text-muted">Stock faible</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-danger bg-opacity-10">
            <div className="py-3 text-center card-body">
              <AlertTriangle className="mb-1 text-danger" size={20} />
              <h5 className="mb-0 fw-bold">{outOfStockItems.length}</h5>
              <small className="text-muted">En rupture</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="border-0 shadow-sm card">
        <div className="p-0 card-body">
          <Table columns={columns} data={items} loading={loading} />
        </div>
      </div>

      {/* Modal article */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Modifier l\'article' : 'Nouvel article'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-8">
              <label htmlFor="name" className="form-label fw-semibold">
                Nom de l'article *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
                placeholder="Nom de l'article"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="reference" className="form-label fw-semibold">
                Référence
              </label>
              <input
                id="reference"
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="form-control"
                placeholder="REF-001"
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
                placeholder="Description de l'article"
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="quantity" className="form-label fw-semibold">
                Quantité *
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="unit" className="form-label fw-semibold">
                Unité *
              </label>
              <select
                id="unit"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="form-select"
              >
                <option value="unité">Unité</option>
                <option value="kg">Kilogramme</option>
                <option value="litre">Litre</option>
                <option value="mètre">Mètre</option>
                <option value="boîte">Boîte</option>
                <option value="paquet">Paquet</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="seuil_alerte" className="form-label fw-semibold">
                Seuil d'alerte *
              </label>
              <input
                id="seuil_alerte"
                type="number"
                min="0"
                required
                value={formData.seuil_alerte}
                onChange={(e) => setFormData({ ...formData, seuil_alerte: parseInt(e.target.value) || 0 })}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="prix_achat" className="form-label fw-semibold">
                Prix d'achat (€)
              </label>
              <input
                id="prix_achat"
                type="number"
                step="0.01"
                min="0"
                value={formData.prix_achat}
                onChange={(e) => setFormData({ ...formData, prix_achat: parseFloat(e.target.value) || 0 })}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="prix_vente" className="form-label fw-semibold">
                Prix de vente (€)
              </label>
              <input
                id="prix_vente"
                type="number"
                step="0.01"
                min="0"
                value={formData.prix_vente}
                onChange={(e) => setFormData({ ...formData, prix_vente: parseFloat(e.target.value) || 0 })}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="fournisseur" className="form-label fw-semibold">
                Fournisseur
              </label>
              <input
                id="fournisseur"
                type="text"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                className="form-control"
                placeholder="Nom du fournisseur"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="emplacement" className="form-label fw-semibold">
                Emplacement
              </label>
              <input
                id="emplacement"
                type="text"
                value={formData.emplacement}
                onChange={(e) => setFormData({ ...formData, emplacement: e.target.value })}
                className="form-control"
                placeholder="Emplacement de stockage"
              />
            </div>
          </div>

          <div className="gap-2 pt-3 mt-4 d-flex justify-content-end border-top">
            <Button type="button" variant="outline-secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingItem ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal quantité */}
      <Modal
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        title="Modifier la quantité"
        size="md"
      >
        {selectedItem && (
          <form onSubmit={handleQuantitySubmit}>
            <div className="mb-3">
              <h6>{selectedItem.name}</h6>
              <p className="text-muted">Stock actuel: {selectedItem.quantity} {selectedItem.unit}</p>
            </div>

            <div className="mb-3">
              <label htmlFor="quantityChange" className="form-label fw-semibold">
                Modification de quantité
              </label>
              <input
                id="quantityChange"
                type="number"
                value={quantityChange}
                onChange={(e) => setQuantityChange(parseInt(e.target.value) || 0)}
                className="form-control"
                placeholder="Entrez un nombre positif ou négatif"
              />
              <div className="form-text">
                Nouveau stock: {selectedItem.quantity + quantityChange} {selectedItem.unit}
              </div>
            </div>

            <div className="gap-2 d-flex justify-content-end">
              <Button type="button" variant="outline-secondary" onClick={() => setIsQuantityModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                Mettre à jour
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default InventairePage;