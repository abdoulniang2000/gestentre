import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/UI/Button';
import { Eye, EyeOff, Shield, Lock, Mail, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);

  const { user, login } = useAuth();

  useEffect(() => {
    setAnimate(true);
  }, []);

  if (user) {
    return <Navigate to="/homepage" replace />;
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
         style={{ 
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           fontFamily: 'system-ui, -apple-system, sans-serif'
         }}>
      
      {/* Particules animées en arrière-plan */}
      <div className="position-absolute w-100 h-100" style={{ zIndex: 1 }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="position-absolute rounded-circle bg-white"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Formes géométriques décoratives */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
        <div className="position-absolute bg-white rounded-circle opacity-10"
             style={{ 
               width: '300px', 
               height: '300px', 
               top: '-150px', 
               right: '-150px',
               animation: 'pulse 4s ease-in-out infinite'
             }}></div>
        <div className="position-absolute bg-white rounded-circle opacity-5"
             style={{ 
               width: '200px', 
               height: '200px', 
               bottom: '-100px', 
               left: '-100px',
               animation: 'pulse 3s ease-in-out infinite reverse'
             }}></div>
      </div>

      <div className={`position-relative ${animate ? 'animate__animated animate__fadeInUp' : 'opacity-0'}`} 
           style={{ zIndex: 10, maxWidth: '450px', width: '100%', margin: '0 20px' }}>
        
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          {/* En-tête avec gradient */}
          <div className="text-center text-white p-5"
               style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="mb-4 animate__animated animate__bounceIn">
              <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center"
                   style={{ width: '80px', height: '80px' }}>
                <Shield className="text-white" size={40} />
              </div>
            </div>
            <h1 className="h3 fw-bold mb-2">Connexion Sécurisée</h1>
            <p className="mb-0 opacity-90">Accédez à votre espace de gestion</p>
          </div>

          <div className="card-body p-5">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger d-flex align-items-center animate__animated animate__shakeX mb-4" 
                     role="alert">
                  <Lock className="me-2" size={18} />
                  <div>{error}</div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="form-label fw-semibold text-dark">
                  <Mail className="me-2" size={16} />
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control form-control-lg rounded-3 border-2"
                  placeholder="votre@email.com"
                  style={{ 
                    borderColor: '#e9ecef',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label fw-semibold text-dark">
                  <Lock className="me-2" size={16} />
                  Mot de passe
                </label>
                <div className="position-relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control form-control-lg rounded-3 border-2 pe-5"
                    placeholder="••••••••"
                    style={{ 
                      borderColor: '#e9ecef',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ zIndex: 5 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-4 d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="form-check-input"
                  />
                  <label htmlFor="remember-me" className="form-check-label text-muted">
                    Se souvenir de moi
                  </label>
                </div>
                <a href="#" className="text-decoration-none small fw-medium"
                   style={{ color: '#667eea' }}>
                  Mot de passe oublié ?
                </a>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="btn btn-lg w-100 fw-semibold rounded-3 mb-4"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  padding: '12px 0'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ms-2" size={18} />
                  </>
                )}
              </Button>
            </form>

            {/* Informations du compte démo */}
            <div className="text-center">
              <div className="card bg-light border-0 rounded-3">
                <div className="card-body py-3">
                  <h6 className="fw-bold text-dark mb-2">
                    <Shield className="me-2" size={16} />
                    Compte de démonstration
                  </h6>
                  <div className="row g-2 text-center">
                    <div className="col-6">
                      <div className="bg-white rounded-2 p-2">
                        <small className="text-muted d-block">Email</small>
                        <code className="small fw-bold text-primary">admin@entreprise.fr</code>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-white rounded-2 p-2">
                        <small className="text-muted d-block">Mot de passe</small>
                        <code className="small fw-bold text-primary">admin123</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-white opacity-75 mb-2">
            © 2024 NetSysteme - Tous droits réservés
          </p>
          <div className="d-flex justify-content-center gap-3">
            <a href="#" className="text-white opacity-75 text-decoration-none small">
              Conditions d'utilisation
            </a>
            <span className="text-white opacity-50">•</span>
            <a href="#" className="text-white opacity-75 text-decoration-none small">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.05); opacity: 0.2; }
        }
        
        .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;