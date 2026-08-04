// apps/demo/src/pages/approval/inbox/sanitizeApprovalHtml.ts
// Lightweight HTML sanitizer for trusted/static approval body content.

const BLOCKED_TAGS = new Set([
  'SCRIPT',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'LINK',
  'META',
  'BASE',
  'FORM',
]);

function isDangerousUrl(value: string) {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('data:text/html')
  );
}

/**
 * Removes script-capable tags/attrs while keeping basic formatting and menu links.
 * Demo-level safeguard; not a full HTML sanitizer library replacement.
 */
export function sanitizeApprovalHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const source = String(html ?? '').trim();
  if (!source) return '';

  const template = document.createElement('template');
  template.innerHTML = source;

  const walk = (root: ParentNode) => {
    const nodes = Array.from(root.childNodes);
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (BLOCKED_TAGS.has(el.tagName)) {
          el.remove();
          continue;
        }

        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          const value = attr.value;
          if (name.startsWith('on')) {
            el.removeAttribute(attr.name);
            continue;
          }
          if ((name === 'href' || name === 'src' || name === 'xlink:href') && isDangerousUrl(value)) {
            el.removeAttribute(attr.name);
          }
        }

        walk(el);
      }
    }
  };

  walk(template.content);
  return template.innerHTML;
}

export function parseMenuParams(raw: string | null | undefined): Record<string, unknown> | undefined {
  if (!raw || !raw.trim()) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return undefined;
  }
  return undefined;
}
