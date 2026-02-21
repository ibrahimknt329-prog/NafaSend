"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white dark:bg-gray-900 shadow-lg py-3"
          : "bg-transparent py-4"
      } px-8 flex justify-between items-center`}
    >
      <Link href="/" className="flex items-center gap-2">
      <Image 
        src="/mon-logo.png" 
         alt="NafaSend Logo" 
          width={85} 
           height={85}
           className="rounded-full border-2 border-white object-cover" />

        <h1 className={`text-2xl font-bold transition ${
          scrolled 
            ? "text-gray-900 dark:text-white" 
            : "text-white"
        }`}>
          NafaSend
        </h1>
      </Link>

      <div className="flex items-center gap-6">
        <div className={`hidden md:flex gap-6 text-lg font-medium transition ${
          scrolled 
            ? "text-gray-700 dark:text-gray-200" 
            : "text-white"
        }`}>
          <Link href="/" className="hover:text-blue-500 dark:hover:text-blue-400 transition">
            Accueil
          </Link>
          <Link href="/envoyer" className="hover:text-blue-500 dark:hover:text-blue-400 transition">
            Envoyer
          </Link>
          <Link href="/suivi" className="hover:text-blue-500 dark:hover:text-blue-400 transition">
            Suivi
          </Link>
        </div>

        {/* Theme Toggle */}
        

        <Link
          href="/login"
          className={`px-6 py-2 rounded-lg transition ${
            scrolled
              ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              : "bg-white text-blue-600 hover:bg-gray-100"
          }`}
        >
          Connexion
        </Link>
      </div>
    </nav>
  );
}