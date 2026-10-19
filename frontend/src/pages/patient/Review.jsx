// src/pages/patient/Review.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Edit3, ArrowRight, User, Clock, FileText, AlertTriangle, FileCheck } from 'lucide-react';
import { PatientLayout } from '../../layouts/PatientLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { usePatient } from '../../context/PatientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { patientAPI, interviewAPI } from '../../services/api';

function ReviewSection({ title, children, onEdit }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.125rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface-2)',
      }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {title}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              padding: '0.25rem',
            }}
          >
            <Edit3 size={12} />
            Edit
          </button>
        )}
      </div>
      {/* Content */}
      <div style={{ padding: '1rem 1.125rem' }}>
        {children}
      </div>
    </div>
  );
}

export default function Review() {
  const navigate = useNavigate();
  const { documents, language, patientId, interview: ctxInterview } = usePatient();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
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
    navigate('/patient/confirmation');
  };

  if (loading) {
    return (
      <PatientLayout showProgress currentStep={6}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
          <div style={{
            width: 28, height: 28,
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1.2s linear infinite',
            marginBottom: '1rem',
          }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading summary...</p>
        </div>
      </PatientLayout>
    );
  }

  if (error) {
    return (
      <PatientLayout showProgress currentStep={6}>
        <div style={{
          padding: '1.5rem',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}>
          <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ color: '#7F1D1D', fontSize: '0.875rem' }}>{error}</p>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout showProgress currentStep={6}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Header */}
        <div>
          <p style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}>
            Step 6 of 6
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
            {t('review.title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('review.subtitle')}
          </p>
        </div>

        {/* Patient Details */}
        <ReviewSection
          title={language === 'hi' ? 'रोगी विवरण' : 'Personal information'}
          onEdit={() => navigate('/patient/registration')}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            {[
              { label: language === 'hi' ? 'नाम' : 'Name',   val: patientData?.name   || '—' },
              { label: language === 'hi' ? 'आयु' : 'Age',    val: patientData?.age    || '—' },
              { label: language === 'hi' ? 'लिंग' : 'Gender', val: patientData?.gender || '—' },
              { label: language === 'hi' ? 'फोन' : 'Phone',  val: patientData?.phone  || '—' },
            ].map(({ label, val }) => (
              <div key={label}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--color-text-primary)', marginTop: 2 }}>{val}</p>
              </div>
            ))}
          </div>
        </ReviewSection>

        {/* Chief Complaint */}
        <ReviewSection title={language === 'hi' ? 'मुख्य समस्या' : 'Chief complaint'}>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{chiefComplaint}</p>
        </ReviewSection>

        {/* Interview */}
        <ReviewSection
          title={language === 'hi' ? 'साक्षात्कार' : 'Interview responses'}
          onEdit={() => navigate('/patient/interview')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {(!interviewData?.responses || interviewData.responses.length === 0)
              ? <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {language === 'hi' ? 'कोई प्रतिक्रिया नहीं' : 'No responses recorded'}
                </p>
              : interviewData.responses.map((r, i) => (
                <div key={i} style={{ paddingBottom: '0.625rem', borderBottom: i < interviewData.responses.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 3 }}>{r.question}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{r.answer}</p>
                </div>
              ))
            }
          </div>
        </ReviewSection>

        {/* Documents */}
        <ReviewSection
          title={language === 'hi' ? 'दस्तावेज़' : 'Documents'}
          onEdit={() => navigate('/patient/documents')}
        >
          {documents.length === 0
            ? <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {language === 'hi' ? 'कोई दस्तावेज़ नहीं' : 'No documents uploaded'}
              </p>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {documents.map(d => (
                  <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <CheckCircle2 size={14} color="var(--color-primary)" />
                    <span style={{ color: 'var(--color-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                    <Badge variant="muted">{d.type}</Badge>
                  </div>
                ))}
              </div>
          }
        </ReviewSection>

        {/* Disclaimer */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.625rem',
          padding: '0.875rem 1rem',
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <AlertTriangle size={15} color="var(--color-text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {language === 'hi'
              ? 'यह जानकारी आपके डॉक्टर के साथ साझा की जाएगी। आपका डॉक्टर सभी नैदानिक निर्णय लेता है।'
              : 'This information will be shared with your doctor. Your doctor makes all clinical decisions.'}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            id="btn-review-edit"
            variant="secondary"
            size="lg"
            onClick={() => navigate('/patient/interview')}
          >
            {t('review.edit')}
          </Button>
          <Button
            id="btn-review-confirm"
            variant="primary"
            size="lg"
            loading={submitting}
            style={{ flex: 1 }}
            onClick={handleConfirm}
          >
            {t('review.confirm')}
            {!submitting && <ArrowRight size={16} />}
          </Button>
        </div>
      </div>
    </PatientLayout>
  );
}
