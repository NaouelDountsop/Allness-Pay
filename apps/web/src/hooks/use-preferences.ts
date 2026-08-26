import { useState, useCallback, useEffect } from 'react';
import i18n from '@/i18n';

type Language = 'fr' | 'en';
type Theme = 'light' | 'dark';

const LANG_LABELS: Record<Language, string> = { fr: 'FR', en: 'EN' };

interface PreferencesState {
  language: Language;
  theme: Theme;
  themeAuto: boolean;
}

const STORAGE_KEY = 'afrilinkpay-preferences';

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function loadPreferences(): PreferencesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const language = parsed.language === 'en' ? 'en' : 'fr';
      const themeAuto = parsed.themeAuto !== false;

      if (parsed.theme === 'light' || parsed.theme === 'dark') {
        return { language, theme: parsed.theme, themeAuto };
      }
      return { language, theme: getSystemTheme(), themeAuto: true };
    }
  } catch {
    // ignore
  }
  return { language: 'fr', theme: getSystemTheme(), themeAuto: true };
}

function savePreferences(state: PreferencesState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<PreferencesState>(loadPreferences);

  useEffect(() => {
    savePreferences(prefs);

    if (prefs.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (i18n.language !== prefs.language) {
      i18n.changeLanguage(prefs.language);
    }
  }, [prefs]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setPrefs((prev) => {
        if (prev.themeAuto) {
          return { ...prev, theme: e.matches ? 'dark' : 'light' };
        }
        return prev;
      });
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleLanguage = useCallback(() => {
    setPrefs((prev) => ({
      ...prev,
      language: prev.language === 'fr' ? 'en' : 'fr',
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
      themeAuto: false,
    }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setPrefs((prev) => ({ ...prev, language: lang }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setPrefs((prev) => ({ ...prev, theme, themeAuto: false }));
  }, []);

  return {
    language: prefs.language,
    theme: prefs.theme,
    themeAuto: prefs.themeAuto,
    langLabel: LANG_LABELS[prefs.language],
    toggleLanguage,
    toggleTheme,
    setLanguage,
    setTheme,
  };
}
