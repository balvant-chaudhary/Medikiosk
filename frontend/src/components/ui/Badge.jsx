// src/components/ui/Badge.jsx
import React from 'react';

const variants = {
  primary: 'bg-[#EAF4F1] text-[#0F4C38] border border-[#A7D9CC]',
  success: 'bg-[#D1F0E8] text-[#0F4C38] border border-[#A7D9CC]',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger:  'bg-red-50 text-red-700 border border-red-200',
  info:    'bg-[#F5F5F4] text-[#5A5A5A] border border-[#E5E7EB]',
  muted:   'bg-[#F5F5F4] text-[#5A5A5A] border border-[#E5E7EB]',
  'ai':    'bg-[#F5F5F4] text-[#1C1C1E] border border-[#E5E7EB]',
};

export function Badge({ children, variant = 'primary', className = '', dot = false }) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium
      ${variants[variant]} ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          variant === 'danger' ? 'bg-red-500' :
          variant === 'success' ? 'bg-[#167765]' :
          variant === 'warning' ? 'bg-amber-500' : 'bg-[#167765]'
        }`} />
      )}
      {children}
    </span>
  );
}

export default Badge;
