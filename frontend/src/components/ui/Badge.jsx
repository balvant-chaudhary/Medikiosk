// src/components/ui/Badge.jsx
import React from 'react';

const variants = {
  primary: 'bg-blue-100 text-blue-700 border border-blue-200',
  success: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border border-amber-200',
  danger:  'bg-red-100 text-red-700 border border-red-200',
  info:    'bg-indigo-100 text-indigo-700 border border-indigo-200',
  muted:   'bg-slate-100 text-slate-600 border border-slate-200',
  'ai':    'bg-gradient-to-r from-blue-500 to-cyan-400 text-white border-0',
};

export function Badge({ children, variant = 'primary', className = '', dot = false }) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
      ${variants[variant]} ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'danger' ? 'bg-red-500' :
          variant === 'success' ? 'bg-emerald-500' :
          variant === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
        }`} />
      )}
      {children}
    </span>
  );
}

export default Badge;
