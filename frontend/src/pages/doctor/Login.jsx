// src/pages/doctor/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F4FF 50%, #E8EEFF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="animate-fadeInUp">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 22,
            background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
            boxShadow: '0 12px 40px rgba(37,99,235,0.35)',
            marginBottom: '1rem',
          }}>
            <Stethoscope size={34} color="white" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
            MediKiosk
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
            Clinical Staff Portal
          </p>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--color-text-primary)', marginBottom: '0.5rem',
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', display: 'flex',
                }}>
                  <Mail size={18} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="doctor@hospital.in"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    border: '2px solid var(--color-border)',
                    borderRadius: 12,
                    background: 'white',
                    color: 'var(--color-text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.875rem', fontWeight: 600,
                color: 'var(--color-text-primary)', marginBottom: '0.5rem',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', display: 'flex',
                }}>
                  <Lock size={18} />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    border: '2px solid var(--color-border)',
                    borderRadius: 12,
                    background: 'white',
                    color: 'var(--color-text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                fontSize: '0.875rem',
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
                padding: '0.875rem 1.5rem',
                borderRadius: 12,
                background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
                border: 'none',
                color: 'white',
                fontFamily: "'Inter', sans-serif",
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.875rem 1rem',
            background: 'var(--color-surface-2)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center', marginBottom: '0.25rem' }}>
              Demo credentials (run <code style={{ background: '#E2E8F0', padding: '1px 4px', borderRadius: 4 }}>npm run seed</code> first)
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              🩺 Doctor: doctor@medikiosk.in · Doctor@1234
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              🏥 Admin: admin@medikiosk.in · Admin@1234
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1.25rem' }}>
          MediKiosk · AI-Assisted Clinical Intake · v1.0
        </p>
      </div>
    </div>
  );
}
