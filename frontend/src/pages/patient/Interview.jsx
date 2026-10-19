// src/pages/patient/Interview.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, ChevronRight, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { PatientLayout } from '../../layouts/PatientLayout';
import { Button } from '../../components/ui/Button';
import { usePatient } from '../../context/PatientContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useVoice } from '../../hooks/useVoice';
import { interviewAPI } from '../../services/api';

export default function Interview() {
  const navigate = useNavigate();
  const { language, addInterviewResponse, setChiefComplaint, interview, setInterviewSessionId, patientId } = usePatient();
  const { t } = useTranslation();
  const { isListening, transcript, startListening, stopListening, speak, stopSpeaking, isSpeaking, isSupported, clearTranscript } = useVoice(language);

  const [currentQ, setCurrentQ] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [textInput, setTextInput] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [scaleValue, setScaleValue] = useState(null);
  const [answered, setAnswered] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    async function initSession() {
      if (patientId) {
        try {
          const { data } = await interviewAPI.create({ patientId, language });
          const session = data.interview;
          setInterviewSessionId(session._id);
          if (session.responses) {
            setAnswered(session.responses.map(r => ({ q: r.question, a: r.answer })));
          }
          fetchNextQuestion(session._id);
        } catch (err) {
          console.error('Failed to create/resume interview session', err);
          setLoadingQuestion(false);
        }
      }
    }
    initSession();
  }, [patientId, language, setInterviewSessionId]);

  const fetchNextQuestion = async (sessionId) => {
    setLoadingQuestion(true);
    try {
      const { data } = await interviewAPI.getNext(sessionId || interview.sessionId);
      if (data.isComplete) {
        await handleCompletion(sessionId || interview.sessionId);
      } else {
        setCurrentQ(data.question);
      }
    } catch (err) {
      console.error('Failed to fetch next question', err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleCompletion = async (sessionId) => {
    try {
      await interviewAPI.complete(sessionId);
    } catch (err) {
      console.error('Failed to complete session', err);
    }
    navigate('/patient/documents');
  };

  useEffect(() => {
    if (currentQ && !loadingQuestion) {
      setTimeout(() => speak(currentQ.text), 500);
    }
  }, [currentQ, loadingQuestion]);

  useEffect(() => {
    if (transcript) setTextInput(transcript);
  }, [transcript]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [answered, currentQ]);

  const getAnswer = () => {
    if (currentQ?.type === 'scale') return scaleValue ? `${scaleValue}/10` : '';
    if (currentQ?.type === 'multi') return selectedOptions.join(', ');
    if (currentQ?.type === 'yesno') return textInput;
    return textInput;
  };

  const handleSubmitAnswer = async (overrideAnswer) => {
    const answer = overrideAnswer ?? getAnswer();
    if (!answer || !answer.trim()) return;
    
    setIsSubmitting(true);
    try {
      const isFirst = answered.length === 0;
      await interviewAPI.answer(interview.sessionId, {
        questionId: currentQ.questionId,
        question: currentQ.text,
        answer: answer,
        ...(isFirst ? { chiefComplaint: answer } : {})
      });
      if (isFirst) setChiefComplaint(answer);
      addInterviewResponse(currentQ.text, answer);
      setAnswered(prev => [...prev, { q: currentQ.text, a: answer }]);
      setTextInput('');
      setSelectedOptions([]);
      setScaleValue(null);
      clearTranscript();
      await fetchNextQuestion(interview.sessionId);
    } catch (err) {
      console.error('Failed to save answer', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOption = (opt) => {
    const noneText = language === 'hi' ? 'इनमें से कोई नहीं' : 'None of them';
    if (opt === noneText) {
      setSelectedOptions(prev => prev.includes(noneText) ? [] : [noneText]);
      return;
    }
    setSelectedOptions(prev => {
      const filtered = prev.filter(o => o !== noneText);
      return filtered.includes(opt) ? filtered.filter(o => o !== opt) : [...filtered, opt];
    });
  };

  const SEVERITY_LABELS = language === 'hi'
    ? ['हल्का', 'मध्यम', 'गंभीर', 'बहुत गंभीर']
    : ['Mild', 'Moderate', 'Severe', 'Very Severe'];

  return (
    <PatientLayout showProgress currentStep={4}>
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
            Step 4 of 6
          </p>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
            {t('interview.title')}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {t('interview.subtitle')}
          </p>
        </div>

        {/* Conversation history */}
        {answered.length > 0 && (
          <div style={{
            background: 'white',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            maxHeight: 240,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}>
            {answered.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}>
                    Q
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{item.q}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', justifyContent: 'flex-end' }}>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: 'white',
                    background: '#167765',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '6px',
                    borderTopRightRadius: 2,
                    maxWidth: '80%',
                  }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Loading */}
        {loadingQuestion && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2 size={24} style={{ color: 'var(--color-primary)', animation: 'spin 1.2s linear infinite' }} />
          </div>
        )}

        {/* Current question */}
        {!loadingQuestion && currentQ && (
          <>
            {/* Question card */}
            <div style={{
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.125rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: 'var(--color-accent-light)',
                  border: '1px solid var(--color-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)',
                }}>
                  Q
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.6, fontSize: '0.9375rem' }}>
                    {currentQ.text}
                  </p>
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speak(currentQ.text)}
                    style={{
                      marginTop: '0.5rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {isSpeaking ? (
                      <>
                        <div style={{ width: 6, height: 6, background: '#DC2626', borderRadius: 2 }} />
                        {language === 'hi' ? 'रोकें' : 'Stop'}
                      </>
                    ) : (
                      <>
                        <Volume2 size={12} />
                        {language === 'hi' ? 'सुनें' : 'Listen'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Scale question */}
            {currentQ.type === 'scale' && (
              <div style={{
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.125rem',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  {SEVERITY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      id={`severity-${i+1}`}
                      onClick={() => { setScaleValue((i+1)*2.5); handleSubmitAnswer(`${label} (${Math.round((i+1)*2.5)}/10)`); }}
                      style={{
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: `1px solid ${scaleValue === (i+1)*2.5 ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: scaleValue === (i+1)*2.5 ? 'var(--color-accent-light)' : 'white',
                        color: scaleValue === (i+1)*2.5 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        transition: 'all 0.15s',
                        fontFamily: 'Inter, sans-serif',
                        minHeight: 52,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Yes/No question */}
            {currentQ.type === 'yesno' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {[
                  { val: language === 'hi' ? 'हाँ' : 'Yes' },
                  { val: language === 'hi' ? 'नहीं' : 'No' },
                ].map(({ val }) => (
                  <button
                    key={val}
                    id={`yesno-${val}`}
                    onClick={() => handleSubmitAnswer(val)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--color-border)',
                      background: 'white',
                      color: 'var(--color-text-primary)',
                      transition: 'all 0.15s',
                      fontFamily: 'Inter, sans-serif',
                      minHeight: 56,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                      e.currentTarget.style.background = 'var(--color-accent-light)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            )}

            {/* Multi-select question */}
            {currentQ.type === 'multi' && (
              <div style={{
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.125rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[...(currentQ.options || []), language === 'hi' ? 'इनमें से कोई नहीं' : 'None of them']
                    .filter((opt, index, self) => self.indexOf(opt) === index)
                    .map(opt => (
                    <button
                      key={opt}
                      id={`opt-${opt}`}
                      onClick={() => toggleOption(opt)}
                      style={{
                        padding: '0.4375rem 0.875rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: `1px solid ${selectedOptions.includes(opt) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: selectedOptions.includes(opt) ? 'var(--color-accent-light)' : 'white',
                        color: selectedOptions.includes(opt) ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        transition: 'all 0.15s',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="md"
                  style={{ width: '100%' }}
                  disabled={selectedOptions.length === 0 || isSubmitting}
                  onClick={() => handleSubmitAnswer(selectedOptions.join(', '))}
                >
                  {language === 'hi' ? 'जारी रखें' : 'Continue'}
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}

            {/* Open / text question */}
            {(currentQ.type === 'open' || !currentQ.type) && (
              <div style={{
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.125rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                {/* Voice button */}
                {isSupported ? (
                  <button
                    id="btn-voice-toggle"
                    onClick={isListening ? stopListening : startListening}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `1px solid ${isListening ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isListening ? 'var(--color-accent-light)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {/* Mic button circle */}
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isListening && (
                        <div style={{
                          position: 'absolute',
                          inset: -8,
                          borderRadius: '50%',
                          border: '2px solid var(--color-primary)',
                          opacity: 0,
                          animation: 'listening-pulse 1.5s ease-in-out infinite',
                        }} />
                      )}
                      <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: '50%',
                        background: isListening ? '#167765' : 'var(--color-surface-2)',
                        border: `1.5px solid ${isListening ? 'transparent' : 'var(--color-border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {isListening
                          ? <MicOff size={22} color="white" />
                          : <Mic size={22} color="var(--color-text-secondary)" />
                        }
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: isListening ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    }}>
                      {isListening ? t('interview.speaking') : t('interview.speak')}
                    </span>
                  </button>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-muted)',
                  }}>
                    <AlertCircle size={14} />
                    {language === 'hi' ? 'ध्वनि इनपुट अनुपलब्ध है। कृपया टाइप करें।' : 'Voice input is unavailable. You can type your answer.'}
                  </div>
                )}

                {/* Text input */}
                <textarea
                  id="interview-text-input"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={t('interview.orType')}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.875rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'white',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.9375rem',
                    fontFamily: 'Inter, sans-serif',
                    resize: 'none',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(22,119,101,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && textInput.trim()) {
                      e.preventDefault();
                      handleSubmitAnswer();
                    }
                  }}
                />

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleSubmitAnswer(language === 'hi' ? 'छोड़ें' : 'Skip')}
                    disabled={isSubmitting}
                    style={{
                      padding: '0.5rem 0.875rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {t('interview.skip')}
                  </button>
                  <Button
                    id="btn-interview-next"
                    variant="primary"
                    size="md"
                    style={{ flex: 1 }}
                    disabled={!textInput.trim() || isSubmitting}
                    onClick={() => handleSubmitAnswer()}
                  >
                    {t('interview.next')}
                    <Send size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PatientLayout>
  );
}
