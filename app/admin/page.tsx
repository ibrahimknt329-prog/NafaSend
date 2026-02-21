"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Commande {
  id: number;
  created_at: string;
  numero_suivi: string;
  expediteur_nom: string;
  expediteur_tel: string;
  expediteur_ville: string;
  destinataire_nom: string;
  destinataire_tel: string;
  destinataire_ville: string;
  destinataire_adresse: string;
  poids: number;
  prix: number;
  statut: string;
  type_service: string;
  paiement_livraison: boolean;
  montant_cod: number | null;
  user_id: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<string>("tous");
  const [recherche, setRecherche] = useState("");
  const [commandeSelectionnee, setCommandeSelectionnee] = useState<Commande | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [nouveauStatut, setNouveauStatut] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    en_preparation: 0,
    en_transit: 0,
    en_livraison: 0,
    livre: 0,
    revenu_total: 0,
    revenu_cod: 0,
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
  // Vérifier si l'utilisateur est admin
const { data: adminData, error: adminError } = await supabase
  .from('admins')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (adminError || !adminData) {
  alert("⛔ Accès refusé : Vous n'êtes pas administrateur");
  router.push('/dashboard');
  return;
}

// L'utilisateur est admin
setUser(user);
loadCommandes();  
  };

  const loadCommandes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur:", error);
      } else if (data) {
        setCommandes(data);
        calculerStats(data);
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculerStats = (data: Commande[]) => {
    const total = data.length;
    const en_preparation = data.filter(c => c.statut === 'en_preparation').length;
    const en_transit = data.filter(c => c.statut === 'en_transit').length;
    const en_livraison = data.filter(c => c.statut === 'en_livraison').length;
    const livre = data.filter(c => c.statut === 'livre').length;
    const revenu_total = data.reduce((sum, c) => sum + c.prix, 0);
    const revenu_cod = data
      .filter(c => c.paiement_livraison && c.montant_cod)
      .reduce((sum, c) => sum + (c.montant_cod || 0), 0);

    setStats({
      total,
      en_preparation,
      en_transit,
      en_livraison,
      livre,
      revenu_total,
      revenu_cod,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatutBadge = (statut: string) => {
    const styles = {
      en_preparation: "bg-blue-100 text-blue-800",
      en_transit: "bg-purple-100 text-purple-800",
      en_livraison: "bg-orange-100 text-orange-800",
      livre: "bg-green-100 text-green-800",
    };
    
    const labels = {
      en_preparation: "En préparation",
      en_transit: "En transit",
      en_livraison: "En livraison",
      livre: "Livré",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[statut as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[statut as keyof typeof labels] || statut}
      </span>
    );
  };

  const ouvrirModalEdit = (commande: Commande) => {
    setCommandeSelectionnee(commande);
    setNouveauStatut(commande.statut);
    setShowEditModal(true);
  };

  const modifierStatut = async () => {
    if (!commandeSelectionnee) return;

    try {
      const { error } = await supabase
        .from('commandes')
        .update({ statut: nouveauStatut })
        .eq('id', commandeSelectionnee.id);

      if (error) throw error;

      // Recharger les commandes
      await loadCommandes();
      setShowEditModal(false);
      setCommandeSelectionnee(null);
    } catch (err: any) {
      console.error("Erreur:", err);
      alert(`Erreur: ${err.message}`);
    }
  };

  const commandesFiltrees = commandes.filter(cmd => {
    // Filtre par statut
    if (filtreStatut !== "tous" && cmd.statut !== filtreStatut) {
      return false;
    }

    // Filtre par recherche
    if (recherche) {
      const r = recherche.toLowerCase();
      return (
        cmd.numero_suivi.toLowerCase().includes(r) ||
        cmd.expediteur_nom.toLowerCase().includes(r) ||
        cmd.destinataire_nom.toLowerCase().includes(r) ||
        cmd.expediteur_ville.toLowerCase().includes(r) ||
        cmd.destinataire_ville.toLowerCase().includes(r)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                👑 Dashboard Administrateur
              </h1>
              <p className="text-gray-600">
                Gérez toutes les commandes et les utilisateurs
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Mon Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-100 text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-200 transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-xs text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-xl shadow p-6">
            <div className="text-xs text-gray-600 mb-1">Préparation</div>
            <div className="text-3xl font-bold text-blue-600">{stats.en_preparation}</div>
          </div>
          <div className="bg-purple-50 rounded-xl shadow p-6">
            <div className="text-xs text-gray-600 mb-1">Transit</div>
            <div className="text-3xl font-bold text-purple-600">{stats.en_transit}</div>
          </div>
          <div className="bg-orange-50 rounded-xl shadow p-6">
            <div className="text-xs text-gray-600 mb-1">Livraison</div>
            <div className="text-3xl font-bold text-orange-600">{stats.en_livraison}</div>
          </div>
          <div className="bg-green-50 rounded-xl shadow p-6">
            <div className="text-xs text-gray-600 mb-1">Livrés</div>
            <div className="text-3xl font-bold text-green-600">{stats.livre}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 col-span-2">
            <div className="text-xs text-gray-600 mb-1">Revenu total</div>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.revenu_total.toLocaleString('fr-FR')} GNF
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="🔍 Rechercher par numéro, nom, ville..."
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="border-2 border-gray-300 rounded-xl px-6 py-3 focus:border-blue-500 focus:outline-none font-semibold"
              >
                <option value="tous">📋 Tous les statuts</option>
                <option value="en_preparation">📦 En préparation</option>
                <option value="en_transit">🚚 En transit</option>
                <option value="en_livraison">🏃 En livraison</option>
                <option value="livre">✅ Livré</option>
              </select>
            </div>
            <button
              onClick={loadCommandes}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              🔄 Actualiser
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Affichage de <strong>{commandesFiltrees.length}</strong> commande(s) sur {stats.total}
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">📦 Toutes les commandes</h2>
          
          {commandesFiltrees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-gray-600">
                {recherche || filtreStatut !== "tous" 
                  ? "Essayez de modifier vos filtres"
                  : "Aucune commande n'a été créée pour le moment"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {commandesFiltrees.map((cmd) => (
                <div
                  key={cmd.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-mono font-bold text-lg text-blue-600 mb-1">
                        {cmd.numero_suivi}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: #{cmd.id} • Créé le {new Date(cmd.created_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatutBadge(cmd.statut)}
                      <button
                        onClick={() => ouvrirModalEdit(cmd)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500">Expéditeur</div>
                      <div className="font-semibold">{cmd.expediteur_nom}</div>
                      <div className="text-sm text-gray-600">{cmd.expediteur_tel}</div>
                      <div className="text-sm text-gray-600">{cmd.expediteur_ville}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Destinataire</div>
                      <div className="font-semibold">{cmd.destinataire_nom}</div>
                      <div className="text-sm text-gray-600">{cmd.destinataire_tel}</div>
                      <div className="text-sm text-gray-600">{cmd.destinataire_ville}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Colis</div>
                      <div className="font-semibold">{cmd.poids} kg</div>
                      <div className="text-sm text-gray-600 capitalize">{cmd.type_service}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Prix</div>
                      <div className="font-bold text-lg">
                        {cmd.prix.toLocaleString('fr-FR')} GNF
                      </div>
                      {cmd.paiement_livraison && (
                        <div className="text-xs text-green-600 font-semibold">
                          💰 COD: {cmd.montant_cod?.toLocaleString('fr-FR')} GNF
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Utilisateur</div>
                      <div className="text-sm text-gray-600">
                        {cmd.user_id ? `ID: ${cmd.user_id.slice(0, 8)}...` : "Anonyme"}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 border-t pt-3">
                    Adresse complète: {cmd.destinataire_adresse}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modal de modification */}
      {showEditModal && commandeSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              Modifier le statut
            </h2>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Commande</div>
              <div className="font-mono font-bold text-lg text-blue-600">
                {commandeSelectionnee.numero_suivi}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau statut
              </label>
              <select
                value={nouveauStatut}
                onChange={(e) => setNouveauStatut(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none font-semibold"
              >
                <option value="en_preparation">📦 En préparation</option>
                <option value="en_transit">🚚 En transit</option>
                <option value="en_livraison">🏃 En livraison</option>
                <option value="livre">✅ Livré</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={modifierStatut}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}