// src/pages/patient/Confirmation.jsx
import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, ArrowRight, Home } from 'lucide-react';
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
  const [count, setCount] = useState(0);
  const [queuePos] = useState(Math.floor(Math.random() * 4));

  // Animated count for queue number
  useEffect(() => {
    const timer = setTimeout(() => setCount(queuePos + 2), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleNewPatient = () => {
    reset();
    navigate('/');
  };

  const queuePosition = language === 'hi' ? QUEUE_POSITIONS_HI[queuePos] : QUEUE_POSITIONS_EN[queuePos];
  const estWait = (queuePos + 2) * 8; // Rough estimate in minutes

  return (
    <PatientLayout showProgress={false} showBack={false} currentStep={6}>
      <div className="text-center space-y-6 py-6">
        {/* Success animation */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
            <CheckCircle size={56} className="text-[var(--color-success)]" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping opacity-30" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)]">
            {t('confirmation.title')}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            {t('confirmation.subtitle')}
          </p>
        </div>

        {/* Patient ID card */}
        <div className="card p-5 mx-auto max-w-xs">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">{t('confirmation.patientId')}</p>
          <p className="text-2xl font-bold text-[#2563EB] tracking-wider">{patientId || 'MK-DEMO'}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            {registration.name || (language === 'hi' ? 'रोगी' : 'Patient')}
          </p>
        </div>

        {/* Queue info */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs text-[var(--color-text-muted)]">
                {language === 'hi' ? 'कतार में स्थिति' : 'Queue Position'}
              </p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{queuePosition}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-muted)]">
                {language === 'hi' ? 'अनुमानित प्रतीक्षा' : 'Est. Wait'}
              </p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">{estWait} min</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <Clock size={16} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              {t('confirmation.message')}
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div className="card p-5 text-left space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {language === 'hi' ? 'आगे क्या होगा?' : "What happens next?"}
          </h3>
          {[
            {
              step: '1',
              text: language === 'hi'
                ? 'हमारा AI आपकी जानकारी का विश्लेषण करेगा।'
                : 'Our AI will analyze your information.',
            },
            {
              step: '2',
              text: language === 'hi'
                ? 'एक नैदानिक सारांश तैयार किया जाएगा।'
                : 'A clinical summary will be prepared.',
            },
            {
              step: '3',
              text: language === 'hi'
                ? 'आपका डॉक्टर समीक्षा करेगा और आपको बुलाएगा।'
                : 'Your doctor will review and call you.',
            },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">{text}</p>
            </div>
          ))}
        </div>

        {/* New patient button */}
        <Button
          id="btn-confirmation-home"
          variant="ghost"
          size="md"
          icon={Home}
          onClick={handleNewPatient}
          className="w-full"
        >
          {language === 'hi' ? 'नया रोगी' : 'Start for Another Patient'}
        </Button>
      </div>
    </PatientLayout>
  );
}
