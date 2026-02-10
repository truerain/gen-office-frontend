// apps/demo/src/i18n/remote.ts
import type { i18n as I18nInstance } from 'i18next';

type RemoteBundle = {
  locale: string;
  namespace: string;
  version?: string;
  resources: Record<string, string>;
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
  const data = await res.json();

  // Accept multiple response shapes
  // 1) { locale, namespace, version, resources }
  if (data?.resources && data?.namespace) {
    return data as RemoteBundle;
  }

  // 2) { version, items: [{ key, value }] }
  if (Array.isArray(data?.items)) {
    const resources: Record<string, string> = {};
    for (const item of data.items) {
      if (item?.key) resources[item.key] = String(item.value ?? '');
    }
    return {
      locale,
      namespace: ns,
      version: data.version,
      resources,
    } as RemoteBundle;
  }

  // 3) [{ key, value }]
  if (Array.isArray(data)) {
    const resources: Record<string, string> = {};
    for (const item of data) {
      if (item?.key) resources[item.key] = String(item.value ?? '');
    }
    return {
      locale,
      namespace: ns,
      resources,
    } as RemoteBundle;
  }

  throw new Error('Unsupported i18n response shape');
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
