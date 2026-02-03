// apps/demo/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import koCommon from './locales/ko/common.json';
import { loadRemoteBundles } from './remote';
import { isFallbackAllowed } from './policy';

const DEFAULT_NS = 'common';
const STORAGE_KEY = 'gen-office-locale';
const MISSING_KEY_STORAGE = 'i18n.missing-keys';
const I18N_REMOTE_FAILED_EVENT = 'i18n:remote-failed';
const NO_FALLBACK: string[] = [];

type MissingKeyEntry = {
  key: string;
  ns: string;
  lng: string;
  ts: number;
};

function resolveInitialLocale(): string {
  if (typeof window === 'undefined') return 'ko';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const nav = navigator.language || 'en';
  return nav.startsWith('ko') ? 'ko' : 'en';
}

function recordMissingKey(lngs: string | readonly string[], ns: string, key: string) {
  if (typeof window === 'undefined') return;
  const lng = Array.isArray(lngs) ? lngs[0] ?? 'en' : lngs;
  const entry: MissingKeyEntry = { key, ns, lng, ts: Date.now() };
  const raw = localStorage.getItem(MISSING_KEY_STORAGE);
  let list: MissingKeyEntry[] = [];
  if (raw) {
    try {
      list = JSON.parse(raw) as MissingKeyEntry[];
    } catch {
      list = [];
    }
  }
  const exists = list.some((item) => item.key === key && item.ns === ns && item.lng === lng);
  if (!exists) {
    list.push(entry);
    localStorage.setItem(MISSING_KEY_STORAGE, JSON.stringify(list.slice(-200)));
  }
  // eslint-disable-next-line no-console
  console.warn(`[i18n] missing key: ${lng}.${ns}.${key}`);
}

function dispatchRemoteFailed(error?: unknown) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(I18N_REMOTE_FAILED_EVENT, {
      detail: { error },
    })
  );
}

export function onI18nRemoteFailed(handler: (error?: unknown) => void) {
  if (typeof window === 'undefined') return () => {};
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ error?: unknown }>).detail;
    handler(detail?.error);
  };
  window.addEventListener(I18N_REMOTE_FAILED_EVENT, listener as EventListener);
  return () => window.removeEventListener(I18N_REMOTE_FAILED_EVENT, listener as EventListener);
}

export function getFixedTWithPolicy(namespace: string, allowFallback = isFallbackAllowed(namespace)) {
  const t = i18n.getFixedT(i18n.language, namespace);
  return (key: string, options?: Record<string, unknown>) =>
    t(key, {
      ...options,
      fallbackLng: allowFallback ? undefined : NO_FALLBACK,
    });
}

export async function initI18n() {
  const locale = resolveInitialLocale();

  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        lng: locale,
        fallbackLng: 'en',
        defaultNS: DEFAULT_NS,
        resources: {
          en: { common: enCommon },
          ko: { common: koCommon },
        },
        saveMissing: true,
        saveMissingTo: 'current',
        missingKeyHandler: (lngs, ns, key) => recordMissingKey(lngs, ns, key),
        interpolation: { escapeValue: false },
      });
  }

  // Load remote bundles in background (DB overrides)
  loadRemoteBundles(i18n, [DEFAULT_NS]).catch((error) => {
    // ignore remote failures; keep local bundles
    dispatchRemoteFailed(error);
  });

  return i18n;
}

export async function setLocale(next: string) {
  if (!i18n.isInitialized) await initI18n();
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, next);
  }
  return i18n.changeLanguage(next);
}

export { i18n };
export { useTranslationWithPolicy } from './useTranslationWithPolicy';
export { isFallbackAllowed } from './policy';
