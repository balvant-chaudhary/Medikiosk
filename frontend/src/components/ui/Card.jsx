// src/components/ui/Card.jsx
import React from 'react';

export function Card({ children, className = '', glass = false, hover = false, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      className={glass ? 'card-glass' : 'card'}
      style={{
        ...(hover ? { transition: 'box-shadow 0.2s ease, transform 0.2s ease', cursor: 'pointer' } : {}),
        ...style,
      }}
      onMouseEnter={hover ? e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
      } : undefined}
      onMouseLeave={hover ? e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', style = {} }) {
  return (
    <div style={{
      padding: '1.125rem 1.5rem',
      borderBottom: '1px solid var(--color-border)',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '', style = {} }) {
  return (
    <div style={{ padding: '1.25rem 1.5rem', ...style }}>
      {children}
    </div>
  );
}

export function CardFooter({ children, style = {} }) {
  return (
    <div style={{
      padding: '0.875rem 1.5rem',
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
