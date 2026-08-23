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

  // Initialize Interview Session & Fetch Next Question
  useEffect(() => {
    async function initSession() {
      if (patientId) {
        try {
          // If we already have a session, we can just fetch next,
          // but create() handles finding 'in-progress' robustly and returns responses
          const { data } = await interviewAPI.create({ patientId, language });
          const session = data.interview;
          setInterviewSessionId(session._id);
          
          // Hydrate past answers for resume functionality
          if (session.responses) {
            setAnswered(session.responses.map(r => ({ q: r.question, a: r.answer })));
          }

          // Fetch the next question
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

  // Speak question aloud when it changes
  useEffect(() => {
    if (currentQ && !loadingQuestion) {
      setTimeout(() => speak(currentQ.text), 500);
    }
  }, [currentQ, loadingQuestion]);

  // Sync STT transcript to text input
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
      
      // Reset inputs
      setTextInput('');
      setSelectedOptions([]);
      setScaleValue(null);
      clearTranscript();

      // Get next
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
    ? ['😊 हल्का', '😐 मध्यम', '😣 गंभीर', '😫 बहुत गंभीर']
    : ['😊 Mild', '😐 Moderate', '😣 Severe', '😫 Very Severe'];

  return (
    <PatientLayout showProgress currentStep={4}>
      <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{t('interview.title')}</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">{t('interview.subtitle')}</p>
        </div>

        {/* Conversation history */}
        {answered.length > 0 && (
          <div className="card p-4 md:p-6 max-h-64 md:max-h-96 overflow-y-auto space-y-4">
            {answered.map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                    AI
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] px-3 py-2 rounded-xl rounded-tl-none">{item.q}</p>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <p className="text-xs text-white bg-[#2563EB] px-3 py-2 rounded-xl rounded-tr-none max-w-[80%] whitespace-pre-wrap">{item.a}</p>
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-slate-600">
                    P
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* Loading State */}
        {loadingQuestion && (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-[#2563EB]" size={32} />
          </div>
        )}

        {/* Current question card */}
        {!loadingQuestion && currentQ && (
          <>
            <div className="card p-5 border-l-4 border-[#2563EB] shadow-md shadow-blue-500/5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                <div className="flex-1">
                  <p className="text-[var(--color-text-primary)] font-medium leading-relaxed">
                    {currentQ.text}
                  </p>
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speak(currentQ.text)}
                    className="mt-2 text-xs text-[var(--color-text-muted)] hover:text-[#2563EB] flex items-center gap-1 transition-colors"
                  >
                    {isSpeaking ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
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

            {/* Answer area by type */}
            {currentQ.type === 'scale' && (
              <div className="card p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {SEVERITY_LABELS.map((label, i) => (
                    <button
                      key={i}
                      id={`severity-${i+1}`}
                      onClick={() => { setScaleValue((i+1)*2.5); handleSubmitAnswer(`${label} (${Math.round((i+1)*2.5)}/10)`); }}
                      className={`py-4 rounded-xl text-sm font-semibold touch-target border-2 transition-all duration-150 ${
                        scaleValue === (i+1)*2.5
                          ? 'bg-[#2563EB] border-[#2563EB] text-white scale-105'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#2563EB] hover:text-[#2563EB]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentQ.type === 'yesno' && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: language === 'hi' ? 'हाँ' : 'Yes', emoji: '✅' },
                  { val: language === 'hi' ? 'नहीं' : 'No',  emoji: '❌' },
                ].map(({ val, emoji }) => (
                  <button
                    key={val}
                    id={`yesno-${val}`}
                    onClick={() => handleSubmitAnswer(val)}
                    className="py-5 rounded-xl flex flex-col items-center gap-2 text-base font-bold touch-target border-2 border-[var(--color-border)] hover:border-[#2563EB] hover:bg-blue-50 transition-all duration-150"
                  >
                    <span className="text-3xl">{emoji}</span>
                    {val}
                  </button>
                ))}
              </div>
            )}

            {currentQ.type === 'multi' && (
              <div className="card p-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[...(currentQ.options || []), language === 'hi' ? 'इनमें से कोई नहीं' : 'None of them']
                    .filter((opt, index, self) => self.indexOf(opt) === index)
                    .map(opt => (
                    <button
                      key={opt}
                      id={`opt-${opt}`}
                      onClick={() => toggleOption(opt)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-150 touch-target ${
                        selectedOptions.includes(opt)
                          ? 'bg-[#2563EB] border-[#2563EB] text-white'
                          : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[#2563EB]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={selectedOptions.length === 0 || isSubmitting}
                  onClick={() => handleSubmitAnswer(selectedOptions.join(', '))}
                >
                  {language === 'hi' ? 'जारी रखें' : 'Continue'}
                  <ChevronRight size={18} />
                </Button>
              </div>
            )}

            {(currentQ.type === 'open' || !currentQ.type) && (
              <div className="card p-4 space-y-3">
                {/* Voice button */}
                {isSupported ? (
                  <button
                    id="btn-voice-toggle"
                    onClick={isListening ? stopListening : startListening}
                    className={`
                      w-full py-4 rounded-xl flex flex-col items-center gap-2
                      touch-target border-2 font-semibold transition-all duration-200
                      ${isListening
                        ? 'bg-[#EF4444] border-[#EF4444] text-white animate-pulse'
                        : 'border-[#2563EB] text-[#2563EB] hover:bg-blue-50'
                      }
                    `}
                  >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    {isListening ? t('interview.speaking') : t('interview.speak')}
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-gray-50 flex items-center justify-center text-sm text-[var(--color-text-muted)] gap-2 border border-gray-200">
                    <AlertCircle size={16} />
                    {language === 'hi' ? 'ध्वनि इनपुट अनुपलब्ध है। कृपया टाइप करें।' : 'Voice input is unavailable. You can type your answer.'}
                  </div>
                )}

                {/* Text input */}
                <div className="relative">
                  <textarea
                    id="interview-text-input"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder={t('interview.orType')}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--color-border)] focus:border-[#2563EB] bg-white text-[var(--color-text-primary)] text-base resize-none outline-none transition-colors"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && textInput.trim()) {
                        e.preventDefault();
                        handleSubmitAnswer();
                      }
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSubmitAnswer(language === 'hi' ? 'छोड़ें' : 'Skip')}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors disabled:opacity-50"
                  >
                    {t('interview.skip')}
                  </button>
                  <Button
                    id="btn-interview-next"
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={!textInput.trim() || isSubmitting}
                    onClick={() => handleSubmitAnswer()}
                  >
                    {t('interview.next')}
                    <Send size={16} />
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
