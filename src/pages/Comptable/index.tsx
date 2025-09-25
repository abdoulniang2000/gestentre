import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { CreditCard, FileText, TrendingUp, Calculator } from 'lucide-react';
import FacturesPage from './FacturesPage';

const ComptablePage: React.FC = () => {
  const tabs = [
    { path: 'factures', label: 'Factures', icon: FileText },
    { path: 'paiements', label: 'Paiements', icon: CreditCard },
    { path: 'rapports', label: 'Rapports', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Comptable</h1>
          <p className="text-gray-600">Gérez vos factures et comptabilité</p>
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
                      ? 'border-green-500 text-green-600'
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
            <Route index element={<Navigate to="factures" replace />} />
            <Route path="factures" element={<FacturesPage />} />
            <Route path="paiements" element={<div>Module Paiements - En développement</div>} />
            <Route path="rapports" element={<div>Module Rapports - En développement</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ComptablePage;