import React, { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Settings, 
  User,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalCommandes: 0,
    totalEmployes: 0,
    totalFactures: 0,
    chiffreAffaires: 0,
    interventionsPlanifiees: 0,
    facturesEnRetard: 0,
    produitsStockFaible: 0,
    commandesRecentes: [],
    interventionsRecentes: []
  });
  const [, setAnimate] = useState(false);

  useEffect(() => {
    loadDashboardStats();
    setAnimate(true);
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleLogout = () => {
    // Implémentez la logique de déconnexion ici
    console.log('Déconnexion');
    navigate('/login');
  };

  const modules = [
    {
      title: 'Gestion commerciale',
      icon: ShoppingCart,
      color: 'bg-danger',
      path: '/commercial',
      description: 'Clients, produits, commandes'
    },
    {
      title: 'Gestion RH',
      icon: Users,
      color: 'bg-warning',
      path: '/rh',
      description: 'Employés, congés, paie'
    },
    {
      title: 'Gestion Comptable',
      icon: CreditCard,
      color: 'bg-success',
      path: '/comptable',
      description: 'Factures, paiements, comptabilité'
    },
    {
      title: 'Gestion Interversion',
      icon: Settings,
      color: 'bg-primary',
      path: '/intervention',
      description: 'Interventions, maintenance'
    },
    {
      title: 'Gestion utilisateur',
      icon: User,
      color: 'bg-info',
      path: '/utilisateur',
      description: 'Utilisateurs, permissions'
    },
  ];

  const statsCards = [
    {
      title: 'Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary bg-opacity-10',
    },
    {
      title: 'Commandes',
      value: stats.totalCommandes,
      icon: Package,
      color: 'text-success',
      bgColor: 'bg-success bg-opacity-10',
    },
    {
      title: 'Employés',
      value: stats.totalEmployes,
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info bg-opacity-10',
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.chiffreAffaires.toLocaleString()} €`,
      icon: DollarSign,
      color: 'text-warning',
      bgColor: 'bg-warning bg-opacity-10',
    },
  ];

  return (
    <div className="py-4 container-fluid">
      {/* En-tête avec déconnexion */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div></div> {/* Espace vide pour équilibrer la flexbox */}
        <button 
          onClick={handleLogout}
          className="btn btn-outline-danger d-flex align-items-center animate__animated animate__fadeIn"
        >
          <LogOut className="me-2" size={18} />
          Déconnexion
        </button>
      </div>

      {/* En-tête principal */}
      <div className="mb-5 text-center animate__animated animate__fadeInDown">
        <h1 className="mb-2 display-4 fw-bold text-dark">
          NET <span className="text-danger">SYSTEME</span>
        </h1>
        <p className="mb-3 lead text-muted">SIMPLIFIEZ VOTRE VIE</p>
        <div className="px-4 py-2 text-white bg-dark d-inline-block rounded-3">
          <div className="fw-bold fs-5">NET PRO®</div>
          <div className="small">Version 2025</div>
        </div>
      </div>

      {/* Modules principaux - disposition comme sur la capture */}
      <div className="mb-5 row justify-content-center">
        {modules.map((module, index) => (
          <div key={index} className="mb-4 col-12 col-md-6 col-lg-4">
            <div 
              className={`card h-100 shadow-sm border-0 animate__animated animate__fadeInUp`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-4 text-center card-body d-flex flex-column justify-content-center">
                <div className={`${module.color} rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto`} 
                     style={{ width: '80px', height: '80px' }}>
                  <module.icon className="text-white" size={32} />
                </div>
                <h5 className="mb-2 card-title fw-bold text-dark">{module.title}</h5>
                <p className="card-text text-muted small">{module.description}</p>
                <button 
                  onClick={() => navigate(module.path)}
                  className="mt-auto btn btn-outline-dark"
                >
                  Accéder
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques en bas */}
      <div className="mt-5 row">
        <div className="col-12">
          <h3 className="mb-4 text-center fw-bold">Aperçu du système</h3>
        </div>
        {statsCards.map((stat, index) => (
          <div key={index} className="mb-3 col-6 col-md-3">
            <div className="border-0 shadow-sm card h-100 animate__animated animate__fadeIn"
                 style={{ animationDelay: `${index * 200}ms` }}>
              <div className="text-center card-body">
                <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 ${stat.bgColor}`} 
                     style={{ width: '60px', height: '60px' }}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <h4 className="fw-bold text-dark">{stat.value}</h4>
                <p className="mb-0 text-muted small">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activités récentes */}
      <div className="mt-4 row">
        <div className="col-12">
          <div className="border-0 shadow-sm card">
            <div className="bg-transparent border-0 card-header">
              <h5 className="mb-0 fw-bold">Activités récentes</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="border-0 list-group-item d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '40px', height: '40px' }}>
                    <TrendingUp className="text-primary" size={18} />
                  </div>
                  <div>
                    <p className="mb-1 fw-medium">Nouvelle commande créée</p>
                    <small className="text-muted">Il y a 2 heures</small>
                  </div>
                </div>
                <div className="border-0 list-group-item d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '40px', height: '40px' }}>
                    <Calendar className="text-success" size={18} />
                  </div>
                  <div>
                    <p className="mb-1 fw-medium">Intervention planifiée</p>
                    <small className="text-muted">Il y a 4 heures</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;