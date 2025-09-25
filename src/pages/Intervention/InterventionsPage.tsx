import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wrench, User, Calendar, AlertTriangle } from 'lucide-react';
import type { Intervention, Client, Employe } from '../../types';
import { interventionService, clientService, employeService } from '../../services/api';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';

const InterventionsPage: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
  const [formData, setFormData] = useState({
    client_id: 0,
    employe_id: 0,
    titre: '',
    description: '',
    date_intervention: new Date().toISOString().split('T')[0],
    heure_debut: '09:00',
    heure_fin: '',
    statut: 'planifiee' as 'planifiee' | 'en_cours' | 'terminee' | 'annulee',
    priorite: 'normale' as 'basse' | 'normale' | 'haute' | 'urgente',
    cout: 0,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [interventionsResponse, clientsResponse, employesResponse] = await Promise.all([
        interventionService.getAll(),
        clientService.getAll(),
        employeService.getAll(),
      ]);

      if (interventionsResponse.success && interventionsResponse.data) {
        setInterventions(interventionsResponse.data);
      }
      if (clientsResponse.success && clientsResponse.data) {
        setClients(clientsResponse.data);
      }
      if (employesResponse.success && employesResponse.data) {
        setEmployes(employesResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIntervention) {
        await interventionService.update(editingIntervention.id, formData);
      } else {
        await interventionService.create(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (intervention: Intervention) => {
    setEditingIntervention(intervention);
    setFormData({
      client_id: intervention.client_id,
      employe_id: intervention.employe_id,
      titre: intervention.titre,
      description: intervention.description,
      date_intervention: intervention.date_intervention.split('T')[0],
      heure_debut: intervention.heure_debut,
      heure_fin: intervention.heure_fin || '',
      statut: intervention.statut,
      priorite: intervention.priorite,
      cout: intervention.cout,
      notes: intervention.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      try {
        await interventionService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIntervention(null);
    setFormData({
      client_id: 0,
      employe_id: 0,
      titre: '',
      description: '',
      date_intervention: new Date().toISOString().split('T')[0],
      heure_debut: '09:00',
      heure_fin: '',
      statut: 'planifiee',
      priorite: 'normale',
      cout: 0,
      notes: '',
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-orange-100 text-orange-800';
      case 'terminee': return 'bg-green-100 text-green-800';
      case 'annulee': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'planifiee': return 'Planifiée';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'basse': return 'text-green-600';
      case 'normale': return 'text-blue-600';
      case 'haute': return 'text-orange-600';
      case 'urgente': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPrioriteLabel = (priorite: string) => {
    switch (priorite) {
      case 'basse': return 'Basse';
      case 'normale': return 'Normale';
      case 'haute': return 'Haute';
      case 'urgente': return 'Urgente';
      default: return priorite;
    }
  };

  const columns = [
    {
      key: 'titre',
      label: 'Intervention',
      render: (value: string, row: Intervention) => (
        <div>
          <div className="font-medium flex items-center">
            <Wrench className="w-4 h-4 mr-2 text-gray-400" />
            {value}
          </div>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(row.date_intervention).toLocaleDateString('fr-FR')} à {row.heure_debut}
          </div>
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      render: (_value: unknown, row: Intervention) => {
        const client = clients.find(c => c.id === row.client_id);
        return client ? (
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            <div>
              <div className="font-medium">{client.nom} {client.prenom}</div>
              <div className="text-sm text-gray-500">{client.telephone}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Client introuvable</span>
        );
      },
    },
    {
      key: 'employe',
      label: 'Technicien',
      render: (_value: unknown, row: Intervention) => {
        const employe = employes.find(e => e.id === row.employe_id);
        return employe ? (
          <div>
            <div className="font-medium">{employe.nom} {employe.prenom}</div>
            <div className="text-sm text-gray-500">{employe.poste}</div>
          </div>
        ) : (
          <span className="text-gray-500">Employé introuvable</span>
        );
      },
    },
    {
      key: 'priorite',
      label: 'Priorité',
      render: (value: string) => (
        <div className={`flex items-center font-medium ${getPrioriteColor(value)}`}>
          {value === 'urgente' && <AlertTriangle className="w-4 h-4 mr-1" />}
          {getPrioriteLabel(value)}
        </div>
      ),
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
      key: 'cout',
      label: 'Coût',
      render: (value: number) => (
        <div className="font-medium text-green-600">
          {value.toFixed(2)} €
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Intervention) => (
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
        <h2 className="text-xl font-semibold text-gray-900">Interventions</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle intervention
        </Button>
      </div>

      <Table columns={columns} data={interventions} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingIntervention ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre *
            </label>
            <input
              type="text"
              required
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
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
                Technicien *
              </label>
              <select
                required
                value={formData.employe_id}
                onChange={(e) => setFormData({ ...formData, employe_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Sélectionner un technicien</option>
                {employes.map((employe) => (
                  <option key={employe.id} value={employe.id}>
                    {employe.nom} {employe.prenom} - {employe.poste}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'intervention *
              </label>
              <input
                type="date"
                required
                value={formData.date_intervention}
                onChange={(e) => setFormData({ ...formData, date_intervention: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure début *
              </label>
              <input
                type="time"
                required
                value={formData.heure_debut}
                onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure fin
              </label>
              <input
                type="time"
                value={formData.heure_fin}
                onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut *
              </label>
              <select
                required
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'planifiee' | 'en_cours' | 'terminee' | 'annulee' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité *
              </label>
              <select
                required
                value={formData.priorite}
                onChange={(e) => setFormData({ ...formData, priorite: e.target.value as 'basse' | 'normale' | 'haute' | 'urgente' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basse">Basse</option>
                <option value="normale">Normale</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cout}
                onChange={(e) => setFormData({ ...formData, cout: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
              {editingIntervention ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InterventionsPage;