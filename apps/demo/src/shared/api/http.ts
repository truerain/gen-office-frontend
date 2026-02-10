// apps/demo/src/shared/api/http.ts
import { getCurrentLocale } from '@/i18n';

const API_BASE_URL = '';

type ApiErrorResponse = {
  code?: string;
  messageKey?: string;
  message?: string;
  locale?: string;
  path?: string;
  timestamp?: string;
  traceId?: string | null;
};

export class HttpError extends Error {
  status: number;
  code?: string;
  messageKey?: string;
  locale?: string;
  path?: string;
  timestamp?: string;
  traceId?: string | null;
  contentLanguage?: string | null;
  raw?: unknown;

  constructor(params: {
    status: number;
    message: string;
    code?: string;
    messageKey?: string;
    locale?: string;
    path?: string;
    timestamp?: string;
    traceId?: string | null;
    contentLanguage?: string | null;
    raw?: unknown;
  }) {
    super(params.message);
    this.name = 'HttpError';
    this.status = params.status;
    this.code = params.code;
    this.messageKey = params.messageKey;
    this.locale = params.locale;
    this.path = params.path;
    this.timestamp = params.timestamp;
    this.traceId = params.traceId;
    this.contentLanguage = params.contentLanguage;
    this.raw = params.raw;
  }
}

let lastContentLanguage: string | null = null;
let authExpiredHandler: ((status: number, error: HttpError) => void) | null = null;
let csrfTokenProvider: (() => string | null) | null = null;

export function getLastContentLanguage(): string | null {
  return lastContentLanguage;
}

export function setAuthExpiredHandler(handler: ((status: number, error: HttpError) => void) | null) {
  authExpiredHandler = handler;
}

export function setCsrfTokenProvider(provider: (() => string | null) | null) {
  csrfTokenProvider = provider;
}

function getCsrfHeader(): Record<string, string> {
  const token = csrfTokenProvider?.();
  if (!token) return {};
  return { 'X-XSRF-TOKEN': token };
}

function withBaseUrl(input: RequestInfo): RequestInfo {
  if (typeof input !== 'string') return input;
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  if (input.startsWith('/')) return `${API_BASE_URL}${input}`;
  return `${API_BASE_URL}/${input}`;
}

export async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(withBaseUrl(input), {
    ...init,
    credentials: init?.credentials ?? 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Lang': getCurrentLocale(),
      ...(init?.method && !['GET', 'HEAD', 'OPTIONS'].includes(init.method.toUpperCase())
        ? getCsrfHeader()
        : {}),
      ...(init?.headers ?? {}),
    },
  });

  lastContentLanguage = res.headers.get('content-language');

  if (!res.ok) {
    const cloned = res.clone();
    let data: ApiErrorResponse | null = null;
    try {
      data = (await cloned.json()) as ApiErrorResponse;
    } catch {
      data = null;
    }

    const text = await res.text().catch(() => '');
    const message =
      (data && typeof data.message === 'string' && data.message.trim()) ||
      text ||
      res.statusText ||
      `HTTP ${res.status}`;

    const error = new HttpError({
      status: res.status,
      message,
      code: data?.code,
      messageKey: data?.messageKey,
      locale: data?.locale,
      path: data?.path,
      timestamp: data?.timestamp,
      traceId: data?.traceId,
      contentLanguage: lastContentLanguage,
      raw: data ?? text,
    });

    if (res.status === 401 || res.status === 440) {
      authExpiredHandler?.(res.status, error);
    }

    throw error;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
