-- Script de création de toutes les tables pour le système de gestion d'entreprise
-- Base de données: gestentre

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS gestentre CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE gestentre;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
) ENGINE=InnoDB;

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  adresse TEXT NOT NULL,
  ville VARCHAR(100) NOT NULL,
  code_postal VARCHAR(10) NOT NULL,
  pays VARCHAR(100) DEFAULT 'France',
  type_client ENUM('particulier', 'entreprise') DEFAULT 'particulier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table des produits
CREATE TABLE IF NOT EXISTS produits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  prix_unitaire DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock_actuel INT NOT NULL DEFAULT 0,
  stock_minimum INT NOT NULL DEFAULT 0,
  categorie VARCHAR(100) NOT NULL,
  unite_mesure VARCHAR(50) DEFAULT 'unité',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table des employés
CREATE TABLE IF NOT EXISTS employes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  telephone VARCHAR(20) NOT NULL,
  poste VARCHAR(100) NOT NULL,
  departement VARCHAR(100) NOT NULL,
  salaire DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  date_embauche DATE NOT NULL,
  statut ENUM('actif', 'inactif', 'conge') DEFAULT 'actif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table des commandes
CREATE TABLE IF NOT EXISTS commandes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  numero_commande VARCHAR(50) UNIQUE NOT NULL,
  date_commande DATE NOT NULL,
  statut ENUM('en_attente', 'confirmee', 'en_cours', 'livree', 'annulee') DEFAULT 'en_attente',
  montant_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table des détails de commande
CREATE TABLE IF NOT EXISTS commande_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commande_id INT NOT NULL,
  produit_id INT NOT NULL,
  quantite INT NOT NULL DEFAULT 1,
  prix_unitaire DECIMAL(10,2) NOT NULL,
  sous_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table des factures
CREATE TABLE IF NOT EXISTS factures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  commande_id INT NOT NULL,
  numero_facture VARCHAR(50) UNIQUE NOT NULL,
  date_facture DATE NOT NULL,
  date_echeance DATE NOT NULL,
  montant_ht DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tva DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  montant_ttc DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  statut ENUM('brouillon', 'envoyee', 'payee', 'en_retard') DEFAULT 'brouillon',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table des interventions
CREATE TABLE IF NOT EXISTS interventions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  employe_id INT NOT NULL,
  titre VARCHAR(200) NOT NULL,
  description TEXT,
  date_intervention DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NULL,
  statut ENUM('planifiee', 'en_cours', 'terminee', 'annulee') DEFAULT 'planifiee',
  priorite ENUM('basse', 'normale', 'haute', 'urgente') DEFAULT 'normale',
  cout DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table des paiements
CREATE TABLE IF NOT EXISTS paiements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facture_id INT NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  date_paiement DATE NOT NULL,
  mode_paiement ENUM('especes', 'cheque', 'virement', 'carte', 'autre') DEFAULT 'virement',
  reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facture_id) REFERENCES factures(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Insertion des données de test
INSERT INTO users (nom, email, password, role, active) VALUES
('Administrateur Système', 'admin@netsysteme.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE),
('Manager Commercial', 'manager@netsysteme.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', TRUE),
('Employé Test', 'employe@netsysteme.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'employee', TRUE);

INSERT INTO clients (nom, prenom, email, telephone, adresse, ville, code_postal, pays, type_client) VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '0123456789', '123 Rue de la Paix', 'Paris', '75001', 'France', 'particulier'),
('Martin', 'Marie', 'marie.martin@email.com', '0987654321', '456 Avenue des Champs', 'Lyon', '69000', 'France', 'particulier'),
('SARL TechCorp', 'Directeur', 'contact@techcorp.com', '0147258369', '789 Boulevard de l\'Innovation', 'Marseille', '13000', 'France', 'entreprise');

INSERT INTO produits (nom, description, prix_unitaire, stock_actuel, stock_minimum, categorie, unite_mesure, active) VALUES
('Ordinateur Portable', 'Ordinateur portable professionnel', 899.99, 15, 5, 'Informatique', 'unité', TRUE),
('Imprimante Laser', 'Imprimante laser couleur', 299.99, 8, 3, 'Informatique', 'unité', TRUE),
('Papier A4', 'Ramette de papier A4 500 feuilles', 4.99, 100, 20, 'Fournitures', 'ramette', TRUE);

INSERT INTO employes (nom, prenom, email, telephone, poste, departement, salaire, date_embauche, statut) VALUES
('Technicien', 'Paul', 'paul.technicien@netsysteme.com', '0123456789', 'Technicien IT', 'Informatique', 2500.00, '2024-01-15', 'actif'),
('Commercial', 'Sophie', 'sophie.commercial@netsysteme.com', '0987654321', 'Commerciale', 'Ventes', 2800.00, '2024-02-01', 'actif'),
('Comptable', 'Pierre', 'pierre.comptable@netsysteme.com', '0147258369', 'Comptable', 'Finance', 3000.00, '2024-01-10', 'actif');

INSERT INTO commandes (client_id, numero_commande, date_commande, statut, montant_total, notes) VALUES
(1, 'CMD-20240115-001', '2024-01-15', 'livree', 899.99, 'Commande urgente'),
(2, 'CMD-20240116-002', '2024-01-16', 'en_cours', 304.98, 'Livraison standard'),
(3, 'CMD-20240117-003', '2024-01-17', 'confirmee', 1199.98, 'Commande entreprise');

INSERT INTO factures (commande_id, numero_facture, date_facture, date_echeance, montant_ht, tva, montant_ttc, statut) VALUES
(1, 'FAC-202401-001', '2024-01-15', '2024-02-14', 749.99, 20.00, 899.99, 'payee'),
(2, 'FAC-202401-002', '2024-01-16', '2024-02-15', 254.15, 20.00, 304.98, 'envoyee'),
(3, 'FAC-202401-003', '2024-01-17', '2024-02-16', 999.98, 20.00, 1199.98, 'brouillon');

INSERT INTO interventions (client_id, employe_id, titre, description, date_intervention, heure_debut, heure_fin, statut, priorite, cout, notes) VALUES
(1, 1, 'Installation ordinateur', 'Installation et configuration ordinateur portable', '2024-01-20', '09:00:00', '11:00:00', 'terminee', 'normale', 150.00, 'Installation réussie'),
(2, 1, 'Maintenance imprimante', 'Maintenance préventive imprimante', '2024-01-22', '14:00:00', NULL, 'planifiee', 'basse', 80.00, 'Maintenance programmée'),
(3, 1, 'Support technique', 'Support technique urgent', '2024-01-21', '10:00:00', NULL, 'en_cours', 'urgente', 200.00, 'Problème réseau');
