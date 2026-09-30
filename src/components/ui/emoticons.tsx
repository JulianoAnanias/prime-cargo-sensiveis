import React from 'react';

interface EmoticonProps {
  className?: string;
  size?: number;
  isSelected?: boolean;
}

export function EmoticonOtimo({ className = '', size = 52, isSelected = false }: EmoticonProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform ${isSelected ? 'scale-110 drop-shadow-md' : 'hover:scale-105'} ${className}`}
    >
      {/* Círculo da face - Verde */}
      <circle cx="32" cy="32" r="28" stroke="#00A859" strokeWidth="4" fill={isSelected ? '#E8F5E9' : '#FFFFFF'} />
      {/* Olhos */}
      <circle cx="23" cy="25" r="3.5" fill="#00A859" />
      <circle cx="41" cy="25" r="3.5" fill="#00A859" />
      {/* Sorriso largo feliz */}
      <path
        d="M20 36 C24 47, 40 47, 44 36"
        stroke="#00A859"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function EmoticonBom({ className = '', size = 52, isSelected = false }: EmoticonProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform ${isSelected ? 'scale-110 drop-shadow-md' : 'hover:scale-105'} ${className}`}
    >
      {/* Círculo da face - Vermelho/Laranja */}
      <circle cx="32" cy="32" r="28" stroke="#E30613" strokeWidth="4" fill={isSelected ? '#FFEBEE' : '#FFFFFF'} />
      {/* Olhos */}
      <circle cx="23" cy="25" r="3.5" fill="#E30613" />
      <circle cx="41" cy="25" r="3.5" fill="#E30613" />
      {/* Sorriso padrão */}
      <path
        d="M22 38 C26 44, 38 44, 42 38"
        stroke="#E30613"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function EmoticonRegular({ className = '', size = 52, isSelected = false }: EmoticonProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform ${isSelected ? 'scale-110 drop-shadow-md' : 'hover:scale-105'} ${className}`}
    >
      {/* Círculo da face - Amarelo/Dourado */}
      <circle cx="32" cy="32" r="28" stroke="#EAB308" strokeWidth="4" fill={isSelected ? '#FEF9C3' : '#FFFFFF'} />
      {/* Olhos */}
      <circle cx="23" cy="25" r="3.5" fill="#EAB308" />
      <circle cx="41" cy="25" r="3.5" fill="#EAB308" />
      {/* Linha reta neutra */}
      <line
        x1="22"
        y1="40"
        x2="42"
        y2="40"
        stroke="#EAB308"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EmoticonRuim({ className = '', size = 52, isSelected = false }: EmoticonProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform ${isSelected ? 'scale-110 drop-shadow-md' : 'hover:scale-105'} ${className}`}
    >
      {/* Círculo da face - Vermelho */}
      <circle cx="32" cy="32" r="28" stroke="#E30613" strokeWidth="4" fill={isSelected ? '#FFEBEE' : '#FFFFFF'} />
      {/* Olhos */}
      <circle cx="23" cy="26" r="3.5" fill="#E30613" />
      <circle cx="41" cy="26" r="3.5" fill="#E30613" />
      {/* Boca triste curvada para baixo */}
      <path
        d="M22 42 C26 35, 38 35, 42 42"
        stroke="#E30613"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
