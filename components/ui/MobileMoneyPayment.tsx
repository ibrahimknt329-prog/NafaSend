"use client";

import { useState } from "react";

interface MobileMoneyPaymentProps {
  montant: number;
  numeroCommande: string;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

type Operateur = "orange" | "mtn" | null;

export default function MobileMoneyPayment({
  montant,
  numeroCommande,
  onSuccess,
  onCancel
}: MobileMoneyPaymentProps) {
  const [operateur, setOperateur] = useState<Operateur>(null);
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"select" | "phone" | "confirm">("select");

  const validatePhone = (phone: string, operator: Operateur) => {
    // Format guinéen : +224 6XX XXX XXX
    const cleanPhone = phone.replace(/\s/g, "");
    
    if (operator === "orange") {
      // Orange : commence par 6 (622, 623, 624, 625, 626, 627, 628, 629)
      return /^(\+224)?6[2-9]\d{7}$/.test(cleanPhone);
    } else if (operator === "mtn") {
      // MTN : commence par 6 (660, 661, 662, 663, 664, 665, 666, 667)
      return /^(\+224)?66\d{7}$/.test(cleanPhone);
    }
    return false;
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("224")) {
      return `+${cleaned}`;
    } else if (cleaned.length === 9) {
      return `+224${cleaned}`;
    }
    return phone;
  };

  const handleSelectOperateur = (op: Operateur) => {
    setOperateur(op);
    setStep("phone");
    setError("");
  };

  const handlePhoneSubmit = () => {
    if (!validatePhone(telephone, operateur)) {
      setError(`Numéro ${operateur === "orange" ? "Orange Money" : "MTN Money"} invalide`);
      return;
    }
    setStep("confirm");
    setError("");
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Simulation de paiement (à remplacer par vraie API)
      await simulatePayment();
      
      onSuccess({
        operateur,
        telephone,
        montant,
        numeroCommande,
        status: "success"
      });

    } catch (err: any) {
      setError(err.message || "Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 90% de succès pour la simulation
        if (Math.random() > 0.1) {
          resolve({ success: true });
        } else {
          reject(new Error("Paiement refusé. Solde insuffisant."));
        }
      }, 3000);
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 max-w-md mx-auto">
      
      {/* ÉTAPE 1 : SÉLECTION OPÉRATEUR */}
      {step === "select" && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">
            Choisir votre opérateur
          </h2>
          
          <div className="space-y-4">
            {/* Orange Money */}
            <button
              onClick={() => handleSelectOperateur("orange")}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-6 rounded-xl flex items-center gap-4 transition shadow-lg hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl">
                🟠
              </div>
              <div className="flex-1 text-left">
                <div className="text-xl font-bold">Orange Money</div>
                <div className="text-sm opacity-90">Paiement sécurisé</div>
              </div>
              <div className="text-2xl">→</div>
            </button>

            {/* MTN Money */}
            <button
              onClick={() => handleSelectOperateur("mtn")}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-6 rounded-xl flex items-center gap-4 transition shadow-lg hover:shadow-xl"
            >
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl">
                🟡
              </div>
              <div className="flex-1 text-left">
                <div className="text-xl font-bold">MTN Money</div>
                <div className="text-sm opacity-90">Paiement sécurisé</div>
              </div>
              <div className="text-2xl">→</div>
            </button>
          </div>

          <button
            onClick={onCancel}
            className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      )}

      {/* ÉTAPE 2 : SAISIE NUMÉRO */}
      {step === "phone" && operateur && (
        <div>
          <button
            onClick={() => {
              setStep("select");
              setOperateur(null);
              setTelephone("");
            }}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Retour
          </button>

          <div className="text-center mb-6">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
              operateur === "orange" ? "bg-orange-100" : "bg-yellow-100"
            }`}>
              {operateur === "orange" ? "🟠" : "🟡"}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {operateur === "orange" ? "Orange Money" : "MTN Money"}
            </h2>
            <p className="text-gray-600">
              Entrez votre numéro de téléphone
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => {
                setTelephone(e.target.value);
                setError("");
              }}
              placeholder="+224 6XX XXX XXX"
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              {operateur === "orange" 
                ? "Format : +224 6XX XXX XXX (commence par 62X-69X)"
                : "Format : +224 66X XXX XXX (commence par 66X)"}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Montant à payer</span>
              <span className="text-2xl font-bold text-blue-600">
                {montant.toLocaleString('fr-FR')} GNF
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Commande : {numeroCommande}
            </div>
          </div>

          <button
            onClick={handlePhoneSubmit}
            disabled={!telephone}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuer
          </button>
        </div>
      )}

      {/* ÉTAPE 3 : CONFIRMATION */}
      {step === "confirm" && operateur && (
        <div>
          <button
            onClick={() => setStep("phone")}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
            disabled={loading}
          >
            ← Modifier
          </button>

          <div className="text-center mb-6">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
              operateur === "orange" ? "bg-orange-100" : "bg-yellow-100"
            }`}>
              {operateur === "orange" ? "🟠" : "🟡"}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Confirmer le paiement
            </h2>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Opérateur</span>
              <span className="font-bold">
                {operateur === "orange" ? "Orange Money" : "MTN Money"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Numéro</span>
              <span className="font-bold">{formatPhone(telephone)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commande</span>
              <span className="font-mono font-bold text-sm">{numeroCommande}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-700 font-semibold">Montant</span>
              <span className="text-2xl font-bold text-blue-600">
                {montant.toLocaleString('fr-FR')} GNF
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-xl mb-4">
              <strong>Erreur :</strong> {error}
            </div>
          )}

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
            <strong>⚠️ Instructions :</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li>Composez le code USSD sur votre téléphone</li>
              <li>Validez le paiement avec votre code PIN</li>
              <li>Attendez la confirmation</li>
            </ol>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : operateur === "orange"
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Traitement en cours...
              </span>
            ) : (
              `Payer ${montant.toLocaleString('fr-FR')} GNF`
            )}
          </button>

          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      )}

    </div>
  );
}