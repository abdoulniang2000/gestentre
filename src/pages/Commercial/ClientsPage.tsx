import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';
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
          <div className="font-medium">{row.nom} {row.prenom}</div>
          <div className="text-sm text-gray-500 capitalize">{row.type_client}</div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (_value: string, row: Client) => (
        <div>
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{row.email}</span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{row.telephone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'adresse',
      label: 'Adresse',
      render: (_value: string, row: Client) => (
        <div className="text-sm">
          <div>{row.adresse}</div>
          <div className="text-gray-500">{row.code_postal} {row.ville}</div>
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
        <h2 className="text-xl font-semibold text-gray-900">Clients</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      <Table columns={columns} data={clients} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
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
                Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              type="text"
              required
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal *
              </label>
              <input
                type="text"
                required
                value={formData.code_postal}
                onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                required
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pays *
              </label>
              <input
                type="text"
                required
                value={formData.pays}
                onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de client *
            </label>
            <select
              required
              value={formData.type_client}
              onChange={(e) => setFormData({ ...formData, type_client: e.target.value as 'particulier' | 'entreprise' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="particulier">Particulier</option>
              <option value="entreprise">Entreprise</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
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