// src/pages/patient/Confirmation.jsx
import React, { useEffect, useState } from 'react';
import { Check, Clock, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PatientLayout } from '../../layouts/PatientLayout';
import { Button } from '../../components/ui/Button';
import { usePatient } from '../../context/PatientContext';
import { useTranslation } from '../../hooks/useTranslation';

const QUEUE_POSITIONS_EN = ['3rd', '4th', '2nd', '5th'];
const QUEUE_POSITIONS_HI = ['3री', '4थी', '2री', '5वीं'];

export default function Confirmation() {
  const navigate = useNavigate();
  const { patientId, registration, language, reset } = usePatient();
  const { t } = useTranslation();
  const [queuePos] = useState(Math.floor(Math.random() * 4));

  const handleNewPatient = () => {
    reset();
    navigate('/');
  };

  const queuePosition = language === 'hi' ? QUEUE_POSITIONS_HI[queuePos] : QUEUE_POSITIONS_EN[queuePos];
  const estWait = (queuePos + 2) * 8;

  return (
    <PatientLayout showProgress={false} showBack={false} currentStep={6}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '1rem' }}>

        {/* Success icon */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-accent-light)',
            border: '2px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Check size={32} color="#167765" strokeWidth={2.5} />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 style={{
            fontSize: '1.375rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '0.5rem',
          }}>
            {t('confirmation.title')}
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            {t('confirmation.subtitle')}
          </p>
        </div>

        {/* Reference number */}
        <div style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          maxWidth: 320,
          margin: '0 auto',
          width: '100%',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            {t('confirmation.patientId')}
          </p>
          <p style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>
            {patientId || 'MK-DEMO'}
          </p>
          {registration?.name && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
              {registration.name}
            </p>
          )}
        </div>

        {/* Queue info */}
        <div style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {language === 'hi' ? 'कतार में स्थिति' : 'Queue position'}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                {queuePosition}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {language === 'hi' ? 'अनुमानित प्रतीक्षा' : 'Est. wait time'}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                {estWait} min
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.75rem',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}>
            <Clock size={14} color="var(--color-text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {t('confirmation.message')}
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          textAlign: 'left',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.875rem' }}>
            {language === 'hi' ? 'आगे क्या होगा?' : 'What happens next?'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              language === 'hi' ? 'AI आपकी जानकारी का विश्लेषण करेगा।' : 'Your information will be reviewed.',
              language === 'hi' ? 'एक नैदानिक सारांश तैयार किया जाएगा।' : 'A clinical summary will be prepared.',
              language === 'hi' ? 'आपका डॉक्टर आपको बुलाएगा।' : 'Your doctor will call you shortly.',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--color-accent-light)',
                  border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)',
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, paddingTop: 2 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <Button
          id="btn-confirmation-home"
          variant="secondary"
          size="lg"
          icon={Home}
          onClick={handleNewPatient}
          style={{ width: '100%' }}
        >
          {language === 'hi' ? 'नया रोगी' : 'Start for another patient'}
        </Button>
      </div>
    </PatientLayout>
  );
}
