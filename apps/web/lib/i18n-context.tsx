'use client';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { type Lang, type TKey, translations } from './i18n';

type I18nCtx = { lang: Lang; t: (key: TKey) => string; toggle: () => void; setLang: (l: Lang) => void };
const I18nContext = createContext<I18nCtx>({
  lang: 'fr',
  t: (k) => k,
  toggle: () => {},
  setLang: () => {},
});

const STORAGE_KEY = 'zenith.lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  // Default to French; hydrate the saved preference on the client after mount
  // to keep SSR markup deterministic.
  const [lang, setLang] = useState<Lang>('fr');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') setLang(saved);
  }, []);

  const persist = useCallback((l: Lang) => {
    setLang(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* private mode — ignore */
    }
  }, []);

  const toggle = useCallback(
    () => persist(lang === 'fr' ? 'en' : 'fr'),
    [lang, persist],
  );
  const t = useCallback((key: TKey): string => translations[lang][key], [lang]);

  return (
    <I18nContext.Provider value={{ lang, t, toggle, setLang: persist }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
export function useT() {
  return useContext(I18nContext).t;
}
