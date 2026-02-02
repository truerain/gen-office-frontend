// apps/demo/src/i18n/policy.ts
const NO_FALLBACK_NAMESPACES = new Set<string>(['admin']);

export function isFallbackAllowed(namespace: string) {
  return !NO_FALLBACK_NAMESPACES.has(namespace);
}

export const noFallbackNamespaces = Array.from(NO_FALLBACK_NAMESPACES);
