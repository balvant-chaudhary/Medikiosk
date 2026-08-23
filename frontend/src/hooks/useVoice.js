// src/hooks/useVoice.js
import { useState, useRef, useCallback } from 'react';

// Web Speech API — browser-native STT/TTS (MVP)
// TODO Phase 11: swap speechService to use Bhashini API

const LANG_CODES = {
  en: 'en-IN',
  hi: 'hi-IN',
};

export function useVoice(lang = 'en') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = LANG_CODES[lang] || 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const t = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(t);
    };
    recognition.onerror = (e) => {
      setError(e.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript('');
    setError(null);
  }, [lang, isSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const utteranceRef = useRef(null);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance; // Prevent garbage collection
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang.includes('hi')) || voices[0];

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => setTranscript(''), []);

  return {
    isListening,
    transcript,
    isSpeaking,
    error,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
  };
}

export default useVoice;
