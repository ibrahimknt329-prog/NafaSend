"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabase() {
  const [status, setStatus] = useState("Test en cours...");
  const [commandes, setCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    testSupabase();
  }, []);

  const testSupabase = async () => {
    setLoading(true);
    try {
      // Test 1 : Vérifier la connexion
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .limit(1);

      if (error) {
        throw new Error(`Erreur de connexion: ${error.message}`);
      }

      setStatus("✅ Connexion à Supabase réussie !");
      
      // Test 2 : Créer une commande de test
      const numeroTest = `TEST${Date.now()}`;
      
      const { data: nouvelleCommande, error: insertError } = await supabase
        .from('commandes')
        .insert([
          {
            numero_suivi: numeroTest,
            expediteur_nom: "Test Expéditeur",
            expediteur_tel: "+224 123456789",
            expediteur_ville: "Conakry",
            destinataire_nom: "Test Destinataire",
            destinataire_tel: "+224 987654321",
            destinataire_ville: "Kindia",
            poids: 2.5,
            prix: 66000,
            statut: "en_preparation",
            type_service: "standard",
            paiement_livraison: false
          }
        ])
        .select();

      if (insertError) {
        throw new Error(`Erreur lors de l'insertion: ${insertError.message}`);
      }

      setStatus(`✅ Connexion réussie ! Commande test créée : ${numeroTest}`);
      
      // Récupérer toutes les commandes
      const { data: allCommandes, error: selectError } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (selectError) {
        throw new Error(`Erreur lors de la lecture: ${selectError.message}`);
      }

      if (allCommandes) {
        setCommandes(allCommandes);
      }

    } catch (error: any) {
      setStatus(`❌ Erreur: ${error.message}`);
      console.error("Erreur détaillée:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">🧪 Test Supabase</h1>
          <p className="text-gray-600 mb-4">
            Cette page teste la connexion à ta base de données Supabase
          </p>
          
          <div className={`p-4 rounded-lg mb-4 ${
            status.startsWith('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : status.startsWith('❌')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="text-lg font-semibold">{status}</p>
          </div>
          
          <button
            onClick={testSupabase}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "Test en cours..." : "🔄 Relancer le test"}
          </button>
        </div>

        {/* Liste des commandes */}
        {commandes.length > 0 && (
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              📦 Commandes dans la base ({commandes.length})
            </h2>
            <div className="space-y-4">
              {commandes.map((cmd) => (
                <div 
                  key={cmd.id} 
                  className="border-2 border-gray-200 p-4 rounded-lg hover:border-blue-400 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg text-blue-600">
                      #{cmd.numero_suivi}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      cmd.statut === 'livre' ? 'bg-green-100 text-green-800' :
                      cmd.statut === 'en_livraison' ? 'bg-orange-100 text-orange-800' :
                      cmd.statut === 'en_transit' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {cmd.statut.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">De:</span>
                      <span className="font-semibold ml-1">{cmd.expediteur_ville}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vers:</span>
                      <span className="font-semibold ml-1">{cmd.destinataire_ville}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Poids:</span>
                      <span className="font-semibold ml-1">{cmd.poids} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix:</span>
                      <span className="font-semibold ml-1">
                        {cmd.prix.toLocaleString('fr-FR')} GNF
                      </span>
                    </div>
                  </div>
                  
                  {cmd.created_at && (
                    <div className="text-xs text-gray-500 mt-2">
                      Créé le: {new Date(cmd.created_at).toLocaleString('fr-FR')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!status.startsWith('✅') && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mt-6">
            <h3 className="font-bold text-yellow-800 mb-2">⚠️ Si tu vois une erreur :</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>1. Vérifie que tu as bien créé la table "commandes" dans Supabase</li>
              <li>2. Vérifie tes clés dans lib/supabase.ts</li>
              <li>3. Vérifie les règles RLS dans Supabase</li>
              <li>4. Ouvre la console (F12) pour voir l'erreur détaillée</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}