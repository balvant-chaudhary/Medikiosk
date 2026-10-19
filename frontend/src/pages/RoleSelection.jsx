// src/pages/RoleSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, ShieldCheck, ArrowRight } from 'lucide-react';

const ROLES = [
  {
    id: 'patient',
    icon: User,
    label: 'Patient',
    labelHi: 'मरीज',
    desc: 'Register and complete your intake',
    path: '/patient/welcome',
    color: '#167765',
  },
  {
    id: 'doctor',
    icon: Stethoscope,
    label: 'Doctor',
    labelHi: 'डॉक्टर',
    desc: 'Review patients and consultations',
    path: '/doctor/login',
    color: '#374151',
  },
  {
    id: 'admin',
    icon: ShieldCheck,
    label: 'Admin',
    labelHi: 'व्यवस्थापक',
    desc: 'Manage clinic settings and data',
    path: '/admin/login',
    color: '#374151',
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();

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
      <div style={{ width: '100%', maxWidth: 600 }} className="animate-fadeInUp">

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#167765',
            marginBottom: '1rem',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>M</span>
          </div>
          <h1 style={{
            fontSize: '1.375rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '0.375rem',
          }}>
            MediKiosk
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Select your role to continue
          </p>
        </div>

        {/* Role cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ROLES.map(({ id, icon: Icon, label, labelHi, desc, path, color }) => (
            <button
              key={id}
              id={`role-${id}`}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.125rem 1.25rem',
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s ease, background 0.15s ease',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#167765';
                e.currentTarget.style.background = '#FAFAFA';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.background = 'white';
              }}
            >
              {/* Icon */}
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: id === 'patient' ? '#EAF4F1' : '#F5F5F4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} color={color} />
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {labelHi}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {desc}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '2rem' }}>
          Patient Intake System · All data encrypted
        </p>
      </div>

      {/* Responsive role cards stack */}
      <style>{`
        @media (max-width: 640px) {
          #role-patient, #role-doctor, #role-admin {
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
