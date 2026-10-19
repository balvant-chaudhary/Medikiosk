// src/pages/admin/Dashboard.jsx
import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  Users, Clock, CheckCircle2, AlertTriangle, FileText,
  Activity, TrendingUp, Mic, Brain, ShieldCheck, Stethoscope,
  Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

/* ──────────────── HARDCODED DEMO DATA ──────────────────────── */

const INTAKE_TREND = [
  { day: 'Mon', patients: 18, interviews: 16, documents: 12 },
  { day: 'Tue', patients: 24, interviews: 22, documents: 18 },
  { day: 'Wed', patients: 31, interviews: 29, documents: 24 },
  { day: 'Thu', patients: 22, interviews: 20, documents: 17 },
  { day: 'Fri', patients: 37, interviews: 35, documents: 30 },
  { day: 'Sat', patients: 28, interviews: 25, documents: 21 },
  { day: 'Sun', patients: 14, interviews: 12, documents: 9  },
];

const DEPT_LOAD = [
  { dept: 'General OPD',  patients: 82 },
  { dept: 'Cardiology',   patients: 34 },
  { dept: 'Orthopaedics', patients: 28 },
  { dept: 'Paediatrics',  patients: 41 },
  { dept: 'Gynaecology',  patients: 19 },
  { dept: 'Dermatology',  patients: 15 },
];

const COMPLAINT_PIE = [
  { name: 'Fever / Cold',   value: 28, color: '#167765' },
  { name: 'Chest / Cardiac',value: 18, color: '#0F9D8F' },
  { name: 'Joint / Bone',   value: 14, color: '#3FAF9B' },
  { name: 'GI / Stomach',   value: 12, color: '#74C4B8' },
  { name: 'Skin',           value: 9,  color: '#A8D9D3' },
  { name: 'Other',          value: 19, color: '#D1EDEA' },
];

const LANG_PIE = [
  { name: 'Hindi',   value: 61, color: '#167765' },
  { name: 'English', value: 39, color: '#A8D9D3' },
];

const DOCTORS = [
  { name: 'Dr. Priya Sharma',    specialty: 'General Medicine', patients: 42, reviewed: 39, pending: 3,  rating: 4.8 },
  { name: 'Dr. Arjun Mehta',     specialty: 'Cardiology',       patients: 28, reviewed: 26, pending: 2,  rating: 4.9 },
  { name: 'Dr. Sunita Rao',      specialty: 'Paediatrics',      patients: 35, reviewed: 31, pending: 4,  rating: 4.7 },
  { name: 'Dr. Vikram Singh',    specialty: 'Orthopaedics',     patients: 22, reviewed: 22, pending: 0,  rating: 4.6 },
  { name: 'Dr. Meenakshi Iyer',  specialty: 'Gynaecology',      patients: 18, reviewed: 15, pending: 3,  rating: 4.8 },
];

const RECENT_PATIENTS = [
  { id: 'MK-0041', name: 'Ramesh Kumar',   age: 54, complaint: 'Chest tightness',   dept: 'Cardiology',   status: 'Reviewed',  time: '9:12 AM' },
  { id: 'MK-0042', name: 'Sunita Devi',    age: 38, complaint: 'Knee pain',         dept: 'Orthopaedics', status: 'Pending',   time: '9:34 AM' },
  { id: 'MK-0043', name: 'Aditya Verma',   age: 22, complaint: 'Fever & cough',     dept: 'General OPD',  status: 'Reviewed',  time: '9:51 AM' },
  { id: 'MK-0044', name: 'Lakshmi Nair',   age: 67, complaint: 'Diabetes follow-up',dept: 'General OPD',  status: 'In Progress',time: '10:08 AM'},
  { id: 'MK-0045', name: 'Pooja Agarwal',  age: 29, complaint: 'Skin rash',         dept: 'Dermatology',  status: 'Pending',   time: '10:22 AM' },
  { id: 'MK-0046', name: 'Mohan Pillai',   age: 45, complaint: 'Back pain',         dept: 'Orthopaedics', status: 'Reviewed',  time: '10:37 AM' },
];

