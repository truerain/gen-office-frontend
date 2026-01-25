import type { GenGridColumnMeta } from './utils';

function isValidDate(d: Date) {
  return !Number.isNaN(d.getTime());
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

export function formatCellValue(value: unknown, meta?: GenGridColumnMeta) {
  if (!meta?.format) return value as any;

  const locale = meta.formatLocale;

  switch (meta.format) {
    case 'number': {
      const n = toNumber(value);
      if (n == null) return value as any;
      return new Intl.NumberFormat(locale, meta.numberFormat).format(n);
    }
    case 'currency': {
      const n = toNumber(value);
      if (n == null) return value as any;
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: meta.currency ?? 'USD',
        ...(meta.numberFormat ?? {}),
      }).format(n);
    }
    case 'percent': {
      const n = toNumber(value);
      if (n == null) return value as any;
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        ...(meta.numberFormat ?? {}),
      }).format(n);
    }
    case 'date':
    case 'datetime': {
      if (value == null || value === '') return meta.emptyLabel ?? '';
      const d = value instanceof Date ? value : new Date(String(value));
      if (!isValidDate(d)) return value as any;
      const opts = meta.dateFormat ?? {};
      return meta.format === 'datetime'
        ? d.toLocaleString(locale, opts)
        : d.toLocaleDateString(locale, opts);
    }
    case 'boolean': {
      if (value === true) return meta.trueLabel ?? 'Yes';
      if (value === false) return meta.falseLabel ?? 'No';
      return meta.emptyLabel ?? '';
    }
    case 'text':
    default:
      return value as any;
  }
}
