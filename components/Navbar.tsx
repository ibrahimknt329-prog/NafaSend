"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function NavbarWithLogo() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = () => {
    return user?.user_metadata?.nom || user?.email?.split("@")[0] || "Utilisateur";
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  return (
    <nav
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-lg py-2"
          : "bg-white/95 backdrop-blur-sm py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-16 h-16 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
            <Image
              src="/logo.png"
              alt="NafaSend Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold">
              <span className="text-blue-500">Nafa</span>
              <span className="text-yellow-600">Send</span>
            </h1>
            <p className="text-xs text-gray-500 -mt-1">Rapide & Sécurisé</p>
          </div>
        </Link>

        {/* MENU DESKTOP */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`font-semibold transition-colors hover:text-blue-500 ${
              isActive("/") ? "text-blue-500" : "text-gray-700"
            }`}
          >
            Accueil
          </Link>
          <Link
            href="/envoyer"
            className={`font-semibold transition-colors hover:text-blue-500 ${
              isActive("/envoyer") ? "text-blue-500" : "text-gray-700"
            }`}
          >
            Envoyer
          </Link>
          <Link
            href="/suivi"
            className={`font-semibold transition-colors hover:text-blue-500 ${
              isActive("/suivi") ? "text-blue-500" : "text-gray-700"
            }`}
          >
            Suivi
          </Link>
          <Link
            href="/contact"
            className={`font-semibold transition-colors hover:text-blue-500 ${
            isActive("/contact") ? "text-blue-500" : "text-gray-700"}`}>
            Contact
          </Link>
        </div>

        {/* USER SECTION */}
        <div className="flex items-center gap-4">
          
          {user ? (
            // UTILISATEUR CONNECTÉ
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 transition group"
              >
                {/* Photo de profil */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-yellow-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                  {getInitials(getUserName())}
                </div>
                
                {/* Nom et flèche */}
                <div className="hidden md:block text-left">
                  <div className="text-sm font-bold text-gray-900">
                    {getUserName()}
                  </div>
                  <div className="text-xs text-gray-500">Mon compte</div>
                </div>
                
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* DROPDOWN MENU */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 animate-scale-in">
                  
                  {/* En-tête du menu */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-bold text-gray-900">
                      {getUserName()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.email}
                    </div>
                  </div>

                  {/* Liens du menu */}
                  <div className="py-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
                    >
                      <span className="text-xl">📊</span>
                      <div>
                        <div className="font-semibold text-sm">Mon Dashboard</div>
                        <div className="text-xs text-gray-500">Voir mes commandes</div>
                      </div>
                    </Link>

                    <Link
                      href="/envoyer"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
                    >
                      <span className="text-xl">📦</span>
                      <div>
                        <div className="font-semibold text-sm">Nouvel envoi</div>
                        <div className="text-xs text-gray-500">Créer une commande</div>
                      </div>
                    </Link>

                    <Link
                      href="/suivi"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition"
                    >
                      <span className="text-xl">📍</span>
                      <div>
                        <div className="font-semibold text-sm">Suivi de colis</div>
                        <div className="text-xs text-gray-500">Localiser un envoi</div>
                      </div>
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-yellow-50 text-gray-700 hover:text-yellow-600 transition"
                    >
                      <span className="text-xl">👑</span>
                      <div>
                        <div className="font-semibold text-sm">Administration</div>
                        <div className="text-xs text-gray-500">Gérer les commandes</div>
                      </div>
                    </Link>
                  </div>

                  {/* Déconnexion */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                    >
                      <span className="text-xl">🚪</span>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Déconnexion</div>
                        <div className="text-xs opacity-75">Se déconnecter</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // UTILISATEUR NON CONNECTÉ
            <Link
              href="/login"
              className="bg-gradient-to-r from-blue-500 to-yellow-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg transition"
            >
              Connexion
            </Link>
          )}

          {/* BOUTON MENU MOBILE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MENU MOBILE */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-6 animate-fade-in">
          <div className="space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-3 px-4 rounded-lg font-semibold transition ${
                isActive("/")
                  ? "bg-blue-50 text-blue-500"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              🏠 Accueil
            </Link>
            <Link
              href="/envoyer"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-3 px-4 rounded-lg font-semibold transition ${
                isActive("/envoyer")
                  ? "bg-blue-50 text-blue-500"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              📦 Envoyer
            </Link>
            <Link
              href="/suivi"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-3 px-4 rounded-lg font-semibold transition ${
                isActive("/suivi")
                  ? "bg-blue-50 text-blue-500"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              📍 Suivi
            </Link>
            
            {user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg font-semibold transition ${
                    isActive("/dashboard")
                      ? "bg-blue-50 text-blue-500"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  📊 Dashboard
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg font-semibold transition ${
                    isActive("/admin")
                      ? "bg-yellow-50 text-yellow-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  👑 Administration
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 rounded-lg font-semibold transition ${
                   isActive("/contact")
                    ? "bg-blue-50 text-blue-500"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}>
                    📞 Contact
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setUserMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}