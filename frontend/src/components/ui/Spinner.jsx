// src/components/ui/Spinner.jsx
import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin-slow text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center gap-4 z-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] flex items-center justify-center">
          <span className="text-white text-2xl">🏥</span>
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-[#2563EB] opacity-30 animate-ping" />
      </div>
      <p className="text-[var(--color-text-secondary)] text-sm font-medium">{message}</p>
    </div>
  );
}

export default Spinner;
