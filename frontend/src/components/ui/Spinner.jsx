// src/components/ui/Spinner.jsx
import React from 'react';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10', xl: 'w-14 h-14' };
  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin-slow text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5"/>
        <path className="opacity-80" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  );
}

export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center gap-4 z-50">
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 10,
        background: 'var(--color-accent-light)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 4C12 4 8 8 8 12C8 16 12 20 12 20" stroke="#167765" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 4C12 4 16 8 16 12C16 16 12 20 12 20" stroke="#167765" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="2" fill="#167765"/>
        </svg>
      </div>
      <p className="text-[var(--color-text-secondary)] text-sm">{message}</p>
    </div>
  );
}

export default Spinner;
