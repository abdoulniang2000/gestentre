import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Mail, Phone } from 'lucide-react';
import type { Employe } from '../../types';
import { employeService } from '../../services/api';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';

const EmployesPage: React.FC = () => {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    poste: '',
    departement: '',
    salaire: 0,
    date_embauche: new Date().toISOString().split('T')[0],
    statut: 'actif' as 'actif' | 'inactif' | 'conge',
  });

  useEffect(() => {
    loadEmployes();
  }, []);

  const loadEmployes = async () => {
    try {
      const response = await employeService.getAll();
      if (response.success && response.data) {
        setEmployes(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmploye) {
        await employeService.update(editingEmploye.id, formData);
      } else {
        await employeService.create(formData);
      }
      await loadEmployes();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (employe: Employe) => {
    setEditingEmploye(employe);
    setFormData({
      nom: employe.nom,
      prenom: employe.prenom,
      email: employe.email,
      telephone: employe.telephone,
      poste: employe.poste,
      departement: employe.departement,
      salaire: employe.salaire,
      date_embauche: employe.date_embauche.split('T')[0],
      statut: employe.statut,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        await employeService.delete(id);
        await loadEmployes();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmploye(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      poste: '',
      departement: '',
      salaire: 0,
      date_embauche: new Date().toISOString().split('T')[0],
      statut: 'actif',
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-red-100 text-red-800';
      case 'conge': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'inactif': return 'Inactif';
      case 'conge': return 'En congé';
      default: return statut;
    }
  };

  const columns = [
    {
      key: 'nom',
      label: 'Employé',
      render: (_value: string, row: Employe) => (
        <div>
          <div className="font-medium flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            {row.nom} {row.prenom}
          </div>
          <div className="text-sm text-gray-500">{row.poste}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (_value: unknown, row: Employe) => (
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
      key: 'departement',
      label: 'Département',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      key: 'salaire',
      label: 'Salaire',
      render: (value: number) => (
        <div className="font-medium text-green-600">
          {value.toLocaleString()} €
        </div>
      ),
    },
    {
      key: 'date_embauche',
      label: 'Date d\'embauche',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
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
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Employe) => (
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
        <h2 className="text-xl font-semibold text-gray-900">Employés</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel employé
        </Button>
      </div>

      <Table columns={columns} data={employes} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEmploye ? 'Modifier l\'employé' : 'Nouvel employé'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poste *
              </label>
              <input
                type="text"
                required
                value={formData.poste}
                onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département *
              </label>
              <input
                type="text"
                required
                value={formData.departement}
                onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salaire (€) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.salaire}
                onChange={(e) => setFormData({ ...formData, salaire: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'embauche *
              </label>
              <input
                type="date"
                required
                value={formData.date_embauche}
                onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut *
            </label>
            <select
              required
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as Employe["statut"] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="conge">En congé</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingEmploye ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployesPage;