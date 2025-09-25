import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Users, Calendar, DollarSign } from 'lucide-react';
import EmployesPage from './EmployesPage';

const RHPage: React.FC = () => {
  const tabs = [
    { path: 'employes', label: 'Employés', icon: Users },
    { path: 'conges', label: 'Congés', icon: Calendar },
    { path: 'paie', label: 'Paie', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion RH</h1>
          <p className="text-gray-600">Gérez vos employés et ressources humaines</p>
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
                      ? 'border-orange-500 text-orange-600'
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
            <Route index element={<Navigate to="employes" replace />} />
            <Route path="employes" element={<EmployesPage />} />
            <Route path="conges" element={<div>Module Congés - En développement</div>} />
            <Route path="paie" element={<div>Module Paie - En développement</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default RHPage;