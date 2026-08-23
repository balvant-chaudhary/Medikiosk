// src/pages/RoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, ShieldCheck } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

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

      <div style={{ width: '100%', maxWidth: 800, position: 'relative', zIndex: 1 }} className="animate-fadeInUp">
        {/* Brand / Logo */}
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
            Select your role to continue / आगे बढ़ने के लिए अपनी भूमिका चुनें
          </p>
        </div>

        {/* Roles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}>
          {/* Patient Role */}
          <button
            onClick={() => navigate('/patient/welcome')}
            className="card-glass"
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <User size={32} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Patient</h2>
              <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.125rem', fontWeight: 600 }}>मरीज</h3>
            </div>
          </button>

          {/* Doctor Role */}
          <button
            onClick={() => navigate('/doctor/login')}
            className="card-glass"
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <Stethoscope size={32} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Doctor</h2>
              <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.125rem', fontWeight: 600 }}>डॉक्टर</h3>
            </div>
          </button>

          {/* Admin Role */}
          <button
            onClick={() => navigate('/admin/login')}
            className="card-glass"
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <ShieldCheck size={32} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Admin</h2>
              <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.125rem', fontWeight: 600 }}>व्यवस्थापक</h3>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
