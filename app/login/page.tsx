"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(""); // Effacer l'erreur quand l'utilisateur tape
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        throw loginError;
      }

      if (data.user) {
        setSuccess("✅ Connexion réussie ! Redirection...");
        setTimeout(() => {
          router.push("/dashboard"); // On créera cette page après
        }, 1500);
      }

    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      if (err.message.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect");
      } else {
        setError(err.message || "Erreur lors de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    try {
      // Créer le compte
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nom: formData.nom,
            telephone: formData.telephone,
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // Créer le profil utilisateur dans une table séparée (optionnel)
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              nom: formData.nom,
              email: formData.email,
              telephone: formData.telephone,
            }
          ]);

        // Ne pas bloquer si la table users n'existe pas encore
        if (profileError) {
          console.log("Info: Table 'users' non créée, ignoré:", profileError);
        }

        setSuccess("✅ Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.");
        
        // Réinitialiser le formulaire
        setFormData({
          nom: "",
          email: "",
          telephone: "",
          password: "",
        });

        // Basculer en mode login après 3 secondes
        setTimeout(() => {
          setMode("login");
          setSuccess("");
        }, 3000);
      }

    } catch (err: any) {
      console.error("Erreur d'inscription:", err);
      if (err.message.includes("User already registered")) {
        setError("Cet email est déjà utilisé");
      } else {
        setError(err.message || "Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === "login") {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-6 py-24">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚚</div>
          <h1 className="text-3xl font-bold text-gray-900">NafaSend</h1>
          <p className="text-gray-600 mt-2">
            {mode === "login" ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 p-4 rounded-xl mb-4">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-800 p-4 rounded-xl mb-4">
            {success}
          </div>
        )}

        {/* Boutons toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              mode === "login" 
                ? "bg-white text-blue-600 shadow" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition ${
              mode === "register" 
                ? "bg-white text-blue-600 shadow" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex: Mohamed Diallo"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Ex: +224 123 456 789"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
              required
            />
            {mode === "register" && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 caractères
              </p>
            )}
          </div>

          {mode === "login" && (
            <div className="text-right">
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Mot de passe oublié ?
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading 
              ? (mode === "login" ? "Connexion..." : "Inscription...") 
              : (mode === "login" ? "Se connecter" : "S'inscrire")
            }
          </button>
        </form>

        {/* Retour à l'accueil */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            ← Retour à l'accueil
          </Link>
        </div>

      </div>
    </main>
  );
}