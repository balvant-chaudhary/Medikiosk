// src/pages/patient/Review.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Edit3, ArrowRight, User, Clock, FileText, Pill, AlertTriangle, FileCheck } from 'lucide-react';
import { PatientLayout } from '../../layouts/PatientLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { usePatient } from '../../context/PatientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { patientAPI, interviewAPI } from '../../services/api';

function ReviewSection({ icon: Icon, title, children, color = '#2563EB' }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <h3 className="font-semibold text-[var(--color-text-primary)] text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Review() {
  const navigate = useNavigate();
  const { documents, language, patientId, interview: ctxInterview } = usePatient();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  
  // Real backend data
  const [patientData, setPatientData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!patientId || !ctxInterview.sessionId) {
        setError('Missing session data');
        setLoading(false);
        return;
      }
      try {
        const [pRes, iRes] = await Promise.all([
          patientAPI.getById(patientId),
          interviewAPI.getById(ctxInterview.sessionId)
        ]);
        setPatientData(pRes.data.patient);
        setInterviewData(iRes.data.interview);
      } catch (err) {
        setError('Failed to load visit summary from backend.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [patientId, ctxInterview.sessionId]);

  const chiefComplaint = interviewData?.chiefComplaint
    || interviewData?.responses?.[0]?.answer
    || (language === 'hi' ? 'दर्ज नहीं किया गया' : 'Not recorded');

  const handleConfirm = () => {
    // In Phase 8, submission is just moving to confirmation since
    // data is already progressively saved.
    navigate('/patient/confirmation');
  };

  if (loading) {
    return (
      <PatientLayout showProgress currentStep={6}>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--color-text-secondary)]">Loading summary from server...</p>
        </div>
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout showProgress currentStep={6}>
        <div className="card p-6 text-center text-red-600 bg-red-50">
          <AlertTriangle size={32} className="mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </PatientLayout>
    );
  }

  const SECTIONS = [
    {
      icon: User,
      title: language === 'hi' ? 'रोगी विवरण' : 'Patient Details',
      color: '#2563EB',
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: language === 'hi' ? 'नाम' : 'Name',   val: patientData.name   || '—' },
            { label: language === 'hi' ? 'आयु' : 'Age',    val: patientData.age    || '—' },
            { label: language === 'hi' ? 'लिंग' : 'Gender', val: patientData.gender || '—' },
            { label: language === 'hi' ? 'फोन' : 'Phone',  val: patientData.phone  || '—' },
          ].map(({ label, val }) => (
            <div key={label}>
              <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: AlertTriangle,
      title: t('review.chiefComplaint'),
      color: '#EF4444',
      content: <p className="text-sm text-[var(--color-text-primary)] font-medium">{chiefComplaint}</p>,
    },
    {
      icon: Clock,
      title: language === 'hi' ? 'साक्षात्कार प्रतिक्रियाएं' : 'Interview Responses',
      color: '#06B6D4',
      content: (
        <div className="space-y-2">
          {(!interviewData?.responses || interviewData.responses.length === 0)
            ? <p className="text-sm text-[var(--color-text-muted)]">{language === 'hi' ? 'कोई प्रतिक्रिया नहीं' : 'No responses recorded'}</p>
            : interviewData.responses.map((r, i) => (
              <div key={i} className="bg-[var(--color-surface-2)] rounded-xl px-4 py-3">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">{r.question}</p>
                <p className="text-sm text-[var(--color-text-primary)] font-medium">{r.answer}</p>
              </div>
            ))
          }
        </div>
      ),
    },
    {
      icon: FileText,
      title: t('review.documents'),
      color: '#10B981',
      content: (
        documents.length === 0
          ? <p className="text-sm text-[var(--color-text-muted)]">{language === 'hi' ? 'कोई दस्तावेज़ नहीं' : 'No documents uploaded'}</p>
          : <div className="space-y-1.5">
              {documents.map(d => (
                <div key={d.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={14} className="text-[var(--color-success)]" />
                  <span className="text-[var(--color-text-primary)] truncate">{d.name}</span>
                  <Badge variant="muted" className="ml-auto">{d.type}</Badge>
                </div>
              ))}
            </div>
      ),
    },
  ];

  return (
    <PatientLayout showProgress currentStep={6}>
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 mb-4 shadow-lg shadow-emerald-500/10">
            <FileCheck size={32} className="text-[var(--color-success)]" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">{t('review.title')}</h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-base">{t('review.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECTIONS.map(({ icon, title, color, content }) => (
            <ReviewSection key={title} icon={icon} title={title} color={color}>
              {content}
            </ReviewSection>
          ))}
        </div>

        {/* AI disclaimer */}
        <div className="flex items-start gap-3 p-5 bg-blue-50 border border-blue-100 rounded-xl">
          <AlertTriangle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 leading-relaxed font-medium">
            {language === 'hi'
              ? 'यह जानकारी आपके डॉक्टर के साथ साझा की जाएगी। AI एक सहायक सारांश तैयार करेगा। आपका डॉक्टर सभी नैदानिक निर्णय लेता है।'
              : 'This information will be shared with your doctor. An AI-assisted summary will be generated as a draft. Your doctor makes all clinical decisions.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            id="btn-review-edit"
            variant="secondary"
            size="lg"
            icon={Edit3}
            onClick={() => navigate('/patient/interview')}
          >
            {t('review.edit')}
          </Button>
          <Button
            id="btn-review-confirm"
            variant="gradient"
            size="lg"
            loading={submitting}
            className="flex-1"
            onClick={handleConfirm}
          >
            {t('review.confirm')}
            {!submitting && <ArrowRight size={18} />}
          </Button>
        </div>
      </div>
    </PatientLayout>
  );
}
