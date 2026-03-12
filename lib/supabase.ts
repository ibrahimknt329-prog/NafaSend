// lib/supabase.ts
// Configuration Supabase SÉCURISÉE avec variables d'environnement

import { createClient } from '@supabase/supabase-js';

// ✅ SÉCURISÉ : Lecture depuis les variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Vérification que les variables sont bien définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ ERREUR: Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
    'doivent être définies dans le fichier .env.local'
  );
}

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ================================================
// TYPES TYPESCRIPT
// ================================================

// Type pour les commandes
export interface Commande {
  id?: number;
  created_at?: string;
  numero_suivi: string;
  expediteur_nom: string;
  expediteur_tel: string;
  expediteur_ville: string;
  expediteur_adresse?: string;
  destinataire_nom: string;
  destinataire_tel: string;
  destinataire_ville: string;
  destinataire_adresse?: string;
  poids: number;
  longueur?: number;
  largeur?: number;
  hauteur?: number;
  prix: number;
  statut: 'en_preparation' | 'en_transit' | 'en_livraison' | 'livre';
  type_service: 'standard' | 'express';
  paiement_livraison: boolean;
  montant_cod?: number;
  user_id?: string;
  paye?: boolean;
  methode_paiement?: string;
  transaction_id?: string;
  date_paiement?: string;
}

// Type pour les profiles utilisateurs
export interface Profile {
  id: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  role?: 'user' | 'admin' | 'livreur';
  created_at?: string;
  updated_at?: string;
}