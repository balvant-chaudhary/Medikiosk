// src/components/ui/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-[#167765] hover:bg-[#12604f] text-white active:scale-[0.97]',
  secondary: 'bg-white hover:bg-[#F5F5F4] text-[#1C1C1E] border border-[#D1D5DB] active:scale-[0.97]',
  danger:    'bg-[#DC2626] hover:bg-[#B91C1C] text-white active:scale-[0.97]',
  ghost:     'bg-transparent hover:bg-[#F5F5F4] text-[#5A5A5A] active:scale-[0.97]',
  gradient:  'bg-[#167765] hover:bg-[#12604f] text-white active:scale-[0.97]',
  success:   'bg-[#167765] hover:bg-[#12604f] text-white active:scale-[0.97]',
  warning:   'bg-[#B45309] hover:bg-[#92400E] text-white active:scale-[0.97]',
};

const sizes = {
  sm:  'px-3 py-2 text-sm rounded-[4px] gap-1.5',
  md:  'px-4 py-2.5 text-sm rounded-[6px] gap-2',
  lg:  'px-5 py-3 text-base rounded-[6px] gap-2',
  xl:  'px-6 py-3.5 text-base rounded-[6px] gap-2.5 min-h-[52px]',
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
        transition-all duration-150 select-none cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin-slow flex-shrink-0" size={size === 'sm' ? 14 : 16} />
      ) : Icon ? (
        <Icon className="flex-shrink-0" size={size === 'sm' ? 14 : 16} />
      ) : null}
      
      <span className="truncate">{children}</span>

      {iconRight && !loading && (
        <span className="flex-shrink-0">
          {React.createElement(iconRight, { size: size === 'sm' ? 14 : 16 })}
        </span>
      )}
    </button>
  );
}

export default Button;
