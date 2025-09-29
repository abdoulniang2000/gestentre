import React, { useEffect, useState } from 'react';
import { ShoppingCart, Users, CreditCard, Settings, User, TrendingUp, DollarSign, Package, Calendar, AlertTriangle, Clock, CheckCircle, MapPin, BarChart3, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/api';
import type { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await dashboardService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      title: 'Gestion commerciale',
      icon: ShoppingCart,
      color: 'danger',
      path: '/commercial',
      description: 'Clients, produits, commandes',
      count: stats.totalClients + stats.totalCommandes
    },
    {
      title: 'Gestion RH',
      icon: Users,
      color: 'warning',
      path: '/rh',
      description: 'Employés, congés, paie',
      count: stats.totalEmployes
    },
    {
      title: 'Gestion Comptable',
      icon: CreditCard,
      color: 'success',
      path: '/comptable',
      description: 'Factures, paiements',
      count: stats.totalFactures
    },
    {
      title: 'Interventions',
      icon: Settings,
      color: 'primary',
      path: '/intervention',
      description: 'Maintenance, support',
      count: stats.interventionsPlanifiees
    },
    {
      title: 'Pointage',
      icon: Clock,
      color: 'info',
      path: '/pointage',
      description: 'Gestion du temps',
      count: 0
    },
    {
      title: 'Inventaire',
      icon: Package,
      color: 'secondary',
      path: '/inventaire',
      description: 'Stock, produits',
      count: stats.produitsStockFaible
    }
  ];

  const statsCards = [
    {
      title: 'Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'primary',
      bgColor: 'bg-primary',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Commandes',
      value: stats.totalCommandes,
      icon: Package,
      color: 'success',
      bgColor: 'bg-success',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.chiffreAffaires.toLocaleString()} €`,
      icon: DollarSign,
      color: 'warning',
      bgColor: 'bg-warning',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Interventions',
      value: stats.interventionsPlanifiees,
      icon: Settings,
      color: 'info',
      bgColor: 'bg-info',
      change: '-3%',
      changeType: 'negative'
    }
  ];

  const alertsCards = [
    {
      title: 'Factures en retard',
      value: stats.facturesEnRetard,
      icon: AlertTriangle,
      color: 'danger',
      bgColor: 'bg-danger',
      description: 'Nécessitent un suivi'
    },
    {
      title: 'Stock faible',
      value: stats.produitsStockFaible,
      icon: Package,
      color: 'warning',
      bgColor: 'bg-warning',
      description: 'Réapprovisionnement requis'
    },
    {
      title: 'Tâches en cours',
      value: stats.interventionsPlanifiees,
      icon: Clock,
      color: 'info',
      bgColor: 'bg-info',
      description: 'À traiter aujourd\'hui'
    },
    {
      title: 'Messages non lus',
      value: 5,
      icon: CheckCircle,
      color: 'success',
      bgColor: 'bg-success',
      description: 'Notifications importantes'
    }
  ];

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
          <h4 className="text-muted">Chargement du tableau de bord...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* En-tête principal */}
      <div className="mb-5 text-center animate__animated animate__fadeInDown">
        <div className="mb-4">
          <div className="bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
               style={{ 
                 width: '80px', 
                 height: '80px',
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
               }}>
            <BarChart3 className="text-white" size={40} />
          </div>
          <h1 className="display-4 fw-bold text-dark mb-2">
            Tableau de <span className="text-primary">Bord</span>
          </h1>
          <p className="lead text-muted mb-4">Vue d'ensemble de votre activité</p>
          <div className="bg-dark text-white d-inline-block px-4 py-2 rounded-pill">
            <small className="fw-bold">
              <Calendar className="me-2" size={16} />
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </small>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="row mb-5">
        <div className="col-12 mb-4">
          <h2 className="h3 fw-bold text-dark d-flex align-items-center">
            <TrendingUp className="me-3 text-primary" size={28} />
            Indicateurs Clés
          </h2>
        </div>
        {statsCards.map((stat, index) => (
          <div key={index} className="col-xl-3 col-lg-6 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100 animate__animated animate__fadeInUp"
                 style={{ animationDelay: `${index * 100}ms` }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className={`${stat.bgColor} bg-opacity-10 rounded-3 p-3`}>
                    <stat.icon className={`text-${stat.color}`} size={28} />
                  </div>
                  <div className={`badge ${stat.changeType === 'positive' ? 'bg-success' : 'bg-danger'} bg-opacity-10 ${stat.changeType === 'positive' ? 'text-success' : 'text-danger'}`}>
                    {stat.change}
                  </div>
                </div>
                <h3 className="fw-bold text-dark mb-1">{stat.value}</h3>
                <p className="text-muted mb-0 small">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alertes et notifications */}
      <div className="row mb-5">
        <div className="col-12 mb-4">
          <h2 className="h3 fw-bold text-dark d-flex align-items-center">
            <AlertTriangle className="me-3 text-warning" size={28} />
            Alertes & Notifications
          </h2>
        </div>
        {alertsCards.map((alert, index) => (
          <div key={index} className="col-xl-3 col-lg-6 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100 animate__animated animate__fadeInUp"
                 style={{ animationDelay: `${index * 100}ms` }}>
              <div className="card-body p-4 text-center">
                <div className={`${alert.bgColor} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                     style={{ width: '60px', height: '60px' }}>
                  <alert.icon className={`text-${alert.color}`} size={24} />
                </div>
                <h4 className="fw-bold text-dark mb-1">{alert.value}</h4>
                <h6 className="fw-semibold text-dark mb-2">{alert.title}</h6>
                <p className="text-muted mb-0 small">{alert.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modules principaux */}
      <div className="row mb-5">
        <div className="col-12 mb-4">
          <h2 className="h3 fw-bold text-dark d-flex align-items-center">
            <Settings className="me-3 text-primary" size={28} />
            Modules de Gestion
          </h2>
        </div>
        {modules.map((module, index) => (
          <div key={index} className="col-xl-4 col-lg-6 col-md-6 mb-4">
            <div 
              className="card border-0 shadow-sm h-100 animate__animated animate__fadeInUp cursor-pointer"
              style={{ 
                animationDelay: `${index * 100}ms`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onClick={() => navigate(module.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="card-body p-4 text-center">
                <div className={`bg-${module.color} bg-opacity-10 rounded-3 d-inline-flex align-items-center justify-content-center mb-3`}
                     style={{ width: '70px', height: '70px' }}>
                  <module.icon className={`text-${module.color}`} size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">{module.title}</h5>
                <p className="text-muted mb-3 small">{module.description}</p>
                {module.count > 0 && (
                  <div className={`badge bg-${module.color} bg-opacity-10 text-${module.color} px-3 py-2`}>
                    {module.count} éléments
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activités récentes */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="fw-bold text-dark d-flex align-items-center mb-0">
                <FileText className="me-3 text-primary" size={24} />
                Activités Récentes
              </h5>
            </div>
            <div className="card-body">
              {stats.commandesRecentes && stats.commandesRecentes.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.commandesRecentes.slice(0, 5).map((commande, index) => (
                    <div key={index} className="list-group-item border-0 px-0 py-3 animate__animated animate__fadeInLeft"
                         style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '45px', height: '45px' }}>
                          <ShoppingCart className="text-primary" size={20} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-semibold mb-1">Commande #{commande.numero_commande}</h6>
                          <p className="text-muted mb-0 small">
                            {new Date(commande.created_at).toLocaleDateString('fr-FR')} • 
                            <span className="fw-medium"> {commande.montant_total}€</span>
                          </p>
                        </div>
                        <div className={`badge bg-${commande.statut === 'livree' ? 'success' : 'warning'} bg-opacity-10 text-${commande.statut === 'livree' ? 'success' : 'warning'}`}>
                          {commande.statut}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <FileText size={48} className="text-muted mb-3 opacity-50" />
                  <p className="text-muted">Aucune activité récente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="fw-bold text-dark d-flex align-items-center mb-0">
                <Calendar className="me-3 text-success" size={24} />
                Interventions Prochaines
              </h5>
            </div>
            <div className="card-body">
              {stats.interventionsRecentes && stats.interventionsRecentes.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.interventionsRecentes.slice(0, 3).map((intervention, index) => (
                    <div key={index} className="list-group-item border-0 px-0 py-3 animate__animated animate__fadeInRight"
                         style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="d-flex align-items-start">
                        <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                             style={{ width: '35px', height: '35px' }}>
                          <Settings className="text-success" size={16} />
                        </div>
                        <div>
                          <h6 className="fw-semibold mb-1 small">{intervention.titre}</h6>
                          <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                            {new Date(intervention.date_intervention).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Calendar size={40} className="text-muted mb-2 opacity-50" />
                  <p className="text-muted small">Aucune intervention planifiée</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .card:hover {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;