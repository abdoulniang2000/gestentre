import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { name: 'RH', path: '/rh', icon: '🧑‍💼', color: 'from-cyan-400 to-blue-600' },
  { name: 'Commercial', path: '/commercial', icon: '📈', color: 'from-pink-400 to-red-600' },
  { name: 'Comptabilité', path: '/comptable', icon: '💰', color: 'from-green-400 to-emerald-600' },
  { name: 'Interventions', path: '/intervention', icon: '🛠️', color: 'from-orange-400 to-yellow-600' },
  { name: 'Inventaire', path: '/inventaire', icon: '📦', color: 'from-purple-400 to-violet-600' },
  { name: 'Pointage', path: '/pointage', icon: '⏰', color: 'from-teal-400 to-cyan-600' },
  { name: 'Dépenses', path: '/depenses', icon: '💸', color: 'from-rose-400 to-pink-600' },
  { name: 'Utilisateur', path: '/utilisateur', icon: '⚙️', color: 'from-indigo-400 to-blue-600' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const numItems = menuItems.length;
  const angleStep = 360 / numItems;
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.35;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMenuClick = (item: { name?: string; path: string; icon?: string; color?: string; }) => {
      navigate(item.path);
    };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100vw',
      background: 'linear-gradient(135deg, #1f2937 0%, #1e40af 50%, #7c3aed 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      overflowY: 'auto',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      
      {/* Particules de fond */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '3px',
              height: '3px',
              backgroundColor: '#06b6d4',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `pulse 2s infinite ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '1rem',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '1.3rem',
            fontFamily: 'monospace',
            color: '#06b6d4',
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            {time.toLocaleTimeString('fr-FR')}
          </div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #06b6d4, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
            textShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
          }}>
            GESTION ENTREPRISE
          </h1>
          <div style={{
            fontSize: '1.1rem',
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontWeight: '500'
          }}>
            Système de Gestion Intégré
          </div>
        </div>
        
        {/* Badge 24/7 */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -100px)',
          zIndex: 20
        }}>
          <div style={{
            padding: '0.75rem 2rem',
            background: 'linear-gradient(to right, #ef4444, #ec4899)',
            borderRadius: '50px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            border: '2px solid #ef4444',
            animation: 'pulse 2s infinite'
          }}>
            24/7
          </div>
        </div>

        {/* Conteneur principal avec plus d'espace */}
        <div style={{
          position: 'relative',
          width: `${2 * radius + 280}px`,
          height: `${2 * radius + 280}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '1rem 0'
        }}>
          
          {/* Anneaux rotatifs avec tailles ajustées */}
          {[1, 2, 3].map((ring) => (
            <div
              key={ring}
              style={{
                position: 'absolute',
                width: `${ring * 220}px`,
                height: `${ring * 220}px`,
                border: ring === 1 ? '2px solid rgba(6, 182, 212, 0.3)' : 
                        ring === 2 ? '2px solid rgba(236, 72, 153, 0.3)' : 
                        '2px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '50%',
                animation: `rotate ${15 + ring * 5}s linear infinite ${ring % 2 === 0 ? 'reverse' : 'normal'}`
              }}
            />
          ))}

          {/* Logo central plus grand */}
          <div 
            onClick={handleLogoClick}
            style={{
              position: 'relative',
              zIndex: 20,
              width: '160px',
              height: '160px',
              background: 'linear-gradient(135deg, #374151, #1f2937)',
              border: '4px solid #06b6d4',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(6, 182, 212, 0.5)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              padding: '1rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ color: '#06b6d4', marginBottom: '0.5rem' }}>
              <rect x="6" y="6" width="36" height="8" fill="currentColor" opacity="0.6"/>
              <rect x="6" y="18" width="36" height="8" fill="currentColor" opacity="0.8"/>
              <rect x="6" y="30" width="36" height="8" fill="currentColor"/>
              <rect x="10" y="10" width="8" height="4" fill="currentColor"/>
              <rect x="22" y="10" width="8" height="4" fill="currentColor"/>
              <rect x="10" y="22" width="8" height="4" fill="currentColor"/>
              <rect x="22" y="22" width="8" height="4" fill="currentColor"/>
              <rect x="10" y="34" width="8" height="4" fill="currentColor"/>
              <rect x="22" y="34" width="8" height="4" fill="currentColor"/>
            </svg>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 'bold',
              color: '#06b6d4',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}>
              NetSystem
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '24px',
              height: '24px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite'
            }}>
              🔒
            </div>
          </div>

          {/* Boutons de menu avec meilleur espacement */}
          {menuItems.map((item, index) => {
            const angle = index * angleStep - 90;
            const rad = angle * (Math.PI / 180);
            const x = radius + 140 + radius * Math.cos(rad);
            const y = radius + 140 + radius * Math.sin(rad);
            const isHovered = hoveredIndex === index;
            
            return (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})`,
                  width: '140px',
                  height: '140px',
                  background: isHovered 
                    ? 'linear-gradient(135deg, #374151, #1f2937)' 
                    : 'linear-gradient(135deg, #374151, #1f2937)',
                  border: isHovered ? '3px solid #06b6d4' : '2px solid #4b5563',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isHovered 
                    ? '0 0 40px rgba(6, 182, 212, 0.6)' 
                    : '0 6px 20px rgba(0, 0, 0, 0.4)',
                  animation: `slideIn 0.8s ease-out forwards ${index * 0.1}s`,
                  opacity: 0,
                  padding: '1.5rem'
                }}
              >
                <span style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.75rem',
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  color: isHovered ? '#06b6d4' : '#d1d5db',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'color 0.3s ease',
                  lineHeight: '1.2',
                  marginBottom: '0.5rem'
                }}>
                  {item.name}
                </span>
                <div style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
              </button>
            );
          })}
        </div>

        {/* Indicateurs de statut avec meilleur espacement */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginTop: '1rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <span>Connexion Sécurisée</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <span>Système Opérationnel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#06b6d4',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            <span>NetSysteme v2.1</span>
          </div>
        </div>

        {/* Section supplémentaire visible en défilant */}
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          maxWidth: '800px',
          width: '90%'
        }}>
          <h2 style={{
            color: '#06b6d4',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Informations Système
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            color: '#d1d5db'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>99.9%</div>
              <div style={{ fontSize: '0.8rem' }}>Uptime</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#3b82f6' }}>1,234</div>
              <div style={{ fontSize: '0.8rem' }}>Utilisateurs Actifs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ec4899' }}>24/7</div>
              <div style={{ fontSize: '0.8rem' }}>Support</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.8rem'
        }}>
          <p>© 2024 GESTENTRE - Tous droits réservés</p>
          <p style={{ marginTop: '0.5rem' }}>NetSystem v2.1 - Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3) rotate(180deg);
          }
          70% {
            transform: translate(-50%, -50%) scale(1.2) rotate(-10deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #0891b2, #2563eb);
        }
      `}</style>
    </div>
  );
};

export default HomePage;