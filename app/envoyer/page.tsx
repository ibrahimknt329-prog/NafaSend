"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import MobileMoneyPayment from "@/components/ui/MobileMoneyPayment";
import { commandeSchema } from '@/lib/validations';
import { z } from 'zod';
import { showError, showSuccess } from '@/lib/toast-utils';
import Spinner from '@/components/ui/Spinner';

export default function EnvoyerWithPayment() {
  const [formData, setFormData] = useState({
    // Expéditeur
    expediteurNom: "",
    expediteurTel: "",
    expediteurAdresse: "",
    expediteurVille: "",
    
    // Destinataire
    destinataireNom: "",
    destinataireTel: "",
    destinataireAdresse: "",
    destinataireVille: "",
    
    // Colis
    poids: "",
    longueur: "",
    largeur: "",
    hauteur: "",
    typeService: "standard",
    paiementLivraison: false,
    montantCOD: "",
  });

  const [prix, setPrix] = useState(0);
  const [showRecap, setShowRecap] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [numeroSuivi, setNumeroSuivi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [methodePaiement, setMethodePaiement] = useState<"online" | "delivery" | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  // Calcul du prix
  const calculerPrix = () => {
    const poidsNum = parseFloat(formData.poids) || 0;
    const longueurNum = parseFloat(formData.longueur) || 0;
    const largeurNum = parseFloat(formData.largeur) || 0;
    const hauteurNum = parseFloat(formData.hauteur) || 0;

    let poidsVolumetrique = 0;
    if (longueurNum && largeurNum && hauteurNum) {
      poidsVolumetrique = (longueurNum * largeurNum * hauteurNum) / 5000;
    }

    const poidsFacturable = Math.max(poidsNum, poidsVolumetrique);

    let prixCalcule = 0;
    if (formData.typeService === "express") {
      prixCalcule = 100000 + (poidsFacturable * 15000);
    } else {
      prixCalcule = 50000 + (poidsFacturable * 8000);
    }

    if (formData.paiementLivraison && formData.montantCOD) {
      const montantCOD = parseFloat(formData.montantCOD);
      prixCalcule += montantCOD * 0.02;
    }

    setPrix(Math.round(prixCalcule));
    return Math.round(prixCalcule);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (["poids", "longueur", "largeur", "hauteur", "typeService", "paiementLivraison", "montantCOD"].includes(name)) {
      setTimeout(calculerPrix, 100);
    }
  };

  const genererNumeroSuivi = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FL${timestamp.slice(-8)}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ✅ VALIDATION AVEC ZOD
  try {
    // Valider les données
    commandeSchema.parse({
      expediteurNom: formData.expediteurNom,
      expediteurTel: formData.expediteurTel,
      expediteurVille: formData.expediteurVille,
      expediteurAdresse: formData.expediteurAdresse || undefined,
      destinataireNom: formData.destinataireNom,
      destinataireTel: formData.destinataireTel,
      destinataireVille: formData.destinataireVille,
      destinataireAdresse: formData.destinataireAdresse || undefined,
      poids: formData.poids,
      longueur: formData.longueur || undefined,
      largeur: formData.largeur || undefined,
      hauteur: formData.hauteur || undefined,
      typeService: formData.typeService,
      paiementLivraison: formData.paiementLivraison,
      montantCOD: formData.montantCOD || undefined,
    });
    
    // Si validation OK, continuer
    setValidationErrors({});
    const prixFinal = calculerPrix();
    const numero = genererNumeroSuivi();
    setNumeroSuivi(numero);
    setShowRecap(true);
    
  } catch (err) {
    // Si erreur de validation
    if (err instanceof z.ZodError) {
      // Créer un objet des erreurs
      const errors: Record<string, string> = {};
      err.issues.forEach((e) => {
        const path = e.path[0] as string;
        errors[path] = e.message;
      });
      setValidationErrors(errors);
      
      // Afficher la première erreur
      const firstError = err.issues[0];
      showError(firstError.message); // Temporaire (sera remplacé par toast)
      
      // Scroll vers le haut pour voir les erreurs
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
  const handleChoixPaiement = (methode: "online" | "delivery") => {
    setMethodePaiement(methode);
    
    if (methode === "online") {
      // Paiement en ligne immédiat
      setShowPayment(true);
    } else {
      // Paiement à la livraison
      enregistrerCommande(false);
    }
  };

  const enregistrerCommande = async (paye: boolean) => {
    setLoading(true);
    setError("");

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const commandeData = {
        numero_suivi: numeroSuivi,
        expediteur_nom: formData.expediteurNom,
        expediteur_tel: formData.expediteurTel,
        expediteur_adresse: formData.expediteurAdresse,
        expediteur_ville: formData.expediteurVille,
        destinataire_nom: formData.destinataireNom,
        destinataire_tel: formData.destinataireTel,
        destinataire_adresse: formData.destinataireAdresse,
        destinataire_ville: formData.destinataireVille,
        poids: parseFloat(formData.poids),
        longueur: formData.longueur ? parseFloat(formData.longueur) : null,
        largeur: formData.largeur ? parseFloat(formData.largeur) : null,
        hauteur: formData.hauteur ? parseFloat(formData.hauteur) : null,
        prix: prix,
        type_service: formData.typeService,
        paiement_livraison: formData.paiementLivraison,
        montant_cod: formData.montantCOD ? parseFloat(formData.montantCOD) : null,
        statut: "en_preparation",
        user_id: user?.id || null,
        paye: paye,
        methode_paiement: paye ? "mobile_money" : "cash_delivery"
      };

      const { error: insertError } = await supabase
        .from('commandes')
        .insert([commandeData]);

      if (insertError) throw insertError;

      if (paye) {
        setPaymentSuccess(true);
      } else {
        setShowRecap(false);
        setShowPayment(false);
        showSuccess(`✅ Commande créée !\n\nNuméro de suivi : ${numeroSuivi}\n\nPaiement à effectuer à la livraison : ${prix.toLocaleString('fr-FR')} GNF`);
        
        // Réinitialiser
        setFormData({
          expediteurNom: "",
          expediteurTel: "",
          expediteurAdresse: "",
          expediteurVille: "",
          destinataireNom: "",
          destinataireTel: "",
          destinataireAdresse: "",
          destinataireVille: "",
          poids: "",
          longueur: "",
          largeur: "",
          hauteur: "",
          typeService: "standard",
          paiementLivraison: false,
          montantCOD: "",
        });
        setPrix(0);
        setMethodePaiement(null);
      }

    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log("Paiement réussi:", data);
    enregistrerCommande(true);
  };

  if (paymentSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-4 text-green-600">
            Paiement effectué avec succès !
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Votre commande a été enregistrée et payée
          </p>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="text-sm text-gray-600 mb-2">Numéro de suivi</div>
            <div className="text-3xl font-mono font-bold text-green-600 mb-4">
              {numeroSuivi}
            </div>
            <div className="text-sm text-gray-600">
              Notez ce numéro pour suivre votre colis
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`/suivi?numero=${numeroSuivi}`}
              className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              📍 Suivre ma commande
            </a>
            <button
              onClick={() => {
                setPaymentSuccess(false);
                setShowRecap(false);
                setShowPayment(false);
                setMethodePaiement(null);
                setFormData({
                  expediteurNom: "",
                  expediteurTel: "",
                  expediteurAdresse: "",
                  expediteurVille: "",
                  destinataireNom: "",
                  destinataireTel: "",
                  destinataireAdresse: "",
                  destinataireVille: "",
                  poids: "",
                  longueur: "",
                  largeur: "",
                  hauteur: "",
                  typeService: "standard",
                  paiementLivraison: false,
                  montantCOD: "",
                });
                setPrix(0);
              }}
              className="block w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              ← Nouvel envoi
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (showPayment && !paymentSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            💳 Paiement Mobile Money
          </h1>
          
          <MobileMoneyPayment
            montant={prix}
            numeroCommande={numeroSuivi}
            onSuccess={handlePaymentSuccess}
            onCancel={() => {
              setShowPayment(false);
              setMethodePaiement(null);
            }}
          />
        </div>
      </main>
    );
  }

  if (showRecap) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">
              📋 Récapitulatif de votre envoi
            </h2>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Numéro de suivi</div>
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {numeroSuivi}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <h3 className="font-bold mb-3">📤 Expéditeur</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Nom :</strong> {formData.expediteurNom}</div>
                  <div><strong>Tél :</strong> {formData.expediteurTel}</div>
                  <div><strong>Ville :</strong> {formData.expediteurVille}</div>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-4">
                <h3 className="font-bold mb-3">📥 Destinataire</h3>
                <div className="space-y-1 text-sm">
                  <div><strong>Nom :</strong> {formData.destinataireNom}</div>
                  <div><strong>Tél :</strong> {formData.destinataireTel}</div>
                  <div><strong>Ville :</strong> {formData.destinataireVille}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm opacity-90">Montant total</div>
                  <div className="text-4xl font-bold">{prix.toLocaleString('fr-FR')} GNF</div>
                </div>
                <div className="text-right text-sm opacity-90">
                  <div>{formData.poids} kg</div>
                  <div className="capitalize">{formData.typeService}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-center">
                💳 Choisissez votre mode de paiement
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleChoixPaiement("online")}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">📱</div>
                  <div className="text-xl font-bold mb-1">Payer maintenant</div>
                  <div className="text-sm opacity-90">Orange Money / MTN Money</div>
                </button>

                <button
                  onClick={() => handleChoixPaiement("delivery")}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  <div className="text-4xl mb-2">💵</div>
                  <div className="text-xl font-bold mb-1">Payer à la livraison</div>
                  <div className="text-sm opacity-90">Espèces ou Mobile Money</div>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-xl mb-4">
                <strong>Erreur :</strong> {error}
              </div>
            )}

            <button
              onClick={() => {
                setShowRecap(false);
                setMethodePaiement(null);
              }}
              disabled={loading}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            >
              ← Modifier
            </button>
          </div>
        </div>
      </main>
    );
  }

  // FORMULAIRE PRINCIPAL (reste identique)
  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">Envoyer un colis</h1>
        <p className="text-gray-600 text-center mb-8">
          Remplissez le formulaire pour créer votre envoi
        </p>

        // app/envoyer/page.tsx
