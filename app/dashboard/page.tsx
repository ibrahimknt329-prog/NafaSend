"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Commande {
  id: number;
  created_at: string;
  numero_suivi: string;
  expediteur_ville: string;
  destinataire_ville: string;
  destinataire_nom: string;
  poids: number;
  prix: number;
  statut: string;
  type_service: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    en_cours: 0,
    livrees: 0,
    montant_total: 0,
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    // Vérifier si l'utilisateur est connecté
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Rediriger vers login si non connecté
      router.push('/login');
      return;
    }

    setUser(user);
    loadCommandes(user.id);
  };

  const loadCommandes = async (userId: string) => {
    setLoading(true);
    try {
      // Récupérer toutes les commandes de l'utilisateur
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erreur:", error);
      } else if (data) {
        setCommandes(data);
        
        // Calculer les stats
        const total = data.length;
        const en_cours = data.filter(c => c.statut !== 'livre').length;
        const livrees = data.filter(c => c.statut === 'livre').length;
        const montant_total = data.reduce((sum, c) => sum + c.prix, 0);

        setStats({ total, en_cours, livrees, montant_total });
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-4xl font-bold mb-2">
                Tableau de bord
              </h1>
              <p className="text-gray-600">
                Bienvenue {user?.user_metadata?.nom || user?.email} !
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/envoyer"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                + Nouvel envoi
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total envois</div>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 mb-1">En cours</div>
            <div className="text-3xl font-bold text-orange-600">{stats.en_cours}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Livrés</div>
            <div className="text-3xl font-bold text-green-600">{stats.livrees}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Montant total</div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.montant_total.toLocaleString('fr-FR')} GNF
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">📦 Mes commandes</h2>
          
          {commandes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Aucune commande
              </h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore créé d'envoi
              </p>
              <Link
                href="/envoyer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                Créer mon premier envoi
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {commandes.map((cmd) => (
                <div
                  key={cmd.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-mono font-bold text-lg text-blue-600 mb-1">
                        {cmd.numero_suivi}
                      </div>
                      <div className="text-sm text-gray-600">
                        Créé le {new Date(cmd.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    {getStatutBadge(cmd.statut)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">De</div>
                      <div className="font-semibold">{cmd.expediteur_ville}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Vers</div>
                      <div className="font-semibold">{cmd.destinataire_ville}</div>
                      <div className="text-sm text-gray-600">{cmd.destinataire_nom}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Poids / Service</div>
                      <div className="font-semibold">{cmd.poids} kg</div>
                      <div className="text-sm text-gray-600 capitalize">{cmd.type_service}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Prix</div>
                      <div className="font-bold text-lg">
                        {cmd.prix.toLocaleString('fr-FR')} GNF
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-3">
                    <Link
                      href={`/suivi?numero=${cmd.numero_suivi}`}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-100 transition text-center"
                    >
                      📍 Suivre
                    </Link>
                    <button className="flex-1 bg-gray-50 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                      📄 Détails
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}