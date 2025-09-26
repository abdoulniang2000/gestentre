import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="top-0 bg-white shadow-sm position-fixed border-bottom w-100" 
            style={{ left: '256px', right: '0', zIndex: 1020, height: '70px' }}>
      <div className="px-4 py-3 container-fluid">
        <div className="d-flex align-items-center justify-content-between">
          {/* Barre de recherche */}
          <div className="d-flex align-items-center">
            <div className="position-relative me-4">
              <div className="input-group">
                <span className="bg-transparent input-group-text border-end-0">
                  <Search className="text-muted" size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="form-control border-start-0 ps-2"
                  style={{ borderLeft: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Notifications et profil utilisateur */}
          <div className="d-flex align-items-center">
            {/* Bouton notifications avec badge */}
            <button className="p-2 btn btn-light position-relative me-3 animate__animated animate__pulse animate__infinite" 
                    style={{ animationDuration: '3s' }}>
              <Bell size={20} className="text-muted" />
              <span className="top-0 p-1 border position-absolute start-100 translate-middle bg-danger border-light rounded-circle">
                <span className="visually-hidden">Nouvelles notifications</span>
              </span>
            </button>

            {/* Profil utilisateur */}
            <div className="dropdown">
              <button 
                className="p-0 btn btn-link text-decoration-none dropdown-toggle d-flex align-items-center" 
                type="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                     style={{ width: '36px', height: '36px' }}>
                  <User className="text-white" size={18} />
                </div>
                <div className="text-start d-none d-md-block">
                  <div className="fw-medium text-dark small">{user?.nom}</div>
                  <div className="text-muted text-capitalize small">{user?.role}</div>
                </div>
              </button>
              <ul className="border-0 shadow dropdown-menu dropdown-menu-end animate__animated animate__fadeIn">
                <li>
                  <a className="dropdown-item d-flex align-items-center" href="#">
                    <User className="me-2" size={16} />
                    Mon profil
                  </a>
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center" href="#">
                    <Bell className="me-2" size={16} />
                    Notifications
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item d-flex align-items-center text-danger" href="#">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Déconnexion
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;