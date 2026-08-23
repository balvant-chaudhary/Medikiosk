// src/pages/patient/Welcome.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Mic, FileText, UserCheck, Stethoscope } from 'lucide-react';
import { usePatient } from '../../context/PatientContext';

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', flag: 'IN', sub: 'Hindi'   },
  { code: 'en', label: 'English', flag: 'GB', sub: 'English' },
];

const FEATURES = [
  { icon: Mic,         label: 'Voice Interaction',  sub: 'Speak in your language'  },
  { icon: FileText,    label: 'Document Upload',    sub: 'Digitize old reports'    },
  { icon: UserCheck,   label: 'Doctor Review',      sub: 'AI-assisted summary'     },
  { icon: Stethoscope, label: 'Clinical Intake',    sub: 'Structured history'      },
];

export default function Welcome() {
  const navigate   = useNavigate();
  const { language, setLanguage } = usePatient();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Content wrapper */}
      <div style={{ width: '100%', maxWidth: 960, position: 'relative', zIndex: 1 }}
           className="animate-fadeInUp">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 600,
            padding: '0.5rem',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* ── Brand / Logo ─────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 88, height: 88,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
            boxShadow: '0 20px 60px rgba(37,99,235,0.45)',
            marginBottom: '1.25rem',
          }}>
            <Stethoscope size={44} color="white" />
          </div>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '0.5rem',
            fontFamily: "'Poppins', sans-serif",
          }}>
            Medi<span style={{ color: '#06B6D4' }}>Kiosk</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.125rem', fontWeight: 500 }}>
            AI-Assisted Patient Intake
          </p>
        </div>

        {/* ── Two-column layout ────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}
          className="welcome-grid"
        >

          {/* Language selector */}
          <div className="card-glass" style={{ padding: '2rem' }}>
            <p style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.9375rem',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '1.25rem',
            }}>
              Choose your language / अपनी भाषा चुनें
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              {LANGUAGES.map(({ code, label, flag, sub }) => (
                <button
                  key={code}
                  id={`lang-${code}`}
                  onClick={() => setLanguage(code)}
                  className={`welcome-lang-btn${language === code ? ' selected' : ''}`}
                  style={{ width: '100%', padding: '1.5rem 1rem', minHeight: 120 }}
                >
                  <span style={{ fontSize: '2rem', fontWeight: 700, color: language === code ? 'white' : 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>
                    {flag}
                  </span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: language === code ? 'white' : 'rgba(255,255,255,0.85)',
                    marginTop: '0.25rem',
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontSize: '0.8125rem',
                    color: language === code ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)',
                  }}>
                    {sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Features + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FEATURES.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="feature-item">
                <div style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: 'rgba(6,182,212,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={20} color="#06B6D4" />
                </div>
                <div>
                  <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem' }}>{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', marginTop: 2 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA button ──────────────────────────────────── */}
        <button
          id="btn-welcome-continue"
          onClick={() => navigate('/patient/consent')}
          style={{
            width: '100%',
            padding: '1.125rem 2rem',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
            border: 'none',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.0625rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(37,99,235,0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,0.35)';
          }}
        >
          {language === 'hi' ? 'जारी रखें' : 'Get Started'}
          <ArrowRight size={22} />
        </button>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.8125rem', marginTop: '1rem' }}>
          {language === 'hi'
            ? 'आपकी गोपनीयता हमारी प्राथमिकता है · सभी डेटा एन्क्रिप्टेड है'
            : 'Your privacy is our priority · All data encrypted'}
        </p>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 640px) {
          .welcome-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
