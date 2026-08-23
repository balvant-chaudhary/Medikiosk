// src/pages/doctor/PatientDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, FileText, Mic, Clock,
  CheckCircle2, XCircle, Edit3, Save, Plus, User,
  ChevronDown, ChevronUp, ExternalLink, Download,
  Stethoscope, Activity, Pill
} from 'lucide-react';
import { DoctorLayout } from '../../layouts/DoctorLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

// ── Mock data (Phase 15 replaces with real API) ──
const MOCK_PATIENT = {
  id: 'p001',
  name: 'Rahul Kumar',
  age: 45, gender: 'Male',
  phone: '9876543210',
  language: 'Hindi',
  abhaId: 'XX-1234-5678-ABCD',
  priority: 'high',
  waitingSince: '09:12 AM',
  chiefComplaint: 'Chest pain for 2 days',
  redFlags: [
    { level: 'high', reason: 'Chest pain with breathlessness', action: 'Priority clinician review recommended.' },
  ],
  interview: [
    { q: 'What brings you to the hospital today?',       a: 'मुझे दो दिन से सीने में दर्द है' },
    { q: 'How long have you been experiencing this?',    a: '2 दिन से' },
    { q: 'How severe is the discomfort?',                a: 'Severe (7/10)' },
    { q: 'Do you have any associated symptoms?',        a: 'Breathlessness, mild sweating' },
    { q: 'Do you have any known medical conditions?',   a: 'Hypertension (diagnosed 3 years ago)' },
    { q: 'Are you taking any medications?',             a: 'Amlodipine 5mg once daily' },
    { q: 'Any known allergies?',                        a: 'None reported' },
    { q: 'Previous hospital admission for this issue?', a: 'No' },
  ],
  documents: [
    { id: 'd1', name: 'Blood_Report_2025.pdf', type: 'Lab Report',   status: 'processed', extracted: true },
    { id: 'd2', name: 'Prescription_Apr.jpg',  type: 'Prescription', status: 'processed', extracted: true },
  ],
  timeline: [
    { year: 2023, event: 'Diagnosed with Hypertension', type: 'condition' },
    { year: 2024, event: 'Blood Report — Hb: 12.4 g/dL, BP: 148/92', type: 'report' },
    { year: 2025, event: 'Prescription — Amlodipine 5mg', type: 'prescription' },
    { year: 2026, event: 'Current Visit — Chest Pain', type: 'current' },
  ],
  extractedData: {
    investigations: [
      { name: 'Haemoglobin', value: '12.4', unit: 'g/dL', status: 'normal' },
      { name: 'WBC',          value: '8200',  unit: '/µL',  status: 'normal' },
      { name: 'Blood Pressure', value: '148/92', unit: 'mmHg', status: 'high' },
      { name: 'Blood Glucose', value: '102',  unit: 'mg/dL', status: 'normal' },
    ],
  },
  aiSummary: {
    status: 'draft',
    chiefComplaint: 'Chest pain for 2 days.',
    hpi: 'Patient reports intermittent chest pain for 2 days with associated breathlessness and mild diaphoresis. Pain is moderate-to-severe in intensity (7/10). No fever, no nausea or vomiting reported.',
    pastHistory: 'Hypertension (diagnosed 2023).',
    medications: 'Amlodipine 5 mg once daily.',
    allergies: 'No known drug allergies.',
    investigations: 'Previous Hb 12.4 g/dL (2024); BP 148/92 mmHg on previous visit.',
    assessment: 'AI GENERATED DRAFT — Requires clinician review. Potential cardiovascular etiology not ruled out.',
  },
};

