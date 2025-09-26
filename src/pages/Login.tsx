import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'animate.css/animate.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animate, setAnimate] = useState(false);

  const { user, login } = useAuth();

  useEffect(() => {
    // Animation d'entrée
    setAnimate(true);
  }, []);

  // If the user is already logged in, redirect to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 overflow-hidden min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative">
      {/* Background avec animations Bootstrap */}
      <div className="top-0 position-absolute w-100 h-100 start-0">
        <div className="position-absolute bg-primary bg-opacity-10 rounded-circle top-25 start-25 w-75 h-75 animate__animated animate__pulse animate__infinite"></div>
        <div className="position-absolute bg-info bg-opacity-10 rounded-circle top-50 end-25 w-75 h-75 animate__animated animate__pulse animate__infinite animate__delay-1s"></div>
        <div className="position-absolute bg-success bg-opacity-10 rounded-circle bottom-25 start-33 w-75 h-75 animate__animated animate__pulse animate__infinite animate__delay-2s"></div>
      </div>

      <div className={`position-relative z-3 w-100 ${animate ? 'animate__animated animate__fadeInUp' : 'opacity-0'}`} style={{ maxWidth: '400px' }}>
        <div className="border-0 shadow-lg card rounded-3">
          <div className="p-5 card-body">
            <div className="mb-4 text-center">
              {/* Logo avec animation */}
              <div className="mb-4 animate__animated animate__bounceIn">
                <img 
                  src="/src/assets/logo.png" 
                  alt="NETSYSTEME Logo" 
                  className="img-fluid" 
                  style={{ maxHeight: '80px' }}
                />
              </div>
              <h2 className="mb-2 card-title fw-bold text-dark">Connexion</h2>
              <p className="text-muted">Accédez à votre espace de travail</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div 
                  className="alert alert-danger d-flex align-items-center animate__animated animate__shakeX" 
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-semibold">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control form-control-lg"
                  placeholder="admin@entreprise.fr"
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control form-control-lg"
                  placeholder="••••••••"
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="form-check-input"
                />
                <label htmlFor="remember-me" className="form-check-label">
                  Se souvenir de moi
                </label>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="py-2 btn btn-primary btn-lg w-100 fw-semibold"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Informations du compte démo */}
            <div className="mt-4 text-center">
              <div className="border-0 card bg-light">
                <div className="py-3 card-body">
                  <small className="text-muted">
                    Compte de démonstration: <br />
                    <span className="fw-bold">admin@entreprise.fr</span> / <span className="fw-bold">admin123</span>
                  </small>
                </div>
              </div>
              
              <a 
                href="/" 
                className="mt-3 btn btn-link text-decoration-none animate__animated animate__fadeIn animate__delay-1s"
              >
                <i className="bi bi-arrow-left me-1"></i>
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;