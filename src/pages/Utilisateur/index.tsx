import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Shield, Mail } from 'lucide-react';
import type { User as UserType } from '../../types';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';

const UtilisateurPage: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    active: true,
  });

  useEffect(() => {
    // Simuler le chargement des utilisateurs
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          nom: 'Admin Système',
          email: 'admin@netsysteme.com',
          role: 'admin',
          active: true,
          created_at: '2024-01-01T00:00:00Z',
          last_login: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          nom: 'Manager Commercial',
          email: 'manager@netsysteme.com',
          role: 'manager',
          active: true,
          created_at: '2024-01-02T00:00:00Z',
          last_login: '2024-01-14T14:20:00Z',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Simuler la mise à jour
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...formData, updated_at: new Date().toISOString() }
            : user
        ));
      } else {
        // Simuler la création
        const newUser: UserType = {
          id: Date.now(),
          ...formData,
          created_at: new Date().toISOString(),
        };
        setUsers(prev => [...prev, newUser]);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      email: user.email,
      role: user.role,
      active: user.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        setUsers(prev => prev.filter(user => user.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      nom: '',
      email: '',
      role: 'employee',
      active: true,
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'employee': return 'Employé';
      default: return role;
    }
  };

  const columns = [
    {
      key: 'nom',
      label: 'Utilisateur',
      render: (value: string, row: UserType) => (
        <div>
          <div className="font-medium flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-400" />
            {value}
          </div>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <Mail className="w-4 h-4 mr-1" />
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (value: string) => (
        <div className="flex items-center">
          <Shield className="w-4 h-4 mr-2 text-gray-400" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(value)}`}>
            {getRoleLabel(value)}
          </span>
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
      key: 'last_login',
      label: 'Dernière connexion',
      render: (value: string | undefined) => (
        <div className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString('fr-FR') : 'Jamais'}
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
      render: (_value: unknown, row: UserType) => (
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
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Utilisateur</h1>
          <p className="text-gray-600">Gérez les utilisateurs et leurs permissions</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Utilisateurs</h2>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>

        <Table columns={columns} data={users} loading={loading} />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
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
                Rôle *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'manager' | 'employee' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="employee">Employé</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrateur</option>
              </select>
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
                Utilisateur actif
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit">
                {editingUser ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UtilisateurPage;