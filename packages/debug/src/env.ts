// packages/debug/src/env.ts
// Resolves whether debug hooks should run.
// Prefer passing `enabled` from the app (import.meta.env.DEV or VITE_DEBUG).

export type DebugEnabledOptions = {
  /**
   * When omitted, reads Vite `import.meta.env` when available.
   * If env cannot be resolved, defaults to false (fail closed).
   */
  enabled?: boolean;
};

/**
 * Prefer explicit `enabled` from the app.
 * When omitted: use `import.meta.env.DEV` / `MODE` if present, otherwise false.
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

  return false;
}
