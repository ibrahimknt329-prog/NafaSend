"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"particuliers" | "ecommerce" | "entreprise">("particuliers");
  
  // Calculateur
  const [villeDepart, setVilleDepart] = useState("");
  const [villeArrivee, setVilleArrivee] = useState("");
  const [poids, setPoids] = useState("");
  const [prixCalcule, setPrixCalcule] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const calculerPrix = () => {
    if (!poids) {
      alert("Veuillez entrer le poids");
      return;
    }
    const poidsNum = parseFloat(poids);
    const prix = 50000 + (poidsNum * 8000);
    setPrixCalcule(prix);
    alert(`Prix estimé: ${prix.toLocaleString('fr-FR')} GNF`);
  };

  return (
    <main className="min-h-screen bg-white">

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white pt-32 pb-20 px-6 overflow-hidden">
        {/* Formes décoratives */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Livraison rapide et sécurisée partout en Guinée
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Optez dès maintenant pour notre service de livraison pour une expérience sans égale ! 
              Dites adieu aux délais d'attente interminables.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/envoyer"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-50 transition shadow-xl"
              >
                Envoyer un colis
              </Link>
              <Link
                href="/suivi"
                className="border-2 border-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/10 transition"
              >
                Suivre mon colis
              </Link>
            </div>
          </div>

          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6">Calculez votre tarif</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Ville d'expédition"
                  value={villeDepart}
                  onChange={(e) => setVilleDepart(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                />
                <input
                  type="text"
                  placeholder="Ville de destination"
                  value={villeArrivee}
                  onChange={(e) => setVilleArrivee(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                />
                <input
                  type="number"
                  placeholder="Poids (kg)"
                  value={poids}
                  onChange={(e) => setPoids(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white"
                />
                <button 
                  onClick={calculerPrix}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition"
                >
                  Calculer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-gray-600 font-semibold">Colis livrés</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">80%</div>
              <div className="text-gray-600 font-semibold">Couverture nationale</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">24-48h</div>
              <div className="text-gray-600 font-semibold">Délai de livraison</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-gray-600 font-semibold">Satisfaction client</div>
            </div>
          </div>
        </div>
      </section>

      {/* NOS SOLUTIONS - TABS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Nos solutions</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">
            Que vous soyez un particulier, un e-commerçant ou une entreprise, nous avons LA solution pour vous !
          </p>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            <button
              onClick={() => setActiveTab("particuliers")}
              className={`px-8 py-3 rounded-lg font-bold transition ${
                activeTab === "particuliers"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Particuliers
            </button>
            <button
              onClick={() => setActiveTab("ecommerce")}
              className={`px-8 py-3 rounded-lg font-bold transition ${
                activeTab === "ecommerce"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              E-commerçants
            </button>
            <button
              onClick={() => setActiveTab("entreprise")}
              className={`px-8 py-3 rounded-lg font-bold transition ${
                activeTab === "entreprise"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Entreprises
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
            {activeTab === "particuliers" && (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-6">Pour les particuliers</h3>
                  <p className="text-gray-700 mb-6 text-lg">
                    Envoyez vos colis à vos proches partout en Guinée en toute simplicité. 
                    Service rapide, sécurisé et abordable.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Envoi depuis n'importe quelle ville",
                      "Suivi en temps réel",
                      "Paiement à la livraison disponible",
                      "Tarifs attractifs dès 50 000 GNF"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/envoyer"
                    className="inline-block mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Envoyer maintenant
                  </Link>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-6xl mb-4 text-center">📦</div>
                  <h4 className="text-xl font-bold text-center mb-4">C'est simple !</h4>
                  <div className="space-y-3 text-gray-700">
                    <p>1️⃣ Remplissez le formulaire en ligne</p>
                    <p>2️⃣ Déposez votre colis en agence</p>
                    <p>3️⃣ Suivez votre envoi en temps réel</p>
                    <p>4️⃣ Votre colis est livré en 24-48h</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ecommerce" && (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-6">Pour les e-commerçants</h3>
                  <p className="text-gray-700 mb-6 text-lg">
                    Boostez votre business avec notre solution complète de livraison. 
                    Collecte, livraison, retours et paiement COD.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Collecte à domicile gratuite",
                      "Paiement COD avec versement J+1",
                      "Plateforme de gestion complète",
                      "Gestion des retours simplifiée",
                      "Tarifs dégressifs selon volume"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className="inline-block mt-8 bg-orange-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-orange-600 transition"
                  >
                    Devenir partenaire
                  </Link>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-6xl mb-4 text-center">🛒</div>
                  <h4 className="text-xl font-bold text-center mb-4">Processus optimisé</h4>
                  <div className="space-y-3 text-gray-700">
                    <p>1️⃣ Inscription et formation gratuite</p>
                    <p>2️⃣ Intégration de vos commandes</p>
                    <p>3️⃣ Collecte automatique des colis</p>
                    <p>4️⃣ Livraison rapide à vos clients</p>
                    <p>5️⃣ Versement J+1 du montant COD</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "entreprise" && (
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-6">Pour les entreprises</h3>
                  <p className="text-gray-700 mb-6 text-lg">
                    Solutions logistiques sur mesure pour optimiser votre chaîne de valeur. 
                    Warehousing, distribution, et gestion complète.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Solutions personnalisées à votre activité",
                      "Warehousing et stockage sécurisé",
                      "Gestion complète de la logistique",
                      "Reporting et analytics détaillés",
                      "Account manager dédié"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="tel:+224123456789"
                    className="inline-block mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition"
                  >
                    Nous contacter
                  </a>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-6xl mb-4 text-center">🏢</div>
                  <h4 className="text-xl font-bold text-center mb-4">Partenariat sur mesure</h4>
                  <div className="space-y-3 text-gray-700">
                    <p>1️⃣ Audit de vos besoins logistiques</p>
                    <p>2️⃣ Proposition de solution personnalisée</p>
                    <p>3️⃣ Mise en place et formation</p>
                    <p>4️⃣ Suivi et optimisation continue</p>
                    <p>5️⃣ Reporting mensuel détaillé</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Comment ça marche ?</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Avec NafaSend, il n'a jamais été aussi simple d'envoyer vos colis partout en Guinée !
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                icon: "📝",
                title: "Créez votre envoi",
                desc: "Renseignez vos informations sur notre plateforme en ligne"
              },
              {
                num: "02",
                icon: "📦",
                title: "Collecte du colis",
                desc: "Notre livreur récupère votre colis à l'adresse indiquée"
              },
              {
                num: "03",
                icon: "🚚",
                title: "Expédition rapide",
                desc: "Votre colis est acheminé vers sa destination finale"
              },
              {
                num: "04",
                icon: "✅",
                title: "Livraison sécurisée",
                desc: "Le destinataire reçoit son colis en 24-48h"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition h-full">
                  <div className="text-6xl font-bold text-blue-100 mb-2">{step.num}</div>
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 border-t-4 border-r-4 border-blue-600 transform rotate-45"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Ils nous font confiance</h2>
          <p className="text-center text-gray-600 mb-16 text-lg">
            Découvrez ce que nos clients disent de nous
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                text: "À J+1 de la réception des colis par mes clients, NafaSend déclenche le processus de paiement. Une réactivité qui place NafaSend comme un partenaire business plutôt qu'un simple service.",
                author: "Amadou Diallo",
                role: "E-commerçant",
                rating: 5
              },
              {
                text: "Dans le cadre de mon activité, j'envoie régulièrement des colis avec NafaSend et je suis satisfait du service. Merci pour la rapidité d'envoi et la disponibilité de vos agents.",
                author: "Fatoumata Bah",
                role: "Entreprise",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-bold">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Rejoignez des milliers de clients satisfaits qui nous font confiance chaque jour
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/envoyer"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-50 transition shadow-xl"
            >
              Envoyer un colis
            </Link>
            <Link
              href="/login"
              className="border-2 border-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/10 transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-3xl font-bold mb-4">🚚 NafaSend</div>
              <p className="text-gray-400 mb-4">
                Votre partenaire de confiance pour la livraison en Guinée
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Nos services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/envoyer" className="hover:text-white transition">Envoyer un colis</Link></li>
                <li><Link href="/suivi" className="hover:text-white transition">Suivre un colis</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Espace client</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">À propos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Qui sommes-nous</a></li>
                <li><a href="#" className="hover:text-white transition">Nos engagements</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span>+224 123 456 789</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <span>contact@NafaSend.gn</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Conakry, Guinée</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 NafaSend. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}