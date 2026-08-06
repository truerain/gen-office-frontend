// packages/debug/src/hooks/useRenderCount.ts
// Counts renders for the calling component (DEV-oriented).

import { useEffect, useRef } from 'react';
import { resolveDebugEnabled, type DebugEnabledOptions } from '../env';

export type UseRenderCountOptions = DebugEnabledOptions & {
  /** When true, log each render count to the console. Default false. */
  log?: boolean;
};

/**
 * Returns how many times this component has rendered (including the current render).
 * In React Strict Mode (DEV), counts may look doubled — that is expected.
 */
export function useRenderCount(
  label?: string,
  options?: UseRenderCountOptions,
): number {
  const enabled = resolveDebugEnabled(options?.enabled);
  const log = options?.log ?? false;
  const countRef = useRef(0);

  countRef.current += 1;
  const count = countRef.current;

  useEffect(() => {
    if (!enabled || !log) {
      return;
    }
    const name = label ? `[debug:render] ${label}` : '[debug:render]';
    console.log(`${name} count=${count}`);
  });

  return enabled ? count : 0;
}
