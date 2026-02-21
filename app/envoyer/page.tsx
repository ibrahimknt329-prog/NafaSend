"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import MobileMoneyPayment from "@/components/ui/MobileMoneyPayment";

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
    const prixFinal = calculerPrix();
    const numero = genererNumeroSuivi();
    setNumeroSuivi(numero);
    setShowRecap(true);
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
        alert(`✅ Commande créée !\n\nNuméro de suivi : ${numeroSuivi}\n\nPaiement à effectuer à la livraison : ${prix.toLocaleString('fr-FR')} GNF`);
        
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

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* EXPÉDITEUR */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📤 Expéditeur
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="expediteurNom"
                value={formData.expediteurNom}
                onChange={handleChange}
                placeholder="Nom complet"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="tel"
                name="expediteurTel"
                value={formData.expediteurTel}
                onChange={handleChange}
                placeholder="Téléphone"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="text"
                name="expediteurVille"
                value={formData.expediteurVille}
                onChange={handleChange}
                placeholder="Ville"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="text"
                name="expediteurAdresse"
                value={formData.expediteurAdresse}
                onChange={handleChange}
                placeholder="Adresse complète"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* DESTINATAIRE */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📥 Destinataire
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="destinataireNom"
                value={formData.destinataireNom}
                onChange={handleChange}
                placeholder="Nom complet"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="tel"
                name="destinataireTel"
                value={formData.destinataireTel}
                onChange={handleChange}
                placeholder="Téléphone"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="text"
                name="destinataireVille"
                value={formData.destinataireVille}
                onChange={handleChange}
                placeholder="Ville"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="text"
                name="destinataireAdresse"
                value={formData.destinataireAdresse}
                onChange={handleChange}
                placeholder="Adresse complète"
                className="border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none col-span-2"
                required
              />
            </div>
          </div>

          {/* COLIS */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📦 Détails du colis
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Poids (kg) *</label>
                <input
                  type="number"
                  name="poids"
                  value={formData.poids}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="Ex: 2.5"
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Type de service</label>
                <select
                  name="typeService"
                  value={formData.typeService}
                  onChange={handleChange}
                  className="border-2 border-gray-300 rounded-lg px-4 py-3 w-full focus:border-blue-500 focus:outline-none"
                >
                  <option value="standard">Standard (2-3 jours)</option>
                  <option value="express">Express (24h)</option>
                </select>
              </div>
            </div>

            {prix > 0 && (
              <div className="bg-blue-50 rounded-xl p-6 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Prix de la livraison :</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {prix.toLocaleString('fr-FR')} GNF
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enregistrement..." : "Continuer →"}
          </button>
        </form>
      </div>
    </main>
  );
}