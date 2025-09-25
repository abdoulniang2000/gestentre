import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Settings, Calendar, Wrench, BarChart3 } from 'lucide-react';
import InterventionsPage from './InterventionsPage';

const InterventionPage: React.FC = () => {
  const tabs = [
    { path: 'interventions', label: 'Interventions', icon: Wrench },
    { path: 'planning', label: 'Planning', icon: Calendar },
    { path: 'rapports', label: 'Rapports', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Intervention</h1>
          <p className="text-gray-600">Gérez vos interventions et maintenance</p>
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
                      ? 'border-blue-500 text-blue-600'
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
            <Route index element={<Navigate to="interventions" replace />} />
            <Route path="interventions" element={<InterventionsPage />} />
            <Route path="planning" element={<div>Module Planning - En développement</div>} />
            <Route path="rapports" element={<div>Module Rapports - En développement</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default InterventionPage;