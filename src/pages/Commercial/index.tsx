import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ShoppingCart, Users, Package, FileText } from 'lucide-react';
import ClientsPage from './ClientsPage';
import ProduitsPage from './ProduitsPage';
import CommandesPage from './CommandesPage';


const CommercialPage: React.FC = () => {
  const tabs = [
    { path: 'clients', label: 'Clients', icon: Users },
    { path: 'produits', label: 'Produits', icon: Package },
    { path: 'commandes', label: 'Commandes', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Commerciale</h1>
          <p className="text-gray-600">Gérez vos clients, produits et commandes</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <Routes>
            <Route index element={<Navigate to="clients" replace />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="produits" element={<ProduitsPage />} />
            <Route path="commandes" element={<CommandesPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default CommercialPage;