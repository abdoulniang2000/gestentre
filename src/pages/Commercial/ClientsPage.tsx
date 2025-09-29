import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Mail, Phone, Download, Upload, User, MapPin, Building, Eye, Search } from 'lucide-react';
import type { Client } from '../../types';
import { clientService } from '../../services/api';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'particulier' | 'entreprise'>('all');
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

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, filterType]);

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

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telephone.includes(searchTerm)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(client => client.type_client === filterType);
    }

    setFilteredClients(filtered);
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
      label: 'Client',
      render: (_value: string, row: Client) => (
        <div className="d-flex align-items-center">
          <div className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
            row.type_client === 'entreprise' ? 'bg-primary' : 'bg-success'
          } bg-opacity-10`} style={{ width: '45px', height: '45px' }}>
            {row.type_client === 'entreprise' ? 
              <Building className={`${row.type_client === 'entreprise' ? 'text-primary' : 'text-success'}`} size={20} /> :
              <User className={`${row.type_client === 'entreprise' ? 'text-primary' : 'text-success'}`} size={20} />
            }
          </div>
          <div>
            <div className="fw-semibold text-dark">{row.nom} {row.prenom}</div>
            <div className={`badge ${row.type_client === 'entreprise' ? 'bg-primary' : 'bg-success'} bg-opacity-10 ${row.type_client === 'entreprise' ? 'text-primary' : 'text-success'} small`}>
              {row.type_client === 'entreprise' ? 'Entreprise' : 'Particulier'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (_value: string, row: Client) => (
        <div>
          <div className="mb-2 d-flex align-items-center">
            <Mail className="text-muted me-2" size={16} />
            <span className="small text-dark">{row.email}</span>
          </div>
          <div className="d-flex align-items-center">
            <Phone className="text-muted me-2" size={16} />
            <span className="small text-dark">{row.telephone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'adresse',
      label: 'Adresse',
      render: (_value: string, row: Client) => (
        <div className="d-flex align-items-start">
          <MapPin className="text-muted me-2 mt-1" size={16} />
          <div className="small">
            <div className="text-dark">{row.adresse}</div>
            <div className="text-muted">{row.code_postal} {row.ville}</div>
            <div className="text-muted">{row.pays}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Date création',
      render: (value: string) => (
        <div className="small">
          <div className="text-dark fw-medium">
            {new Date(value).toLocaleDateString('fr-FR')}
          </div>
          <div className="text-muted">
            {new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Client) => (
        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-info"
            onClick={() => console.log('Voir client', row)}
            className="btn-sm"
            title="Voir détails"
          >
            <Eye size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline-primary"
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

  const stats = {
    total: clients.length,
    particuliers: clients.filter(c => c.type_client === 'particulier').length,
    entreprises: clients.filter(c => c.type_client === 'entreprise').length,
    nouveaux: clients.filter(c => {
      const created = new Date(c.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length
  };

  return (
    <div className="container-fluid py-4">
      {/* En-tête de page */}
      <div className="mb-4 animate__animated animate__fadeInDown">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-danger bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center me-3"
               style={{ width: '60px', height: '60px' }}>
            <Users className="text-danger" size={28} />
          </div>
          <div>
            <h1 className="h2 fw-bold text-dark mb-1">Gestion des Clients</h1>
            <p className="text-muted mb-0">Gérez votre portefeuille clients et prospects</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="card border-0 shadow-sm animate__animated animate__fadeInUp">
            <div className="card-body p-4 text-center">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <Users className="text-primary" size={24} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.total}</h3>
              <p className="text-muted mb-0 small">Total Clients</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="card border-0 shadow-sm animate__animated animate__fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="card-body p-4 text-center">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <User className="text-success" size={24} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.particuliers}</h3>
              <p className="text-muted mb-0 small">Particuliers</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="card border-0 shadow-sm animate__animated animate__fadeInUp" style={{ animationDelay: '200ms' }}>
            <div className="card-body p-4 text-center">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <Building className="text-info" size={24} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.entreprises}</h3>
              <p className="text-muted mb-0 small">Entreprises</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 mb-3">
          <div className="card border-0 shadow-sm animate__animated animate__fadeInUp" style={{ animationDelay: '300ms' }}>
            <div className="card-body p-4 text-center">
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style={{ width: '60px', height: '60px' }}>
                <Plus className="text-warning" size={24} />
              </div>
              <h3 className="fw-bold text-dark mb-1">{stats.nouveaux}</h3>
              <p className="text-muted mb-0 small">Nouveaux (30j)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="card border-0 shadow-sm mb-4 animate__animated animate__fadeInUp">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-lg-4 mb-3 mb-lg-0">
              <div className="input-group">
                <span className="input-group-text bg-transparent">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-lg-3 mb-3 mb-lg-0">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'particulier' | 'entreprise')}
              >
                <option value="all">Tous les types</option>
                <option value="particulier">Particuliers</option>
                <option value="entreprise">Entreprises</option>
              </select>
            </div>
            <div className="col-lg-5 text-lg-end">
              <div className="d-flex gap-2 justify-content-lg-end">
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
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="animate__animated animate__fadeInUp">
        <Table columns={columns} data={filteredClients} loading={loading} />
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

          <div className="d-flex gap-2 pt-4 mt-4 justify-content-end border-top">
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