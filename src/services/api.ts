import axios from 'axios';
import type { AuthResponse, ApiResponse, User, Client, Produit, Commande, Employe, Facture, Intervention } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

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