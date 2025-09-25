import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, User } from 'lucide-react';
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

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-orange-100 text-orange-800';
      case 'livree': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'en_cours': return 'En cours';
      case 'livree': return 'Livrée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };

  const columns = [
    {
      key: 'numero_commande',
      label: 'N° Commande',
      render: (value: string, row: Commande) => (
        <div>
          <div className="font-medium flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-400" />
            {value}
          </div>
          <div className="text-sm text-gray-500">
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
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <div>
              <div className="font-medium">{client.nom} {client.prenom}</div>
              <div className="text-sm text-gray-500">{client.email}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Client introuvable</span>
        );
      },
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(value)}`}>
          {getStatutLabel(value)}
        </span>
      ),
    },
    {
      key: 'montant_total',
      label: 'Montant',
      render: (value: number) => (
        <div className="font-medium text-green-600">
          {value.toFixed(2)} €
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Commande) => (
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
        <h2 className="text-xl font-semibold text-gray-900">Commandes</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      <Table columns={columns} data={commandes} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCommande ? 'Modifier la commande' : 'Nouvelle commande'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <select
                required
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom} {client.prenom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Commande
              </label>
              <input
                type="text"
                value={formData.numero_commande}
                onChange={(e) => setFormData({ ...formData, numero_commande: e.target.value })}
                placeholder="Généré automatiquement"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de commande *
              </label>
              <input
                type="date"
                required
                value={formData.date_commande}
                onChange={(e) => setFormData({ ...formData, date_commande: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut *
              </label>
              <select
                required
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'en_attente' | 'confirmee' | 'en_cours' | 'livree' | 'annulee' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en_attente">En attente</option>
                <option value="confirmee">Confirmée</option>
                <option value="en_cours">En cours</option>
                <option value="livree">Livrée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant total (€) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.montant_total}
              onChange={(e) => setFormData({ ...formData, montant_total: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
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