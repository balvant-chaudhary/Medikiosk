// src/context/PatientContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const PatientContext = createContext(null);

const initialState = {
  language: 'en',
  consentAccepted: false,
  consentTimestamp: null,
  patientType: 'new', // 'new' | 'existing'
  registration: {
    name: '',
    age: '',
    gender: '',
    phone: '',
    abhaId: '',
    preferredLanguage: 'en',
  },
  interview: {
    sessionId: null,
    chiefComplaint: '',
    responses: [], // [{question, answer, timestamp}]
    extractedData: {
      symptoms: [],
      duration: '',
      severity: '',
      history: [],
      medications: [],
      allergies: [],
    },
  },
  documents: [], // [{id, name, type, url, status}]
  redFlags: [],  // [{level, reason, action}]
  summary: null, // AI-generated summary object
  patientId: null,
  step: 0,
};

export function PatientProvider({ children }) {
  const [state, setState] = useState(initialState);

  const setLanguage = useCallback((lang) => {
    setState(prev => ({ ...prev, language: lang }));
  }, []);

  const acceptConsent = useCallback(() => {
    setState(prev => ({
      ...prev,
      consentAccepted: true,
      consentTimestamp: new Date().toISOString(),
    }));
  }, []);

  const setPatientType = useCallback((type) => {
    setState(prev => ({ ...prev, patientType: type }));
  }, []);

  const setRegistration = useCallback((data) => {
    setState(prev => ({
      ...prev,
      registration: { ...prev.registration, ...data },
    }));
  }, []);

  const setInterviewSessionId = useCallback((sessionId) => {
    setState(prev => ({
      ...prev,
      interview: { ...prev.interview, sessionId },
    }));
  }, []);

  const addInterviewResponse = useCallback((question, answer) => {
    setState(prev => ({
      ...prev,
      interview: {
        ...prev.interview,
        responses: [
          ...prev.interview.responses,
          { question, answer, timestamp: new Date().toISOString() },
        ],
      },
    }));
  }, []);

  const setChiefComplaint = useCallback((complaint) => {
    setState(prev => ({
      ...prev,
      interview: {
        ...prev.interview,
        chiefComplaint: complaint,
      },
    }));
  }, []);

  const setExtractedData = useCallback((data) => {
    setState(prev => ({
      ...prev,
      interview: {
        ...prev.interview,
        extractedData: { ...prev.interview.extractedData, ...data },
      },
    }));
  }, []);

  const addDocument = useCallback((doc) => {
    setState(prev => ({
      ...prev,
      documents: [...prev.documents, doc],
    }));
  }, []);

  const removeDocument = useCallback((id) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id),
    }));
  }, []);

  const setRedFlags = useCallback((flags) => {
    setState(prev => ({ ...prev, redFlags: flags }));
  }, []);

  const setSummary = useCallback((summary) => {
    setState(prev => ({ ...prev, summary }));
  }, []);

  const setPatientId = useCallback((id) => {
    setState(prev => ({ ...prev, patientId: id }));
  }, []);

  const setStep = useCallback((step) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <PatientContext.Provider value={{
      ...state,
      setLanguage,
      acceptConsent,
      setPatientType,
      setRegistration,
      setInterviewSessionId,
      addInterviewResponse,
      setChiefComplaint,
      setExtractedData,
      addDocument,
      removeDocument,
      setRedFlags,
      setSummary,
      setPatientId,
      setStep,
      reset,
    }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used inside PatientProvider');
  return ctx;
}

export default PatientContext;
