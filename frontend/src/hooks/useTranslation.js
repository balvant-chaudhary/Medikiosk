// src/hooks/useTranslation.js
import { usePatient } from '../context/PatientContext';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';

const translations = { en, hi };

export function useTranslation() {
  const { language } = usePatient();
  const t = translations[language] || translations.en;

  // Get nested key like 'welcome.title'
  const translate = (key) => {
    const parts = key.split('.');
    let result = t;
    for (const part of parts) {
      result = result?.[part];
      if (result === undefined) return key;
    }
    return result;
  };

  return { t: translate, lang: language };
}

export default useTranslation;
