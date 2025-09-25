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
  // Removed unused loading state

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      // Removed setLoading(false) since loading state is unused
    }
  };

  const modules = [
    {
      title: 'Gestion commerciale',
      icon: ShoppingCart,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      path: '/commercial',
      description: 'Clients, produits, commandes'
    },
    {
      title: 'Gestion RH',
      icon: Users,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      path: '/rh',
      description: 'Employés, congés, paie'
    },
    {
      title: 'Gestion Comptable',
      icon: CreditCard,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/comptable',
      description: 'Factures, paiements, comptabilité'
    },
    {
      title: 'Gestion intervention',
      icon: Settings,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/intervention',
      description: 'Interventions, maintenance'
    },
    {
      title: 'Gestion utilisateur',
      icon: User,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      path: '/utilisateur',
      description: 'Utilisateurs, permissions'
    },
  ];

  const statsCards = [
    {
      title: 'Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Commandes',
      value: stats.totalCommandes,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Employés',
      value: stats.totalEmployes,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.chiffreAffaires.toLocaleString()} €`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          NET<span className="text-red-500">SYSTEME</span>
        </h1>
        <p className="text-gray-600 mb-4">SIMPLIFIEZ VOTRE VIE</p>
        <div className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg">
          <div className="text-lg font-medium">NET PRO®</div>
          <div className="text-sm">Version 2025</div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modules principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((module, index) => (
          <div
            key={index}
            onClick={() => navigate(module.path)}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="text-center">
              <div className={`w-20 h-20 ${module.color} ${module.hoverColor} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300`}>
                <module.icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
              <p className="text-gray-600 text-sm">{module.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activités récentes</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Nouvelle commande créée</p>
              <p className="text-sm text-gray-600">Il y a 2 heures</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Intervention planifiée</p>
              <p className="text-sm text-gray-600">Il y a 4 heures</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;