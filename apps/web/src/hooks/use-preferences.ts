import { useState, useCallback, useEffect } from 'react';

type Language = 'fr' | 'en';
type Theme = 'light' | 'dark';

const LANG_LABELS: Record<Language, string> = { fr: 'FR', en: 'EN' };

interface PreferencesState {
  language: Language;
  theme: Theme;
}

const STORAGE_KEY = 'afrilinkpay-preferences';

function loadPreferences(): PreferencesState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.language === 'fr' || parsed.language === 'en') {
        if (parsed.theme === 'light' || parsed.theme === 'dark') {
          return { language: parsed.language, theme: parsed.theme };
        }
        return { language: parsed.language, theme: 'light' };
      }
      if (parsed.theme === 'light' || parsed.theme === 'dark') {
        return { language: 'fr', theme: parsed.theme };
      }
    }
  } catch {
    // ignore
  }
  return { language: 'fr', theme: 'light' };
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
  }, [prefs]);

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
    }));
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setPrefs((prev) => ({ ...prev, language: lang }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setPrefs((prev) => ({ ...prev, theme }));
  }, []);

  return {
    language: prefs.language,
    theme: prefs.theme,
    langLabel: LANG_LABELS[prefs.language],
    toggleLanguage,
    toggleTheme,
    setLanguage,
    setTheme,
  };
}
