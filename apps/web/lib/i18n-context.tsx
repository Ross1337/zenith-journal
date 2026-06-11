'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Lang, type TKey, translations } from './i18n';

type I18nCtx = { lang: Lang; t: (key: TKey) => string; toggle: () => void };
const I18nContext = createContext<I18nCtx>({ lang: 'fr', t: (k) => k, toggle: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');
  const toggle = useCallback(() => setLang((l) => (l === 'fr' ? 'en' : 'fr')), []);
  const t = useCallback((key: TKey): string => translations[lang][key], [lang]);
  return <I18nContext.Provider value={{ lang, t, toggle }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }
export function useT() { return useContext(I18nContext).t; }
