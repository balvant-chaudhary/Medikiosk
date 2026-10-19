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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 6,
            background: '#167765',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Building2 size={16} color="white" />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>MediKiosk</p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.625rem', borderRadius: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--color-accent-light)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.8125rem', flexShrink: 0,
          }}>
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 500, fontSize: '0.8125rem', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Admin'}
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.hospital || 'MediKiosk Central'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{ color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 4, borderRadius: 4, transition: 'color 0.15s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="layout-sidebar-root">

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className="layout-sidebar"
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          display: 'none',
        }}
        id="admin-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header id="admin-mobile-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'white',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.75rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ color: 'var(--color-text-secondary)', cursor: 'pointer', background: 'none', border: 'none', padding: 4, display: 'flex' }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
          MediKiosk Admin
        </span>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside style={{
            position: 'relative',
            width: 240,
            background: 'white',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 101,
            borderRight: '1px solid var(--color-border)',
          }}>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'absolute', top: 12, right: 12, color: 'var(--color-text-muted)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main content area ───────────────────────────────── */}
      <main className="layout-main" style={{ padding: '1.75rem 2rem' }}>
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
