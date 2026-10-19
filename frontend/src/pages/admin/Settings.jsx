// src/pages/admin/Settings.jsx
import React, { useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout';
import {
  Building2, Mic, Brain, ShieldCheck, Bell, Palette,
  Globe, Database, Check, AlertTriangle, Info
} from 'lucide-react';

/* ── Reusable toggle ── */
function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24,
        borderRadius: 999,
        background: value ? '#167765' : '#D1D5DB',
        border: 'none', cursor: 'pointer',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        background: 'white',
        position: 'absolute',
        top: 3,
        left: value ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

/* ── Section wrapper ── */
function SettingSection({ icon: Icon, title, desc, children }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #E5E7EB', background: '#F9F9F8', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: '#EAF4F1', border: '1px solid #A7D9CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color="#167765" />
        </div>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1C1C1E' }}>{title}</h3>
          {desc && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 1 }}>{desc}</p>}
        </div>
      </div>
      <div style={{ padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Row: label + control ── */
function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1C1C1E' }}>{label}</p>
        {desc && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 2 }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

/* ── Separator ── */
function Sep() {
  return <div style={{ height: 1, background: '#F0F0EE', margin: '0 -1.25rem' }} />;
}

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  // Hospital info
  const [hospitalName, setHospitalName]     = useState('City General Hospital');
  const [hospitalCity, setHospitalCity]     = useState('New Delhi');
  const [hospitalPhone, setHospitalPhone]   = useState('011-23456789');
  const [kioskCount, setKioskCount]         = useState('4');

  // AI / interview
  const [voiceEnabled, setVoiceEnabled]     = useState(true);
  const [hindiEnabled, setHindiEnabled]     = useState(true);
  const [englishEnabled, setEnglishEnabled] = useState(true);
  const [aiSummary, setAiSummary]           = useState(true);
  const [ocrEnabled, setOcrEnabled]         = useState(true);
  const [autoAdvance, setAutoAdvance]       = useState(true);

  // Privacy
  const [encryptData, setEncryptData]       = useState(true);
  const [auditLogs, setAuditLogs]           = useState(true);
  const [dataRetention, setDataRetention]   = useState('90');

  // Notifications
  const [notifyPending, setNotifyPending]   = useState(true);
  const [notifyNewPt, setNotifyNewPt]       = useState(true);
  const [notifyFailed, setNotifyFailed]     = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputStyle = {
    padding: '0.5rem 0.75rem', border: '1px solid #E5E7EB', borderRadius: 6,
    fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#1C1C1E',
    background: 'white', outline: 'none', minWidth: 200,
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1C1C1E' }}>System Settings</h1>
          <p style={{ fontSize: '0.875rem', color: '#5A5A5A', marginTop: 2 }}>Configure the MediKiosk clinic environment</p>
        </div>
        <button
          onClick={handleSave}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5625rem 1.25rem', borderRadius: 6, border: 'none',
            background: saved ? '#0F9D8F' : '#167765', color: 'white',
            fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.2s',
          }}
        >
          {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.75rem 1rem', marginBottom: '1rem',
          background: '#D1F0E8', border: '1px solid #A7D9CC', borderRadius: 6,
          fontSize: '0.875rem', color: '#0F4C38', fontWeight: 500,
        }}>
          <Check size={15} /> Settings saved successfully!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Hospital Info */}
        <SettingSection icon={Building2} title="Hospital Information" desc="Basic clinic identity shown on patient screens">
          <SettingRow label="Hospital Name" desc="Displayed on kiosk welcome screen">
            <input value={hospitalName} onChange={e => setHospitalName(e.target.value)} style={inputStyle} />
          </SettingRow>
          <Sep />
          <SettingRow label="City / Location" desc="Helps patients confirm correct clinic">
            <input value={hospitalCity} onChange={e => setHospitalCity(e.target.value)} style={inputStyle} />
          </SettingRow>
          <Sep />
          <SettingRow label="Contact Number" desc="Helpdesk number shown on kiosk footer">
            <input value={hospitalPhone} onChange={e => setHospitalPhone(e.target.value)} style={inputStyle} />
          </SettingRow>
          <Sep />
          <SettingRow label="Active Kiosk Count" desc="Number of patient intake terminals deployed">
            <select value={kioskCount} onChange={e => setKioskCount(e.target.value)} style={selectStyle}>
              {['1','2','3','4','5','6','8','10'].map(n => <option key={n}>{n}</option>)}
            </select>
          </SettingRow>
        </SettingSection>

        {/* AI & Interview */}
        <SettingSection icon={Mic} title="AI & Interview Configuration" desc="Control voice, language, and AI summary generation">
          <SettingRow label="Voice Input (Speech-to-Text)" desc="Allow patients to answer by speaking">
            <Toggle value={voiceEnabled} onChange={setVoiceEnabled} />
          </SettingRow>
          <Sep />
          <SettingRow label="Hindi Language Support" desc="Enable Hindi voice + text for patient intake">
            <Toggle value={hindiEnabled} onChange={setHindiEnabled} />
          </SettingRow>
          <Sep />
          <SettingRow label="English Language Support" desc="Enable English language for patient intake">
            <Toggle value={englishEnabled} onChange={setEnglishEnabled} />
          </SettingRow>
          <Sep />
          <SettingRow label="AI Clinical Summary" desc="Auto-generate AI summary for doctor review">
            <Toggle value={aiSummary} onChange={setAiSummary} />
          </SettingRow>
          <Sep />
          <SettingRow label="OCR Document Scanning" desc="Extract text from uploaded medical documents">
            <Toggle value={ocrEnabled} onChange={setOcrEnabled} />
          </SettingRow>
          <Sep />
          <SettingRow label="Auto-advance Interview" desc="Automatically move to next question after answer">
            <Toggle value={autoAdvance} onChange={setAutoAdvance} />
          </SettingRow>
          <Sep />
          <SettingRow label="AI Model" desc="Large language model used for clinical summarization">
            <select style={selectStyle} defaultValue="gemini-1.5-pro">
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
            </select>
          </SettingRow>
        </SettingSection>

        {/* Privacy & Security */}
        <SettingSection icon={ShieldCheck} title="Privacy & Security" desc="Patient data protection and compliance controls">
          <SettingRow label="End-to-End Data Encryption" desc="All patient data encrypted at rest and in transit (AES-256)">
            <Toggle value={encryptData} onChange={setEncryptData} />
          </SettingRow>
          <Sep />
          <SettingRow label="Audit Logs" desc="Track all admin and doctor actions for compliance">
            <Toggle value={auditLogs} onChange={setAuditLogs} />
          </SettingRow>
          <Sep />
          <SettingRow label="Data Retention Period" desc="How long patient records are kept (days)">
            <select value={dataRetention} onChange={e => setDataRetention(e.target.value)} style={selectStyle}>
              {['30','60','90','180','365'].map(n => <option key={n}>{n} days</option>)}
            </select>
          </SettingRow>
          <Sep />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.75rem', background: '#EAF4F1', border: '1px solid #A7D9CC', borderRadius: 6 }}>
            <Info size={14} color="#167765" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.8125rem', color: '#0F4C38', lineHeight: 1.5 }}>
              MediKiosk is HIPAA-aligned. All patient data is encrypted at rest with AES-256 and in transit via TLS 1.3. Doctors only access their own assigned patients.
            </p>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection icon={Bell} title="Doctor Notifications" desc="Alert doctors when new patient events occur">
          <SettingRow label="Notify on Pending Review" desc="Alert doctor when a patient's AI summary is ready">
            <Toggle value={notifyPending} onChange={setNotifyPending} />
          </SettingRow>
          <Sep />
          <SettingRow label="Notify on New Registration" desc="Alert when a new patient registers at kiosk">
            <Toggle value={notifyNewPt} onChange={setNotifyNewPt} />
          </SettingRow>
          <Sep />
          <SettingRow label="Notify on OCR Failure" desc="Alert admin when document processing fails">
            <Toggle value={notifyFailed} onChange={setNotifyFailed} />
          </SettingRow>
        </SettingSection>

        {/* System Status */}
        <SettingSection icon={Database} title="System Status" desc="Live status of all MediKiosk services">
          {[
            { service: 'Patient Intake API',        status: 'Operational', uptime: '99.97%'  },
            { service: 'AI Interview Engine',        status: 'Operational', uptime: '99.91%'  },
            { service: 'OCR Document Processor',     status: 'Operational', uptime: '99.85%'  },
            { service: 'Speech-to-Text (Google)',    status: 'Operational', uptime: '99.99%'  },
            { service: 'MongoDB Atlas',              status: 'Operational', uptime: '100.00%' },
            { service: 'Gemini AI (Summarization)',  status: 'Operational', uptime: '99.93%'  },
          ].map(({ service, status, uptime }) => (
            <React.Fragment key={service}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#167765', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.875rem', color: '#374151' }}>{service}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Uptime: <strong style={{ color: '#167765' }}>{uptime}</strong></span>
                  <span style={{ background: '#D1F0E8', color: '#0F4C38', fontSize: '0.6875rem', fontWeight: 600, padding: '0.2rem 0.625rem', borderRadius: 999 }}>
                    {status}
                  </span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </SettingSection>

        {/* Danger zone */}
        <div style={{ background: 'white', border: '1px solid #FECACA', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #FECACA', background: '#FEF2F2', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <AlertTriangle size={15} color="#DC2626" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#7F1D1D' }}>Danger Zone</h3>
          </div>
          <div style={{ padding: '1.125rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SettingRow label="Reset Today's Queue" desc="Clears all pending patient assignments for today">
              <button style={{ padding: '0.4375rem 1rem', border: '1px solid #FECACA', borderRadius: 6, background: 'white', color: '#DC2626', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Reset Queue
              </button>
            </SettingRow>
            <div style={{ height: 1, background: '#FEE2E2' }} />
            <SettingRow label="Export All Data" desc="Download a full encrypted backup of all patient records">
              <button style={{ padding: '0.4375rem 1rem', border: '1px solid #FECACA', borderRadius: 6, background: 'white', color: '#DC2626', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Export Backup
              </button>
            </SettingRow>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
