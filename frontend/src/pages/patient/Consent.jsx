// src/pages/patient/Consent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Volume2, VolumeX, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { PatientLayout } from '../../layouts/PatientLayout';
import { Button } from '../../components/ui/Button';
import { usePatient } from '../../context/PatientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useVoice } from '../../hooks/useVoice';

export default function Consent() {
  const navigate = useNavigate();
  const { acceptConsent, language } = usePatient();
  const { t } = useTranslation();
  const { speak, stopSpeaking, isSpeaking } = useVoice(language);
  const [checkedItems, setCheckedItems] = useState([]);

  const points = t('consent.points');
  const allChecked = Array.isArray(points) && checkedItems.length === points.length;

  const toggleCheck = (i) => {
    setCheckedItems(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleListen = () => {
    if (isSpeaking) { stopSpeaking(); return; }
    if (Array.isArray(points)) {
      speak(points.join('. '));
    }
  };

  const handleAgree = () => {
    acceptConsent();
    navigate('/patient/registration');
  };

  return (
    <PatientLayout showProgress currentStep={2}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

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
            Step 2 of 6
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
            {t('consent.title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('consent.subtitle')}
          </p>
        </div>

        {/* Audio toggle */}
        <div>
          <button
            id="btn-consent-listen"
            onClick={handleListen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: isSpeaking ? 'var(--color-accent-light)' : 'white',
              color: isSpeaking ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {isSpeaking ? 'Stop' : t('consent.listen')}
          </button>
        </div>

        {/* Consent items */}
        <div style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}>
          {Array.isArray(points) && points.map((point, i) => {
            const checked = checkedItems.includes(i);
            return (
              <button
                key={i}
                id={`consent-item-${i}`}
                onClick={() => toggleCheck(i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  padding: '1rem 1.125rem',
                  textAlign: 'left',
                  background: checked ? 'var(--color-accent-light)' : 'transparent',
                  border: 'none',
                  borderBottom: i < points.length - 1 ? '1px solid var(--color-border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: checked ? 'none' : '1.5px solid var(--color-border)',
                  background: checked ? '#167765' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                  transition: 'all 0.15s',
                }}>
                  {checked && <Check size={13} color="white" strokeWidth={2.5} />}
                </div>
                <span style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: checked ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}>
                  {point}
                </span>
              </button>
            );
          })}
        </div>

        {/* Warning if partially checked */}
        {!allChecked && checkedItems.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            padding: '0.875rem 1rem',
            background: '#FEF9EC',
            border: '1px solid #F5D78A',
            borderRadius: 'var(--radius-md)',
          }}>
            <AlertTriangle size={16} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.8125rem', color: '#78350F' }}>
              {language === 'hi'
                ? 'आगे बढ़ने के लिए सभी बिंदुओं को स्वीकार करें।'
                : 'Please acknowledge all points before continuing.'}
            </p>
          </div>
        )}

        {/* Acknowledge all link */}
        {!allChecked && (
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              color: 'var(--color-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              fontFamily: 'Inter, sans-serif',
              padding: 0,
            }}
            onClick={() => setCheckedItems(Array.isArray(points) ? points.map((_, i) => i) : [])}
          >
            {language === 'hi' ? 'सभी को स्वीकार करें' : 'Acknowledge all'}
          </button>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            id="btn-consent-back"
            variant="secondary"
            size="lg"
            icon={ArrowLeft}
            onClick={() => navigate('/patient/welcome')}
            style={{ flexShrink: 0 }}
          >
            {t('consent.back')}
          </Button>
          <Button
            id="btn-consent-agree"
            variant="primary"
            size="lg"
            style={{ flex: 1 }}
            disabled={!allChecked}
            onClick={handleAgree}
          >
            {t('consent.agree')}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </PatientLayout>
  );
}
