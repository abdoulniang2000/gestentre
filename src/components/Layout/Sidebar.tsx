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
    { path: '/dashboard', icon: Home, label: 'Dashboard', color: 'text-gray-600' },
    { path: '/commercial', icon: ShoppingCart, label: 'Gestion commerciale', color: 'text-red-500' },
    { path: '/rh', icon: Users, label: 'Gestion RH', color: 'text-orange-500' },
    { path: '/comptable', icon: CreditCard, label: 'Gestion Comptable', color: 'text-green-500' },
    { path: '/intervention', icon: Settings, label: 'Gestion intervention', color: 'text-blue-500' },
    { path: '/utilisateur', icon: User, label: 'Gestion utilisateur', color: 'text-purple-500' },
  ];

  return (
    <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0 z-30">
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            NET<span className="text-red-500">SYSTEME</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">SIMPLIFIEZ VOTRE VIE</p>
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg mt-4">
            <div className="text-sm font-medium">NET PRO®</div>
            <div className="text-xs">Version 2025</div>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;