// packages/gen-datagrid/src/core/dom/gridBoundary.ts
// Resolves DOM event and focus ownership for nested GenDataGrid roots.

import { gridRootSelector } from './selectors';

export function getOwningGridRoot(target: EventTarget | Element | null) {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return null;
  return target.closest<HTMLElement>(gridRootSelector);
}

export function isEventOwnedByRoot(
  root: HTMLElement | null,
  target: EventTarget | Element | null
) {
  return Boolean(root && getOwningGridRoot(target) === root);
}

export function isFocusOwnedByRoot(
  root: HTMLElement | null,
  activeElement: Element | null = typeof document === 'undefined' ? null : document.activeElement
) {
  return Boolean(root && getOwningGridRoot(activeElement) === root);
}
