"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  type Language,
} from "./language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const FALLBACK_CONTEXT: LanguageContextValue = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {
    // Safe no-op when a component is rendered outside the provider (for
    // example in server-rendered unit tests).
  },
};

export function safeReadLanguage(): Language | null {
  try {
    return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Persist the selected language without making storage a hard requirement. */
export function persistLanguage(language: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizeLanguage(language));
  } catch {
    // Private browsing or blocked storage: the in-memory choice still works.
  }
}

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback((next: Language) => {
    const normalized = normalizeLanguage(next);
    setLanguageState(normalized);
    persistLanguage(normalized);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) setLanguageState(normalizeLanguage(stored));
    } catch {
      // Use English when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language === "hi" ? "hi" : "en";
    root.dataset.language = language;
    document.title =
      language === "hi"
        ? "सतर्क AI — सतर्क रहें. सुरक्षित रहें."
        : "Satark AI — Stay Alert. Stay Protected.";
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext) ?? FALLBACK_CONTEXT;
}
