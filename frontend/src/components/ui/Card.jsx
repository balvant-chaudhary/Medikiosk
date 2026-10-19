// src/components/ui/Card.jsx
import React from 'react';

export function Card({ children, className = '', glass = false, hover = false, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      className={glass ? 'card-glass' : 'card'}
      style={{
        ...(hover ? { transition: 'border-color 0.15s ease', cursor: 'pointer' } : {}),
        ...style,
      }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
      } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style = {} }) {
  return (
    <div style={{
      padding: '1rem 1.25rem',
      borderBottom: '1px solid var(--color-border)',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', style = {} }) {
  return (
    <div style={{ padding: '1.125rem 1.25rem', ...style }}>
      {children}
    </div>
  );
}

export function CardFooter({ children, style = {} }) {
  return (
    <div style={{
      padding: '0.75rem 1.25rem',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-surface-2)',
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      ...style,
    }}>
      {children}
    </div>
  );
}

export default Card;
