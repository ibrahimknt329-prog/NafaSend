"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import SimpleMap from "@/components/TrackingMap";

interface Commande {
  id: number;
  created_at: string;
  numero_suivi: string;
  expediteur_nom: string;
  expediteur_ville: string;
  destinataire_nom: string;
  destinataire_ville: string;
  destinataire_adresse: string;
  poids: number;
  prix: number;
  statut: string;
  type_service: string;
}

export default function SuiviPageWithMap() {
  const [numeroSuivi, setNumeroSuivi] = useState("");
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const getStatutInfo = (statut: string) => {
    const infos = {
      en_preparation: {
        icon: "📦",
        titre: "Colis enregistré",
        description: "Votre colis est enregistré et en attente de récupération",
        couleur: "blue"
      },
      en_transit: {
        icon: "🚚",
        titre: "En transit",
        description: "Votre colis est en cours d'acheminement",
        couleur: "purple"
      },
      en_livraison: {
        icon: "🏃",
        titre: "En cours de livraison",
        description: "Le livreur est en route vers l'adresse de livraison",
        couleur: "orange"
      },
      livre: {
        icon: "✅",
        titre: "Livré",
        description: "Votre colis a été livré avec succès",
        couleur: "green"
      }
    };
    
    return infos[statut as keyof typeof infos] || infos.en_preparation;
  };

  const getHistorique = (statut: string, createdAt: string) => {
    const dateCreation = new Date(createdAt);
    
    const date1 = new Date(dateCreation);
    const date2 = new Date(dateCreation.getTime() + 4 * 60 * 60 * 1000);
    const date3 = new Date(dateCreation.getTime() + 24 * 60 * 60 * 1000);
    const date4 = new Date(dateCreation.getTime() + 48 * 60 * 60 * 1000);
    const date5 = statut === "livre" ? new Date(dateCreation.getTime() + 72 * 60 * 60 * 1000) : null;
    
    const formatDate = (date: Date) => {
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const baseHistorique = [
      {
        statut: "Colis enregistré",
        date: formatDate(date1),
        lieu: "Système",
        actif: true
      },
      {
        statut: "Colis récupéré",
        date: statut !== "en_preparation" ? formatDate(date2) : "",
        lieu: "Centre de tri",
        actif: statut !== "en_preparation"
      },
      {
        statut: "En transit",
        date: (statut === "en_transit" || statut === "en_livraison" || statut === "livre") ? formatDate(date3) : "",
        lieu: "Hub national",
        actif: statut === "en_transit" || statut === "en_livraison" || statut === "livre"
      },
      {
        statut: "En cours de livraison",
        date: (statut === "en_livraison" || statut === "livre") ? formatDate(date4) : "",
        lieu: "Centre de livraison",
        actif: statut === "en_livraison" || statut === "livre"
      },
      {
        statut: "Livré",
        date: date5 ? formatDate(date5) : "",
        lieu: "Remis au destinataire",
        actif: statut === "livre"
      }
    ];
    
    return baseHistorique;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroSuivi.trim()) return;

    setLoading(true);
    setError("");
    setNotFound(false);
    setCommande(null);

    try {
      const { data, error: searchError } = await supabase
        .from('commandes')
        .select('*')
        .eq('numero_suivi', numeroSuivi.trim().toUpperCase())
        .single();

      if (searchError) {
        if (searchError.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw searchError;
        }
      } else if (data) {
        setCommande(data);
      }

    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-4xl font-bold mb-2 text-center">Suivre mon colis</h1>
        <p className="text-gray-600 text-center mb-8">
          Entrez votre numéro de suivi pour localiser votre colis
        </p>

        {/* FORMULAIRE DE RECHERCHE */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={numeroSuivi}
              onChange={(e) => setNumeroSuivi(e.target.value.toUpperCase())}
              placeholder="Ex: FL123456789"
              className="flex-1 border-2 border-gray-300 rounded-xl px-6 py-4 text-lg focus:border-blue-500 focus:outline-none uppercase"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "⏳ Recherche..." : "🔍 Suivre"}
            </button>
          </div>
        </form>

        {/* MESSAGE D'ERREUR */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 p-6 rounded-2xl mb-8">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {/* COLIS NON TROUVÉ */}
        {notFound && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-yellow-800 mb-2">
              Colis non trouvé
            </h3>
            <p className="text-yellow-700 mb-4">
              Le numéro de suivi <strong>{numeroSuivi}</strong> n'existe pas dans notre système.
            </p>
            <p className="text-sm text-yellow-600">
              Vérifiez que vous avez bien saisi le numéro ou contactez notre service client.
            </p>
          </div>
        )}

        {/* RÉSULTATS DU SUIVI */}
        {commande && (
          <div className="space-y-6">
            
            {/* STATUT ACTUEL */}
            <div className={`bg-gradient-to-r from-${getStatutInfo(commande.statut).couleur}-500 to-${getStatutInfo(commande.statut).couleur}-600 text-white rounded-2xl shadow-xl p-8`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl">{getStatutInfo(commande.statut).icon}</div>
                <div>
                  <div className="text-sm opacity-90">Numéro de suivi: {commande.numero_suivi}</div>
                  <h2 className="text-3xl font-bold">{getStatutInfo(commande.statut).titre}</h2>
                  <p className="text-lg opacity-90">{getStatutInfo(commande.statut).description}</p>
                </div>
              </div>
              
              {commande.statut !== "livre" && (
                <div className="bg-white bg-opacity-20 rounded-xl p-4 mt-4">
                  <div className="text-sm opacity-90">Livraison estimée</div>
                  <div className="text-xl font-bold">
                    {commande.type_service === "express" ? "Dans les 24h" : "2-3 jours ouvrables"}
                  </div>
                </div>
              )}
            </div>

            {/* CARTE INTERACTIVE */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">📍 Position du colis</h3>
              <SimpleMap 
                origin={commande.expediteur_ville}
                destination={commande.destinataire_ville}
                status={commande.statut}
              />
            </div>

            {/* INFORMATIONS DE LIVRAISON */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">📋 Informations de livraison</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Expéditeur</div>
                  <div className="font-bold">{commande.expediteur_nom}</div>
                  <div className="text-sm text-gray-600">{commande.expediteur_ville}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Créé le {new Date(commande.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Destinataire</div>
                  <div className="font-bold">{commande.destinataire_nom}</div>
                  <div className="text-sm text-gray-600">{commande.destinataire_ville}</div>
                  <div className="text-sm text-gray-600">{commande.destinataire_adresse}</div>
                </div>
              </div>
              
              <div className="border-t mt-4 pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Poids</div>
                  <div className="font-semibold">{commande.poids} kg</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Service</div>
                  <div className="font-semibold capitalize">{commande.type_service}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Prix</div>
                  <div className="font-semibold">{commande.prix.toLocaleString('fr-FR')} GNF</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">ID</div>
                  <div className="font-semibold text-sm">#{commande.id}</div>
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6">📍 Historique du colis</h3>
              
              <div className="space-y-6">
                {getHistorique(commande.statut, commande.created_at).map((etape, index) => (
                  <div key={index} className="flex gap-4">
                    
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        etape.actif 
                          ? "bg-green-500 text-white shadow-lg" 
                          : "bg-gray-200 text-gray-400"
                      }`}>
                        {etape.actif ? "✓" : "○"}
                      </div>
                      {index < getHistorique(commande.statut, commande.created_at).length - 1 && (
                        <div className={`w-1 h-16 ${
                          etape.actif ? "bg-green-500" : "bg-gray-200"
                        }`}></div>
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className={`font-bold text-lg ${etape.actif ? "text-gray-900" : "text-gray-400"}`}>
                        {etape.statut}
                      </div>
                      <div className="text-sm text-gray-600">{etape.lieu}</div>
                      {etape.date && (
                        <div className="text-sm text-gray-500 mt-1">{etape.date}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOUTON NOUVELLE RECHERCHE */}
            <div className="text-center">
              <button
                onClick={() => {
                  setCommande(null);
                  setNumeroSuivi("");
                  setNotFound(false);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                ← Nouvelle recherche
              </button>
            </div>

          </div>
        )}

        {/* AIDE */}
        {!commande && !notFound && !loading && (
          <div className="bg-blue-50 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2">Besoin d'aide ?</h3>
            <p className="text-gray-600 mb-4">
              Vous pouvez retrouver votre numéro de suivi dans l'email de confirmation
              ou en contactant notre service client.
            </p>
            <div className="text-sm text-gray-500">
              <p>💡 Astuce : Le numéro de suivi commence toujours par "FL"</p>
              <p className="mt-2">Exemple : FL12345678901</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}