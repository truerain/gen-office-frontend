// apps/demo/src/i18n/remote.ts
import type { i18n as I18nInstance } from 'i18next';

type RemoteBundle = {
  locale: string;
  namespace: string;
  version?: string;
  resources: Record<string, string>;
};

type ApiResponseEnvelope<T = unknown> = {
  success: boolean;
  code: string;
  message: string | null;
  data: T;
  messageParams?: Record<string, unknown>;
};

const CACHE_PREFIX = 'i18n.bundle';

function getCacheKey(locale: string, ns: string) {
  // Cache key for a locale/namespace pair
  return `${CACHE_PREFIX}:${locale}:${ns}`;
}

function readCache(locale: string, ns: string): RemoteBundle | null {
  // Read cached bundle from localStorage
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(getCacheKey(locale, ns));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RemoteBundle;
  } catch {
    return null;
  }
}

function writeCache(bundle: RemoteBundle) {
  // Persist bundle to localStorage cache
  if (typeof window === 'undefined') return;
  localStorage.setItem(getCacheKey(bundle.locale, bundle.namespace), JSON.stringify(bundle));
}

function isApiResponseEnvelope(value: unknown): value is ApiResponseEnvelope<unknown> {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.success === 'boolean' && typeof record.code === 'string' && 'data' in record;
}

function toRemoteBundle(payload: unknown, locale: string, ns: string): RemoteBundle {
  // 1) { locale, namespace, version, resources }
  if (
    payload &&
    typeof payload === 'object' &&
    'resources' in payload &&
    'namespace' in payload
  ) {
    return payload as RemoteBundle;
  }

  // 2) { version, items: [{ key, value }] }
  if (payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)) {
    const data = payload as { version?: string; items: Array<{ key?: string; value?: unknown }> };
    const resources: Record<string, string> = {};
    for (const item of data.items) {
      if (item?.key) resources[item.key] = String(item.value ?? '');
    }
    return {
      locale,
      namespace: ns,
      version: data.version,
      resources,
    };
  }

  // 3) [{ key, value }]
  if (Array.isArray(payload)) {
    const resources: Record<string, string> = {};
    for (const item of payload as Array<{ key?: string; value?: unknown }>) {
      if (item?.key) resources[item.key] = String(item.value ?? '');
    }
    return {
      locale,
      namespace: ns,
      resources,
    };
  }

  throw new Error('Unsupported i18n response shape');
}

async function fetchRemoteBundle(locale: string, ns: string, version?: string) {
  // Fetch remote (DB-backed) i18n bundle; server may return different shapes
  const url = new URL('/api/i18n', window.location.origin);
  url.searchParams.set('locale', locale);
  url.searchParams.set('ns', ns);
  if (version) url.searchParams.set('version', version);

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-Lang': locale,
    },
  });
  if (!res.ok) throw new Error(`i18n fetch failed: ${res.status}`);
  const raw = (await res.json()) as unknown;
  if (isApiResponseEnvelope(raw)) {
    if (!raw.success) {
      const message =
        (typeof raw.message === 'string' && raw.message.trim()) ||
        raw.code ||
        `i18n fetch failed: ${res.status}`;
      throw new Error(message);
    }
    return toRemoteBundle(raw.data, locale, ns);
  }

  return toRemoteBundle(raw, locale, ns);
}

export async function loadRemoteBundles(i18n: I18nInstance, namespaces: string[]) {
  // Load remote bundles in parallel and merge into i18n, with cache+version handling
  const locale = i18n.language || 'en';

  await Promise.all(
    namespaces.map(async (ns) => {
      const cached = readCache(locale, ns);
      const version = cached?.version;
      const remote = await fetchRemoteBundle(locale, ns, version);

      // if server returns same version without resources, keep cache
      // If server returns empty resources with same version, keep cached bundle
      const next =
        remote && Object.keys(remote.resources ?? {}).length === 0 && cached
          ? cached
          : remote;
      if (!next) return;
      i18n.addResourceBundle(locale, ns, next.resources, true, true);
      writeCache(next);
    })
  );
}
