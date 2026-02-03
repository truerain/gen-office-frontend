// apps/demo/src/i18n/useTranslationWithPolicy.ts
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { isFallbackAllowed } from './policy';

const NO_FALLBACK: string[] = [];

export function useTranslationWithPolicy(namespace: string) {
  const { t, i18n } = useTranslation(namespace);
  const allowFallback = isFallbackAllowed(namespace);

  const tWithPolicy = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      t(key, {
        ...options,
        fallbackLng: allowFallback ? undefined : NO_FALLBACK,
      }),
    [t, allowFallback]
  );

  return { t: tWithPolicy, i18n };
}
