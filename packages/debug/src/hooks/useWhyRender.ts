// packages/debug/src/hooks/useWhyRender.ts
// Shallow-compares a deps bag and logs which keys changed since the last render.

import { useEffect, useRef } from 'react';
import { resolveDebugEnabled, type DebugEnabledOptions } from '../env';

export type UseWhyRenderOptions = DebugEnabledOptions;

export type WhyRenderDeps = Record<string, unknown>;

/**
 * Logs keys in `deps` whose values changed by `Object.is` since the previous render.
 * This is a hint about changed inputs, not a full root-cause analysis.
 */
export function useWhyRender(
  label: string,
  deps: WhyRenderDeps,
  options?: UseWhyRenderOptions,
): void {
  const enabled = resolveDebugEnabled(options?.enabled);
  const prevRef = useRef<WhyRenderDeps | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const prev = prevRef.current;
    const snapshot: WhyRenderDeps = { ...deps };
    prevRef.current = snapshot;

    if (!prev) {
      console.log(`[debug:why] ${label} (mounted)`, snapshot);
      return;
    }

    const changed: Record<string, { from: unknown; to: unknown }> = {};
    const keys = new Set([...Object.keys(prev), ...Object.keys(snapshot)]);
    for (const key of keys) {
      const from = prev[key];
      const to = snapshot[key];
      if (!Object.is(from, to)) {
        changed[key] = { from, to };
      }
    }

    if (Object.keys(changed).length === 0) {
      return;
    }

    console.log(`[debug:why] ${label}`, changed);
  });
}
