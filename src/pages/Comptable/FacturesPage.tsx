import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import type { Facture, Commande } from '../../types';
import { factureService, commandeService } from '../../services/api';
import Table from '../../components/UI/Table';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';

const FacturesPage: React.FC = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacture, setEditingFacture] = useState<Facture | null>(null);
  const [formData, setFormData] = useState({
    commande_id: 0,
    numero_facture: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: '',
    montant_ht: 0,
    tva: 20,
    montant_ttc: 0,
    statut: 'brouillon' as 'brouillon' | 'envoyee' | 'payee' | 'en_retard',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calculer le montant TTC automatiquement
    const montantTTC = formData.montant_ht * (1 + formData.tva / 100);
    if (montantTTC !== formData.montant_ttc) {
      setFormData(prev => ({ ...prev, montant_ttc: montantTTC }));
    }
  }, [formData.montant_ht, formData.montant_ttc, formData.tva]);

  const loadData = async () => {
    try {
      const [facturesResponse, commandesResponse] = await Promise.all([
        factureService.getAll(),
        commandeService.getAll(),
      ]);

      if (facturesResponse.success && facturesResponse.data) {
        setFactures(facturesResponse.data);
      }
      if (commandesResponse.success && commandesResponse.data) {
        setCommandes(commandesResponse.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNumeroFacture = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FAC-${year}${month}-${random}`;
  };

  const calculateEcheance = (dateFacture: string) => {
    const date = new Date(dateFacture);
    date.setDate(date.getDate() + 30); // 30 jours par défaut
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        numero_facture: formData.numero_facture || generateNumeroFacture(),
        date_echeance: formData.date_echeance || calculateEcheance(formData.date_facture),
      };

      if (editingFacture) {
        await factureService.update(editingFacture.id, dataToSubmit);
      } else {
        await factureService.create(dataToSubmit);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (facture: Facture) => {
    setEditingFacture(facture);
    setFormData({
      commande_id: facture.commande_id,
      numero_facture: facture.numero_facture,
      date_facture: facture.date_facture.split('T')[0],
      date_echeance: facture.date_echeance.split('T')[0],
      montant_ht: facture.montant_ht,
      tva: facture.tva,
      montant_ttc: facture.montant_ttc,
      statut: facture.statut,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await factureService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFacture(null);
    setFormData({
      commande_id: 0,
      numero_facture: '',
      date_facture: new Date().toISOString().split('T')[0],
      date_echeance: '',
      montant_ht: 0,
      tva: 20,
      montant_ttc: 0,
      statut: 'brouillon',
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'bg-gray-100 text-gray-800';
      case 'envoyee': return 'bg-blue-100 text-blue-800';
      case 'payee': return 'bg-green-100 text-green-800';
      case 'en_retard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'Brouillon';
      case 'envoyee': return 'Envoyée';
      case 'payee': return 'Payée';
      case 'en_retard': return 'En retard';
      default: return statut;
    }
  };

  const columns = [
    {
      key: 'numero_facture',
      label: 'N° Facture',
      render: (value: string, row: Facture) => (
        <div>
          <div className="font-medium flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-400" />
            {value}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(row.date_facture).toLocaleDateString('fr-FR')}
          </div>
        </div>
      ),
    },
    {
      key: 'commande',
      label: 'Commande',
      render: (_value: unknown, row: Facture) => {
        const commande = commandes.find(c => c.id === row.commande_id);
        return commande ? (
          <div>
            <div className="font-medium">{commande.numero_commande}</div>
            <div className="text-sm text-gray-500">
              {new Date(commande.date_commande).toLocaleDateString('fr-FR')}
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Commande introuvable</span>
        );
      },
    },
    {
      key: 'montant_ttc',
      label: 'Montant',
      render: (value: number, row: Facture) => (
        <div>
          <div className="font-medium text-green-600">
            {value.toFixed(2)} € TTC
          </div>
          <div className="text-sm text-gray-500">
            {row.montant_ht.toFixed(2)} € HT
          </div>
        </div>
      ),
    },
    {
      key: 'date_echeance',
      label: 'Échéance',
      render: (value: string) => {
        const echeance = new Date(value);
        const today = new Date();
        const isOverdue = echeance < today;
        
        return (
          <div className={isOverdue ? 'text-red-600' : 'text-gray-900'}>
            {echeance.toLocaleDateString('fr-FR')}
            {isOverdue && (
              <div className="text-xs text-red-500">En retard</div>
            )}
          </div>
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
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Facture) => (
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
        <h2 className="text-xl font-semibold text-gray-900">Factures</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      <Table columns={columns} data={factures} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingFacture ? 'Modifier la facture' : 'Nouvelle facture'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commande *
              </label>
              <select
                required
                value={formData.commande_id}
                onChange={(e) => setFormData({ ...formData, commande_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Sélectionner une commande</option>
                {commandes.map((commande) => (
                  <option key={commande.id} value={commande.id}>
                    {commande.numero_commande} - {commande.montant_total.toFixed(2)} €
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                N° Facture
              </label>
              <input
                type="text"
                value={formData.numero_facture}
                onChange={(e) => setFormData({ ...formData, numero_facture: e.target.value })}
                placeholder="Généré automatiquement"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de facture *
              </label>
              <input
                type="date"
                required
                value={formData.date_facture}
                onChange={(e) => setFormData({ ...formData, date_facture: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.date_echeance}
                onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                placeholder="Calculée automatiquement (+30 jours)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant HT (€) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.montant_ht}
                onChange={(e) => setFormData({ ...formData, montant_ht: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TVA (%) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                value={formData.tva}
                onChange={(e) => setFormData({ ...formData, tva: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant TTC (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.montant_ttc.toFixed(2)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
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
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'brouillon' | 'envoyee' | 'payee' | 'en_retard' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="brouillon">Brouillon</option>
              <option value="envoyee">Envoyée</option>
              <option value="payee">Payée</option>
              <option value="en_retard">En retard</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              {editingFacture ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacturesPage;