// src/pages/patient/Registration.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Calendar, ArrowRight, UserPlus, UserCheck } from 'lucide-react';
import { PatientLayout } from '../../layouts/PatientLayout';
import { Button } from '../../components/ui/Button';
import { usePatient } from '../../context/PatientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { patientAPI, consentAPI } from '../../services/api';

const GENDERS_EN = ['Male', 'Female', 'Other', 'Prefer not to say'];
const GENDERS_HI = ['पुरुष', 'महिला', 'अन्य', 'बताना नहीं चाहते'];

export default function Registration() {
  const navigate = useNavigate();
  const { setRegistration, setPatientType, patientType, language, setPatientId } = usePatient();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: '', age: '', gender: '', phone: '', abhaId: '', preferredLanguage: language,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const genders = language === 'hi' ? GENDERS_HI : GENDERS_EN;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = language === 'hi' ? 'नाम आवश्यक है' : 'Name is required';
    if (!form.age || isNaN(form.age) || +form.age < 1 || +form.age > 120)
      errs.age = language === 'hi' ? 'सही आयु दर्ज करें' : 'Enter a valid age (1-120)';
    if (!form.gender) errs.gender = language === 'hi' ? 'लिंग चुनें' : 'Please select gender';
    if (!form.phone || !/^\d{10}$/.test(form.phone))
      errs.phone = language === 'hi' ? '10 अंकों का फोन नंबर दर्ज करें' : 'Enter a valid 10-digit phone number';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    try {
      // 1. Create Patient
      const { data } = await patientAPI.create(form);
      const { patient, token } = data;

      // 2. Save token
      localStorage.setItem('mk_patient_token', token);

      // 3. Post Consent (collected in the previous step)
      await consentAPI.create({
        patientId: patient._id,
        accepted: true,
        type: 'general_intake',
        version: '1.0'
      });

      // 4. Update context
      setRegistration(patient);
      setPatientId(patient._id);

      navigate('/patient/interview');
    } catch (err) {
      setErrors({ phone: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const field = (label, id, icon, input) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
        {label}
      </label>
      <div className={`
        flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 bg-white transition-all duration-150 touch-target
        ${errors[id] ? 'border-[var(--color-danger)] focus-within:border-[var(--color-danger)]' : 'border-[var(--color-border)] focus-within:border-[#2563EB]'}
      `}>
        <div className="text-[var(--color-text-muted)] flex-shrink-0">
          {React.createElement(icon, { size: 20 })}
        </div>
        <div className="flex-1 w-full relative">
          {input}
        </div>
      </div>
      {errors[id] && <p className="mt-1.5 text-xs text-[var(--color-danger)] font-medium">{errors[id]}</p>}
    </div>
  );

  const inputClass = (id) => `
    w-full bg-transparent text-[var(--color-text-primary)] text-base outline-none
  `;

  return (
    <PatientLayout showProgress currentStep={3}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{t('registration.title')}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.375rem', fontSize: '1rem' }}>{t('registration.subtitle')}</p>
        </div>

        {/* Patient type toggle */}
        <div style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: '0.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.375rem',
        }}>
          {[
            { type: 'new',      icon: UserPlus,  label: t('registration.newPatient') },
            { type: 'existing', icon: UserCheck, label: t('registration.existingPatient') },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              id={`patient-type-${type}`}
              onClick={() => setPatientType(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                background: patientType === type ? '#2563EB' : 'transparent',
                color: patientType === type ? 'white' : 'var(--color-text-secondary)',
                boxShadow: patientType === type ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
              }}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Name */}
          {field(t('registration.name'), 'name', User,
            <input
              id="name"
              type="text"
              className={inputClass('name')}
              value={form.name}
              onChange={e => { setForm(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name: ''})); }}
              placeholder={language === 'hi' ? 'अपना पूरा नाम लिखें' : 'Enter your full name'}
              autoComplete="name"
            />
          )}

          {/* Age + Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                {t('registration.age')}
              </label>
              <div className={`
                flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 bg-white transition-all duration-150 touch-target
                ${errors.age ? 'border-[var(--color-danger)] focus-within:border-[var(--color-danger)]' : 'border-[var(--color-border)] focus-within:border-[#2563EB]'}
              `}>
                <div className="text-[var(--color-text-muted)] flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <input
                  id="age"
                  type="number"
                  min="1" max="120"
                  className="w-full bg-transparent text-[var(--color-text-primary)] text-base outline-none"
                  value={form.age}
                  onChange={e => { setForm(p => ({...p, age: e.target.value})); setErrors(p => ({...p, age: ''})); }}
                  placeholder={language === 'hi' ? 'आयु' : 'Age'}
                />
              </div>
              {errors.age && <p className="mt-1.5 text-xs text-[var(--color-danger)] font-medium">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                {t('registration.gender')}
              </label>
              <select
                id="gender"
                className={`w-full px-4 py-3.5 rounded-xl border-2 bg-white text-[var(--color-text-primary)] text-base outline-none touch-target min-h-[56px] md:min-h-[64px] ${errors.gender ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)] focus:border-[#2563EB]'}`}
                value={form.gender}
                onChange={e => { setForm(p => ({...p, gender: e.target.value})); setErrors(p => ({...p, gender: ''})); }}
              >
                <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.gender && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.gender}</p>}
            </div>
          </div>

          {/* Phone */}
          {field(t('registration.phone'), 'phone', Phone,
            <input
              id="phone"
              type="tel"
              className={inputClass('phone')}
              value={form.phone}
              onChange={e => { setForm(p => ({...p, phone: e.target.value.replace(/\D/g,'')})); setErrors(p => ({...p, phone: ''})); }}
              placeholder={language === 'hi' ? '10 अंकों का फोन नंबर' : '10-digit mobile number'}
              maxLength={10}
            />
          )}

          {/* ABHA ID (optional) */}
          {patientType === 'existing' && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                {t('registration.abhaId')}
              </label>
              <input
                id="abhaId"
                type="text"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-[var(--color-border)] focus:border-[#2563EB] bg-white text-[var(--color-text-primary)] text-base outline-none touch-target"
                value={form.abhaId}
                onChange={e => setForm(p => ({...p, abhaId: e.target.value}))}
                placeholder="XX-XXXX-XXXX-XXXX"
              />
            </div>
          )}

          <Button
            id="btn-registration-continue"
            type="submit"
            variant="gradient"
            size="xl"
            loading={loading}
            className="w-full mt-2"
          >
            {t('registration.next')}
            {!loading && <ArrowRight size={20} />}
          </Button>
        </form>
      </div>
    </PatientLayout>
  );
}
