"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-lg hover:-translate-y-0.5",
    success: "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5",
    danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:shadow-lg hover:-translate-y-0.5",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}