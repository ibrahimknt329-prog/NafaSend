import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LivreMoi - Livraison rapide en Guinée",
  description: "Service de livraison de colis rapide et sécurisé partout en Guinée. Suivi en temps réel, paiement à la livraison.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider>
          <AuthProvider>
        <Navbar />
        {children}
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}