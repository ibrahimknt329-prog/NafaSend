// lib/supabase.ts
// Configuration Supabase pour ton projet

import { createClient } from '@supabase/supabase-js';

// ⚠️ IMPORTANT : Remplace ces valeurs par TES PROPRES CLÉS Supabase
// Tu les as copiées à l'ÉTAPE 3
const supabaseUrl = 'https://lfpvmfabmkfsacdwojxm.supabase.co';
const supabaseAnonKey = 'sb_publishable_Rq-q5QyQBiCZGTh8ovYgTA_VhU-C8LX';

// Crée le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
}