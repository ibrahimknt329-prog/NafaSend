// lib/validations.ts
// Schémas de validation avec Zod

import { z } from 'zod';

// ================================================
// VALIDATION FORMULAIRE D'ENVOI
// ================================================

export const commandeSchema = z.object({
  // EXPÉDITEUR
  expediteurNom: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le nom ne doit contenir que des lettres"),

  expediteurTel: z
    .string()
    .regex(
      /^(\+224)?[67]\d{8}$/,
      "Numéro invalide. Format: +224 622 123 456 ou 622123456"
    ),

  expediteurVille: z
    .string()
    .min(2, "La ville est requise")
    .max(50, "Le nom de la ville est trop long"),

  expediteurAdresse: z
    .string()
    .max(200, "L'adresse est trop longue")
    .optional(),

  // DESTINATAIRE
  destinataireNom: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le nom ne doit contenir que des lettres"),

  destinataireTel: z
    .string()
    .regex(
      /^(\+224)?[67]\d{8}$/,
      "Numéro invalide. Format: +224 622 123 456 ou 622123456"
    ),

  destinataireVille: z
    .string()
    .min(2, "La ville est requise")
    .max(50, "Le nom de la ville est trop long"),

  destinataireAdresse: z
    .string()
    .max(200, "L'adresse est trop longue")
    .optional(),

  // COLIS
  poids: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(
      z
        .number()
        .min(0.1, "Le poids minimum est 0.1 kg")
        .max(100, "Le poids maximum est 100 kg")
    ),

  longueur: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).max(200).optional())
    .optional(),

  largeur: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).max(200).optional())
    .optional(),

  hauteur: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).max(200).optional())
    .optional(),

  typeService: z.enum(['standard', 'express'], {
    errorMap: () => ({ message: "Type de service invalide" }),
  }),

  paiementLivraison: z.boolean(),

  montantCOD: z
    .string()
    .transform((val) => (val ? parseFloat(val) : undefined))
    .pipe(z.number().min(0).optional())
    .optional(),
});

export type CommandeFormData = z.infer<typeof commandeSchema>;

// ================================================
// VALIDATION FORMULAIRE DE CONTACT
// ================================================

export const contactSchema = z.object({
  prenom: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom est trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le prénom ne doit contenir que des lettres"),

  nom: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom est trop long")
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le nom ne doit contenir que des lettres"),

  email: z
    .string()
    .email("Email invalide")
    .min(5, "L'email est trop court")
    .max(100, "L'email est trop long"),

  telephone: z
    .string()
    .regex(
      /^(\+224)?[67]\d{8}$/,
      "Numéro invalide. Format: +224 622 123 456"
    ),

  ville: z
    .string()
    .min(2, "La ville est requise")
    .max(50, "Le nom de la ville est trop long"),

  typeClient: z.enum(['particulier', 'ecommercant', 'entreprise']),

  message: z
    .string()
    .max(1000, "Le message est trop long (max 1000 caractères)")
    .optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// ================================================
// VALIDATION SUIVI
// ================================================

export const suiviSchema = z.object({
  numeroSuivi: z
    .string()
    .min(8, "Le numéro de suivi est trop court")
    .max(50, "Le numéro de suivi est trop long")
    .regex(
      /^[A-Z0-9-]+$/,
      "Le numéro de suivi ne doit contenir que des lettres majuscules, chiffres et tirets"
    ),
});

export type SuiviFormData = z.infer<typeof suiviSchema>;

// ================================================
// VALIDATION LOGIN
// ================================================

export const loginSchema = z.object({
  email: z
    .string()
    .email("Email invalide")
    .min(5, "L'email est trop court"),

  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(100, "Le mot de passe est trop long"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ================================================
// VALIDATION SIGNUP
// ================================================

export const signupSchema = z
  .object({
    nom: z
      .string()
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom est trop long")
      .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le nom ne doit contenir que des lettres"),

    prenom: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom est trop long")
      .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le prénom ne doit contenir que des lettres"),

    email: z
      .string()
      .email("Email invalide")
      .min(5, "L'email est trop court"),

    telephone: z
      .string()
      .regex(
        /^(\+224)?[67]\d{8}$/,
        "Numéro invalide. Format: +224 622 123 456"
      ),

    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .max(100, "Le mot de passe est trop long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// ================================================
// HELPERS DE VALIDATION
// ================================================

/**
 * Formatte un numéro de téléphone guinéen
 * @param tel - Numéro brut
 * @returns Numéro formatté (+224 XXX XXX XXX)
 */
export function formatTelephoneGuinee(tel: string): string {
  // Retirer tous les espaces et le +224
  const clean = tel.replace(/\s/g, '').replace('+224', '');
  
  // Vérifier que c'est un numéro valide
  if (!/^[67]\d{8}$/.test(clean)) {
    return tel; // Retourner tel quel si invalide
  }
  
  // Formater : +224 XXX XXX XXX
  return `+224 ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
}

/**
 * Nettoie un numéro de téléphone (enlève espaces et +224)
 * @param tel - Numéro formatté
 * @returns Numéro nettoyé (6XXXXXXXX ou 7XXXXXXXX)
 */
export function cleanTelephoneGuinee(tel: string): string {
  return tel.replace(/\s/g, '').replace('+224', '');
}

/**
 * Valide qu'une ville fait partie des villes de Guinée
 * @param ville - Nom de la ville
 * @returns true si valide
 */
export function isVilleGuineeValide(ville: string): boolean {
  const villesGuinee = [
    'Conakry',
    'Dubréka',
    'Kindia',
    'Mamou',
    'Labé',
    'Kankan',
    'Nzérékoré',
    'Boké',
    'Kissidougou',
    'Faranah',
    'Siguiri',
    'Kamsar',
    'Guéckédou',
    'Macenta',
    'Dalaba',
    'Pita',
  ];
  
  return villesGuinee.some(
    (v) => v.toLowerCase() === ville.toLowerCase()
  );
}