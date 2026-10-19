// src/pages/admin/Doctors.jsx
import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Stethoscope, Users, CheckCircle2, Clock, Star, Phone, Mail, Building2, Award } from 'lucide-react';

const DOCTORS = [
  {
    id: 'd1',
    name: 'Dr. Priya Sharma',
    specialty: 'General Medicine',
    dept: 'OPD',
    email: 'priya.sharma@medikiosk.in',
    phone: '9876543210',
    license: 'MCI-2025-001',
    experience: '12 years',
    qualifications: 'MBBS, MD (Internal Medicine)',
    patients: 42,
    reviewed: 39,
    pending: 3,
    rating: 4.8,
    languages: ['English', 'Hindi'],
    status: 'Active',
    joined: 'Jan 2023',
    weeklyTrend: [
      { day: 'Mon', p: 8 }, { day: 'Tue', p: 11 }, { day: 'Wed', p: 9 },
      { day: 'Thu', p: 7 }, { day: 'Fri', p: 13 }, { day: 'Sat', p: 6 }, { day: 'Sun', p: 3 },
    ],
  },
  {
    id: 'd2',
    name: 'Dr. Arjun Mehta',
    specialty: 'Cardiology',
    dept: 'Cardiology',
    email: 'arjun.mehta@medikiosk.in',
    phone: '9123456789',
    license: 'MCI-2025-002',
    experience: '9 years',
    qualifications: 'MBBS, DM (Cardiology)',
    patients: 28,
    reviewed: 26,
    pending: 2,
    rating: 4.9,
    languages: ['English', 'Hindi', 'Gujarati'],
    status: 'Active',
    joined: 'Mar 2023',
    weeklyTrend: [
      { day: 'Mon', p: 5 }, { day: 'Tue', p: 7 }, { day: 'Wed', p: 6 },
      { day: 'Thu', p: 4 }, { day: 'Fri', p: 8 }, { day: 'Sat', p: 3 }, { day: 'Sun', p: 2 },
    ],
  },
  {
    id: 'd3',
    name: 'Dr. Sunita Rao',
    specialty: 'Paediatrics',
    dept: 'Paediatrics',
    email: 'sunita.rao@medikiosk.in',
    phone: '9988776655',
    license: 'MCI-2025-003',
    experience: '15 years',
    qualifications: 'MBBS, MD (Paediatrics)',
    patients: 35,
    reviewed: 31,
    pending: 4,
    rating: 4.7,
    languages: ['English', 'Hindi', 'Telugu'],
    status: 'Active',
    joined: 'Dec 2022',
    weeklyTrend: [
      { day: 'Mon', p: 7 }, { day: 'Tue', p: 9 }, { day: 'Wed', p: 8 },
      { day: 'Thu', p: 5 }, { day: 'Fri', p: 10 }, { day: 'Sat', p: 7 }, { day: 'Sun', p: 4 },
    ],
  },
  {
    id: 'd4',
    name: 'Dr. Vikram Singh',
    specialty: 'Orthopaedics',
    dept: 'Orthopaedics',
    email: 'vikram.singh@medikiosk.in',
    phone: '9765432109',
    license: 'MCI-2025-004',
    experience: '11 years',
    qualifications: 'MBBS, MS (Orthopaedics)',
    patients: 22,
    reviewed: 22,
    pending: 0,
    rating: 4.6,
    languages: ['English', 'Hindi'],
    status: 'Active',
    joined: 'Feb 2023',
    weeklyTrend: [
      { day: 'Mon', p: 4 }, { day: 'Tue', p: 5 }, { day: 'Wed', p: 6 },
      { day: 'Thu', p: 3 }, { day: 'Fri', p: 7 }, { day: 'Sat', p: 4 }, { day: 'Sun', p: 2 },
    ],
  },
  {
    id: 'd5',
    name: 'Dr. Meenakshi Iyer',
    specialty: 'Gynaecology',
    dept: 'Gynaecology',
    email: 'meenakshi.iyer@medikiosk.in',
    phone: '9654321098',
    license: 'MCI-2025-005',
    experience: '8 years',
    qualifications: 'MBBS, MD (Gynaecology & Obstetrics)',
    patients: 18,
    reviewed: 15,
    pending: 3,
    rating: 4.8,
    languages: ['English', 'Hindi', 'Tamil'],
    status: 'Active',
    joined: 'Apr 2023',
    weeklyTrend: [
      { day: 'Mon', p: 3 }, { day: 'Tue', p: 4 }, { day: 'Wed', p: 5 },
      { day: 'Thu', p: 3 }, { day: 'Fri', p: 6 }, { day: 'Sat', p: 3 }, { day: 'Sun', p: 1 },
    ],
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
      <p style={{ fontWeight: 600, color: '#1C1C1E', marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#167765' }}>Patients: <strong>{payload[0].value}</strong></p>
    </div>
  );
};

export default function AdminDoctors() {
  const [selected, setSelected] = useState(DOCTORS[0]);

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1C1C1E' }}>Doctor Management</h1>
          <p style={{ fontSize: '0.875rem', color: '#5A5A5A', marginTop: 2 }}>{DOCTORS.length} active doctors · All verified</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#D1F0E8', border: '1px solid #A7D9CC', borderRadius: 999, padding: '0.3rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500, color: '#0F4C38' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#167765', display: 'inline-block' }} />
          All Doctors Active
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Doctors',     value: 5,   icon: Stethoscope, color: '#167765', bg: '#EAF4F1' },
          { label: 'Total Reviewed',    value: 133, icon: CheckCircle2, color: '#0F9D8F', bg: '#E0F4F2' },
          { label: 'Still Pending',     value: 12,  icon: Clock,        color: '#B45309', bg: '#FEF3C7' },
          { label: 'Avg. Patient Load', value: 29,  icon: Users,        color: '#167765', bg: '#EAF4F1' },
        ].map(k => (
          <div key={k.label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: 7, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <k.icon size={17} color={k.color} />
            </div>
            <div>
              <p style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1C1C1E', lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: '0.75rem', color: '#5A5A5A', marginTop: 2 }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1rem' }} className="doctor-grid">

        {/* Doctor list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {DOCTORS.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelected(doc)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1rem',
                background: selected?.id === doc.id ? '#EAF4F1' : 'white',
                border: `1px solid ${selected?.id === doc.id ? '#167765' : '#E5E7EB'}`,
                borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                width: '100%',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: selected?.id === doc.id ? '#D1F0E8' : '#F5F5F4',
                border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9375rem',
                color: selected?.id === doc.id ? '#167765' : '#5A5A5A', flexShrink: 0,
              }}>
                {doc.name.charAt(4)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#5A5A5A' }}>{doc.specialty}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#167765' }}>{doc.patients}p</p>
                <p style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>{doc.pending} pending</p>
              </div>
            </button>
          ))}
        </div>

        {/* Doctor detail */}
        {selected && (
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #E5E7EB', background: '#F9F9F8', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#EAF4F1', border: '1.5px solid #A7D9CC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1.25rem', color: '#167765', flexShrink: 0,
              }}>
                {selected.name.charAt(4)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1C1C1E' }}>{selected.name}</h2>
                  <span style={{ background: '#D1F0E8', color: '#0F4C38', fontSize: '0.6875rem', fontWeight: 600, padding: '0.175rem 0.5rem', borderRadius: 999 }}>
                    Active
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#5A5A5A' }}>{selected.specialty} · {selected.dept}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < Math.floor(selected.rating) ? '#F59E0B' : 'none'} color="#F59E0B" />
                  ))}
                  <span style={{ fontSize: '0.75rem', color: '#5A5A5A', marginLeft: 2 }}>{selected.rating} / 5.0</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Joined</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1E' }}>{selected.joined}</p>
              </div>
            </div>

            <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Info grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1E', marginBottom: 4 }}>Contact & Credentials</h3>
                {[
                  { icon: Mail,      label: 'Email',        val: selected.email        },
                  { icon: Phone,     label: 'Phone',        val: selected.phone        },
                  { icon: Award,     label: 'License',      val: selected.license      },
                  { icon: Building2, label: 'Experience',   val: selected.experience   },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F4', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color="#5A5A5A" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 500 }}>{label}</p>
                      <p style={{ fontSize: '0.8125rem', color: '#1C1C1E', fontWeight: 500 }}>{val}</p>
                    </div>
                  </div>
                ))}

                <div>
                  <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 500, marginBottom: 4 }}>Qualifications</p>
                  <p style={{ fontSize: '0.8125rem', color: '#374151' }}>{selected.qualifications}</p>
                </div>

                <div>
                  <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 500, marginBottom: 6 }}>Languages</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selected.languages.map(l => (
                      <span key={l} style={{ background: '#EAF4F1', border: '1px solid #A7D9CC', color: '#0F4C38', fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.625rem', borderRadius: 999 }}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Patient stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: 4 }}>
                  {[
                    { label: 'Assigned',  val: selected.patients },
                    { label: 'Reviewed',  val: selected.reviewed },
                    { label: 'Pending',   val: selected.pending  },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: '#F9F9F8', border: '1px solid #E5E7EB', borderRadius: 6, padding: '0.625rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1C1C1E', lineHeight: 1 }}>{val}</p>
                      <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: 3 }}>{label}</p>
                    </div>
                  ))}
                </div>

                {/* Completion bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9CA3AF', marginBottom: 4 }}>
                    <span>Today's completion</span>
                    <span style={{ fontWeight: 700, color: '#167765' }}>{Math.round((selected.reviewed / selected.patients) * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: '#F0F0EE', borderRadius: 999 }}>
                    <div style={{ height: '100%', background: '#167765', borderRadius: 999, width: `${(selected.reviewed / selected.patients) * 100}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>

              {/* Weekly chart */}
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1E', marginBottom: '0.875rem' }}>
                  Patient Volume — This Week
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={selected.weeklyTrend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0EE" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="p" name="Patients" fill="#167765" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div style={{ marginTop: '1rem', padding: '0.875rem', background: '#F9F9F8', border: '1px solid #E5E7EB', borderRadius: 6 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5A5A5A', marginBottom: 6 }}>AI Integration Stats</p>
                  {[
                    { label: 'Interviews read via AI', val: `${selected.reviewed} summaries` },
                    { label: 'Avg review time', val: '4.2 minutes' },
                    { label: 'Voice language', val: selected.languages[0] },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                      <span style={{ color: '#9CA3AF' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: '#167765' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .doctor-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
