// src/pages/patient/Consent.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, Volume2, VolumeX, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
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
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] shadow-lg mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {t('consent.title')}
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 text-sm">
            {t('consent.subtitle')}
          </p>
        </div>

        {/* Audio button */}
        <div className="flex justify-center">
          <button
            id="btn-consent-listen"
            onClick={handleListen}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
              border-2 transition-all duration-200
              ${isSpeaking
                ? 'bg-[#06B6D4] border-[#06B6D4] text-white'
                : 'bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#2563EB] hover:text-[#2563EB]'
              }
            `}
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {isSpeaking ? 'Stop' : t('consent.listen')}
          </button>
        </div>

        {/* Consent points */}
        <div className="card p-0 overflow-hidden">
          {Array.isArray(points) && points.map((point, i) => (
            <button
              key={i}
              id={`consent-item-${i}`}
              onClick={() => toggleCheck(i)}
              className={`
                w-full flex items-start gap-4 px-5 py-4 text-left transition-all duration-150
                border-b border-[var(--color-border)] last:border-b-0
                ${checkedItems.includes(i)
                  ? 'bg-blue-50/60'
                  : 'hover:bg-[var(--color-surface-2)]'
                }
              `}
            >
              <CheckCircle2
                size={22}
                className={`flex-shrink-0 mt-0.5 transition-colors ${
                  checkedItems.includes(i)
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--color-border)]'
                }`}
              />
              <span className={`text-sm leading-relaxed ${
                checkedItems.includes(i)
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}>
                {point}
              </span>
            </button>
          ))}
        </div>

        {/* Warning if not all checked */}
        {!allChecked && checkedItems.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-sm">
              {language === 'hi'
                ? 'आगे बढ़ने के लिए सभी बिंदुओं को स्वीकार करें।'
                : 'Please acknowledge all points before continuing.'}
            </p>
          </div>
        )}

        {/* Select all helper */}
        {!allChecked && (
          <button
            className="w-full text-sm text-[var(--color-primary)] underline-offset-2 hover:underline"
            onClick={() => setCheckedItems(Array.isArray(points) ? points.map((_, i) => i) : [])}
          >
            {language === 'hi' ? 'सभी को स्वीकार करें' : 'Acknowledge all'}
          </button>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            id="btn-consent-back"
            variant="ghost"
            size="lg"
            icon={ArrowLeft}
            onClick={() => navigate('/patient/welcome')}
            className="flex-shrink-0"
          >
            {t('consent.back')}
          </Button>
          <Button
            id="btn-consent-agree"
            variant={allChecked ? 'gradient' : 'secondary'}
            size="lg"
            className="flex-1"
            disabled={!allChecked}
            onClick={handleAgree}
          >
            {t('consent.agree')}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </PatientLayout>
  );
}
