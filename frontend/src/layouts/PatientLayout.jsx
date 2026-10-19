// src/layouts/PatientLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Home } from 'lucide-react';
import { usePatient } from '../context/PatientContext';

const STEPS = [
  { label: 'Welcome', short: 'Welcome' },
  { label: 'Consent', short: 'Consent' },
  { label: 'Details', short: 'Details' },
  { label: 'Interview', short: 'Interview' },
  { label: 'Documents', short: 'Documents' },
  { label: 'Review', short: 'Review' },
];

export function PatientLayout({ children, showProgress = true, showBack = true, currentStep = 1 }) {
  const navigate = useNavigate();
  const { step } = usePatient();
  const pct = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="layout-patient-root">

      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        {/* Top bar — brand + step info */}
        <div style={{ padding: '0.875rem 1.5rem' }}>
          <div style={{
            maxWidth: 720,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Left: Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              {/* Logo mark */}
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 6,
                background: '#167765',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', lineHeight: 1 }}>M</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                  MediKiosk
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.2, marginTop: 1 }}>
                  Patient registration
                </div>
              </div>
            </div>

            {/* Right: Step info + Home */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {showProgress && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    Step {currentStep} of {STEPS.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, lineHeight: 1.3 }}>
                    {STEPS[currentStep - 1]?.label}
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '0.375rem',
                  borderRadius: 6,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                aria-label="Home"
              >
                <Home size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Step progress indicator */}
        {showProgress && (
          <div style={{ padding: '0 1.5rem 1rem' }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              {/* Connecting line + dots */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Background line */}
                <div style={{
                  position: 'absolute',
                  left: 11,
                  right: 11,
                  top: '50%',
                  height: '1px',
                  background: 'var(--color-border)',
                  transform: 'translateY(-50%)',
                }} />
                {/* Green progress line */}
                <div style={{
                  position: 'absolute',
                  left: 11,
                  top: '50%',
                  height: '1px',
                  background: 'var(--color-primary)',
                  transform: 'translateY(-50%)',
                  width: `${Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * (100 - (22 / ((STEPS.length - 1) * 100)) * 100))}%`,
                  transition: 'width 0.4s ease',
                }} />

                {STEPS.map(({ label }, i) => {
                  const idx = i + 1;
                  const isDone = idx < currentStep;
                  const isActive = idx === currentStep;
                  return (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative', zIndex: 1 }}>
                      <div className={`mk-step-dot${isDone ? ' done' : isActive ? ' active' : ''}`}>
                        {isDone ? <Check size={12} strokeWidth={2.5} /> : idx}
                      </div>
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isDone || isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}>
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
      <footer style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          MediKiosk · Patient Intake · All data encrypted
        </p>
      </footer>
    </div>
  );
}

export default PatientLayout;
