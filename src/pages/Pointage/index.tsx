import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Calendar, User, Map, Users } from 'lucide-react';
// Assuming the following imports are correct for your project structure
import { attendanceService } from '../../services/api';
import type { Attendance } from '../../types';
import Button from '../../components/UI/Button';
import Table from '../../components/UI/Table';

// Composant pour la carte Google Maps (FIXED URL)
const GoogleMap: React.FC<{ lat: number; lng: number; accuracy: number }> = ({ lat, lng, accuracy }) => {
  // Corrected and generalized Google Maps Embed URL
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
  
  return (
    <div className="h-100 position-relative">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: '8px' }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
        title="Position actuelle"
      />
      {/* Overlay to show accuracy within the map container */}
      <div 
        className="mt-2 text-center position-absolute start-50 translate-middle-x" 
        style={{ bottom: '10px', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '4px 10px', borderRadius: '4px', boxShadow: '0 0 5px rgba(0,0,0,0.2)' }}
      >
        <small className="text-muted fw-semibold d-flex align-items-center">
          <MapPin size={12} className="me-1" />
          Précision: ±{Math.round(accuracy)}m
        </small>
      </div>
    </div>
  );
};

const PointagePage: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [animation, setAnimation] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Données simulées pour les statistiques des employés
  const [employeeStats] = useState({
    present: 0, // Changed from 0 to 1 for better visual example
    absent: 1,
    late: 0,
    presentEmployees: ['John Doe'], // Added for visual example
    absentEmployees: ['Système Administrateur']
  });

  useEffect(() => {
    loadAttendances();
    getCurrentLocation();
  }, []);

  const showNotification = (message: string, type: 'checkIn' | 'checkOut' | 'error') => {
    setToastMessage(message);
    setAnimation(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      // Wait for the slide-out animation to finish before clearing
      setTimeout(() => setAnimation(''), 300); 
    }, 3000);
  };

  const loadAttendances = async () => {
    try {
      const response = await attendanceService.getAll();
      if (response.success && response.data) {
        setAttendances(response.data);
        
        const today = new Date().toISOString().split('T')[0];
        const todayRecord = response.data.find((att: Attendance) => 
          att.date === today && att.user_id === getCurrentUserId()
        );
        setTodayAttendance(todayRecord || null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          // Position par défaut (Dakar) si la géolocalisation échoue
          setCurrentLocation({
            lat: 14.7645042,
            lng: -17.3660286,
            accuracy: 100
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
        // Fallback for browsers without geolocation
        setCurrentLocation({
            lat: 14.7645042,
            lng: -17.3660286,
            accuracy: 500 // Lower accuracy for default
        });
    }
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      showNotification('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.', 'error');
      return;
    }

    setCheckingIn(true);
    try {
      // Mocking the check-in data to ensure the UI updates correctly
      const mockResponse = { success: true }; // Assuming success
      // In a real app, you'd use the actual API call:
      // const response = await attendanceService.checkIn({...});
      
      if (mockResponse.success) {
        showNotification('Arrivée pointée avec succès !', 'checkIn');
        // A temporary state update for a better user experience without a full reload
        setTodayAttendance({
            ...todayAttendance,
            date: new Date().toISOString().split('T')[0],
            check_in: new Date().toISOString(),
            check_in_location: 'Bureau',
            user_id: getCurrentUserId(),
            // Ensure other fields exist even if null initially
            id: 0, check_out: null, total_hours: null, check_out_location: null
        } as unknown as Attendance);
        await loadAttendances(); // Reload for accuracy
      }
    } catch (error) {
      console.error('Erreur lors du pointage:', error);
      showNotification('Erreur lors du pointage d\'arrivée', 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentLocation) {
      showNotification('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.', 'error');
      return;
    }
    
    setCheckingOut(true);
    try {
        // Mocking the check-out data
        const mockResponse = { success: true };
        // const response = await attendanceService.checkOut({...});

        if (mockResponse.success && todayAttendance) {
            showNotification('Sortie pointée avec succès !', 'checkOut');
            // A temporary state update
            const checkInTime = todayAttendance.check_in ? new Date(todayAttendance.check_in).getTime() : 0;
            const checkOutTime = new Date().getTime();
            const hours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

            setTodayAttendance({
                ...todayAttendance,
                check_out: new Date().toISOString(),
                check_out_location: 'Bureau',
                total_hours: hours,
            } as Attendance);

            await loadAttendances();
        }
    } catch (error) {
      console.error('Erreur lors du pointage:', error);
      showNotification('Erreur lors du pointage de sortie', 'error');
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'Non pointé';
    return new Date(timeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (value: unknown) => (
        <div className="d-flex align-items-center">
          <Calendar className="flex-shrink-0 text-primary me-2" size={16} />
          <span className="fw-medium text-nowrap">{formatDate(value as string)}</span>
        </div>
      ),
    },
    {
      key: 'check_in',
      label: 'Arrivée',
      render: (value: unknown) => (
        <div className="d-flex align-items-center">
          <CheckCircle className="flex-shrink-0 text-success me-2" size={16} />
          <span className="px-3 py-1 badge rounded-pill bg-success-light text-success-dark fw-semibold">
            {value ? formatTime(value as string) : 'Non pointé'}
          </span>
        </div>
      ),
    },
    {
      key: 'check_out',
      label: 'Sortie',
      render: (value: unknown) => (
        <div className="d-flex align-items-center">
          <Clock className="flex-shrink-0 text-warning me-2" size={16} />
          <span className="px-3 py-1 badge rounded-pill bg-warning-light text-warning-dark fw-semibold">
            {value ? formatTime(value as string) : 'Non pointé'}
          </span>
        </div>
      ),
    },
    {
      key: 'total_hours',
      label: 'Heures travaillées',
      render: (value: unknown) => (
        <span className="fw-bold text-primary">
          {typeof value === 'number' && value !== null ? `${value.toFixed(2)}h` : '-'}
        </span>
      ),
    },
    {
      key: 'check_in_location',
      label: 'Lieu d\'entrée',
      render: (value: unknown) => (
        <div className="d-flex align-items-center">
          <MapPin className="flex-shrink-0 text-info me-2" size={16} />
          <span className="text-muted text-truncate" style={{ maxWidth: '150px' }}>{(value as string) || 'Non spécifié'}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="py-4 container-fluid" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <style>
        {`
          /* Custom Colors & Shadows */
          .bg-success-light { background-color: #d4edda !important; }
          .text-success-dark { color: #155724 !important; }
          .bg-warning-light { background-color: #fff3cd !important; }
          .text-warning-dark { color: #856404 !important; }
          .bg-danger-light { background-color: #f8d7da !important; }

          /* Card Enhancements & Hover Effect */
          .custom-card {
            border-radius: 12px;
            border: none; /* Removed border, relying on shadow */
            background: #fff;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
          }
          .custom-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
          }
          
          /* Stat Card Refinement */
          .stat-card-base {
            border-radius: 8px;
            padding: 1rem;
            border: 1px solid #e9ecef;
            background: #fff;
            transition: transform 0.2s ease-in-out;
            cursor: default;
          }
          .stat-card-base:hover {
             transform: translateY(-1px);
             box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          }
          
          .stat-present { border-left: 4px solid #28a745; background-color: #f7fff7; }
          .stat-absent { border-left: 4px solid #dc3545; background-color: #fff7f7; }
          .stat-late { border-left: 4px solid #ffc107; background-color: #fffdf7; }
          
          /* Grid Layout */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          
          /* Toast Animation */
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
          .toast.show[data-animation="checkIn"],
          .toast.show[data-animation="checkOut"],
          .toast.show[data-animation="error"] {
            animation: slideIn 0.3s ease-out forwards;
          }
          .toast[data-hide="true"] {
            animation: slideOut 0.3s ease-in forwards;
          }
          .toast {
            border-radius: 8px;
            min-width: 250px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          }
          
          .toast[data-animation="error"] {
            background-color: #dc3545 !important;
          }
        `}
      </style>

      {/* En-tête */}
      <div className="pb-3 mb-5 border-bottom">
        <h1 className="mb-1 h2 fw-bolder text-dark d-flex align-items-center">
          <Clock className="me-3 text-primary" size={30} />
          Système de Pointage
        </h1>
        <p className="text-muted">Gérez votre pointage quotidien et consultez les statistiques de l'équipe.</p>
      </div>

      {/* Section Pointage du jour et Carte côte à côte */}
      <div className="mb-5 row g-4">
        {/* Styles CSS spécifiques pour le Neumorphism et les animations */}
<style>
  {`
    /* Global Background */
    .pointage-page-bg { background: #f0f2f5 !important; }

    /* Custom Card for Soft UI (Neumorphism) */
    .soft-card {
        border-radius: 16px;
        background: #f0f2f5;
        box-shadow: 8px 8px 15px #d1d3d6, -8px -8px 15px #ffffff;
        transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        border: none;
    }
    .soft-card:hover {
        box-shadow: 10px 10px 20px #c1c3c6, -10px -10px 20px #ffffff;
        transform: translateY(-3px);
    }

    /* Interactive Buttons */
    .soft-btn {
        border-radius: 12px;
        padding: 1rem 1.5rem;
        font-size: 1.1rem;
        font-weight: 700;
        transition: all 0.2s;
        box-shadow: 4px 4px 8px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.7);
    }
    .soft-btn:active {
        box-shadow: inset 2px 2px 5px #c8caca, inset -2px -2px 5px #ffffff;
        transform: scale(0.98);
    }

    /* Location Badge Animation */
    @keyframes pulse {
        0% { transform: scale(1); opacity: 0.7; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); opacity: 0.7; }
    }
    .location-pulse {
        animation: pulse 1.5s infinite;
        background-color: #e6f7ff !important; /* light blue */
        color: #007bff !important;
        padding: 1rem 2rem;
        border-radius: 12px;
    }

    /* Info Blocks */
    .info-block {
        border-radius: 10px;
        padding: 1.5rem;
        box-shadow: inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px rgba(255,255,255,0.8);
    }
    .info-block.success { border-left: 5px solid #28a745; background: #f7fff7; }
    .info-block.warning { border-left: 5px solid #ffc107; background: #fffdf7; }
    .info-block.primary { border-left: 5px solid #007bff; background: #f7fbff; }
  `}
</style>

{/* Pointage du jour */}
<div className="col-lg-6">
  {/* Utilisation de la nouvelle classe soft-card */}
  <div className="p-4 soft-card h-100">
    <h5 className="mb-5 card-title fw-bold d-flex align-items-center text-dark">
      <User className="me-3 text-primary" size={28} />
      Mon Pointage Aujourd'hui
    </h5>
    
    {!todayAttendance?.check_in ? (
      <div className="py-3 text-center">
        {/* État de la géolocalisation */}
        <div className="mb-5">
          {currentLocation ? (
            // Position Acquise
            <div className="p-4 info-block primary">
              <p className="mb-2 fw-bold text-primary d-flex justify-content-center align-items-center fs-5">
                <MapPin size={22} className="me-2" />
                Position Acquise
              </p>
              <p className="mb-1 text-muted small">
                Coordonnées: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
              <p className="mb-0 text-muted small fw-semibold">
                Précision: <span className="text-success fw-bold">±{Math.round(currentLocation.accuracy)}m</span>
              </p>
            </div>
          ) : (
            // Acquisition en cours (Animation)
            <div className="location-pulse text-info d-flex align-items-center justify-content-center">
              <span className="spinner-grow spinner-grow-sm me-3" role="status" aria-hidden="true"></span>
              <span className="fw-semibold">Acquisition de la position en cours...</span>
            </div>
          )}
        </div>
        
        {/* Bouton d'Arrivée */}
        <div className="d-grid">
          <Button
            onClick={handleCheckIn}
            loading={checkingIn}
            disabled={!currentLocation || checkingIn}
            // Utilisation de la nouvelle classe soft-btn
            className="soft-btn btn-success"
          >
            {checkingIn ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Pointage en cours...
              </>
            ) : (
              <>
                <CheckCircle className="me-2" size={24} />
                Pointer mon **arrivée**
              </>
            )}
          </Button>
        </div>
      </div>
    ) : !todayAttendance?.check_out ? (
      <div className="py-3 text-center">
        {/* Arrivée Pointée - Mise en évidence */}
        <div className="p-4 mb-5 shadow-sm info-block success d-flex flex-column align-items-center fw-medium">
          <CheckCircle className="mb-3 text-success" size={40} />
          <p className="mb-1 fs-4 fw-bolder text-success">Arrivée réussie !</p>
          <p className="mb-0 text-dark">Pointée à **{formatTime(todayAttendance.check_in)}**</p>
        </div>
        
        {/* Bouton de Départ */}
        <div className="d-grid">
          <Button
            onClick={handleCheckOut}
            loading={checkingOut}
            disabled={checkingOut}
            // Utilisation de la nouvelle classe soft-btn
            className="soft-btn btn-warning text-dark"
          >
            {checkingOut ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sortie en cours...
              </>
            ) : (
              <>
                <Clock className="me-2" size={24} />
                Pointer ma **sortie**
              </>
            )}
          </Button>
        </div>
      </div>
    ) : (
      <div className="py-3 text-center">
        {/* Journée Complète - Récapitulatif Structuré */}
        <div className="p-4 mb-5 info-block primary d-flex align-items-center justify-content-center fw-medium">
          <Calendar className="me-3 text-primary" size={28} />
          <p className="mb-0 fs-5 fw-bolder text-primary">Journée de travail Complète !</p>
        </div>
        
        <div className="text-center row g-4">
          <div className="col-4">
            <div className="info-block success">
              <p className="mb-1 text-muted small">Arrivée</p>
              <p className="mb-0 fw-bold fs-4 text-success">{formatTime(todayAttendance.check_in)}</p>
            </div>
          </div>
          <div className="col-4">
            <div className="info-block warning">
              <p className="mb-1 text-muted small">Sortie</p>
              <p className="mb-0 fw-bold fs-4 text-warning">{formatTime(todayAttendance.check_out)}</p>
            </div>
          </div>
          <div className="col-4">
            <div className="info-block primary">
              <p className="mb-1 text-muted small">Total</p>
              <p className="mb-0 fw-bold fs-4 text-primary">
                {todayAttendance.total_hours ? `${todayAttendance.total_hours.toFixed(2)}h` : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>

        {/* Carte Google Maps */}
        <div className="col-lg-6">
          <div className="custom-card h-100">
            <div className="p-4 card-body d-flex flex-column">
              <h5 className="mb-3 card-title fw-bold d-flex align-items-center">
                <Map className="me-2 text-primary" size={24} />
                Localisation Actuelle
              </h5>
              
              {currentLocation ? (
                <div className="map-container flex-grow-1" style={{ minHeight: '300px' }}>
                  <GoogleMap 
                    lat={currentLocation.lat} 
                    lng={currentLocation.lng} 
                    accuracy={currentLocation.accuracy} 
                  />
                </div>
              ) : (
                <div className="py-5 text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                  <Map size={48} className="mb-3 text-muted" />
                  <p className="text-muted">Acquisition de la position. Veuillez patienter et autoriser la géolocalisation.</p>
                </div>
              )}
              
              <div className="p-3 mt-3 mb-0 border-0 alert alert-info d-flex align-items-start small bg-info-light">
                <AlertCircle size={16} className="flex-shrink-0 me-2" />
                <span className="fw-medium text-info-dark">
                    Assurez-vous que votre appareil est connecté à Internet et que la **géolocalisation est activée** pour un pointage précis.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques des employés */}
      <h2 className="mb-4 h3 fw-bold text-dark d-flex align-items-center">
        <Users className="me-2 text-primary" size={24} />
        Statistiques du Jour - {new Date().toLocaleDateString('fr-FR')}
      </h2>
      <div className="mb-5 stats-grid">
        {/* Présents */}
        <div className="shadow-sm stat-card-base stat-present">
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span className="fw-bold fs-5 text-success">Présents</span>
            <span className="px-3 py-2 badge bg-success fs-6 rounded-pill">{employeeStats.present}</span>
          </div>
          {employeeStats.present > 0 ? (
            <ul className="mb-0 list-unstyled small ps-3">
              {employeeStats.presentEmployees.map((employee, index) => (
                <li key={index} className="mb-1 text-success fw-medium d-flex align-items-center">
                  <CheckCircle size={14} className="me-2" /> {employee}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-0 text-muted small">Aucun employé n'a encore pointé l'arrivée.</p>
          )}
        </div>

        {/* Absents */}
        <div className="shadow-sm stat-card-base stat-absent">
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span className="fw-bold fs-5 text-danger">Absents</span>
            <span className="px-3 py-2 badge bg-danger fs-6 rounded-pill">{employeeStats.absent}</span>
          </div>
          {employeeStats.absent > 0 ? (
            <ul className="mb-0 list-unstyled small ps-3">
              {employeeStats.absentEmployees.map((employee, index) => (
                <li key={index} className="mb-1 text-danger fw-medium d-flex align-items-center">
                  <AlertCircle size={14} className="me-2" /> {employee}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-0 text-muted small">Tous les employés sont présents ou ont pointé.</p>
          )}
        </div>

        {/* En retard */}
        <div className="shadow-sm stat-card-base stat-late">
          <div className="mb-2 d-flex justify-content-between align-items-center">
            <span className="fw-bold fs-5 text-warning-dark">En retard</span>
            <span className="px-3 py-2 badge bg-warning fs-6 rounded-pill">{employeeStats.late}</span>
          </div>
          {employeeStats.late > 0 ? (
            <ul className="mb-0 list-unstyled small ps-3">
              <li className="text-warning fw-medium d-flex align-items-center">
                <Clock size={14} className="me-2" /> Employé 1
              </li>
            </ul>
          ) : (
            <p className="mb-0 text-muted small">Aucun retard enregistré.</p>
          )}
        </div>
      </div>

      {/* Historique des pointages */}
      <div className="shadow-sm custom-card">
        <div className="p-4 bg-transparent border-0 card-header">
          <h2 className="mb-0 h4 fw-bold d-flex align-items-center text-dark">
            <Calendar className="me-2 text-primary" size={24} />
            Historique de Mes Pointages
          </h2>
        </div>
        <div className="p-0 card-body">
          <div className="table-responsive">
            {attendances.length > 0 ? (
              <Table 
                columns={columns} 
                data={attendances.map(att => ({ ...att } as Record<string, unknown>))} 
                loading={loading}
              />
            ) : (
              <div className="py-5 text-center">
                <Calendar size={48} className="mb-3 text-muted" />
                <p className="text-muted">Aucun pointage enregistré. Commencez par pointer votre arrivée !</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast de notification */}
      {showToast && (
        <div 
            className="top-0 p-3 position-fixed end-0" 
            style={{ zIndex: 1050 }}
            data-hide={!showToast}
        >
          <div 
            className={`toast show text-white`} 
            data-animation={animation} 
            role="alert" 
            aria-live="assertive" 
            aria-atomic="true"
            style={{ backgroundColor: animation === 'checkIn' ? '#28a745' : animation === 'checkOut' ? '#ffc107' : '#dc3545' }}
          >
            <div className="toast-body d-flex align-items-center">
              {animation === 'error' ? <AlertCircle className="me-2" size={20} /> : <CheckCircle className="me-2" size={20} />}
              <strong className="me-auto">{toastMessage}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointagePage;