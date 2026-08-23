// src/components/ui/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`
        relative bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]
        w-full ${sizes[size]} max-h-[90vh] flex flex-col
        animate-fadeInUp
      `}>
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
            <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--color-bg)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
