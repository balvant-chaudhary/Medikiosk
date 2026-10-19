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

/* Shared input field styles */
const inputStyle = (hasError) => ({
  width: '100%',
  padding: '0.6875rem 0.875rem',
  border: `1px solid ${hasError ? '#DC2626' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-md)',
  background: 'white',
  color: 'var(--color-text-primary)',
  fontSize: '0.9375rem',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  minHeight: 48,
});

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
      const { data } = await patientAPI.create(form);
      const { patient, token } = data;
      localStorage.setItem('mk_patient_token', token);
      await consentAPI.create({
        patientId: patient._id,
        accepted: true,
        type: 'general_intake',
        version: '1.0'
      });
      setRegistration(patient);
      setPatientId(patient._id);
      navigate('/patient/interview');
    } catch (err) {
      setErrors({ phone: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (id) => ({
    outline: 'none',
    borderColor: errors[id] ? '#DC2626' : 'var(--color-primary)',
    boxShadow: errors[id] ? 'none' : '0 0 0 2px rgba(22, 119, 101, 0.1)',
  });

  return (
    <PatientLayout showProgress currentStep={3}>
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
            Step 3 of 6
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
            {t('registration.title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('registration.subtitle')}
          </p>
        </div>

        {/* Patient type toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
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
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${patientType === type ? 'var(--color-primary)' : 'var(--color-border)'}`,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.15s ease',
                background: patientType === type ? 'var(--color-accent-light)' : 'white',
                color: patientType === type ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.125rem',
        }}>

          {/* Full Name */}
          <div>
            <label htmlFor="name" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
              {t('registration.name')}
            </label>
            <input
              id="name"
              type="text"
              style={inputStyle(errors.name)}
              value={form.name}
              onChange={e => { setForm(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name: ''})); }}
              placeholder={language === 'hi' ? 'अपना पूरा नाम लिखें' : 'Enter your full name'}
              autoComplete="name"
              onFocus={e => Object.assign(e.target.style, focusStyle('name'))}
              onBlur={e => { e.target.style.borderColor = errors.name ? '#DC2626' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.name && <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#DC2626' }}>{errors.name}</p>}
          </div>

          {/* Age + Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label htmlFor="age" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
                {t('registration.age')}
              </label>
              <input
                id="age"
                type="number"
                min="1" max="120"
                style={inputStyle(errors.age)}
                value={form.age}
                onChange={e => { setForm(p => ({...p, age: e.target.value})); setErrors(p => ({...p, age: ''})); }}
                placeholder={language === 'hi' ? 'आयु' : 'Age'}
                onFocus={e => Object.assign(e.target.style, focusStyle('age'))}
                onBlur={e => { e.target.style.borderColor = errors.age ? '#DC2626' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.age && <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#DC2626' }}>{errors.age}</p>}
            </div>

            <div>
              <label htmlFor="gender" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
                {t('registration.gender')}
              </label>
              <select
                id="gender"
                style={{ ...inputStyle(errors.gender), cursor: 'pointer' }}
                value={form.gender}
                onChange={e => { setForm(p => ({...p, gender: e.target.value})); setErrors(p => ({...p, gender: ''})); }}
                onFocus={e => Object.assign(e.target.style, focusStyle('gender'))}
                onBlur={e => { e.target.style.borderColor = errors.gender ? '#DC2626' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.gender && <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#DC2626' }}>{errors.gender}</p>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
              {t('registration.phone')}
            </label>
            <input
              id="phone"
              type="tel"
              style={inputStyle(errors.phone)}
              value={form.phone}
              onChange={e => { setForm(p => ({...p, phone: e.target.value.replace(/\D/g,'')})); setErrors(p => ({...p, phone: ''})); }}
              placeholder={language === 'hi' ? '10 अंकों का फोन नंबर' : '10-digit mobile number'}
              maxLength={10}
              onFocus={e => Object.assign(e.target.style, focusStyle('phone'))}
              onBlur={e => { e.target.style.borderColor = errors.phone ? '#DC2626' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.phone && <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#DC2626' }}>{errors.phone}</p>}
          </div>

          {/* ABHA ID (optional, existing patients) */}
          {patientType === 'existing' && (
            <div>
              <label htmlFor="abhaId" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
                {t('registration.abhaId')}
              </label>
              <input
                id="abhaId"
                type="text"
                style={inputStyle(false)}
                value={form.abhaId}
                onChange={e => setForm(p => ({...p, abhaId: e.target.value}))}
                placeholder="XX-XXXX-XXXX-XXXX"
                onFocus={e => Object.assign(e.target.style, focusStyle('abhaId'))}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          )}

          <Button
            id="btn-registration-continue"
            type="submit"
            variant="primary"
            size="xl"
            loading={loading}
            style={{ width: '100%', marginTop: '0.25rem' }}
          >
            {t('registration.next')}
            {!loading && <ArrowRight size={16} />}
          </Button>
        </form>
      </div>
    </PatientLayout>
  );
}
