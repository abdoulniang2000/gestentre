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

// Types supplémentaires basés sur le fichier Flask
export interface Attendance {
  id: number;
  user_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  check_in_location?: string;
  check_out_location?: string;
  check_in_lat?: number;
  check_in_lng?: number;
  check_out_lat?: number;
  check_out_lng?: number;
  work_location_id?: number;
  notes?: string;
  total_hours?: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Expense {
  id: number;
  user_id: number;
  titre: string;
  description?: string;
  montant: number;
  categorie?: string;
  date_depense: string;
  justificatif?: string;
  site: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface InventoryItem {
  id: number;
  name: string;
  description?: string;
  reference?: string;
  category_id?: number;
  quantity: number;
  unit: string;
  prix_achat?: number;
  prix_vente?: number;
  seuil_alerte: number;
  fournisseur?: string;
  emplacement?: string;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkLocation {
  id: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'bureau' | 'chantier';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalaryAdvance {
  id: number;
  user_id: number;
  montant: number;
  motif: string;
  date_demande: string;
  statut: 'en_attente' | 'approuve' | 'refuse';
  approved_at?: string;
  approved_by_id?: number;
  notes_admin?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  approved_by?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  user?: User;
}

export interface Reminder {
  id: number;
  client_id: number;
  user_id: number;
  remind_at?: string;
  notes: string;
  created_at: string;
  client?: Client;
  user?: User;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  allDay: boolean;
  notified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Installation {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  montant_total: number;
  montant_avance: number;
  montant_restant: number;
  date_installation?: string;
  methode_paiement?: string;
  date_echeance?: string;
  contrat_path?: string;
  statut: 'en_attente' | 'en_cours' | 'terminee' | 'annulee';
  created_at: string;
  updated_at: string;
}

export interface Devis {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  commentaire?: string;
  user_id: number;
  assigned_to?: number;
  status: 'pending' | 'assigned' | 'completed';
  created_at: string;
  updated_at: string;
  user?: User;
  assigned_user?: User;
}

export interface BillingClient {
  id: number;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  supplier?: string;
  alert_quantity: number;
  image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  billing_client_id: number;
  date: string;
  due_date?: string;
  tax_rate: number;
  discount_percent?: number;
  discount_amount?: number;
  domaine?: string;
  notes?: string;
  status: 'draft' | 'confirmed' | 'paid';
  created_at: string;
  updated_at: string;
  billing_client?: BillingClient;
  items?: InvoiceItem[];
  subtotal?: number;
  tax_amount?: number;
  total?: number;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  total?: number;
  product?: Product;
}

export interface Proforma {
  id: number;
  proforma_number: string;
  billing_client_id: number;
  date: string;
  valid_until?: string;
  tax_rate: number;
  discount_percent?: number;
  discount_amount?: number;
  domaine?: string;
  notes?: string;
  status: 'draft' | 'sent' | 'converted';
  converted_to_invoice?: boolean;
  invoice_id?: number;
  created_at: string;
  updated_at: string;
  billing_client?: BillingClient;
  items?: ProformaItem[];
  subtotal?: number;
  tax_amount?: number;
  total?: number;
}

export interface ProformaItem {
  id: number;
  proforma_id: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  total?: number;
  product?: Product;
}

export interface DashboardStats {
  totalClients: number;
  totalCommandes: number;
  totalEmployes: number;
  totalFactures: number;
  chiffreAffaires: number;
  interventionsPlanifiees: number;
  facturesEnRetard: number;
  produitsStockFaible: number;
  commandesRecentes: Commande[];
  interventionsRecentes: Intervention[];
  stats_commerciaux?: unknown[];
  technicien_stats?: unknown[];
  today_attendance?: Attendance;
  monthly_attendance?: number;
  today_interventions?: number;
  pending_interventions?: number;
  total_clients?: number;
  prospects?: number;
  low_stock_items?: number;
  unread_messages?: number;
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