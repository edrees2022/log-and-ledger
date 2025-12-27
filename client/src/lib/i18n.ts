import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all language files
import en from '../locales/en/translation.json';
import ar from '../locales/ar/translation.json';
import tl from '../locales/tl/translation.json';
import hi from '../locales/hi/translation.json';
import ur from '../locales/ur/translation.json';
import fr from '../locales/fr/translation.json';
import es from '../locales/es/translation.json';
import zh from '../locales/zh/translation.json';
import ru from '../locales/ru/translation.json';
import bn from '../locales/bn/translation.json';
import ms from '../locales/ms/translation.json';
import tr from '../locales/tr/translation.json';
import pt from '../locales/pt/translation.json';
import id from '../locales/id/translation.json';
import de from '../locales/de/translation.json';
import ko from '../locales/ko/translation.json';
import ja from '../locales/ja/translation.json';

// Language configuration
export const languages = [
  { code: "en", name: "English", direction: "ltr" },
  { code: "ar", name: "العربية", direction: "rtl" },
  { code: "fr", name: "Français", direction: "ltr" },
  { code: "es", name: "Español", direction: "ltr" },
  { code: "de", name: "Deutsch", direction: "ltr" },
  { code: "zh", name: "中文", direction: "ltr" },
  { code: "ja", name: "日本語", direction: "ltr" },
  { code: "ko", name: "한국어", direction: "ltr" },
  { code: "ru", name: "Русский", direction: "ltr" },
  { code: "hi", name: "हिन्दी", direction: "ltr" },
  { code: "ur", name: "اردو", direction: "rtl" },
  { code: "tl", name: "Tagalog", direction: "ltr" },
  { code: "bn", name: "বাংলা", direction: "ltr" },
  { code: "ms", name: "Bahasa Melayu", direction: "ltr" },
  { code: "tr", name: "Türkçe", direction: "ltr" },
  { code: "pt", name: "Português", direction: "ltr" },
  { code: "id", name: "Bahasa Indonesia", direction: "ltr" },
];

// RTL languages list
export const rtlLanguages = ['ar', 'ur'];

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
      ru: { translation: ru },
      hi: { translation: hi },
      ur: { translation: ur },
      tl: { translation: tl },
      bn: { translation: bn },
      ms: { translation: ms },
      tr: { translation: tr },
      pt: { translation: pt },
      id: { translation: id },
    },
    fallbackLng: 'en',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'log-ledger-language',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Key separator
    keySeparator: '.',
    nsSeparator: false,
  });

export default i18n;