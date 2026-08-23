// src/layouts/PatientLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { usePatient } from '../context/PatientContext';

const STEPS = ['Language', 'Consent', 'Details', 'Interview', 'Documents', 'Review'];

export function PatientLayout({ children, showProgress = true, showBack = true, currentStep = 1 }) {
  const navigate = useNavigate();
  const { step } = usePatient();
  const pct = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="layout-patient-root">

      {/* ── Sticky header ───────────────────────────────────── */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
      }}>
        {/* Logo bar */}
        <div style={{ padding: '0.875rem 1.5rem' }}>
          <div style={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: '0.5rem',
                  borderRadius: 10,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                aria-label="Go back"
              >
                <ArrowLeft size={22} />
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1 }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '1rem',
                flexShrink: 0,
              }}>
                M
              </div>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '1rem' }}>
                MediKiosk
              </span>
            </div>

            {showProgress && (
              <span style={{
                fontSize: '0.8125rem', fontWeight: 600,
                color: 'var(--color-primary)',
                background: '#EFF6FF',
                padding: '0.25rem 0.625rem',
                borderRadius: 999,
                flexShrink: 0,
              }}>
                {pct}%
              </span>
            )}

            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.5rem',
                borderRadius: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              aria-label="Home"
            >
              <Home size={20} />
            </button>
          </div>
        </div>

        {/* Progress bar + step labels */}
        {showProgress && (
          <div style={{ padding: '0 1.5rem 0.875rem' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              {/* Step counter text */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  Step {currentStep} of {STEPS.length}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {STEPS[currentStep - 1]}
                </span>
              </div>
              {/* Bar */}
              <div className="mk-progress-bar">
                <div className="mk-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              {/* Step dots */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.625rem',
              }}>
                {STEPS.map((label, i) => {
                  const idx = i + 1;
                  const isDone = idx < currentStep;
                  const isActive = idx === currentStep;
                  return (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: isDone
                          ? 'var(--color-success)'
                          : isActive
                          ? 'var(--color-primary)'
                          : 'var(--color-border)',
                        transition: 'background 0.3s',
                      }} />
                      <span className={`mk-step-label${isDone ? ' done' : isActive ? ' active' : ''}`}
                        style={{ display: 'none' }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Content ─────────────────────────────────────────── */}
      <main className="layout-patient-content">
        <div className="layout-patient-inner animate-fadeInUp">
          {children}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          MediKiosk · AI-Assisted Patient Intake · All data encrypted
        </p>
      </footer>
    </div>
  );
}

export default PatientLayout;
