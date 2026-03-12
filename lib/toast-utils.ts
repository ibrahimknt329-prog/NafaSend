// lib/toast-utils.ts
// Fonctions utilitaires pour les notifications toast

import toast from 'react-hot-toast';

/**
 * Affiche un toast de succès
 */
export const showSuccess = (message: string) => {
  return toast.success(message, {
    duration: 3000,
  });
};

/**
 * Affiche un toast d'erreur
 */
export const showError = (message: string) => {
  return toast.error(message, {
    duration: 5000,
  });
};

/**
 * Affiche un toast de chargement
 */
export const showLoading = (message: string = 'Chargement...') => {
  return toast.loading(message);
};

/**
 * Met à jour un toast de chargement en succès
 */
export const updateToSuccess = (toastId: string, message: string) => {
  toast.success(message, {
    id: toastId,
  });
};

/**
 * Met à jour un toast de chargement en erreur
 */
export const updateToError = (toastId: string, message: string) => {
  toast.error(message, {
    id: toastId,
  });
};

/**
 * Ferme un toast
 */
export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

/**
 * Toast personnalisé
 */
export const showCustom = (message: string, icon?: string) => {
  return toast(message, {
    icon: icon || '📢',
  });
};

/**
 * Toast avec promesse (pour les actions async)
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};

// ================================================
// MESSAGES PRÉDÉFINIS
// ================================================

export const TOAST_MESSAGES = {
  // Commandes
  COMMANDE_CREATED: 'Commande créée avec succès ! 🎉',
  COMMANDE_UPDATED: 'Commande mise à jour ✅',
  COMMANDE_ERROR: 'Erreur lors de la création de la commande',
  
  // Paiement
  PAIEMENT_SUCCESS: 'Paiement effectué avec succès ! 💳',
  PAIEMENT_ERROR: 'Erreur lors du paiement',
  PAIEMENT_PENDING: 'Paiement en cours...',
  
  // Authentification
  LOGIN_SUCCESS: 'Connexion réussie ! 👋',
  LOGIN_ERROR: 'Email ou mot de passe incorrect',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  SIGNUP_SUCCESS: 'Inscription réussie ! Bienvenue ! 🎉',
  SIGNUP_ERROR: 'Erreur lors de l\'inscription',
  
  // Contact
  CONTACT_SUCCESS: 'Message envoyé avec succès ! 📧',
  CONTACT_ERROR: 'Erreur lors de l\'envoi du message',
  
  // Validation
  VALIDATION_ERROR: 'Veuillez corriger les erreurs dans le formulaire',
  FIELD_REQUIRED: 'Ce champ est requis',
  
  // Général
  LOADING: 'Chargement...',
  SAVING: 'Enregistrement...',
  DELETING: 'Suppression...',
  SUCCESS: 'Opération réussie ! ✅',
  ERROR: 'Une erreur est survenue',
  
  // Réseau
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre internet.',
  TIMEOUT_ERROR: 'La requête a pris trop de temps',
};

// ================================================
// EXEMPLES D'UTILISATION
// ================================================

/*
// 1. Toast simple
showSuccess('Commande créée !');
showError('Une erreur est survenue');

// 2. Toast avec loading
const toastId = showLoading('Création en cours...');
try {
  await createCommande();
  updateToSuccess(toastId, 'Commande créée !');
} catch (error) {
  updateToError(toastId, 'Erreur lors de la création');
}

// 3. Toast avec promesse
await showPromise(
  createCommande(),
  {
    loading: 'Création en cours...',
    success: 'Commande créée !',
    error: 'Erreur lors de la création'
  }
);

// 4. Toast personnalisé
showCustom('Nouvelle notification', '🔔');

// 5. Utiliser les messages prédéfinis
showSuccess(TOAST_MESSAGES.COMMANDE_CREATED);
*/