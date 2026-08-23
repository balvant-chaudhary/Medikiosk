// src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Settings, LogOut, Menu, X,
  Building2, BarChart3, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/patients',  icon: Users,           label: 'Patients'  },
  { to: '/admin/doctors',   icon: FileText,        label: 'Doctors'   },
  { to: '/admin/analytics', icon: BarChart3,       label: 'Analytics' },
  { to: '/admin/settings',  icon: Settings,        label: 'Settings'  },
];

export function AdminLayout({ children }) {
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
        className="layout-sidebar"
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          display: 'none',
        }}
        id="admin-sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366F1 0%, #2563EB 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Building2 size={20} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                MediKiosk
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Admin'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.hospital || 'MediKiosk Central'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{ color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ────────────────────────────────── */}
      <header id="admin-mobile-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.875rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: 4, display: 'flex' }}
        >
          <Menu size={22} />
        </button>
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
          MediKiosk Admin
        </span>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside style={{
            position: 'relative',
            width: 280,
            background: 'white',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem',
            zIndex: 101,
          }}>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
            >
              <X size={20} />
            </button>
            <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content area ─────────────────────────────── */}
      <main className="layout-main" style={{ padding: '2rem 2.5rem', paddingTop: '2rem' }}>
        <div className="animate-fadeInUp">
          {children}
        </div>
      </main>

      {/* Sidebar responsive show via CSS */}
      <style>{`
        @media (min-width: 768px) {
          #admin-sidebar { display: flex !important; }
          #admin-mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;
