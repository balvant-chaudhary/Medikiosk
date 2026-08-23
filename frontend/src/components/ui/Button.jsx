// src/components/ui/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md hover:shadow-lg active:scale-[0.98]',
  secondary: 'bg-white hover:bg-[#F8FAFF] text-[#2563EB] border border-[#2563EB] hover:shadow-md active:scale-[0.98]',
  danger: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-md hover:shadow-lg active:scale-[0.98]',
  ghost: 'bg-transparent hover:bg-[#F0F4FF] text-[#475569] active:scale-[0.98]',
  gradient: 'text-white shadow-lg hover:shadow-xl active:scale-[0.98]',
  success: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-md hover:shadow-lg active:scale-[0.98]',
  warning: 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-md hover:shadow-lg active:scale-[0.98]',
};

const sizes = {
  sm:  'px-4 py-2 text-sm rounded-[8px] gap-1.5',
  md:  'px-6 py-3 text-base rounded-[12px] gap-2',
  lg:  'px-8 py-4 text-lg rounded-[14px] gap-2.5',
  xl:  'px-10 py-5 text-xl rounded-[16px] gap-3 min-h-[64px]',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconRight,
  className = '',
  disabled,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center font-semibold
        transition-all duration-200 select-none cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${variant === 'gradient' ? 'bg-gradient-to-r from-[#2563EB] to-[#06B6D4]' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin-slow flex-shrink-0" size={size === 'sm' ? 14 : size === 'xl' ? 22 : 18} />
      ) : Icon ? (
        <Icon className="flex-shrink-0" size={size === 'sm' ? 14 : size === 'xl' ? 22 : 18} />
      ) : null}
      
      <span className="truncate">{children}</span>

      {iconRight && !loading && (
        <span className="flex-shrink-0">
          {React.createElement(iconRight, { size: size === 'sm' ? 14 : size === 'xl' ? 22 : 18 })}
        </span>
      )}
    </button>
  );
}

export default Button;
