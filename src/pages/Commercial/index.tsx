import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ShoppingCart, Users, Package, FileText, BarChart3 } from 'lucide-react';
import ClientsPage from './ClientsPage';
import ProduitsPage from './ProduitsPage';
import CommandesPage from './CommandesPage';

const CommercialPage: React.FC = () => {
  const tabs = [
    { path: 'clients', label: 'Clients', icon: Users },
    { path: 'produits', label: 'Produits', icon: Package },
    { path: 'commandes', label: 'Commandes', icon: FileText },
    { path: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="py-4 container-fluid">
      {/* En-tête avec icône et description */}
      <div className="mb-4 d-flex align-items-center animate__animated animate__fadeInDown">
        <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-3" 
             style={{ width: '60px', height: '60px' }}>
          <ShoppingCart className="text-white" size={28} />
        </div>
        <div>
          <h1 className="mb-1 h2 fw-bold text-dark">Gestion Commerciale</h1>
          <p className="mb-0 text-muted">Gérez vos clients, produits et commandes</p>
        </div>
      </div>

      {/* Carte principale avec navigation et contenu */}
      <div className="border-0 shadow-sm card">
        {/* Navigation par onglets */}
        <div className="px-4 pt-4 bg-transparent card-header border-bottom-0">
          <ul className="nav nav-tabs nav-tabs-custom card-header-tabs">
            {tabs.map((tab, index) => (
              <li key={tab.path} className="nav-item">
                <NavLink
                  to={tab.path}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center animate__animated animate__fadeIn ${
                      isActive 
                        ? 'active text-danger fw-semibold' 
                        : 'text-muted'
                    }`
                  }
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <tab.icon className="me-2" size={18} />
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Contenu des onglets */}
        <div className="px-4 py-4 card-body">
          <Routes>
            <Route index element={<Navigate to="clients" replace />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="produits" element={<ProduitsPage />} />
            <Route path="commandes" element={<CommandesPage />} />
            <Route path="analytics" element={
              <div className="py-5 text-center">
                <BarChart3 size={48} className="mb-3 text-muted" />
                <h4 className="text-muted">Analytics Commerciales</h4>
                <p className="text-muted">Module d'analyse en développement</p>
              </div>
            } />
          </Routes>
        </div>
      </div>

      {/* Statistiques rapides ou indicateurs */}
      <div className="mt-4 row">
        <div className="col-md-3">
          <div className="border-0 card bg-primary bg-opacity-10">
            <div className="text-center card-body">
              <Users className="mb-2 text-primary" size={24} />
              <h5 className="fw-bold">Clients</h5>
              <p className="text-muted small">Gestion du portefeuille</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-success bg-opacity-10">
            <div className="text-center card-body">
              <Package className="mb-2 text-success" size={24} />
              <h5 className="fw-bold">Produits</h5>
              <p className="text-muted small">Catalogue et stocks</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-warning bg-opacity-10">
            <div className="text-center card-body">
              <FileText className="mb-2 text-warning" size={24} />
              <h5 className="fw-bold">Commandes</h5>
              <p className="text-muted small">Ventes et facturation</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="border-0 card bg-info bg-opacity-10">
            <div className="text-center card-body">
              <BarChart3 className="mb-2 text-info" size={24} />
              <h5 className="fw-bold">Analytics</h5>
              <p className="text-muted small">Performances commerciales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialPage;