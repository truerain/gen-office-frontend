// packages/debug/src/env.ts
// Resolves whether debug hooks should run.
// Prefer passing `enabled: import.meta.env.DEV` from apps when using the built dist.

export type DebugEnabledOptions = {
  /**
   * When omitted, reads Vite `import.meta.env` (works when the app resolves package source).
   * Built dist may bake DEV=false — pass `enabled` explicitly from the app if unsure.
   */
  enabled?: boolean;
};

/**
 * Prefer explicit `enabled` from the app (`import.meta.env.DEV`).
 * Fallback reads `import.meta.env` when the module is compiled by the app bundler.
 */
export function resolveDebugEnabled(enabled?: boolean): boolean {
  if (typeof enabled === 'boolean') {
    return enabled;
  }

  const env = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;
  if (env && typeof env === 'object') {
    if (typeof env.DEV === 'boolean') {
      return env.DEV;
    }
    if (typeof env.MODE === 'string') {
      return env.MODE !== 'production';
    }
  }

  return true;
}
