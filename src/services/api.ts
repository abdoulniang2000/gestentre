import axios from 'axios';
import type { AuthResponse, ApiResponse, User, Client, Produit, Commande, Employe, Facture, Intervention } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services de dashboard
export const dashboardService = {
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getActivities: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/dashboard/activities');
    return response.data;
  },
};

// Services de pointage/attendance
export const attendanceService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/attendance');
    return response.data;
  },

  checkIn: async (data: { latitude: number; longitude: number; location_name?: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/attendance/check-in', data);
    return response.data;
  },

  checkOut: async (data: { latitude: number; longitude: number; location?: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/attendance/check-out', data);
    return response.data;
  },

  justifyLate: async (reason: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/attendance/justify-late', { reason });
    return response.data;
  },
};

// Services de dépenses
export const expenseService = {
  getAll: async (site?: string): Promise<ApiResponse<any[]>> => {
    const url = site ? `/expenses/${site}` : '/expenses';
    const response = await api.get(url);
    return response.data;
  },

  create: async (expense: any, site: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/expenses/${site}`, expense);
    return response.data;
  },

  approve: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.post(`/expenses/${id}/approve`);
    return response.data;
  },

  reject: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.post(`/expenses/${id}/reject`);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

// Services d'inventaire
export const inventoryService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/inventory');
    return response.data;
  },

  create: async (item: FormData): Promise<ApiResponse<any>> => {
    const response = await api.post('/inventory', item, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id: number, item: FormData): Promise<ApiResponse<any>> => {
    const response = await api.put(`/inventory/${id}`, item, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  updateQuantity: async (id: number, quantity: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/inventory/${id}/update-quantity`, { quantity });
    return response.data;
  },

  outbound: async (id: number, quantity: number, reason?: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/inventory/outbound', { item_id: id, quantity, reason });
    return response.data;
  },
};

// Services de notifications
export const notificationService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },
};

// Services de rappels clients
export const reminderService = {
  create: async (clientId: number, data: { remind_date?: string; notes: string }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/clients/${clientId}/remind`, data);
    return response.data;
  },

  sendCatalogue: async (clientId: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/clients/${clientId}/send-catalogue`);
    return response.data;
  },

  requestQuote: async (clientId: number, details: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/clients/${clientId}/request-quote`, { details });
    return response.data;
  },
};

// Services de conversion client
export const conversionService = {
  convertClient: async (clientId: number, note: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/clients/${clientId}/convert`, { note });
    return response.data;
  },

  blacklistClient: async (clientId: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/clients/${clientId}/blacklist`);
    return response.data;
  },
};

// Services d'avances sur salaire
export const salaryAdvanceService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/salary-advances');
    return response.data;
  },

  create: async (data: { montant: number; motif: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/salary-advances', data);
    return response.data;
  },

  approve: async (id: number, notes?: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/salary-advances/${id}/approve`, { notes_admin: notes });
    return response.data;
  },

  refuse: async (id: number, notes?: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/salary-advances/${id}/refuse`, { notes_admin: notes });
    return response.data;
  },
};

// Services de lieux de travail
export const workLocationService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/work-locations');
    return response.data;
  },

  create: async (location: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/work-locations', location);
    return response.data;
  },
};

// Services de calendrier
export const calendarService = {
  getEvents: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/calendar/events');
    return response.data;
  },

  createEvent: async (event: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/calendar/events', event);
    return response.data;
  },

  updateEvent: async (id: number, event: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/calendar/events/${id}`, event);
    return response.data;
  },

  deleteEvent: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/calendar/events/${id}`);
    return response.data;
  },
};

// Services d'installations
export const installationService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/installations');
    return response.data;
  },

  create: async (installation: FormData): Promise<ApiResponse<any>> => {
    const response = await api.post('/installations', installation, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id: number, installation: FormData): Promise<ApiResponse<any>> => {
    const response = await api.put(`/installations/${id}`, installation, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/installations/${id}`);
    return response.data;
  },

  addPayment: async (id: number, amount: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/installations/${id}/versement`, { montant_verse: amount });
    return response.data;
  },
};

// Services de devis
export const devisService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/devis');
    return response.data;
  },

  create: async (devis: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/devis', devis);
    return response.data;
  },

  assign: async (id: number, technicianId: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/devis/${id}/assign`, { technician_id: technicianId });
    return response.data;
  },

  complete: async (id: number, commentaire?: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/devis/${id}/complete`, { commentaire });
    return response.data;
  },
};

// Services de facturation
export const billingService = {
  // Clients de facturation
  getClients: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/billing/clients');
    return response.data;
  },

  createClient: async (client: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/billing/clients', client);
    return response.data;
  },

  // Produits
  getProducts: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/billing/products');
    return response.data;
  },

  createProduct: async (product: FormData): Promise<ApiResponse<any>> => {
    const response = await api.post('/billing/products', product, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateProduct: async (id: number, product: FormData): Promise<ApiResponse<any>> => {
    const response = await api.put(`/billing/products/${id}`, product, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteProduct: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/billing/products/${id}`);
    return response.data;
  },

  // Factures
  getInvoices: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/billing/invoices');
    return response.data;
  },

  createInvoice: async (invoice: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/billing/invoices', invoice);
    return response.data;
  },

  getInvoice: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/billing/invoices/${id}`);
    return response.data;
  },

  updateInvoice: async (id: number, invoice: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/billing/invoices/${id}`, invoice);
    return response.data;
  },

  deleteInvoice: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/billing/invoices/${id}`);
    return response.data;
  },

  confirmInvoice: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/billing/invoices/${id}/confirm`);
    return response.data;
  },

  duplicateInvoice: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/billing/invoices/${id}/duplicate`);
    return response.data;
  },

  // Proformas
  getProformas: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/billing/proformas');
    return response.data;
  },

  createProforma: async (proforma: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/billing/proformas', proforma);
    return response.data;
  },

  getProforma: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/billing/proformas/${id}`);
    return response.data;
  },

  updateProforma: async (id: number, proforma: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/billing/proformas/${id}`, proforma);
    return response.data;
  },

  deleteProforma: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/billing/proformas/${id}`);
    return response.data;
  },

  convertProforma: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/billing/proformas/${id}/convert`);
    return response.data;
  },

  duplicateProforma: async (id: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/billing/proformas/${id}/duplicate`);
    return response.data;
  },
};