const ACTIVITY = [
  { icon: '🤖', text: 'AI summary generated for MK-0041 · Cardiology',  time: '2m ago'  },
  { icon: '📄', text: 'Lab report OCR completed for MK-0043',            time: '11m ago' },
  { icon: '🩺', text: 'Dr. Arjun Mehta reviewed 3 patients',             time: '18m ago' },
  { icon: '🆕', text: 'New patient registered: Pooja Agarwal (MK-0045)', time: '25m ago' },
  { icon: '✅', text: 'Interview completed for Mohan Pillai (MK-0046)',  time: '31m ago' },
  { icon: '🌐', text: 'Language auto-detected: Hindi — MK-0044',         time: '40m ago' },
];

/* ──────────────── HELPERS ─────────────────────────────────── */

const todayStr = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

const STATUS_STYLE = {
  'Reviewed':    { bg: '#D1F0E8', color: '#0F4C38' },
  'Pending':     { bg: '#FEF3C7', color: '#78350F' },
  'In Progress': { bg: '#EAF4F1', color: '#0F4C38' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB',
      borderRadius: 6, padding: '0.625rem 0.875rem',
      fontSize: '0.8125rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, color: '#1C1C1E', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ──────────────── KPI CARD ────────────────────────────────── */

function KPI({ label, value, sub, icon: Icon, color, bg, trend, trendUp }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      padding: '1.125rem 1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1C1C1E', lineHeight: 1.1 }}>{value}</p>
          <p style={{ fontSize: '0.8125rem', color: '#5A5A5A', marginTop: '0.25rem', fontWeight: 500 }}>{label}</p>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              {trendUp
                ? <ArrowUpRight size={13} color="#167765" />
                : <ArrowDownRight size={13} color="#DC2626" />}
              <span style={{ fontSize: '0.75rem', color: trendUp ? '#167765' : '#DC2626', fontWeight: 600 }}>
                {trend}
              </span>
            </div>
          )}
          {!trend && sub && (
            <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 4 }}>{sub}</p>
          )}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 8,
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
    </div>
  );
}

