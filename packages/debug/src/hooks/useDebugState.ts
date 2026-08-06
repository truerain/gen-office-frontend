// packages/debug/src/hooks/useDebugState.ts
// Observes an existing value and logs to the console when it changes (DEV-oriented).

import { useEffect, useRef } from 'react';
import { resolveDebugEnabled, type DebugEnabledOptions } from '../env';

export type UseDebugStateOptions = DebugEnabledOptions & {
  /** When true (default), use console.groupCollapsed. */
  collapsed?: boolean;
};

function snapshotKey(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

/**
 * Observes `value` and logs when it changes. Does not own or update state.
 *
 * @example
 * useDebugState('CustomerInfo.filter', filter);
 * useDebugState('CustomerInfo.filter', filter, { enabled: import.meta.env.DEV });
 */
export function useDebugState(
  label: string,
  value: unknown,
  options?: UseDebugStateOptions,
): void {
  const enabled = resolveDebugEnabled(options?.enabled);
  const collapsed = options?.collapsed ?? true;
  const prevKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const nextKey = snapshotKey(value);
    if (prevKeyRef.current === nextKey) {
      return;
    }

    const isFirst = prevKeyRef.current === undefined;
    prevKeyRef.current = nextKey;

    const title = isFirst ? `[debug:state] ${label} (initial)` : `[debug:state] ${label}`;
    if (collapsed) {
      console.groupCollapsed(title);
      console.log(value);
      console.groupEnd();
    } else {
      console.log(title, value);
    }
  }, [collapsed, enabled, label, value]);
}
