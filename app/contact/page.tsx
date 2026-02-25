"use client";

import { useState } from "react";

export default function ContactPageImproved() {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    ville: "",
    typeClient: "particulier",
    message: ""
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isOpenNow = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    
    if (day === 0) return false;
    if (day === 6) return hours >= 9 && hours < 16;
    return hours >= 8 && hours < 18;
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'prenom':
        if (!value.trim()) return "Le prénom est requis";
        if (value.length < 2) return "Le prénom doit contenir au moins 2 caractères";
        if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) return "Le prénom ne doit contenir que des lettres";
        return "";

      case 'nom':
        if (!value.trim()) return "Le nom est requis";
        if (value.length < 2) return "Le nom doit contenir au moins 2 caractères";
        if (!/^[a-zA-ZÀ-ÿ\s-]+$/.test(value)) return "Le nom ne doit contenir que des lettres";
        return "";

      case 'email':
        if (!value.trim()) return "L'email est requis";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email invalide";
        return "";

      case 'telephone':
        if (!value.trim()) return "Le téléphone est requis";
        const cleanPhone = value.replace(/\s/g, '');
        if (!/^(\+224)?[6-7]\d{8}$/.test(cleanPhone)) {
          return "Numéro invalide (ex: +224 622 123 456)";
        }
        return "";

      case 'ville':
        if (!value.trim()) return "La ville est requise";
        if (value.length < 2) return "La ville doit contenir au moins 2 caractères";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: any) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'message' && key !== 'typeClient') {
        const error = validateField(key, formData[key as keyof typeof formData]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
      ville: true
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Veuillez corriger les erreurs avant d'envoyer");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      console.log('Message reçu:', formData);
      
      setFormData({
        prenom: "",
        nom: "",
        email: "",
        telephone: "",
        ville: "",
        typeClient: "particulier",
        message: ""
      });
      
      setErrors({});
      setTouched({});

      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-600 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-teal-700 mb-4">
              Contactez-nous
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Nous vous répondrons au plus vite !
            </p>

            <div className={`mb-6 p-4 rounded-xl ${isOpenNow() ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOpenNow() ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`font-bold ${isOpenNow() ? 'text-green-800' : 'text-red-800'}`}>
                  {isOpenNow() ? 'Ouvert maintenant' : 'Fermé actuellement'}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  📧
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email</div>
                  <a href="mailto:contact@nafasend.gn" className="text-lg text-teal-700 font-semibold hover:text-teal-800 transition">
                    contact@nafasend.gn
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  📞
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Téléphone</div>
                  <a href="tel:+224123456789" className="text-lg text-teal-700 font-semibold hover:text-teal-800 transition">
                    +224 123 456 789
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  📍
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Adresse</div>
                  <p className="text-lg text-teal-700 font-semibold">
                    Quartier Madina, Conakry
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    République de Guinée
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-teal-50 rounded-xl p-6 border-2 border-teal-200">
              <h3 className="font-bold text-teal-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🕐</span>
                Horaires d ouverture
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Lundi - Vendredi</span>
                  <span className="font-semibold text-teal-800">8h30 - 18h00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Samedi</span>
                  <span className="font-semibold text-teal-800">9h00 - 16h00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-semibold">Dimanche</span>
                  <span className="font-semibold text-red-600">Fermé</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Envoyez-nous un message
            </h2>

            {success && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <div className="font-bold text-green-800">Message envoyé !</div>
                    <div className="text-sm text-green-700">Nous vous répondrons rapidement.</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none ${
                    errors.prenom && touched.prenom ? 'border-red-500' : 'border-gray-300 focus:border-teal-500'
                  }`}
                />
                {errors.prenom && touched.prenom && (
                  <p className="mt-1 text-sm text-red-600">{errors.prenom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none ${
                    errors.nom && touched.nom ? 'border-red-500' : 'border-gray-300 focus:border-teal-500'
                  }`}
                />
                {errors.nom && touched.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="nom@example.com"
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300 focus:border-teal-500'
                  }`}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+224 622 123 456"
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none ${
                    errors.telephone && touched.telephone ? 'border-red-500' : 'border-gray-300 focus:border-teal-500'
                  }`}
                />
                {errors.telephone && touched.telephone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none ${
                    errors.ville && touched.ville ? 'border-red-500' : 'border-gray-300 focus:border-teal-500'
                  }`}
                />
                {errors.ville && touched.ville && (
                  <p className="mt-1 text-sm text-red-600">{errors.ville}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Je suis...
                </label>
                <select
                  name="typeClient"
                  value={formData.typeClient}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-teal-500 focus:outline-none"
                >
                  <option value="particulier">Un particulier</option>
                  <option value="ecommercant">Un e-commerçant</option>
                  <option value="entreprise">Une entreprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (optionnel)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Décrivez votre besoin..."
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-teal-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-cyan-700 transition shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Envoi en cours..." : "Envoyer le message"}
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 bg-white rounded-3xl shadow-2xl p-6 overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Notre localisation
          </h2>
          <div className="rounded-2xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15738.523767682!2d-13.6794!3d9.6412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xf1cd0f3f6e3f6e3%3A0x1234567890abcdef!2sQuartier%20Madina%2C%20Conakry!5e0!3m2!1sfr!2sfr!4v1234567890123!5m2!1sfr!2sfr"
              width="100%"
              height="450"
              style={{ border: 0 }}
              loading="lazy"
            ></iframe>
          </div>
        </div>

      </div>
    </main>
  );
}