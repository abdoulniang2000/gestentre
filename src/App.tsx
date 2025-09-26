import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CommercialPage from './pages/Commercial';
import RHPage from './pages/RH';
import ComptablePage from './pages/Comptable';
import InterventionPage from './pages/Intervention';
import UtilisateurPage from './pages/Utilisateur';
import PointagePage from './pages/Pointage';
import DepensesPage from './pages/Depenses';
import InventairePage from './pages/Inventaire';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="commercial/*" element={<CommercialPage />} />
            <Route path="rh/*" element={<RHPage />} />
            <Route path="comptable/*" element={<ComptablePage />} />
            <Route path="intervention/*" element={<InterventionPage />} />
            <Route path="utilisateur" element={<UtilisateurPage />} />
            <Route path="pointage" element={<PointagePage />} />
            <Route path="depenses" element={<DepensesPage />} />
            <Route path="inventaire" element={<InventairePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;