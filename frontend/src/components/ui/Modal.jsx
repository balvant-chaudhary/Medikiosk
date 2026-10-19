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
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onClose}
      />
      <div className={`
        relative bg-white
        w-full ${sizes[size]} max-h-[90vh] flex flex-col
        animate-fadeInUp
      `}
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                padding: '0.375rem',
                borderRadius: 'var(--radius-md)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1" style={{ padding: '1.25rem' }}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
