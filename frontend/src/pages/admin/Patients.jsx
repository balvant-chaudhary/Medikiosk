// src/pages/admin/Patients.jsx
import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Search, Filter, Download, Eye, FileText, Mic, CheckCircle2, Clock, AlertCircle, ChevronDown } from 'lucide-react';

const ALL_PATIENTS = [
  { id: 'MK-0041', name: 'Ramesh Kumar',      age: 54, gender: 'Male',   phone: '9876543210', complaint: 'Chest tightness & shortness of breath', dept: 'Cardiology',   doctor: 'Dr. Arjun Mehta',   status: 'Reviewed',    lang: 'Hindi',   interview: true,  docs: 2, time: '9:12 AM',  date: 'Today' },
  { id: 'MK-0042', name: 'Sunita Devi',        age: 38, gender: 'Female', phone: '9123456789', complaint: 'Left knee pain for 3 weeks',           dept: 'Orthopaedics', doctor: 'Dr. Vikram Singh',   status: 'Pending',     lang: 'Hindi',   interview: true,  docs: 1, time: '9:34 AM',  date: 'Today' },
  { id: 'MK-0043', name: 'Aditya Verma',       age: 22, gender: 'Male',   phone: '9988776655', complaint: 'Fever, cough and body ache',           dept: 'General OPD',  doctor: 'Dr. Priya Sharma',  status: 'Reviewed',    lang: 'English', interview: true,  docs: 0, time: '9:51 AM',  date: 'Today' },
  { id: 'MK-0044', name: 'Lakshmi Nair',       age: 67, gender: 'Female', phone: '9871234560', complaint: 'Diabetes follow-up & foot swelling',   dept: 'General OPD',  doctor: 'Dr. Priya Sharma',  status: 'In Progress', lang: 'Hindi',   interview: true,  docs: 3, time: '10:08 AM', date: 'Today' },
  { id: 'MK-0045', name: 'Pooja Agarwal',      age: 29, gender: 'Female', phone: '9765432109', complaint: 'Skin rash and itching on forearms',    dept: 'Dermatology',  doctor: 'Unassigned',        status: 'Pending',     lang: 'English', interview: false, docs: 1, time: '10:22 AM', date: 'Today' },
  { id: 'MK-0046', name: 'Mohan Pillai',       age: 45, gender: 'Male',   phone: '9654321098', complaint: 'Lower back pain, radiating to legs',   dept: 'Orthopaedics', doctor: 'Dr. Vikram Singh',   status: 'Reviewed',    lang: 'Hindi',   interview: true,  docs: 2, time: '10:37 AM', date: 'Today' },
  { id: 'MK-0047', name: 'Geeta Sharma',       age: 34, gender: 'Female', phone: '9543210987', complaint: 'Irregular periods & abdominal cramps', dept: 'Gynaecology',  doctor: 'Dr. Meenakshi Iyer', status: 'Reviewed',   lang: 'Hindi',   interview: true,  docs: 1, time: '11:05 AM', date: 'Today' },
  { id: 'MK-0048', name: 'Kiran Bhat',         age: 52, gender: 'Male',   phone: '9432109876', complaint: 'High BP and occasional headaches',     dept: 'General OPD',  doctor: 'Dr. Priya Sharma',  status: 'Reviewed',    lang: 'Hindi',   interview: true,  docs: 0, time: '11:18 AM', date: 'Today' },
  { id: 'MK-0049', name: 'Anjali Singh',       age: 8,  gender: 'Female', phone: '9321098765', complaint: 'Vomiting and loose stools for 2 days', dept: 'Paediatrics',  doctor: 'Dr. Sunita Rao',    status: 'Reviewed',    lang: 'Hindi',   interview: true,  docs: 0, time: '11:32 AM', date: 'Today' },
  { id: 'MK-0050', name: 'Deepak Joshi',       age: 41, gender: 'Male',   phone: '9210987654', complaint: 'Eye redness and blurry vision',        dept: 'General OPD',  doctor: 'Dr. Priya Sharma',  status: 'Pending',     lang: 'English', interview: true,  docs: 0, time: '11:45 AM', date: 'Today' },
  { id: 'MK-0038', name: 'Nalini Subramanian', age: 61, gender: 'Female', phone: '9187654321', complaint: 'Joint pain and morning stiffness',     dept: 'Orthopaedics', doctor: 'Dr. Vikram Singh',   status: 'Reviewed',    lang: 'Hindi',   interview: true,  docs: 2, time: '3:22 PM',  date: 'Yesterday' },
  { id: 'MK-0037', name: 'Rohit Garg',         age: 28, gender: 'Male',   phone: '9098765432', complaint: 'Anxiety and sleep disturbance',        dept: 'General OPD',  doctor: 'Dr. Priya Sharma',  status: 'Reviewed',    lang: 'English', interview: true,  docs: 0, time: '2:14 PM',  date: 'Yesterday' },
];

