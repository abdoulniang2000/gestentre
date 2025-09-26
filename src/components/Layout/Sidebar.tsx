import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', color: 'text-muted' },
    { path: '/commercial', icon: ShoppingCart, label: 'Gestion commerciale', color: 'text-danger' },
    { path: '/rh', icon: Users, label: 'Gestion RH', color: 'text-warning' },
    { path: '/comptable', icon: CreditCard, label: 'Gestion Comptable', color: 'text-success' },
    { path: '/intervention', icon: Settings, label: 'Gestion intervention', color: 'text-primary' },
    { path: '/utilisateur', icon: User, label: 'Gestion utilisateur', color: 'text-info' },
  ];

  return (
    <div className="top-0 z-30 bg-white shadow-lg vh-100 position-fixed start-0" style={{ width: '256px' }}>
      <div className="p-4 h-100 d-flex flex-column">
        {/* En-tête */}
        <div className="mb-4 text-center">
          <h1 className="mb-1 h3 fw-bold text-dark">
            NET<span className="text-danger">SYSTEME</span>
          </h1>
          <p className="mb-3 text-muted small">SIMPLIFIEZ VOTRE VIE</p>
          <div className="px-3 py-2 text-white rounded bg-dark">
            <div className="fw-medium small">NET PRO®</div>
            <div className="opacity-75 small">Version 2025</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow-1">
          <ul className="nav nav-pills flex-column">
            {menuItems.map((item, index) => (
              <li key={item.path} className="mb-2 nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center animate__animated animate__fadeInLeft ${
                      isActive
                        ? 'active bg-primary text-white shadow-sm'
                        : 'text-muted hover-bg-light'
                    }`
                  }
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <item.icon className={`me-3 ${menuItems.find(m => m.path === item.path)?.color}`} size={20} />
                  <span className="fw-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bouton de déconnexion */}
        <div className="pt-3 mt-auto border-top">
          <button
            onClick={logout}
            className="btn btn-outline-danger d-flex align-items-center w-100 animate__animated animate__fadeInUp"
          >
            <LogOut className="me-2" size={18} />
            <span className="fw-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;