export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  active: boolean;
  created_at: string;
  last_login?: string;
}

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  type_client: 'particulier' | 'entreprise';
  created_at: string;
  updated_at: string;
}

export interface Produit {
  id: number;
  nom: string;
  description: string;
  prix_unitaire: number;
  stock_actuel: number;
  stock_minimum: number;
  categorie: string;
  unite_mesure: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Commande {
  id: number;
  client_id: number;
  numero_commande: string;
  date_commande: string;
  statut: 'en_attente' | 'confirmee' | 'en_cours' | 'livree' | 'annulee';
  montant_total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  departement: string;
  salaire: number;
  date_embauche: string;
  statut: 'actif' | 'inactif' | 'conge';
  created_at: string;
  updated_at: string;
}

export interface Facture {
  id: number;
  commande_id: number;
  numero_facture: string;
  date_facture: string;
  date_echeance: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'en_retard';
  created_at: string;
  updated_at: string;
  commande?: Commande;
}

export interface Intervention {
  id: number;
  client_id: number;
  employe_id: number;
  titre: string;
  description: string;
  date_intervention: string;
  heure_debut: string;
  heure_fin?: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  cout: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Client;
  employe?: Employe;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}