function CollapsibleSection({ title, icon: Icon, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[var(--color-surface-2)] transition-colors"
      >
        <Icon size={18} className="text-[#2563EB] flex-shrink-0" />
        <span className="font-semibold text-[var(--color-text-primary)] flex-1 text-left">{title}</span>
        {badge}
        {open ? <ChevronUp size={16} className="text-[var(--color-text-muted)]" /> : <ChevronDown size={16} className="text-[var(--color-text-muted)]" />}
      </button>
      {open && (
        <div className="border-t border-[var(--color-border)] px-5 py-4 animate-fadeInUp">
          {children}
        </div>
      )}
    </div>
  );
}

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = MOCK_PATIENT; // Phase 15: fetch from API by id

  const [summaryText, setSummaryText] = useState(JSON.stringify(patient.aiSummary, null, 2));
  const [summaryStatus, setSummaryStatus] = useState('draft'); // draft | confirmed | rejected
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [docModal, setDocModal] = useState(null);

  const handleConfirm = () => {
    setSummaryStatus('confirmed');
    setEditing(false);
  };

  const handleReject = () => {
    setSummaryStatus('rejected');
    setEditing(false);
  };

  const handleSaveNotes = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  const STATUS_CONFIG = {
    draft:     { badge: 'warning', label: 'AI Draft — Pending Review' },
    confirmed: { badge: 'success', label: 'Doctor Confirmed'           },
    rejected:  { badge: 'danger',  label: 'AI Summary Rejected'        },
  };

  return (
    <DoctorLayout>
      {/* Back + header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[#2563EB] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Queue
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#F97316] flex items-center justify-center text-white font-bold text-lg">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{patient.name}</h1>
              <p className="text-[var(--color-text-secondary)] text-sm">
                {patient.age} yrs · {patient.gender} · {patient.language} · Waiting since {patient.waitingSince}
              </p>
            </div>
          </div>
          <Badge variant="danger" dot>HIGH PRIORITY</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Red Flags */}
          {patient.redFlags.length > 0 && (
            <div className="card border-l-4 border-[#EF4444] p-5 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle size={22} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#EF4444] text-sm">⚠️ POTENTIAL RED FLAG DETECTED</p>
                  <p className="text-[#EF4444]/80 text-xs mt-0.5 font-medium">
                    AI Screening — Clinician review recommended. This is NOT a diagnosis.
                  </p>
                  {patient.redFlags.map((f, i) => (
                    <div key={i} className="mt-3">
                      <p className="text-sm text-[var(--color-text-primary)] font-medium">{f.reason}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{f.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Clinical Summary */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <Stethoscope size={18} className="text-[#2563EB]" />
                <span className="font-bold text-[var(--color-text-primary)]">Clinical Summary</span>
                <Badge variant="ai">AI Generated</Badge>
              </div>
              <Badge variant={STATUS_CONFIG[summaryStatus].badge}>
                {STATUS_CONFIG[summaryStatus].label}
              </Badge>
            </div>

            <div className="p-5">
              {editing ? (
                <textarea
                  className="w-full h-64 p-4 rounded-xl border-2 border-[#2563EB] bg-white font-mono text-sm outline-none resize-none"
                  value={summaryText}
                  onChange={e => setSummaryText(e.target.value)}
                />
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Chief Complaint', val: patient.aiSummary.chiefComplaint },
                    { label: 'History of Present Illness', val: patient.aiSummary.hpi },
                    { label: 'Past Medical History', val: patient.aiSummary.pastHistory },
                    { label: 'Current Medications', val: patient.aiSummary.medications },
                    { label: 'Allergies', val: patient.aiSummary.allergies },
                    { label: 'Previous Investigations', val: patient.aiSummary.investigations },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-[var(--color-surface-2)] rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-sm text-[var(--color-text-primary)]">{val}</p>
                    </div>
                  ))}
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{patient.aiSummary.assessment}</p>
                  </div>
                </div>
              )}
            </div>

            {summaryStatus !== 'confirmed' && (
              <div className="border-t border-[var(--color-border)] px-5 py-4 flex flex-wrap gap-2">
                {editing ? (
                  <>
                    <Button id="btn-save-edit" variant="primary" size="sm" icon={Save} onClick={() => setEditing(false)}>
                      Save Changes
                    </Button>
                    <Button id="btn-cancel-edit" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button id="btn-edit-summary" variant="secondary" size="sm" icon={Edit3} onClick={() => setEditing(true)}>
                      Edit
                    </Button>
                    <Button id="btn-confirm-summary" variant="success" size="sm" icon={CheckCircle2} onClick={handleConfirm}>
                      Confirm Summary
                    </Button>
                    <Button id="btn-reject-summary" variant="danger" size="sm" icon={XCircle} onClick={handleReject}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            )}

            {summaryStatus === 'confirmed' && (
              <div className="border-t border-[var(--color-border)] px-5 py-3 bg-emerald-50">
                <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium">
                  <CheckCircle2 size={16} />
                  Summary confirmed by doctor
                </div>
              </div>
            )}
          </div>

          {/* Interview Transcript */}
          <CollapsibleSection title="Interview Transcript" icon={Mic}>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {patient.interview.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">A</div>
                    <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] px-3 py-2 rounded-xl rounded-tl-none">{item.q}</p>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <p className="text-xs text-white bg-[#2563EB] px-3 py-2 rounded-xl rounded-tr-none max-w-[85%]">{item.a}</p>
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">P</div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* OCR Extracted Data */}
          <CollapsibleSection title="Extracted Investigations" icon={Activity}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Test</th>
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Value</th>
                    <th className="text-left py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.extractedData.investigations.map((inv, i) => (
                    <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="py-3 pr-4 font-medium text-[var(--color-text-primary)]">{inv.name}</td>
                      <td className="py-3 pr-4 text-[var(--color-text-secondary)]">{inv.value} {inv.unit}</td>
                      <td className="py-3">
                        <Badge variant={inv.status === 'high' ? 'danger' : inv.status === 'low' ? 'warning' : 'success'}>
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-[var(--color-text-muted)] mt-3">
                ⚠ OCR-extracted data. Verify against original documents.
              </p>
            </div>
          </CollapsibleSection>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Patient info */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-[#2563EB]" />
              <span className="font-semibold text-sm text-[var(--color-text-primary)]">Patient Info</span>
            </div>
            {[
              { label: 'Phone',    val: patient.phone    },
              { label: 'ABHA ID',  val: patient.abhaId   },
              { label: 'Language', val: patient.language  },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">{label}</span>
                <span className="text-[var(--color-text-primary)] font-medium">{val}</span>
              </div>
            ))}
          </div>

          {/* Medical Timeline */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-[#2563EB]" />
              <span className="font-semibold text-sm text-[var(--color-text-primary)]">Medical Timeline</span>
            </div>
            <div className="relative pl-5">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--color-border)]" />
              {patient.timeline.map((item, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  <div className={`absolute -left-3 w-3 h-3 rounded-full border-2 border-white ${
                    item.type === 'current'      ? 'bg-[#2563EB]' :
                    item.type === 'condition'   ? 'bg-[#EF4444]' :
                    item.type === 'report'      ? 'bg-[#06B6D4]' :
                    'bg-[#10B981]'
                  }`} />
                  <p className="text-xs font-bold text-[var(--color-text-muted)]">{item.year}</p>
                  <p className="text-xs text-[var(--color-text-primary)] mt-0.5">{item.event}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-[#2563EB]" />
              <span className="font-semibold text-sm text-[var(--color-text-primary)]">Documents</span>
            </div>
            <div className="space-y-2">
              {patient.documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)]">
                  <FileText size={16} className="text-[#2563EB] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{doc.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{doc.type}</p>
                  </div>
                  <button
                    id={`view-doc-${doc.id}`}
                    onClick={() => setDocModal(doc)}
                    className="text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Notes */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Plus size={16} className="text-[#2563EB]" />
              <span className="font-semibold text-sm text-[var(--color-text-primary)]">Doctor Notes</span>
            </div>
            <textarea
              id="doctor-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add clinical notes here..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-[var(--color-border)] focus:border-[#2563EB] bg-white text-sm text-[var(--color-text-primary)] resize-none outline-none transition-colors"
            />
            <Button
              id="btn-save-notes"
              variant={noteSaved ? 'success' : 'secondary'}
              size="sm"
              icon={noteSaved ? CheckCircle2 : Save}
              className="w-full mt-2"
              onClick={handleSaveNotes}
            >
              {noteSaved ? 'Saved!' : 'Save Notes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Doc viewer modal */}
      <Modal
        isOpen={!!docModal}
        onClose={() => setDocModal(null)}
        title={docModal?.name}
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-[var(--color-surface-2)] rounded-xl border border-[var(--color-border)]">
            <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Extracted Information</p>
            <p className="text-xs text-[var(--color-text-muted)]">OCR processing complete. Data extracted and verified.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Download}>Download Original</Button>
          </div>
        </div>
      </Modal>
    </DoctorLayout>
  );
}
