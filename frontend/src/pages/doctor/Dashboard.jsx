// src/pages/doctor/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/doctorAPI';
import {
  UserCircle, Search, CheckCircle2, AlertCircle, Loader2,
  Stethoscope, LogOut, Clock, FileText, RefreshCw
} from 'lucide-react';

/* ── Status badge helper ────────────────────────────────────────── */
function QueueBadge({ status }) {
  const map = {
    READY_FOR_REVIEW: { label: 'NEW',       bg: '#FEF3C7', color: '#92400E' },
    IN_REVIEW:        { label: 'IN REVIEW', bg: '#DBEAFE', color: '#1E40AF' },
    REVIEWED:         { label: 'REVIEWED',  bg: '#D1FAE5', color: '#065F46' },
  };
  const s = map[status] || { label: status, bg: '#F3F4F6', color: '#374151' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.03em',
      background: s.bg,
      color: s.color,
      flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

/* ── Patient card in queue ──────────────────────────────────────── */
function QueueCard({ item, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '1rem',
        borderRadius: 12,
        border: `2px solid ${isSelected ? '#3B82F6' : '#E5E7EB'}`,
        background: isSelected ? '#EFF6FF' : 'white',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        marginBottom: '0.5rem',
        boxShadow: isSelected ? '0 2px 8px rgba(59,130,246,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#93C5FD';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
        <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>
          {item.patientId?.name || 'Unknown Patient'}
        </p>
        <QueueBadge status={item.queueStatus} />
      </div>
      <p style={{ fontSize: '0.8125rem', color: '#4B5563', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 600 }}>CC:</span>{' '}
        {item.clinicalSummary?.chiefComplaint || item.chiefComplaint || 'Not specified'}
      </p>
      {item.clinicalSummary?.duration && (
        <p style={{ fontSize: '0.75rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} /> {item.clinicalSummary.duration}
        </p>
      )}
    </div>
  );
}

/* ── Section header ─────────────────────────────────────────────── */
function SectionHeader({ color, label, title, icon: Icon }) {
  return (
    <div style={{
      padding: '1rem 1.5rem',
      background: `${color}08`,
      borderBottom: `1px solid ${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {Icon && <Icon size={16} style={{ color }} />}
        <div style={{
          background: color, color: 'white',
          fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.07em',
          padding: '2px 8px', borderRadius: 4,
        }}>
          {label}
        </div>
        <h3 style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{title}</h3>
      </div>
    </div>
  );
}

/* ── Info chip ──────────────────────────────────────────────────── */
function InfoChip({ label, value, bg, color }) {
  return (
    <div style={{ background: bg || '#F9FAFB', border: `1px solid ${color}25`, borderRadius: 10, padding: '0.75rem 1rem' }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: color || '#6B7280', marginBottom: '0.25rem' }}>
        {label}
      </p>
      <p style={{ fontWeight: 600, color: '#111827', fontSize: '0.9375rem' }}>{value || '—'}</p>
    </div>
  );
}

/* ── Bullet list ────────────────────────────────────────────────── */
function BulletList({ items, emptyText }) {
  if (!items?.length) return <p style={{ fontSize: '0.875rem', color: '#9CA3AF', fontStyle: 'italic' }}>{emptyText || 'None reported'}</p>;
  return (
    <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
      {items.map((s, i) => (
        <li key={i} style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>{s}</li>
      ))}
    </ul>
  );
}

/* ── Main Dashboard ─────────────────────────────────────────────── */
function DoctorDashboard() {
  const { user, logout } = useAuth();
  const [queue,            setQueue]            = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [patientRecord,    setPatientRecord]    = useState(null);
  const [patientDocuments, setPatientDocuments] = useState([]);
  const [search,           setSearch]           = useState('');
  const [filterStatus,     setFilterStatus]     = useState('');
  const [loadingQueue,     setLoadingQueue]     = useState(false);
  const [loadingRecord,    setLoadingRecord]    = useState(false);
  const [queueError,       setQueueError]       = useState('');

  /* Fetch queue */
  const fetchQueue = async () => {
    setLoadingQueue(true); setQueueError('');
    try {
      const params = {};
      if (search)       params.search = search;
      if (filterStatus) params.status = filterStatus;
      const data = await doctorAPI.getQueue(params);
      if (data.success) setQueue(data.queue);
    } catch (err) {
      setQueueError(err.response?.data?.message || 'Failed to fetch queue.');
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchQueue, 400);
    return () => clearTimeout(t);
  }, [search, filterStatus]);

  /* Fetch patient record */
  useEffect(() => {
    if (!selectedRecordId) { setPatientRecord(null); return; }
    const fetch = async () => {
      setLoadingRecord(true);
      try {
        const data = await doctorAPI.getPatientDetail(selectedRecordId);
        if (data.success) {
          setPatientRecord(data.record);
          setPatientDocuments(data.documents || []);
          fetchQueue();
        }
      } catch (err) {
        console.error('Failed to fetch record', err);
      } finally {
        setLoadingRecord(false);
      }
    };
    fetch();
  }, [selectedRecordId]);

  const handleMarkReviewed = async () => {
    if (!selectedRecordId) return;
    try {
      const data = await doctorAPI.markReviewed(selectedRecordId);
      if (data.success) { setPatientRecord(data.record); fetchQueue(); }
    } catch (err) {
      console.error('Mark reviewed failed', err);
    }
  };

  const FILTER_TABS = [
    { val: '',                label: 'All'        },
    { val: 'READY_FOR_REVIEW', label: 'New'        },
    { val: 'IN_REVIEW',        label: 'In Review'  },
    { val: 'REVIEWED',         label: 'Reviewed'   },
  ];

  return (
    /* Root: full viewport, no scroll */
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: '#F8FAFC', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ══ LEFT SIDEBAR — PATIENT QUEUE ══════════════════════════ */}
      <aside style={{
        width: 340,
        flexShrink: 0,
        background: 'white',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}>

        {/* Sidebar Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Stethoscope size={18} color="white" />
              </div>
              <span style={{ fontWeight: 800, color: 'white', fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>
                MediKiosk
              </span>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/doctor/login'; }}
              style={{ color: 'rgba(255,255,255,0.65)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6 }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.75rem',
            }}>
              {user?.name?.charAt(0) || 'D'}
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{user?.name || 'Doctor'}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Doctor Dashboard</p>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA', flexShrink: 0 }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '0.625rem' }}>
            <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search patients or complaints..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                border: '1.5px solid #E5E7EB',
                borderRadius: 8,
                fontSize: '0.8125rem',
                color: '#374151',
                background: 'white',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>
          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {FILTER_TABS.map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setFilterStatus(val)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: filterStatus === val ? '#2563EB' : 'white',
                  color: filterStatus === val ? 'white' : '#4B5563',
                  boxShadow: filterStatus === val ? '0 2px 6px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={fetchQueue}
              style={{ marginLeft: 'auto', padding: '3px 8px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex', alignItems: 'center' }}
              title="Refresh"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Queue count */}
        <div style={{ padding: '0.5rem 1rem 0.25rem', flexShrink: 0 }}>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>
            {loadingQueue ? 'Loading…' : `${queue.length} patient${queue.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Queue list (scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.75rem 1rem' }}>
          {loadingQueue ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 80 }}>
              <Loader2 size={24} style={{ color: '#6B7280', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : queueError ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#EF4444', fontSize: '0.875rem', background: '#FEF2F2', borderRadius: 10 }}>
              {queueError}
            </div>
          ) : queue.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140, color: '#D1D5DB' }}>
              <CheckCircle2 size={48} style={{ marginBottom: '0.5rem' }} />
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem', fontWeight: 500 }}>No patients in queue</p>
            </div>
          ) : (
            queue.map(item => (
              <QueueCard
                key={item._id}
                item={item}
                isSelected={selectedRecordId === item._id}
                onClick={() => setSelectedRecordId(item._id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ══ RIGHT PANEL — PATIENT RECORD ══════════════════════════ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F8FAFC' }}>

        {loadingRecord ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
            <p style={{ fontWeight: 500, color: '#4B5563' }}>Loading clinical record…</p>
          </div>

        ) : !patientRecord ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB' }}>
            <UserCircle size={88} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#6B7280' }}>Select a patient to view their clinical record</p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '0.375rem' }}>Choose from the queue on the left</p>
          </div>

        ) : (
          <>
            {/* Sticky topbar */}
            <div style={{
              background: 'white',
              borderBottom: '1px solid #E5E7EB',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                  {patientRecord.patientId?.name}
                </h2>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem', color: '#6B7280' }}>
                  <span>Age: <strong style={{ color: '#374151' }}>{patientRecord.patientId?.age || '—'}</strong></span>
                  <span>Sex: <strong style={{ color: '#374151' }}>{patientRecord.patientId?.gender || '—'}</strong></span>
                  <span>Status: <strong style={{ color: '#2563EB' }}>{patientRecord.queueStatus?.replace(/_/g, ' ')}</strong></span>
                </div>
              </div>

              {patientRecord.queueStatus !== 'REVIEWED' ? (
                <button
                  onClick={handleMarkReviewed}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    background: '#16A34A',
                    color: 'white', border: 'none', borderRadius: 10,
                    fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.35)',
                    transition: 'all 0.15s ease',
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
                  onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
                >
                  <CheckCircle2 size={18} />
                  Mark as Reviewed
                </button>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  background: '#ECFDF5', border: '1px solid #A7F3D0',
                  borderRadius: 10, color: '#065F46', fontWeight: 700, fontSize: '0.875rem',
                }}>
                  <CheckCircle2 size={16} style={{ color: '#16A34A' }} />
                  Reviewed
                </div>
              )}
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem 4rem' }}>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>

                {/* ── AI Clinical Summary ─────────────────────────────── */}
                <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E0E7FF', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
                  {/* Color accent bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#4F46E5' }} />
                  <SectionHeader color="#4F46E5" label="AI GENERATED" title="Clinical Summary" icon={Stethoscope} />

                  <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Left */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280', marginBottom: '0.5rem' }}>
                          AI Summary
                        </p>
                        <p style={{ fontSize: '0.9375rem', color: '#1F2937', lineHeight: 1.7, fontWeight: 500, background: '#F9FAFB', padding: '0.875rem', borderRadius: 10, border: '1px solid #F3F4F6' }}>
                          {patientRecord.clinicalSummary?.aiSummaryText || 'No summary generated.'}
                        </p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <InfoChip label="Chief Complaint" value={patientRecord.clinicalSummary?.chiefComplaint} bg="#FFF7ED" color="#EA580C" />
                        <InfoChip label="Duration · Severity" value={`${patientRecord.clinicalSummary?.duration || '—'} · ${patientRecord.clinicalSummary?.severity || '—'}`} bg="#EFF6FF" color="#2563EB" />
                      </div>
                    </div>

                    {/* Right */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {[
                        { label: 'Reported Symptoms',  items: patientRecord.clinicalSummary?.symptoms        },
                        { label: 'Medical History',    items: patientRecord.clinicalSummary?.medicalHistory  },
                      ].map(({ label, items }) => (
                        <div key={label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '0.875rem' }}>
                          <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '0.625rem' }}>
                            {label}
                          </p>
                          <BulletList items={items} />
                        </div>
                      ))}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {[
                          { label: 'Medications', items: patientRecord.clinicalSummary?.medications },
                          { label: 'Allergies',   items: patientRecord.clinicalSummary?.allergies   },
                        ].map(({ label, items }) => (
                          <div key={label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '0.75rem' }}>
                            <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B7280', borderBottom: '1px solid #F3F4F6', paddingBottom: '0.375rem', marginBottom: '0.5rem' }}>
                              {label}
                            </p>
                            <BulletList items={items} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Uploaded Documents ─────────────────────────────── */}
                <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #D1FAE5', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#10B981' }} />
                  <SectionHeader color="#10B981" label="ATTACHMENTS" title={`Uploaded Documents (${patientDocuments.length})`} icon={FileText} />

                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {patientDocuments.length === 0 ? (
                      <p style={{ fontSize: '0.875rem', color: '#6B7280', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
                        No physical documents uploaded for this visit.
                      </p>
                    ) : (
                      patientDocuments.map(doc => (
                        <div key={doc._id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#FAFAFA' }}>
                          {/* Doc header */}
                          <div style={{ background: '#F3F4F6', borderBottom: '1px solid #E5E7EB', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FileText size={15} style={{ color: '#6B7280' }} />
                              <span style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>{doc.originalName}</span>
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#E5E7EB', color: '#374151', borderRadius: 999, fontWeight: 600 }}>
                                OCR: {doc.ocrStatus}
                              </span>
                            </div>
                            <a
                              href={`http://localhost:5000${doc.storageUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#2563EB', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}
                              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                              onMouseLeave={e => e.target.style.textDecoration = 'none'}
                            >
                              View full file →
                            </a>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'row', gap: '0', flexWrap: 'wrap' }}>
                            {/* Image Preview */}
                            <div style={{ flex: '1 1 30%', minWidth: 200, borderRight: '1px solid #E5E7EB', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white' }}>
                              <img 
                                src={`http://localhost:5000${doc.storageUrl}`} 
                                alt="Medical Document" 
                                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            </div>

                            {/* Extracted Data */}
                            <div style={{ flex: '2 1 60%', display: 'flex', flexDirection: 'column' }}>
                              {/* AI extraction */}
                              {doc.aiExtraction ? (
                                <div style={{ padding: '0.875rem 1rem', background: '#F5F3FF', flex: 1 }}>
                                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C3AED', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', display: 'inline-block' }} />
                                    AI Structured Extraction
                                  </p>
                                  {doc.aiExtraction.summary && (
                                    <p style={{ fontSize: '0.875rem', color: '#1F2937', fontWeight: 500, marginBottom: '0.75rem' }}>
                                      {doc.aiExtraction.summary}
                                    </p>
                                  )}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                                    {doc.aiExtraction.reportedConditions?.length > 0 && (
                                      <div>
                                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Conditions</p>
                                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                          {doc.aiExtraction.reportedConditions.map((c, i) => <li key={i} style={{ fontSize: '0.8125rem', color: '#374151', marginBottom: 2 }}>{c}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {doc.aiExtraction.medications?.length > 0 && (
                                      <div>
                                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Medications</p>
                                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                          {doc.aiExtraction.medications.map((c, i) => <li key={i} style={{ fontSize: '0.8125rem', color: '#374151', marginBottom: 2 }}>{c}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {doc.aiExtraction.allergies?.length > 0 && (
                                      <div>
                                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Allergies</p>
                                        <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                                          {doc.aiExtraction.allergies.map((c, i) => <li key={i} style={{ fontSize: '0.8125rem', color: '#374151', marginBottom: 2 }}>{c}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                  {doc.aiExtraction.labValues?.length > 0 && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lab Values</p>
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                                        {doc.aiExtraction.labValues.map((l, i) => (
                                          <div key={i} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{l.test}</p>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: l.flag === 'high' ? '#DC2626' : l.flag === 'low' ? '#2563EB' : '#059669' }}>
                                              {l.value} {l.unit}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ padding: '0.875rem 1rem', flex: 1 }}>
                                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: '0.5rem' }}>
                                    Raw OCR Text
                                  </p>
                                  <div style={{
                                    background: 'white', border: '1px solid #E5E7EB', borderRadius: 8,
                                    padding: '0.625rem 0.875rem',
                                    fontSize: '0.8125rem', color: '#374151',
                                    maxHeight: 120, overflowY: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'ui-monospace, monospace',
                                    lineHeight: 1.6,
                                  }}>
                                    {doc.extractedText || 'No text extracted or OCR failed.'}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ── Raw Patient Responses ─────────────────────────── */}
                <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <SectionHeader color="#6B7280" label="RESPONSES" title="Raw Patient Responses" icon={AlertCircle} />
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                          <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: '0.8125rem', width: '50%' }}>Question</th>
                          <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontWeight: 600, color: '#6B7280', fontSize: '0.8125rem', width: '50%' }}>Patient Answer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientRecord.responses?.map((r, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '0.875rem 1.25rem', color: '#4B5563', fontWeight: 500, verticalAlign: 'top' }}>{r.question}</td>
                            <td style={{ padding: '0.875rem 1.25rem', color: '#111827', verticalAlign: 'top' }}>{r.answer}</td>
                          </tr>
                        ))}
                        {(!patientRecord.responses || patientRecord.responses.length === 0) && (
                          <tr>
                            <td colSpan={2} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>No responses recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default DoctorDashboard;
