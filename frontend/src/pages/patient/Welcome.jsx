// src/pages/patient/Welcome.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
];

export default function Welcome() {
  const navigate  = useNavigate();
  const { language, setLanguage } = usePatient();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }} className="animate-fadeInUp">

        {/* Logo mark */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: 10,
          background: '#167765',
          marginBottom: '1.5rem',
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '1.375rem' }}>M</span>
        </div>

        {/* Application label */}
        <p style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '0.625rem',
        }}>
          MediKiosk
        </p>

        {/* Heading */}
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '0.625rem',
          lineHeight: 1.3,
        }}>
          {language === 'hi'
            ? 'मेडिकायोस्क में आपका स्वागत है'
            : 'Welcome to MediKiosk'}
        </h1>

        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '2.5rem',
          lineHeight: 1.6,
        }}>
          {language === 'hi'
            ? 'आपकी परामर्श के लिए तैयार हो जाइए।'
            : "Let's get you ready for your consultation."}
        </p>

        {/* Language selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem',
        }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Language:</span>
          {LANGUAGES.map(({ code, label }, i) => (
            <React.Fragment key={code}>
              {i > 0 && <span style={{ color: 'var(--color-border)', fontSize: '0.875rem' }}>|</span>}
              <button
                id={`lang-${code}`}
                onClick={() => setLanguage(code)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: language === code ? 600 : 400,
                  color: language === code ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  padding: '0.25rem 0.125rem',
                  transition: 'color 0.15s',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {label}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Get Started button */}
        <button
          id="btn-welcome-continue"
          onClick={() => navigate('/patient/consent')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.875rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            background: '#167765',
            border: 'none',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9375rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            minHeight: 52,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#12604f'}
          onMouseLeave={e => e.currentTarget.style.background = '#167765'}
        >
          {language === 'hi' ? 'शुरू करें' : 'Get Started'}
          <ArrowRight size={18} />
        </button>

        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1.25rem' }}>
          {language === 'hi'
            ? 'आपकी गोपनीयता हमारी प्राथमिकता है · सभी डेटा एन्क्रिप्टेड'
            : 'Your privacy is our priority · All data encrypted'}
        </p>
      </div>
    </div>
  );
}
