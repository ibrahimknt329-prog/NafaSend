"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  hover?: boolean;
  glass?: boolean;
  gradient?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  subtitle,
  icon,
  hover = true,
  glass = false,
  gradient = false,
  className = "",
  onClick,
}: CardProps) {
  const baseStyles = "rounded-2xl p-6 transition-all duration-300";
  const hoverStyles = hover ? "hover-lift cursor-pointer" : "";
  const glassStyles = glass ? "glass" : "bg-white shadow-lg";
  const gradientStyles = gradient ? "animated-gradient text-white" : "";

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${glassStyles} ${gradientStyles} ${className}`}
      onClick={onClick}
    >
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <span className="text-3xl">{icon}</span>}
          <div>
            {title && <h3 className="text-xl font-bold">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

// Composant StatCard pour les statistiques
export function StatCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
  className = "",
}: {
  title: string;
  value: string | number;
  icon: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} text-white rounded-2xl p-6 shadow-lg hover-lift ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl">{icon}</div>
        {trend && (
          <div
            className={`text-sm font-semibold px-2 py-1 rounded-full ${
              trend.positive ? "bg-green-400" : "bg-red-400"
            } bg-opacity-30`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </div>
      <div className="text-sm opacity-90 mb-1">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

// Composant Card avec effet glassmorphism
export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl p-6 hover-lift ${className}`}>
      {children}
    </div>
  );
}