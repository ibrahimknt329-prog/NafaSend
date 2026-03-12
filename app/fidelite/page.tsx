"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface LoyaltyData {
  points: number;
  level: string;
  totalSpent: number;
  discount: number;
  nextLevel: string | null;
  pointsToNext: number;
}

export default function LoyaltyProgram() {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReferral, setShowReferral] = useState(false);

  const levels = {
    bronze: { min: 0, max: 499, discount: 5, color: "from-orange-400 to-orange-600", icon: "🥉" },
    silver: { min: 500, max: 999, discount: 10, color: "from-gray-400 to-gray-600", icon: "🥈" },
    gold: { min: 1000, max: 1999, discount: 15, color: "from-yellow-400 to-yellow-600", icon: "🥇" },
    platinum: { min: 2000, max: 999999, discount: 20, color: "from-purple-400 to-purple-600", icon: "💎" }
  };

  useEffect(() => {
    if (user) {
      loadLoyaltyData();
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    try {
      // Récupérer les données de fidélité
      let { data: loyaltyData, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Créer un compte fidélité
        const { data: newLoyalty } = await supabase
          .from('loyalty_points')
          .insert([{
            user_id: user?.id,
            points: 0,
            level: 'bronze',
            total_spent: 0
          }])
          .select()
          .single();
        
        loyaltyData = newLoyalty;
      }

      if (loyaltyData) {
        const currentLevel = loyaltyData.level || 'bronze';
        const points = loyaltyData.points || 0;
        
        // Calculer le niveau suivant
        const levelOrder = ['bronze', 'silver', 'gold', 'platinum'];
        const currentIndex = levelOrder.indexOf(currentLevel);
        const nextLevel = currentIndex < levelOrder.length - 1 ? levelOrder[currentIndex + 1] : null;
        
        const pointsToNext = nextLevel ? levels[nextLevel as keyof typeof levels].min - points : 0;

        setLoyalty({
          points,
          level: currentLevel,
          totalSpent: loyaltyData.total_spent || 0,
          discount: levels[currentLevel as keyof typeof levels].discount,
          nextLevel,
          pointsToNext: Math.max(0, pointsToNext)
        });
      }
    } catch (error) {
      console.error('Erreur chargement fidélité:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralCode = () => {
    if (!user) return '';
    const userName = user.user_metadata?.nom || user.email?.split('@')[0] || 'USER';
    return `NAFA-${userName.toUpperCase()}-2024`;
  };

  const shareReferral = () => {
    const code = getReferralCode();
    const message = `🎁 Rejoins NafaSend avec mon code ${code} et gagne 10,000 GNF ! Je gagne aussi 10,000 GNF. C'est win-win ! 🚀`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Parrainage NafaSend',
        text: message,
        url: `https://nafasend.gn?ref=${code}`
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('Code copié dans le presse-papier !');
    }
  };

  const getProgressPercentage = () => {
    if (!loyalty) return 0;
    
    const currentLevel = levels[loyalty.level as keyof typeof levels];
    const range = currentLevel.max - currentLevel.min;
    const progress = loyalty.points - currentLevel.min;
    
    return Math.min(100, (progress / range) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!loyalty) return null;

  const currentLevelData = levels[loyalty.level as keyof typeof levels];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* CARTE PRINCIPALE */}
        <div className={`bg-gradient-to-br ${currentLevelData.color} rounded-3xl shadow-2xl p-8 mb-8 text-white`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="text-sm opacity-90 mb-2">Votre Statut</div>
              <div className="flex items-center gap-3">
                <span className="text-6xl">{currentLevelData.icon}</span>
                <div>
                  <h1 className="text-4xl font-bold capitalize">{loyalty.level}</h1>
                  <p className="text-xl opacity-90">{currentLevelData.discount}% de réduction</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">Vos Points</div>
              <div className="text-5xl font-bold">{loyalty.points}</div>
              <div className="text-sm opacity-90">pts</div>
            </div>
          </div>

          {/* BARRE DE PROGRESSION */}
          {loyalty.nextLevel && (
            <div className="bg-white/20 rounded-full h-4 overflow-hidden mb-3">
              <div 
                className="bg-white h-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          )}

          <div className="flex justify-between text-sm opacity-90">
            {loyalty.nextLevel ? (
              <>
                <span>Niveau actuel : {loyalty.level}</span>
                <span>Plus que {loyalty.pointsToNext} pts pour {loyalty.nextLevel} !</span>
              </>
            ) : (
              <span>🎉 Vous êtes au niveau maximum !</span>
            )}
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-500 text-sm mb-2">Total Dépensé</div>
            <div className="text-3xl font-bold text-gray-900">
              {loyalty.totalSpent.toLocaleString()} <span className="text-lg">GNF</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-500 text-sm mb-2">Réduction Active</div>
            <div className="text-3xl font-bold text-green-600">
              {currentLevelData.discount}%
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-gray-500 text-sm mb-2">Valeur des Points</div>
            <div className="text-3xl font-bold text-blue-600">
              {(loyalty.points * 10).toLocaleString()} <span className="text-lg">GNF</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">1 point = 10 GNF</div>
          </div>
        </div>

        {/* COMMENT GAGNER DES POINTS */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            💡 Comment gagner des points ?
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl">📦</div>
              <div>
                <div className="font-bold text-gray-900">Faites des envois</div>
                <div className="text-gray-600">1 point = 100 GNF dépensé</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
              <div className="text-3xl">👥</div>
              <div>
                <div className="font-bold text-gray-900">Parrainez vos amis</div>
                <div className="text-gray-600">100 points par filleul (= 10,000 GNF bonus)</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl">🎂</div>
              <div>
                <div className="font-bold text-gray-900">Votre anniversaire</div>
                <div className="text-gray-600">200 points offerts (= 20,000 GNF bonus)</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl">
              <div className="text-3xl">⭐</div>
              <div>
                <div className="font-bold text-gray-900">Laissez un avis</div>
                <div className="text-gray-600">50 points par avis vérifié</div>
              </div>
            </div>
          </div>
        </div>

        {/* NIVEAUX */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🏆 Les Niveaux
          </h2>

          <div className="space-y-4">
            {Object.entries(levels).map(([level, data]) => {
              const isCurrentLevel = level === loyalty.level;
              const isCompleted = loyalty.points >= data.min;

              return (
                <div 
                  key={level}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${
                    isCurrentLevel 
                      ? 'border-blue-500 bg-blue-50' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{data.icon}</span>
                    <div>
                      <div className="font-bold text-gray-900 capitalize flex items-center gap-2">
                        {level}
                        {isCurrentLevel && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                            ACTUEL
                          </span>
                        )}
                        {isCompleted && !isCurrentLevel && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                            ✓ DÉBLOQUÉ
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.min} - {data.max === 999999 ? '∞' : data.max} points
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {data.discount}%
                    </div>
                    <div className="text-xs text-gray-500">de réduction</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PARRAINAGE */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">👥 Parrainez vos amis</h2>
              <p className="text-green-100">
                Gagnez 10,000 GNF pour chaque ami parrainé (+ 100 points)
              </p>
            </div>
            <button
              onClick={() => setShowReferral(!showReferral)}
              className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition"
            >
              {showReferral ? 'Masquer' : 'Voir mon code'}
            </button>
          </div>

          {showReferral && (
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 animate-fade-in">
              <div className="text-sm text-green-100 mb-2">Votre code de parrainage</div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 bg-white text-gray-900 px-6 py-4 rounded-xl font-mono text-2xl font-bold text-center">
                  {getReferralCode()}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getReferralCode());
                    alert('Code copié !');
                  }}
                  className="bg-white/30 hover:bg-white/50 p-4 rounded-xl transition"
                >
                  📋
                </button>
              </div>

              <button
                onClick={shareReferral}
                className="w-full bg-white text-green-600 py-4 rounded-xl font-bold hover:bg-green-50 transition flex items-center justify-center gap-2"
              >
                <span>📤</span>
                <span>Partager mon code</span>
              </button>

              <div className="mt-6 pt-6 border-t border-white/30">
                <div className="text-sm text-green-100 mb-3">Comment ça marche ?</div>
                <ol className="space-y-2 text-sm">
                  <li>1️⃣ Partagez votre code à vos amis</li>
                  <li>2️⃣ Votre ami s'inscrit avec votre code</li>
                  <li>3️⃣ Il fait sa première commande</li>
                  <li>4️⃣ Vous recevez tous les deux 10,000 GNF + 100 points ! 🎉</li>
                </ol>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}