const STATUS_STYLE = {
  'Reviewed':    { bg: '#D1F0E8', color: '#0F4C38' },
  'Pending':     { bg: '#FEF3C7', color: '#78350F' },
  'In Progress': { bg: '#EAF4F1', color: '#0F4C38' },
};

export default function AdminPatients() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [selected, setSelected] = useState(null);

  const depts = ['All', ...new Set(ALL_PATIENTS.map(p => p.dept))];
  const statuses = ['All', 'Reviewed', 'Pending', 'In Progress'];

  const filtered = ALL_PATIENTS.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.complaint.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchDept   = filterDept === 'All'   || p.dept === filterDept;
    return matchSearch && matchStatus && matchDept;
  });

  const todayCount     = ALL_PATIENTS.filter(p => p.date === 'Today').length;
  const reviewedCount  = ALL_PATIENTS.filter(p => p.status === 'Reviewed').length;
  const pendingCount   = ALL_PATIENTS.filter(p => p.status === 'Pending').length;
  const withDocsCount  = ALL_PATIENTS.filter(p => p.docs > 0).length;

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1C1C1E' }}>Patient Records</h1>
          <p style={{ fontSize: '0.875rem', color: '#5A5A5A', marginTop: 2 }}>{ALL_PATIENTS.length} total records · {todayCount} registered today</p>
        </div>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #E5E7EB',
          background: 'white', color: '#5A5A5A', cursor: 'pointer',
          fontSize: '0.8125rem', fontWeight: 500, fontFamily: 'Inter, sans-serif',
        }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Today',        value: todayCount,    color: '#167765', bg: '#EAF4F1' },
          { label: 'Reviewed',     value: reviewedCount, color: '#167765', bg: '#D1F0E8' },
          { label: 'Pending',      value: pendingCount,  color: '#B45309', bg: '#FEF3C7' },
          { label: 'With Docs',    value: withDocsCount, color: '#0F9D8F', bg: '#E0F4F2' },
        ].map(k => (
          <div key={k.label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '1rem' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1C1C1E', lineHeight: 1 }}>{k.value}</p>
            <p style={{ fontSize: '0.75rem', color: '#5A5A5A', marginTop: 4 }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or complaint…"
            style={{
              width: '100%', padding: '0.5625rem 0.875rem 0.5625rem 2.25rem',
              border: '1px solid #E5E7EB', borderRadius: 6,
              fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none', color: '#1C1C1E',
            }}
          />
        </div>
        {/* Status filter */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '0.5625rem 0.875rem', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#374151', background: 'white', cursor: 'pointer', outline: 'none' }}>
          {statuses.map(s => <option key={s}>{s}</option>)}
        </select>
        {/* Dept filter */}
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          style={{ padding: '0.5625rem 0.875rem', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#374151', background: 'white', cursor: 'pointer', outline: 'none' }}>
          {depts.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Layout: table + detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '1rem', alignItems: 'start' }}>

        {/* Table */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: '#F9F9F8' }}>
                  {['Patient ID', 'Name', 'Age', 'Chief Complaint', 'Department', 'Assigned Doctor', 'Interview', 'Docs', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.875rem', fontWeight: 600, color: '#5A5A5A', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '2.5rem', textAlign: 'center', color: '#9CA3AF' }}>No patients match your filters</td></tr>
                ) : filtered.map((p, i) => {
                  const s = STATUS_STYLE[p.status] || { bg: '#F5F5F4', color: '#5A5A5A' };
                  const isSelected = selected?.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(isSelected ? null : p)}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid #F5F5F4' : 'none',
                        cursor: 'pointer',
                        background: isSelected ? '#EAF4F1' : 'transparent',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#FAFAFA'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '0.75rem 0.875rem', fontWeight: 600, color: '#167765', fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.id}</td>
                      <td style={{ padding: '0.75rem 0.875rem', fontWeight: 500, color: '#1C1C1E', whiteSpace: 'nowrap' }}>{p.name}</td>
                      <td style={{ padding: '0.75rem 0.875rem', color: '#5A5A5A' }}>{p.age}y</td>
                      <td style={{ padding: '0.75rem 0.875rem', color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.complaint}</td>
                      <td style={{ padding: '0.75rem 0.875rem', color: '#5A5A5A', whiteSpace: 'nowrap' }}>{p.dept}</td>
                      <td style={{ padding: '0.75rem 0.875rem', color: '#374151', whiteSpace: 'nowrap' }}>{p.doctor}</td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        {p.interview
                          ? <span style={{ color: '#167765', display: 'flex', alignItems: 'center', gap: 3 }}><CheckCircle2 size={13} /> Done</span>
                          : <span style={{ color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={13} /> Pending</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', color: p.docs > 0 ? '#167765' : '#9CA3AF', fontWeight: 600 }}>
                        {p.docs > 0 ? p.docs : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ background: s.bg, color: s.color, padding: '0.2rem 0.625rem', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #E5E7EB', background: '#F9F9F8', fontSize: '0.75rem', color: '#9CA3AF' }}>
            Showing {filtered.length} of {ALL_PATIENTS.length} records · Click a row to view details
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', position: 'sticky', top: 20 }}>
            <div style={{ padding: '1rem 1.125rem', borderBottom: '1px solid #E5E7EB', background: '#F9F9F8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1C1C1E' }}>{selected.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '1.125rem', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '1.125rem' }}>
              {[
                { label: 'Age',         val: `${selected.age} years`  },
                { label: 'Gender',      val: selected.gender           },
                { label: 'Phone',       val: selected.phone            },
                { label: 'Language',    val: selected.lang             },
                { label: 'Department',  val: selected.dept             },
                { label: 'Doctor',      val: selected.doctor           },
                { label: 'Time',        val: selected.time             },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#9CA3AF', fontWeight: 500 }}>{label}</span>
                  <span style={{ color: '#1C1C1E', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                </div>
              ))}

              <div style={{ marginTop: '0.875rem', padding: '0.875rem', background: '#F9F9F8', border: '1px solid #E5E7EB', borderRadius: 6 }}>
                <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Chief Complaint</p>
                <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.5 }}>{selected.complaint}</p>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1, padding: '0.625rem', background: selected.interview ? '#D1F0E8' : '#F5F5F4', border: '1px solid #E5E7EB', borderRadius: 6, textAlign: 'center' }}>
                  <Mic size={14} color={selected.interview ? '#167765' : '#9CA3AF'} style={{ margin: '0 auto 4px' }} />
                  <p style={{ fontSize: '0.6875rem', color: selected.interview ? '#0F4C38' : '#9CA3AF', fontWeight: 600 }}>Interview {selected.interview ? '✓' : 'Pending'}</p>
                </div>
                <div style={{ flex: 1, padding: '0.625rem', background: selected.docs > 0 ? '#D1F0E8' : '#F5F5F4', border: '1px solid #E5E7EB', borderRadius: 6, textAlign: 'center' }}>
                  <FileText size={14} color={selected.docs > 0 ? '#167765' : '#9CA3AF'} style={{ margin: '0 auto 4px' }} />
                  <p style={{ fontSize: '0.6875rem', color: selected.docs > 0 ? '#0F4C38' : '#9CA3AF', fontWeight: 600 }}>{selected.docs > 0 ? `${selected.docs} Document${selected.docs > 1 ? 's' : ''}` : 'No Docs'}</p>
                </div>
              </div>

              <div style={{ marginTop: '0.875rem' }}>
                <div style={{ ...STATUS_STYLE[selected.status], padding: '0.375rem 0.75rem', borderRadius: 6, textAlign: 'center', fontSize: '0.8125rem', fontWeight: 600 }}>
                  {selected.status}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