// Services d'authentification
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Services clients
export const clientService = {
  getAll: async (): Promise<ApiResponse<Client[]>> => {
    const response = await api.get('/clients');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Client>> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Client>> => {
    const response = await api.post('/clients', client);
    return response.data;
  },

  update: async (id: number, client: Partial<Client>): Promise<ApiResponse<Client>> => {
    const response = await api.put(`/clients/${id}`, client);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
};

// Services produits
export const produitService = {
  getAll: async (): Promise<ApiResponse<Produit[]>> => {
    const response = await api.get('/produits');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Produit>> => {
    const response = await api.get(`/produits/${id}`);
    return response.data;
  },

  create: async (produit: Omit<Produit, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Produit>> => {
    const response = await api.post('/produits', produit);
    return response.data;
  },

  update: async (id: number, produit: Partial<Produit>): Promise<ApiResponse<Produit>> => {
    const response = await api.put(`/produits/${id}`, produit);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/produits/${id}`);
    return response.data;
  },
};

// Services commandes
export const commandeService = {
  getAll: async (): Promise<ApiResponse<Commande[]>> => {
    const response = await api.get('/commandes');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Commande>> => {
    const response = await api.get(`/commandes/${id}`);
    return response.data;
  },

  create: async (commande: Omit<Commande, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Commande>> => {
    const response = await api.post('/commandes', commande);
    return response.data;
  },

  update: async (id: number, commande: Partial<Commande>): Promise<ApiResponse<Commande>> => {
    const response = await api.put(`/commandes/${id}`, commande);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/commandes/${id}`);
    return response.data;
  },
};

// Services employés
export const employeService = {
  getAll: async (): Promise<ApiResponse<Employe[]>> => {
    const response = await api.get('/employes');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Employe>> => {
    const response = await api.get(`/employes/${id}`);
    return response.data;
  },

  create: async (employe: Omit<Employe, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Employe>> => {
    const response = await api.post('/employes', employe);
    return response.data;
  },

  update: async (id: number, employe: Partial<Employe>): Promise<ApiResponse<Employe>> => {
    const response = await api.put(`/employes/${id}`, employe);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/employes/${id}`);
    return response.data;
  },
};

// Services factures
export const factureService = {
  getAll: async (): Promise<ApiResponse<Facture[]>> => {
    const response = await api.get('/factures');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Facture>> => {
    const response = await api.get(`/factures/${id}`);
    return response.data;
  },

  create: async (facture: Omit<Facture, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Facture>> => {
    const response = await api.post('/factures', facture);
    return response.data;
  },

  update: async (id: number, facture: Partial<Facture>): Promise<ApiResponse<Facture>> => {
    const response = await api.put(`/factures/${id}`, facture);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/factures/${id}`);
    return response.data;
  },
};

// Services interventions
export const interventionService = {
  getAll: async (): Promise<ApiResponse<Intervention[]>> => {
    const response = await api.get('/interventions');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Intervention>> => {
    const response = await api.get(`/interventions/${id}`);
    return response.data;
  },

  create: async (intervention: Omit<Intervention, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Intervention>> => {
    const response = await api.post('/interventions', intervention);
    return response.data;
  },

  update: async (id: number, intervention: Partial<Intervention>): Promise<ApiResponse<Intervention>> => {
    const response = await api.put(`/interventions/${id}`, intervention);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/interventions/${id}`);
    return response.data;
  },
};

export default api;