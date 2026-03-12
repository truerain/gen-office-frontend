import type { TFunction } from 'i18next';
import { i18n } from '@/i18n';
import { HttpError } from './http';

type ResolveApiErrorMessageOptions = {
  defaultMessage?: string;
  t?: TFunction;
};

function translateByCode(
  key: string,
  params: Record<string, unknown> | undefined,
  t?: TFunction
): string {
  const translator = t ?? (i18n.t.bind(i18n) as TFunction);
  const translated = translator(key, {
    defaultValue: '',
    ...(params ?? {}),
  });
  return typeof translated === 'string' ? translated.trim() : '';
}

export function resolveApiErrorMessage(
  error: unknown,
  options: ResolveApiErrorMessageOptions = {}
): string {
  if (error instanceof HttpError) {
    const key = String(error.code ?? error.messageKey ?? '').trim();
    if (key) {
      const translated = translateByCode(key, error.messageParams, options.t);
      if (translated) return translated;
    }

    const fallback = String(error.message ?? '').trim();
    if (fallback) return fallback;
  }

  if (error instanceof Error) {
    const fallback = String(error.message ?? '').trim();
    if (fallback) return fallback;
  }

  return options.defaultMessage ?? 'Request failed.';
}
