import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, User, Download, Upload, Eye } from 'lucide-react';
import type { Commande, Client } from '../../types';
import { commandeService, clientService } from '../../services/api';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';

const CommandesPage: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommande, setEditingCommande] = useState<Commande | null>(null);
  const [formData, setFormData] = useState({
    client_id: 0,
    numero_commande: '',
    date_commande: new Date().toISOString().split('T')[0],
    statut: 'en_attente' as 'en_attente' | 'confirmee' | 'en_cours' | 'livree' | 'annulee',
    montant_total: 0,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [commandesResponse, clientsResponse] = await Promise.all([
        commandeService.getAll(),
        clientService.getAll(),
      ]);

      if (commandesResponse.success && commandesResponse.data) {
        setCommandes(commandesResponse.data);
      }
      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNumeroCommande = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CMD-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        numero_commande: formData.numero_commande || generateNumeroCommande(),
      };

      if (editingCommande) {
        await commandeService.update(editingCommande.id, dataToSubmit);
      } else {
        await commandeService.create(dataToSubmit);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (commande: Commande) => {
    setEditingCommande(commande);
    setFormData({
      client_id: commande.client_id,
      numero_commande: commande.numero_commande,
      date_commande: commande.date_commande.split('T')[0],
      statut: commande.statut,
      montant_total: commande.montant_total,
      notes: commande.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      try {
        await commandeService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleView = (commande: Commande) => {
    // Implémentez la visualisation détaillée
    console.log('Voir commande:', commande);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCommande(null);
    setFormData({
      client_id: 0,
      numero_commande: '',
      date_commande: new Date().toISOString().split('T')[0],
      statut: 'en_attente',
      montant_total: 0,
      notes: '',
    });
  };

  const getStatutBadge = (statut: string) => {
    const statutConfig = {
      'en_attente': { class: 'bg-warning text-dark', label: 'En attente' },
      'confirmee': { class: 'bg-info text-white', label: 'Confirmée' },
      'en_cours': { class: 'bg-primary text-white', label: 'En cours' },
      'livree': { class: 'bg-success text-white', label: 'Livrée' },
      'annulee': { class: 'bg-danger text-white', label: 'Annulée' },
    };

    const config = statutConfig[statut as keyof typeof statutConfig] || { class: 'bg-secondary', label: statut };
    
    return (
      <span className={`badge ${config.class} animate__animated animate__pulse`}>
        {config.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'numero_commande',
      label: 'N° Commande',
      render: (value: string, row: Commande) => (
        <div>
          <div className="fw-semibold d-flex align-items-center">
            <FileText className="text-muted me-2" size={16} />
            {value}
          </div>
          <div className="text-muted small">
            {new Date(row.date_commande).toLocaleDateString('fr-FR')}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (_value: unknown, row: Commande) => {
        const client = clients.find(c => c.id === row.client_id);
        return client ? (
          <div className="d-flex align-items-center">
            <User className="text-muted me-2" size={16} />
            <div>
              <div className="fw-semibold">{client.nom} {client.prenom}</div>
              <div className="text-muted small">{client.email}</div>
            </div>
          </div>
        ) : (
          <span className="text-muted small">Client introuvable</span>
        );
      },
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value: string) => getStatutBadge(value),
    },
    {
      key: 'montant_total',
      label: 'Montant',
      render: (value: number) => (
        <div className="fw-bold text-success">
          {value.toFixed(2)} €
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Commande) => (
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
          <h2 className="mb-1 h3 fw-bold text-dark">Commandes</h2>
          <p className="mb-0 text-muted">Gestion des commandes clients</p>
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
            Nouvelle commande
          </Button>
        </div>
      </div>

      {/* Tableau */}
      <div className="border-0 shadow-sm card">
        <div className="p-0 card-body">
          <Table columns={columns} data={commandes} loading={loading} />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCommande ? 'Modifier la commande' : 'Nouvelle commande'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="client_id" className="form-label fw-semibold">
                Client *
              </label>
              <select
                id="client_id"
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value) })}
                className="form-select"
              >
                <option value={0}>Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom} - {client.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="numero_commande" className="form-label fw-semibold">
                N° Commande
              </label>
              <input
                id="numero_commande"
                type="text"
                value={formData.numero_commande}
                onChange={(e) => setFormData({ ...formData, numero_commande: e.target.value })}
                placeholder="Généré automatiquement"
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="date_commande" className="form-label fw-semibold">
                Date de commande *
              </label>
              <input
                id="date_commande"
                type="date"
                required
                value={formData.date_commande}
                onChange={(e) => setFormData({ ...formData, date_commande: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="statut" className="form-label fw-semibold">
                Statut *
              </label>
              <select
                id="statut"
                required
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as any })}
                className="form-select"
              >
                <option value="en_attente">En attente</option>
                <option value="confirmee">Confirmée</option>
                <option value="en_cours">En cours</option>
                <option value="livree">Livrée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>

            <div className="col-12">
              <label htmlFor="montant_total" className="form-label fw-semibold">
                Montant total (€) *
              </label>
              <input
                id="montant_total"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.montant_total}
                onChange={(e) => setFormData({ ...formData, montant_total: parseFloat(e.target.value) || 0 })}
                className="form-control"
              />
            </div>

            <div className="col-12">
              <label htmlFor="notes" className="form-label fw-semibold">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="form-control"
              />
            </div>
          </div>

          <div className="gap-2 pt-3 mt-4 d-flex justify-content-end border-top">
            <Button type="button" variant="outline-secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingCommande ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CommandesPage;