// src/pages/doctor/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const inputStyle = {
  width: '100%',
  padding: '0.6875rem 0.875rem 0.6875rem 2.5rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'white',
  color: 'var(--color-text-primary)',
  fontSize: '0.9375rem',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'Inter, sans-serif',
  minHeight: 48,
};

export default function DoctorLogin() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      const user = await login(email, password);
      if      (user.role === 'ADMIN')  navigate('/admin/dashboard');
      else if (user.role === 'DOCTOR') navigate('/doctor/dashboard');
      else { setError('This portal is for doctors and administrators only.'); setLoading(false); }
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }} className="animate-fadeInUp">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 10,
            background: '#167765',
            marginBottom: '1rem',
          }}>
            <Stethoscope size={22} color="white" />
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
            MediKiosk
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Clinical Staff Portal
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{
                display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                color: 'var(--color-text-primary)', marginBottom: '0.375rem',
              }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', display: 'flex',
                }}>
                  <Mail size={16} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="doctor@hospital.in"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(22,119,101,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" style={{
                display: 'block', fontSize: '0.8125rem', fontWeight: 500,
                color: 'var(--color-text-primary)', marginBottom: '0.375rem',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', display: 'flex',
                }}>
                  <Lock size={16} />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(22,119,101,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: '#DC2626',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                background: loading ? '#7EC4B8' : '#167765',
                border: 'none',
                color: 'white',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.15s ease',
                minHeight: 48,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#12604f'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#167765'; }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.875rem',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Demo credentials
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
              Doctor: doctor@medikiosk.in · Doctor@1234
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Admin: admin@medikiosk.in · Admin@1234
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1.25rem' }}>
          MediKiosk · Clinical Intake · v1.0
        </p>
      </div>
    </div>
  );
}
