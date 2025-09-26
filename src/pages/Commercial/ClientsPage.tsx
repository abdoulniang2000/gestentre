import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, Phone, Download, Upload } from 'lucide-react';
import type { Client } from '../../types';
import { clientService } from '../../services/api';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    code_postal: '',
    pays: 'France',
    type_client: 'particulier' as 'particulier' | 'entreprise',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientService.getAll();
      if (response.success && response.data) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientService.update(editingClient.id, formData);
      } else {
        await clientService.create(formData);
      }
      await loadClients();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      ville: client.ville,
      code_postal: client.code_postal,
      pays: client.pays,
      type_client: client.type_client,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await clientService.delete(id);
        await loadClients();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      ville: '',
      code_postal: '',
      pays: 'France',
      type_client: 'particulier',
    });
  };

  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (_value: string, row: Client) => (
        <div>
          <div className="fw-semibold">{row.nom} {row.prenom}</div>
          <div className="text-muted small text-capitalize">{row.type_client}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (_value: string, row: Client) => (
        <div>
          <div className="mb-1 d-flex align-items-center">
            <Mail className="text-muted me-2" size={16} />
            <span className="small">{row.email}</span>
          </div>
          <div className="d-flex align-items-center">
            <Phone className="text-muted me-2" size={16} />
            <span className="small">{row.telephone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'adresse',
      label: 'Adresse',
      render: (_value: string, row: Client) => (
        <div className="small">
          <div>{row.adresse}</div>
          <div className="text-muted">{row.code_postal} {row.ville}</div>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Date création',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Client) => (
        <div className="gap-2 d-flex">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => handleEdit(row)}
            className="btn-sm"
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => handleDelete(row.id)}
            className="btn-sm"
          >
            <Trash2 size={16} />
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
          <h2 className="mb-1 h3 fw-bold text-dark">Clients</h2>
          <p className="mb-0 text-muted">Gestion de votre portefeuille clients</p>
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
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Tableau */}
      <div className="border-0 shadow-sm card">
        <div className="p-0 card-body">
          <Table columns={columns} data={clients} loading={loading} />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="nom" className="form-label fw-semibold">
                Nom *
              </label>
              <input
                id="nom"
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="prenom" className="form-label fw-semibold">
                Prénom *
              </label>
              <input
                id="prenom"
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="email" className="form-label fw-semibold">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="telephone" className="form-label fw-semibold">
                Téléphone *
              </label>
              <input
                id="telephone"
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-12">
              <label htmlFor="adresse" className="form-label fw-semibold">
                Adresse *
              </label>
              <input
                id="adresse"
                type="text"
                required
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="code_postal" className="form-label fw-semibold">
                Code postal *
              </label>
              <input
                id="code_postal"
                type="text"
                required
                value={formData.code_postal}
                onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="ville" className="form-label fw-semibold">
                Ville *
              </label>
              <input
                id="ville"
                type="text"
                required
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="pays" className="form-label fw-semibold">
                Pays *
              </label>
              <input
                id="pays"
                type="text"
                required
                value={formData.pays}
                onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-12">
              <label htmlFor="type_client" className="form-label fw-semibold">
                Type de client *
              </label>
              <select
                id="type_client"
                required
                value={formData.type_client}
                onChange={(e) => setFormData({ ...formData, type_client: e.target.value as 'particulier' | 'entreprise' })}
                className="form-select"
              >
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
              </select>
            </div>
          </div>

          <div className="gap-2 pt-3 mt-4 d-flex justify-content-end border-top">
            <Button type="button" variant="outline-secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingClient ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;