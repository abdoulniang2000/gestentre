import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, DollarSign, Calendar, FileText, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react';
import { expenseService } from '../../services/api';
import type { Expense } from '../../types';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';
import Modal from '../../components/UI/Modal';

const DepensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState('');
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    montant: 0,
    categorie: '',
    date_depense: new Date().toISOString().split('T')[0],
    justificatif: '',
  });

  const sites = ['Bureau', 'Chantier A', 'Chantier B', 'Déplacement'];

  useEffect(() => {
    loadExpenses();
  }, [selectedSite]);

  const loadExpenses = async () => {
    try {
      const response = await expenseService.getAll(selectedSite);
      if (response.success && response.data) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) {
      alert('Veuillez sélectionner un site');
      return;
    }

    try {
      await expenseService.create(formData, selectedSite);
      await loadExpenses();
      handleCloseModal();
      alert('Dépense créée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de la création de la dépense');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await expenseService.approve(id);
      await loadExpenses();
      alert('Dépense approuvée !');
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await expenseService.reject(id);
      await loadExpenses();
      alert('Dépense rejetée !');
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        await expenseService.delete(id);
        await loadExpenses();
        alert('Dépense supprimée !');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      titre: '',
      description: '',
      montant: 0,
      categorie: '',
      date_depense: new Date().toISOString().split('T')[0],
      justificatif: '',
    });
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-warning text-dark';
      case 'approuve': return 'bg-success text-white';
      case 'rejete': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'approuve': return 'Approuvée';
      case 'rejete': return 'Rejetée';
      default: return statut;
    }
  };

  const columns = [
    {
      key: 'titre',
      label: 'Dépense',
      render: (value: string, row: Expense) => (
        <div>
          <div className="fw-semibold d-flex align-items-center">
            <FileText className="text-muted me-2" size={16} />
            {value}
          </div>
          <div className="text-muted small">{row.categorie}</div>
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
      key: 'montant',
      label: 'Montant',
      render: (value: number) => (
        <div className="fw-bold text-success">
          {value.toFixed(2)} €
        </div>
      ),
    },
    {
      key: 'date_depense',
      label: 'Date',
      render: (value: string) => (
        <div className="d-flex align-items-center">
          <Calendar className="text-muted me-2" size={16} />
          {new Date(value).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
    {
      key: 'site',
      label: 'Site',
      render: (value: string) => (
        <span className="badge bg-info">{value}</span>
      ),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value: string) => (
        <span className={`badge ${getStatutColor(value)}`}>
          {getStatutLabel(value)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Expense) => (
        <div className="gap-1 d-flex">
          {row.statut === 'en_attente' && (
            <>
              <Button
                size="sm"
                variant="outline-success"
                onClick={() => handleApprove(row.id)}
                className="btn-sm"
              >
                <CheckCircle size={14} />
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => handleReject(row.id)}
                className="btn-sm"
              >
                <XCircle size={14} />
              </Button>
            </>
          )}
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
      {/* En-tête */}
      <div className="mb-4 d-flex align-items-center">
        <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3" 
             style={{ width: '60px', height: '60px' }}>
          <DollarSign className="text-white" size={28} />
        </div>
        <div>
          <h1 className="mb-1 h2 fw-bold text-dark">Gestion des Dépenses</h1>
          <p className="mb-0 text-muted">Gérez vos dépenses par site</p>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <label className="me-2 fw-semibold">Site:</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="">Tous les sites</option>
            {sites.map((site) => (
              <option key={site} value={site}>{site}</option>
            ))}
          </select>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="d-flex align-items-center"
        >
          <Plus className="me-2" size={16} />
          Nouvelle dépense
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="mb-4 row">
        <div className="col-md-3">
          <div className="border-0 card bg-primary bg-opacity-10">
            <div className="py-3 text-center card-body">
              <DollarSign className="mb-1 text-primary" size={20} />
              <h5 className="mb-0 fw-bold">
                {expenses.reduce((sum, exp) => sum + exp.montant, 0).toFixed(2)} €
              </h5>
              <small className="text-muted">Total dépenses</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-warning bg-opacity-10">
            <div className="py-3 text-center card-body">
              <FileText className="mb-1 text-warning" size={20} />
              <h5 className="mb-0 fw-bold">
                {expenses.filter(exp => exp.statut === 'en_attente').length}
              </h5>
              <small className="text-muted">En attente</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-success bg-opacity-10">
            <div className="py-3 text-center card-body">
              <CheckCircle className="mb-1 text-success" size={20} />
              <h5 className="mb-0 fw-bold">
                {expenses.filter(exp => exp.statut === 'approuve').length}
              </h5>
              <small className="text-muted">Approuvées</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-danger bg-opacity-10">
            <div className="py-3 text-center card-body">
              <XCircle className="mb-1 text-danger" size={20} />
              <h5 className="mb-0 fw-bold">
                {expenses.filter(exp => exp.statut === 'rejete').length}
              </h5>
              <small className="text-muted">Rejetées</small>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="border-0 shadow-sm card">
        <div className="p-0 card-body">
          <Table columns={columns} data={expenses} loading={loading} />
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Nouvelle dépense"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="titre" className="form-label fw-semibold">
                Titre *
              </label>
              <input
                id="titre"
                type="text"
                required
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="form-control"
                placeholder="Titre de la dépense"
              />
            </div>
            <div className="col-md-6">
              <label htmlFor="site" className="form-label fw-semibold">
                Site *
              </label>
              <select
                id="site"
                required
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="form-select"
              >
                <option value="">Sélectionner un site</option>
                {sites.map((site) => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>
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
                placeholder="Description de la dépense"
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="montant" className="form-label fw-semibold">
                Montant (€) *
              </label>
              <input
                id="montant"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: parseFloat(e.target.value) || 0 })}
                className="form-control"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="categorie" className="form-label fw-semibold">
                Catégorie
              </label>
              <select
                id="categorie"
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="form-select"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Transport">Transport</option>
                <option value="Repas">Repas</option>
                <option value="Matériel">Matériel</option>
                <option value="Hébergement">Hébergement</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="date_depense" className="form-label fw-semibold">
                Date de dépense *
              </label>
              <input
                id="date_depense"
                type="date"
                required
                value={formData.date_depense}
                onChange={(e) => setFormData({ ...formData, date_depense: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="col-12">
              <label htmlFor="justificatif" className="form-label fw-semibold">
                Justificatif
              </label>
              <input
                id="justificatif"
                type="text"
                value={formData.justificatif}
                onChange={(e) => setFormData({ ...formData, justificatif: e.target.value })}
                className="form-control"
                placeholder="Référence du justificatif"
              />
            </div>
          </div>

          <div className="gap-2 pt-3 mt-4 d-flex justify-content-end border-top">
            <Button type="button" variant="outline-secondary" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button type="submit">
              Créer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepensesPage;