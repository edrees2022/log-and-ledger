import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, rtlLanguages } from '../lib/i18n';
import '../lib/i18n'; // Initialize i18n

export interface Language {
  code: string;
  name: string;
  direction: string;
}

interface TranslationContextType {
  currentLanguage: Language;
  changeLanguage: (languageCode: string) => void;
  t: (key: string, options?: any) => string;
  isRTL: boolean;
  availableLanguages: Language[];
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Get current language from i18n or default to English
    const currentLang = i18n.language || 'en';
    return languages.find(lang => lang.code === currentLang) || languages[0];
  });

  // Check if current language is RTL
  const isRTL = rtlLanguages.includes(currentLanguage.code);

  const changeLanguage = async (languageCode: string) => {
    try {
      const selectedLanguage = languages.find(lang => lang.code === languageCode);
      if (!selectedLanguage) {
        console.warn(`Language ${languageCode} not found`);
        return;
      }

      // Change language in i18n
      await i18n.changeLanguage(languageCode);
      
      // Update local state
      setCurrentLanguage(selectedLanguage);
      
      // Set document direction for RTL languages
      document.documentElement.dir = selectedLanguage.direction;
      document.documentElement.lang = languageCode;
      
      // Store in localStorage for persistence
      localStorage.setItem('log-ledger-language', languageCode);
      
      console.log('Language changed to:', languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Initialize document direction and language on mount
  useEffect(() => {
    document.documentElement.dir = currentLanguage.direction;
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  // Listen for i18n language changes (for cases where language is changed elsewhere)
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const newLanguage = languages.find(lang => lang.code === lng);
      if (newLanguage && newLanguage.code !== currentLanguage.code) {
        setCurrentLanguage(newLanguage);
        document.documentElement.dir = newLanguage.direction;
        document.documentElement.lang = lng;
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n, currentLanguage.code]);

  const value: TranslationContextType = {
    currentLanguage,
    changeLanguage,
    t,
    isRTL,
    availableLanguages: languages,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};