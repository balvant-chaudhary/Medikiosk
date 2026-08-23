// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Users, Clock, CheckCircle2, AlertTriangle, FileText, Activity } from 'lucide-react';
import { adminAPI } from '../../services/api';

/* ── Custom Tooltip ─────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      padding: '0.625rem 0.875rem',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '0.875rem',
    }}>
      <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ── Mini Donut Chart ────────────────────────────────────────────── */
function MiniPie({ data }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={38} outerRadius={60}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={v => `${v}`} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        {data.map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{d.name}</span>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, wRes] = await Promise.all([adminAPI.getStats(), adminAPI.getWorkload()]);
        setStats(sRes.data.stats);
        setDoctors(wRes.data.doctors);
      } catch (err) {
        console.error('Admin stats failed', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
          <div style={{
            width: 36, height: 36,
            border: '3px solid var(--color-primary)',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
          }} className="animate-spin-slow" />
        </div>
      </AdminLayout>
    );
  }

  const kpis = [
    { label: 'Total Patients',   value: stats.patients.total,           sub: `+${stats.patients.today} today`,        icon: Users,         color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Interviews Done',  value: stats.interviews.completed,      sub: `${stats.interviews.inProgress} active`, icon: CheckCircle2,  color: '#10B981', bg: '#ECFDF5' },
    { label: 'Pending Review',   value: stats.interviews.readyForReview, sub: 'Needs Doctor',                          icon: Clock,         color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'AI Summaries',     value: stats.documents.aiSuccess,       sub: 'Successfully extracted',                icon: Activity,      color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Total Documents',  value: stats.documents.total,           sub: `${stats.documents.completed} OCR done`, icon: FileText,      color: '#06B6D4', bg: '#ECFEFF' },
    { label: 'OCR Failed',       value: stats.documents.failed,          sub: 'Requires attention',                    icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
  ];

  const docPieData = [
    { name: 'Completed OCR', value: stats.documents.completed, color: '#10B981' },
    { name: 'Failed OCR',    value: stats.documents.failed,    color: '#EF4444' },
  ];

  return (
    <AdminLayout>

      {/* ── Page header ───────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospital Analytics</h1>
          <p className="page-subtitle">{todayStr}</p>
        </div>
        <div className="status-online">
          <span className="status-dot" />
          System Online
        </div>
      </div>

      {/* ── KPI Grid ──────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.75rem',
      }} className="kpi-grid">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="kpi-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                  {value}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
                  {label}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                  {sub}
                </p>
              </div>
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.25rem',
        marginBottom: '1.25rem',
      }} className="chart-grid">

        {/* Area chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1.25rem' }}>
            Patient Intake — Last 7 Days
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.patients.trend} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradPt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F7" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="patients" name="Patients" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradPt)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            OCR Status
          </h2>
          <MiniPie data={docPieData} />
        </div>
      </div>

      {/* ── Doctor workload table ─────────────────────────── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Doctor Workload
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="mk-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Specialty</th>
                <th style={{ textAlign: 'right' }}>Patients Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                    No workload data available
                  </td>
                </tr>
              ) : (
                doctors.map(doc => (
                  <tr key={doc.id}>
                    <td style={{ fontWeight: 600 }}>{doc.name}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{doc.specialty || 'General'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10B981' }}>{doc.reviewedCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 900px) {
          .kpi-grid   { grid-template-columns: repeat(2, 1fr) !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .kpi-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
