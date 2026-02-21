"use client";

interface MapProps {
  origin: string;
  destination: string;
  status: string;
}

export default function SimpleMap({ origin, destination, status }: MapProps) {
  const getStatusEmoji = (status: string) => {
    const emojis = {
      en_preparation: "📦",
      en_transit: "🚚",
      en_livraison: "🏃",
      livre: "✅"
    };
    return emojis[status as keyof typeof emojis] || "📦";
  };

  const getProgressPercentage = (status: string) => {
    const percentages = {
      en_preparation: 25,
      en_transit: 50,
      en_livraison: 75,
      livre: 100
    };
    return percentages[status as keyof typeof percentages] || 0;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      en_preparation: "Préparation en cours",
      en_transit: "Colis en route",
      en_livraison: "Livraison en cours",
      livre: "Colis livré"
    };
    return labels[status as keyof typeof labels] || "En traitement";
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-100">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4 animate-bounce-soft">{getStatusEmoji(status)}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{getStatusLabel(status)}</h3>
        <p className="text-gray-600">
          <span className="font-semibold">{origin}</span> 
          <span className="mx-2">→</span> 
          <span className="font-semibold">{destination}</span>
        </p>
      </div>

      {/* Barre de progression */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Progression de la livraison</span>
          <span className="text-sm font-semibold text-blue-600">{getProgressPercentage(status)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
            style={{ width: `${getProgressPercentage(status)}%` }}
          >
            {getProgressPercentage(status) > 15 && (
              <span className="text-white text-xs font-bold">{getProgressPercentage(status)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Étapes visuelles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "en_preparation", label: "Préparation", icon: "📦", percent: 25 },
          { key: "en_transit", label: "Transit", icon: "🚚", percent: 50 },
          { key: "en_livraison", label: "Livraison", icon: "🏃", percent: 75 },
          { key: "livre", label: "Livré", icon: "✅", percent: 100 }
        ].map((step, index) => {
          const isActive = getProgressPercentage(status) >= step.percent;
          const isCurrent = getProgressPercentage(status) === step.percent;
          
          return (
            <div
              key={step.key}
              className={`text-center p-4 rounded-lg transition-all duration-300 ${
                isCurrent
                  ? "bg-blue-600 text-white shadow-xl scale-110 border-2 border-blue-700"
                  : isActive 
                  ? "bg-blue-100 border-2 border-blue-600" 
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <div className={`text-3xl mb-2 ${isCurrent ? 'animate-bounce-soft' : ''}`}>
                {step.icon}
              </div>
              <div className={`text-sm font-semibold ${
                isCurrent 
                  ? "text-white" 
                  : isActive 
                  ? "text-blue-600" 
                  : "text-gray-400"
              }`}>
                {step.label}
              </div>
              {isActive && (
                <div className={`text-xs mt-1 ${isCurrent ? "text-blue-100" : "text-blue-500"}`}>
                  {step.percent}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 pt-6 border-t border-blue-200">
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-gray-500 mb-1">📍 Point de départ</div>
            <div className="font-bold text-gray-900">{origin}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-gray-500 mb-1">🎯 Destination</div>
            <div className="font-bold text-gray-900">{destination}</div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          💡 Position mise à jour en temps réel
        </p>
      </div>
    </div>
  );
}

// Export pour compatibilité
export { SimpleMap };