// SECTION DU FORMULAIRE AVEC VALIDATION VISUELLE COMPLÈTE

{/* ========================================
    FORMULAIRE PRINCIPAL
======================================== */}

<form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">

  {/* ========================================
      SECTION 1 : INFORMATIONS EXPÉDITEUR
  ======================================== */}
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <span>📤</span>
      <span>Informations de l'expéditeur</span>
    </h2>

    <div className="grid md:grid-cols-2 gap-6">
      
      {/* NOM EXPÉDITEUR */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="expediteurNom"
          value={formData.expediteurNom}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.expediteurNom 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: Mohamed Camara"
        />
        {validationErrors.expediteurNom && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.expediteurNom}</span>
          </p>
        )}
      </div>

      {/* TÉLÉPHONE EXPÉDITEUR */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="expediteurTel"
          value={formData.expediteurTel}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.expediteurTel 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: +224 622 123 456"
        />
        {validationErrors.expediteurTel && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.expediteurTel}</span>
          </p>
        )}
      </div>

      {/* VILLE EXPÉDITEUR */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ville <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="expediteurVille"
          value={formData.expediteurVille}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.expediteurVille 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: Conakry"
        />
        {validationErrors.expediteurVille && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.expediteurVille}</span>
          </p>
        )}
      </div>

      {/* ADRESSE EXPÉDITEUR (Optionnel) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Adresse complète (optionnel)
        </label>
        <input
          type="text"
          name="expediteurAdresse"
          value={formData.expediteurAdresse}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          placeholder="Ex: Quartier Madina, près de..."
        />
      </div>

    </div>
  </div>

  {/* ========================================
      SECTION 2 : INFORMATIONS DESTINATAIRE
  ======================================== */}
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <span>📥</span>
      <span>Informations du destinataire</span>
    </h2>

    <div className="grid md:grid-cols-2 gap-6">
      
      {/* NOM DESTINATAIRE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nom complet <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="destinataireNom"
          value={formData.destinataireNom}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.destinataireNom 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: Aissatou Diallo"
        />
        {validationErrors.destinataireNom && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.destinataireNom}</span>
          </p>
        )}
      </div>

      {/* TÉLÉPHONE DESTINATAIRE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Téléphone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="destinataireTel"
          value={formData.destinataireTel}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.destinataireTel 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: +224 655 987 654"
        />
        {validationErrors.destinataireTel && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.destinataireTel}</span>
          </p>
        )}
      </div>

      {/* VILLE DESTINATAIRE */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ville <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="destinataireVille"
          value={formData.destinataireVille}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.destinataireVille 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: Kindia"
        />
        {validationErrors.destinataireVille && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.destinataireVille}</span>
          </p>
        )}
      </div>

      {/* ADRESSE DESTINATAIRE (Optionnel) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Adresse complète (optionnel)
        </label>
        <input
          type="text"
          name="destinataireAdresse"
          value={formData.destinataireAdresse}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          placeholder="Ex: Centre-ville, face à..."
        />
      </div>

    </div>
  </div>

  {/* ========================================
      SECTION 3 : DÉTAILS DU COLIS
  ======================================== */}
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <span>📦</span>
      <span>Détails du colis</span>
    </h2>

    <div className="grid md:grid-cols-2 gap-6">
      
      {/* POIDS */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Poids (kg) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="poids"
          value={formData.poids}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.poids 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: 5"
          min="0.1"
          max="100"
          step="0.1"
        />
        {validationErrors.poids && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.poids}</span>
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">Maximum 100 kg</p>
      </div>

      {/* LONGUEUR (Optionnel) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Longueur (cm) (optionnel)
        </label>
        <input
          type="number"
          name="longueur"
          value={formData.longueur}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.longueur 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: 50"
          min="0"
          max="200"
        />
        {validationErrors.longueur && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.longueur}</span>
          </p>
        )}
      </div>

      {/* LARGEUR (Optionnel) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Largeur (cm) (optionnel)
        </label>
        <input
          type="number"
          name="largeur"
          value={formData.largeur}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.largeur 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: 30"
          min="0"
          max="200"
        />
        {validationErrors.largeur && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.largeur}</span>
          </p>
        )}
      </div>

      {/* HAUTEUR (Optionnel) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Hauteur (cm) (optionnel)
        </label>
        <input
          type="number"
          name="hauteur"
          value={formData.hauteur}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
            validationErrors.hauteur 
              ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
          }`}
          placeholder="Ex: 20"
          min="0"
          max="200"
        />
        {validationErrors.hauteur && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
            <span>⚠️</span>
            <span>{validationErrors.hauteur}</span>
          </p>
        )}
      </div>

    </div>
  </div>

  {/* ========================================
      SECTION 4 : TYPE DE SERVICE
  ======================================== */}
  <div className="bg-white rounded-2xl shadow-lg p-8">
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <span>🚚</span>
      <span>Type de service</span>
    </h2>

    <div className="grid md:grid-cols-2 gap-4">
      
      {/* SERVICE STANDARD */}
      <button
        type="button"
        onClick={() => setFormData({ ...formData, typeService: 'standard' })}
        className={`p-6 rounded-xl border-2 transition ${
          formData.typeService === 'standard'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="text-4xl mb-2">📦</div>
        <div className="font-bold text-lg">Standard</div>
        <div className="text-sm text-gray-600">Livraison en 24-48h</div>
        <div className="text-blue-600 font-bold mt-2">À partir de 50,000 GNF</div>
      </button>

      {/* SERVICE EXPRESS */}
      <button
        type="button"
        onClick={() => setFormData({ ...formData, typeService: 'express' })}
        className={`p-6 rounded-xl border-2 transition ${
          formData.typeService === 'express'
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="text-4xl mb-2">⚡</div>
        <div className="font-bold text-lg">Express</div>
        <div className="text-sm text-gray-600">Livraison en 24h</div>
        <div className="text-orange-600 font-bold mt-2">À partir de 100,000 GNF</div>
      </button>

    </div>

    {/* PAIEMENT À LA LIVRAISON */}
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="paiementLivraison"
          checked={formData.paiementLivraison}
          onChange={handleChange}
          className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <div>
          <div className="font-semibold text-gray-900">
            Paiement à la livraison (COD)
          </div>
          <div className="text-sm text-gray-600">
            Le destinataire paie le montant à la réception du colis
          </div>
        </div>
      </label>

      {/* MONTANT COD (conditionnel) */}
      {formData.paiementLivraison && (
        <div className="mt-4 animate-fade-in">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Montant à collecter (GNF)
          </label>
          <input
            type="number"
            name="montantCOD"
            value={formData.montantCOD}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition ${
              validationErrors.montantCOD 
                ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            placeholder="Ex: 150000"
            min="0"
          />
          {validationErrors.montantCOD && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1 animate-fade-in">
              <span>⚠️</span>
              <span>{validationErrors.montantCOD}</span>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Frais de COD : 2% du montant
          </p>
        </div>
      )}
    </div>
  </div>

  {/* ========================================
      SECTION 5 : RÉCAPITULATIF PRIX
  ======================================== */}
  {prix > 0 && (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        💰 Prix estimé
      </h2>
      <div className="text-5xl font-bold text-blue-600">
        {prix.toLocaleString('fr-FR')} <span className="text-2xl">GNF</span>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Service {formData.typeService === 'express' ? 'Express ⚡' : 'Standard 📦'} · {formData.poids} kg
      </p>
    </div>
  )}

  {/* ========================================
      BOUTON DE SOUMISSION
  ======================================== */}
  <div className="flex gap-4">
    <button
      type="submit"
      disabled={loading}
      className={`flex-1 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${
        loading
          ? 'bg-gray-400 cursor-not-allowed text-gray-200'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
      }`}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>Chargement...</span>
        </>
      ) : (
        
       'Continuer'
          
        )}
    </button>
  </div>

</form>
      </div>
    </main>
  );
}