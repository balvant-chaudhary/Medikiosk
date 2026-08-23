// src/layouts/DoctorLayout.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bell, LogOut, Menu, X,
  Stethoscope, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/patients',  icon: Users,           label: 'Patients'  },
  { to: '/doctor/queue',     icon: Activity,        label: 'Queue',  badge: null },
];

export function DoctorLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/doctor/login');
  };

  return (
    <div className="layout-sidebar-root">

      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside
        id="doctor-sidebar"
        className="layout-sidebar"
        style={{
          background: '#0F172A',
          borderRight: 'none',
          display: 'none',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Stethoscope size={20} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>MediKiosk</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Doctor Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `doctor-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{
                  background: '#EF4444', color: 'white',
                  fontSize: '0.6875rem', fontWeight: 700,
                  padding: '1px 6px', borderRadius: 999,
                }}>
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Doctor info */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
            }}>
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Doctor'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.specialty || 'General Medicine'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', background: 'none', border: 'none', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────── */}
      <header id="doctor-mobile-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: '#0F172A',
        padding: '0.875rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ color: 'white', cursor: 'pointer', background: 'none', border: 'none', padding: 4, display: 'flex' }}
        >
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Stethoscope size={14} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>MediKiosk</span>
        </div>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside style={{
            position: 'relative',
            width: 280,
            background: '#0F172A',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem',
            zIndex: 101,
          }}>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              <X size={20} />
            </button>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `doctor-nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon size={18} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{
                      background: '#EF4444', color: 'white',
                      fontSize: '0.6875rem', fontWeight: 700,
                      padding: '1px 6px', borderRadius: 999,
                    }}>
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content area ─────────────────────────────── */}
      <main className="layout-main">
        {/* Top bar (desktop only) */}
        <div id="doctor-topbar" style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          padding: '0.875rem 2rem',
          background: 'white',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <button style={{
            position: 'relative', padding: '0.5rem', borderRadius: 10,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)',
          }}>
            <Bell size={20} />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7, background: '#EF4444', borderRadius: '50%',
            }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--color-border)' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.875rem',
            }}>
              {user?.name?.charAt(0) || 'D'}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {user?.name || 'Doctor'}
            </span>
          </div>
        </div>

        <div style={{ padding: '2rem 2.5rem' }} className="animate-fadeInUp">
          {children}
        </div>
      </main>

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 768px) {
          #doctor-sidebar       { display: flex !important; }
          #doctor-mobile-header { display: none !important; }
          #doctor-topbar        { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

export default DoctorLayout;
