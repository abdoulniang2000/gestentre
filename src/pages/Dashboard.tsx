import React, { useEffect, useState } from 'react';
import { ShoppingCart, Users, CreditCard, Settings, User, TrendingUp, DollarSign, Package, Calendar, TriangleAlert as AlertTriangle, Clock, CircleCheck as CheckCircle } from 'lucide-react';
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

  const alertsCards = [
    {
      title: 'Interventions planifiées',
      value: stats.interventionsPlanifiees,
      icon: Clock,
      color: 'text-info',
      bgColor: 'bg-info bg-opacity-10',
    },
    {
      title: 'Factures en retard',
      value: stats.facturesEnRetard,
      icon: AlertTriangle,
      color: 'text-danger',
      bgColor: 'bg-danger bg-opacity-10',
    },
    {
      title: 'Stock faible',
      value: stats.produitsStockFaible,
      icon: Package,
      color: 'text-warning',
      bgColor: 'bg-warning bg-opacity-10',
    },
    {
      title: 'Messages non lus',
      value: stats.unread_messages || 0,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success bg-opacity-10',
    },
  ];

  if (loading) {
    return (
      <div className="py-4 container-fluid">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 container-fluid">
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

      {/* Statistiques principales */}
      <div className="mb-4 row">
        <div className="col-12">
          <h3 className="mb-3 fw-bold">Aperçu général</h3>
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

      {/* Alertes et notifications */}
      <div className="mb-4 row">
        <div className="col-12">
          <h3 className="mb-3 fw-bold">Alertes et notifications</h3>
        </div>
        {alertsCards.map((alert, index) => (
          <div key={index} className="mb-3 col-6 col-md-3">
            <div className="border-0 shadow-sm card h-100 animate__animated animate__fadeIn"
                 style={{ animationDelay: `${index * 200}ms` }}>
              <div className="text-center card-body">
                <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 ${alert.bgColor}`} 
                     style={{ width: '50px', height: '50px' }}>
                  <alert.icon className={alert.color} size={20} />
                </div>
                <h5 className="fw-bold text-dark">{alert.value}</h5>
                <p className="mb-0 text-muted small">{alert.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modules principaux - disposition comme sur la capture */}
      <div className="mb-5 row justify-content-center">
        <div className="col-12">
          <h3 className="mb-4 text-center fw-bold">Modules de gestion</h3>
        </div>
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

      {/* Activités récentes */}
      <div className="mt-4 row">
        <div className="col-12">
          <div className="border-0 shadow-sm card">
            <div className="bg-transparent border-0 card-header">
              <h5 className="mb-0 fw-bold">Activités récentes</h5>
            </div>
            <div className="card-body">
              {stats.commandesRecentes && stats.commandesRecentes.length > 0 ? (
                <div className="list-group list-group-flush">
                  {stats.commandesRecentes.slice(0, 3).map((commande, index) => (
                    <div key={index} className="border-0 list-group-item d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <TrendingUp className="text-primary" size={18} />
                      </div>
                      <div>
                        <p className="mb-1 fw-medium">Commande #{commande.numero_commande}</p>
                        <small className="text-muted">
                          {new Date(commande.created_at).toLocaleDateString('fr-FR')}
                        </small>
                      </div>
                    </div>
                  ))}
                  {stats.interventionsRecentes && stats.interventionsRecentes.slice(0, 2).map((intervention, index) => (
                    <div key={`int-${index}`} className="border-0 list-group-item d-flex align-items-center">
                      <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{ width: '40px', height: '40px' }}>
                        <Calendar className="text-success" size={18} />
                      </div>
                      <div>
                        <p className="mb-1 fw-medium">Intervention: {intervention.titre}</p>
                        <small className="text-muted">
                          {new Date(intervention.date_intervention).toLocaleDateString('fr-FR')}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted">
                  <Calendar size={48} className="mb-3 opacity-50" />
                  <p>Aucune activité récente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques commerciaux si disponibles */}
      {stats.stats_commerciaux && stats.stats_commerciaux.length > 0 && (
        <div className="mt-4 row">
          <div className="col-12">
            <div className="border-0 shadow-sm card">
              <div className="bg-transparent border-0 card-header">
                <h5 className="mb-0 fw-bold">Performance commerciale</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {stats.stats_commerciaux.slice(0, 3).map((commercial, index) => (
                    <div key={index} className="mb-3 col-md-4">
                      <div className="p-3 border rounded">
                        <h6 className="fw-bold">{commercial.prenom} {commercial.nom}</h6>
                        <div className="d-flex justify-content-between">
                          <span>Prospects:</span>
                          <span className="fw-bold text-info">{commercial.nb_prospects}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Convertis:</span>
                          <span className="fw-bold text-success">{commercial.nb_convertis}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Taux:</span>
                          <span className="fw-bold text-primary">{commercial.taux}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques techniciens si disponibles */}
      {stats.technicien_stats && stats.technicien_stats.length > 0 && (
        <div className="mt-4 row">
          <div className="col-12">
            <div className="border-0 shadow-sm card">
              <div className="bg-transparent border-0 card-header">
                <h5 className="mb-0 fw-bold">Performance technique</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {stats.technicien_stats.slice(0, 3).map((technicien, index) => (
                    <div key={index} className="mb-3 col-md-4">
                      <div className="p-3 border rounded">
                        <h6 className="fw-bold">{technicien.prenom} {technicien.nom}</h6>
                        <div className="d-flex justify-content-between">
                          <span>Présence:</span>
                          <span className="fw-bold text-info">{technicien.taux}%</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Interventions:</span>
                          <span className="fw-bold text-success">{technicien.interventions}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pointage du jour si disponible */}
      {stats.today_attendance && (
        <div className="mt-4 row">
          <div className="col-12">
            <div className="border-0 shadow-sm card">
              <div className="bg-transparent border-0 card-header">
                <h5 className="mb-0 fw-bold">Mon pointage aujourd'hui</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-2 d-flex align-items-center">
                      <CheckCircle className="text-success me-2" size={20} />
                      <span>Arrivée: </span>
                      <span className="fw-bold ms-2">
                        {stats.today_attendance.check_in ? 
                          new Date(stats.today_attendance.check_in).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 
                          'Non pointé'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2 d-flex align-items-center">
                      <Clock className="text-warning me-2" size={20} />
                      <span>Départ: </span>
                      <span className="fw-bold ms-2">
                        {stats.today_attendance.check_out ? 
                          new Date(stats.today_attendance.check_out).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 
                          'Non pointé'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;