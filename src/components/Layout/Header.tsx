import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Settings, LogOut, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications] = useState([
    { id: 1, message: 'Nouvelle commande reçue', time: '5 min', type: 'success' },
    { id: 2, message: 'Facture en retard', time: '1h', type: 'warning' },
    { id: 3, message: 'Intervention planifiée', time: '2h', type: 'info' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="position-fixed bg-white shadow-sm border-bottom w-100" 
            style={{ left: '280px', right: '0', zIndex: 1020, height: '70px', top: 0 }}>
      <div className="container-fluid px-4 py-3 h-100">
        <div className="d-flex align-items-center justify-content-between h-100">
          {/* Barre de recherche et informations */}
          <div className="d-flex align-items-center">
            <div className="position-relative me-4">
              <div className="input-group" style={{ width: '350px' }}>
                <span className="input-group-text bg-transparent border-end-0">
                  <Search className="text-muted" size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher clients, produits, commandes..."
                  className="form-control border-start-0 ps-2"
                  style={{ borderLeft: 'none' }}
                />
              </div>
            </div>
            
            {/* Horloge */}
            <div className="d-none d-lg-block me-4">
              <div className="d-flex align-items-center text-muted">
                <Calendar className="me-2" size={16} />
                <span className="small fw-medium">
                  {currentTime.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
                <span className="mx-2">•</span>
                <span className="small fw-bold text-primary">
                  {currentTime.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="d-flex align-items-center">
            {/* Notifications */}
            <div className="dropdown me-3">
              <button 
                className="btn btn-light position-relative rounded-circle animate__animated animate__pulse animate__infinite" 
                style={{ animationDuration: '3s', width: '45px', height: '45px' }}
                type="button" 
                data-bs-toggle="dropdown"
              >
                <Bell size={20} className="text-muted" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.length}
                  <span className="visually-hidden">notifications non lues</span>
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 animate__animated animate__fadeIn" style={{ width: '320px' }}>
                <li className="dropdown-header d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Notifications</span>
                  <span className="badge bg-primary rounded-pill">{notifications.length}</span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                {notifications.map((notif) => (
                  <li key={notif.id}>
                    <a className="dropdown-item py-3 border-bottom" href="#">
                      <div className="d-flex">
                        <div className={`rounded-circle me-3 d-flex align-items-center justify-content-center ${
                          notif.type === 'success' ? 'bg-success' : 
                          notif.type === 'warning' ? 'bg-warning' : 'bg-info'
                        }`} style={{ width: '8px', height: '8px' }}></div>
                        <div className="flex-grow-1">
                          <div className="fw-medium small">{notif.message}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>Il y a {notif.time}</div>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item text-center text-primary fw-medium" href="#">
                    Voir toutes les notifications
                  </a>
                </li>
              </ul>
            </div>

            {/* Messages */}
            <button className="btn btn-light position-relative rounded-circle me-3" style={{ width: '45px', height: '45px' }}>
              <Mail size={20} className="text-muted" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                2
              </span>
            </button>

            {/* Profil utilisateur */}
            <div className="dropdown">
              <button 
                className="btn btn-link text-decoration-none dropdown-toggle d-flex align-items-center p-2 rounded-3" 
                type="button" 
                data-bs-toggle="dropdown"
                style={{ border: '2px solid #e9ecef' }}
              >
                <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{ 
                       width: '40px', 
                       height: '40px',
                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                     }}>
                  <User className="text-white" size={18} />
                </div>
                <div className="text-start d-none d-md-block">
                  <div className="fw-semibold text-dark small">{user?.nom}</div>
                  <div className="text-muted text-capitalize" style={{ fontSize: '0.75rem' }}>{user?.role}</div>
                </div>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 animate__animated animate__fadeIn">
                <li className="dropdown-header">
                  <div className="d-flex align-items-center">
                    <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ 
                           width: '35px', 
                           height: '35px',
                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                         }}>
                      <User className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="fw-bold">{user?.nom}</div>
                      <div className="text-muted small">{user?.email}</div>
                    </div>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item d-flex align-items-center py-2" href="#">
                    <User className="me-3" size={16} />
                    Mon profil
                  </a>
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center py-2" href="#">
                    <Settings className="me-3" size={16} />
                    Paramètres
                  </a>
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center py-2" href="#">
                    <Bell className="me-3" size={16} />
                    Notifications
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item d-flex align-items-center py-2 text-danger"
                    onClick={logout}
                  >
                    <LogOut className="me-3" size={16} />
                    Déconnexion
                  </button>
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