/* ──────────────── MAIN COMPONENT ──────────────────────────── */

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const kpis = [
    { label: 'Total Patients Today', value: 46,   trend: '+21% vs yesterday', trendUp: true,  icon: Users,        color: '#167765', bg: '#EAF4F1' },
    { label: 'Interviews Completed', value: 43,   trend: '93% completion',    trendUp: true,  icon: Mic,          color: '#0F9D8F', bg: '#E0F4F2' },
    { label: 'AI Summaries Ready',   value: 39,   trend: '100% accurate',     trendUp: true,  icon: Brain,        color: '#167765', bg: '#EAF4F1' },
    { label: 'Pending Review',       value: 7,    sub: 'Awaiting doctor',                     icon: Clock,        color: '#B45309', bg: '#FEF3C7' },
    { label: 'Documents Uploaded',   value: 31,   trend: '+8 since morning',  trendUp: true,  icon: FileText,     color: '#0F9D8F', bg: '#E0F4F2' },
    { label: 'Avg. Wait Time',       value: '14m', trend: '-3m vs last week', trendUp: true,  icon: Activity,     color: '#167765', bg: '#EAF4F1' },
  ];

  return (
    <AdminLayout>

      {/* ── Header ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1C1C1E' }}>Hospital Analytics</h1>
          <p style={{ fontSize: '0.875rem', color: '#5A5A5A', marginTop: 2 }}>{todayStr}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#D1F0E8', border: '1px solid #A7D9CC', borderRadius: 999, padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, color: '#0F4C38' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#167765', display: 'inline-block' }} />
          System Online · Live Data
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB', paddingBottom: 0 }}>
        {['overview', 'patients', 'doctors'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid #167765' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#167765' : '#5A5A5A',
              marginBottom: -1,
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ════════════ OVERVIEW TAB ════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }} className="kpi-grid">
            {kpis.map(k => <KPI key={k.label} {...k} />)}
          </div>

          {/* Charts row 1: Intake trend + Pie */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }} className="chart-grid">

            {/* Area chart — intake */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1C1C1E' }}>Patient Intake — Last 7 Days</h2>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Patients · Interviews · Documents</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={INTAKE_TREND} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gPt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#167765" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#167765" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0F9D8F" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#0F9D8F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="patients"   name="Patients"   stroke="#167765" strokeWidth={2} fill="url(#gPt)" dot={false} />
                  <Area type="monotone" dataKey="interviews" name="Interviews" stroke="#0F9D8F" strokeWidth={2} fill="url(#gIn)" dot={false} />
                  <Area type="monotone" dataKey="documents"  name="Documents"  stroke="#A8D9D3" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Complaint distribution pie */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1C1C1E', marginBottom: '0.5rem' }}>Chief Complaints</h2>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={COMPLAINT_PIE} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                    {COMPLAINT_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
                {COMPLAINT_PIE.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <span style={{ color: '#5A5A5A' }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#1C1C1E' }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts row 2: Bar (dept) + Lang pie */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }} className="chart-grid">

            {/* Department bar */}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1C1C1E', marginBottom: '1rem' }}>
                Department-wise Patient Volume
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={DEPT_LOAD} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barSize={26}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" horizontal vertical={false} />
                  <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="patients" name="Patients" fill="#167765" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Language pie + feature highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              {/* Language */}
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1.125rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1E', marginBottom: '0.625rem' }}>
                  Language Split
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <ResponsiveContainer width={80} height={80}>
                    <PieChart>
                      <Pie data={LANG_PIE} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value" paddingAngle={2}>
                        {LANG_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {LANG_PIE.map(d => (
                      <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.color }} />
                          <span style={{ color: '#5A5A5A' }}>{d.name}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: '#1C1C1E' }}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI features */}
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1.125rem', flex: 1 }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1E', marginBottom: '0.75rem' }}>
                  AI Features Active
                </h2>
                {[
                  { icon: Mic,        label: 'Voice Interviews',    val: '43 today'  },
                  { icon: Brain,      label: 'AI Summaries',        val: '39 ready'  },
                  { icon: FileText,   label: 'OCR Document Scan',   val: '31 scanned'},
                  { icon: ShieldCheck,label: 'Privacy Encrypted',   val: 'Always on' },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon size={13} color="#167765" />
                      <span style={{ color: '#5A5A5A' }}>{label}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#167765' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={15} color="#167765" />
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1C1C1E' }}>Recent Activity</h2>
            </div>
            <div>
              {ACTIVITY.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1.25rem',
                  borderBottom: i < ACTIVITY.length - 1 ? '1px solid #F5F5F4' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1rem' }}>{a.icon}</span>
                    <span style={{ fontSize: '0.8125rem', color: '#374151' }}>{a.text}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF', flexShrink: 0, marginLeft: '1rem' }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ════════════ PATIENTS TAB ═══════════════════════ */}
      {activeTab === 'patients' && (
        <>
          {/* Mini KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }} className="kpi-grid">
            {[
              { label: 'Registered Today', value: 46, icon: Users,       color: '#167765', bg: '#EAF4F1' },
              { label: 'Interviews Done',  value: 43, icon: Mic,         color: '#0F9D8F', bg: '#E0F4F2' },
              { label: 'Awaiting Doctor',  value: 7,  icon: Clock,       color: '#B45309', bg: '#FEF3C7' },
              { label: 'Docs Uploaded',    value: 31, icon: FileText,    color: '#167765', bg: '#EAF4F1' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1C1C1E', lineHeight: 1.1 }}>{value}</p>
                    <p style={{ fontSize: '0.75rem', color: '#5A5A5A', marginTop: 3 }}>{label}</p>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 7, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={color} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Patient table */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={15} color="#167765" />
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1C1C1E' }}>Today's Patients</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#F5F5F4', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.375rem 0.75rem' }}>
                <Calendar size={13} color="#9CA3AF" />
                <span style={{ fontSize: '0.8125rem', color: '#5A5A5A' }}>
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#F9F9F8' }}>
                    {['Patient ID', 'Name', 'Age', 'Chief Complaint', 'Department', 'Time', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1.125rem', fontWeight: 600, color: '#5A5A5A', borderBottom: '1px solid #E5E7EB', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_PATIENTS.map((p, i) => {
                    const s = STATUS_STYLE[p.status] || { bg: '#F5F5F4', color: '#5A5A5A' };
                    return (
                      <tr key={p.id} style={{ borderBottom: i < RECENT_PATIENTS.length - 1 ? '1px solid #F5F5F4' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '0.875rem 1.125rem', fontWeight: 600, color: '#167765', fontFamily: 'monospace' }}>{p.id}</td>
                        <td style={{ padding: '0.875rem 1.125rem', fontWeight: 500, color: '#1C1C1E', whiteSpace: 'nowrap' }}>{p.name}</td>
                        <td style={{ padding: '0.875rem 1.125rem', color: '#5A5A5A' }}>{p.age}y</td>
                        <td style={{ padding: '0.875rem 1.125rem', color: '#374151' }}>{p.complaint}</td>
                        <td style={{ padding: '0.875rem 1.125rem', color: '#5A5A5A', whiteSpace: 'nowrap' }}>{p.dept}</td>
                        <td style={{ padding: '0.875rem 1.125rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{p.time}</td>
                        <td style={{ padding: '0.875rem 1.125rem' }}>
                          <span style={{ background: s.bg, color: s.color, padding: '0.2rem 0.625rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #E5E7EB', background: '#F9F9F8', fontSize: '0.8125rem', color: '#9CA3AF' }}>
              Showing 6 of 46 patients · Scroll to see all · Data auto-refreshes every 60s
            </div>
          </div>
        </>
      )}

      {/* ════════════ DOCTORS TAB ════════════════════════ */}
      {activeTab === 'doctors' && (
        <>
          {/* Doctor cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {DOCTORS.map((doc, i) => (
              <div key={doc.name} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#EAF4F1', border: '1px solid #A7D9CC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.9375rem', color: '#167765', flexShrink: 0,
                  }}>
                    {doc.name.charAt(4)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1C1C1E' }}>{doc.name}</p>
                    <p style={{ fontSize: '0.75rem', color: '#5A5A5A' }}>{doc.specialty}</p>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', fontWeight: 700, color: '#167765' }}>
                    ⭐ {doc.rating}
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  {[
                    { label: 'Assigned',  val: doc.patients },
                    { label: 'Reviewed',  val: doc.reviewed },
                    { label: 'Pending',   val: doc.pending  },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center', background: '#F9F9F8', borderRadius: 6, padding: '0.5rem 0.25rem' }}>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1C1C1E' }}>{val}</p>
                      <p style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 4 }}>
                    <span>Completion</span>
                    <span style={{ fontWeight: 600, color: '#167765' }}>{Math.round((doc.reviewed / doc.patients) * 100)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: '#F0F0EE', borderRadius: 999 }}>
                    <div style={{ width: `${(doc.reviewed / doc.patients) * 100}%`, height: '100%', background: '#167765', borderRadius: 999 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Workload bar chart */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Stethoscope size={15} color="#167765" />
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1C1C1E' }}>Doctor Patient Volume Comparison</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={DOCTORS.map(d => ({ name: d.name.replace('Dr. ', ''), reviewed: d.reviewed, pending: d.pending }))}
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
                barSize={22}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '0.8125rem', color: '#5A5A5A' }} />
                <Bar dataKey="reviewed" name="Reviewed" fill="#167765" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending"  name="Pending"  fill="#FDE68A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .kpi-grid   { grid-template-columns: repeat(2, 1fr) !important; }
          .chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
