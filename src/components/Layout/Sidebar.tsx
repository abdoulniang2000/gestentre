import React from 'react';
import { NavLink } from 'react-router-dom';
import { Hop as Home, ShoppingCart, Users, CreditCard, Settings, LogOut, User, Clock, DollarSign, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { path: '/homepage', icon: Home, label: 'Accueil', color: 'text-primary' },
    { path: '/dashboard', icon: Home, label: 'Dashboard', color: 'text-info' },
    { path: '/commercial', icon: ShoppingCart, label: 'Commercial', color: 'text-danger' },
    { path: '/rh', icon: Users, label: 'Ressources Humaines', color: 'text-warning' },
    { path: '/comptable', icon: CreditCard, label: 'Comptabilité', color: 'text-success' },
    { path: '/intervention', icon: Settings, label: 'Interventions', color: 'text-primary' },
    { path: '/pointage', icon: Clock, label: 'Pointage', color: 'text-info' },
    { path: '/depenses', icon: DollarSign, label: 'Dépenses', color: 'text-warning' },
    { path: '/inventaire', icon: Package, label: 'Inventaire', color: 'text-success' },
    { path: '/utilisateur', icon: User, label: 'Utilisateurs', color: 'text-secondary' },
  ];

  return (
    <div className="position-fixed top-0 start-0 vh-100 bg-white shadow-lg border-end" style={{ width: '280px', zIndex: 1030 }}>
      <div className="h-100 d-flex flex-column">
        {/* En-tête avec logo */}
        <div className="p-4 border-bottom bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="text-center text-white">
            <div className="mb-3 animate__animated animate__bounceIn">
              <div className="mx-auto bg-white rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: '60px', height: '60px' }}>
                <Settings className="text-primary" size={28} />
              </div>
            </div>
            <h4 className="mb-1 fw-bold">NET<span className="text-warning">SYSTÈME</span></h4>
            <p className="mb-0 small opacity-75">Gestion d'Entreprise</p>
          </div>
        </div>

        {/* Profil utilisateur */}
        <div className="p-3 border-bottom bg-light">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '40px', height: '40px' }}>
              <User className="text-white" size={18} />
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold text-dark small">{user?.nom}</div>
              <div className="text-muted text-capitalize" style={{ fontSize: '0.75rem' }}>{user?.role}</div>
            </div>
            <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1 p-3 overflow-auto">
          <ul className="nav nav-pills flex-column">
            {menuItems.map((item, index) => (
              <li key={item.path} className="mb-2 nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center rounded-3 transition-all animate__animated animate__fadeInLeft ${
                      isActive
                        ? 'active bg-primary text-white shadow-sm'
                        : 'text-dark hover-bg-light'
                    }`
                  }
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    padding: '12px 16px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <item.icon className={`me-3 ${isActive ? 'text-white' : item.color}`} size={20} />
                  <span className="fw-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bouton de déconnexion */}
        <div className="p-3 border-top">
          <button
            onClick={logout}
            className="btn btn-outline-danger d-flex align-items-center w-100 rounded-3 animate__animated animate__fadeInUp"
            style={{ padding: '12px 16px' }}
          >
            <LogOut className="me-2" size={18} />
            <span className="fw-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      <style>{`
        .hover-bg-light:hover {
          background-color: #f8f9fa !important;
          transform: translateX(5px);
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;