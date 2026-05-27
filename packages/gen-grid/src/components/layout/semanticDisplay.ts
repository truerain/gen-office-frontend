import type { ReactNode } from 'react';
import { formatCellValue } from './cellFormat';
import type { GenGridColumnMeta } from './utils';

export type GenGridMetaResolverArgs<T = unknown> = {
  row: T;
  rowId: string;
  columnId: string;
  value: unknown;
};

export type GenGridDisplayScaleTooltipMode = 'raw' | 'scaled' | 'both' | 'off';

export type GenGridDisplayScaleExportMode = 'raw' | 'display';

export type GenGridDisplayScaleConfig = {
  divisor: number;
  unitLabel?: string;
  cellUnitLabel?: string;
  tooltip?: GenGridDisplayScaleTooltipMode;
  /** Excel/clipboard 등 export 시 기본 `display`(화면과 동일 스케일). */
  export?: GenGridDisplayScaleExportMode;
};

export type GenGridDisplayScaleInput<T = unknown> =
  | number
  | GenGridDisplayScaleConfig
  | ((args: GenGridMetaResolverArgs<T>) => GenGridDisplayScaleInput<T> | undefined);

export type ResolvedGenGridDisplayScale = GenGridDisplayScaleConfig;

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeDisplayScaleConfig(
  input: number | GenGridDisplayScaleConfig
): ResolvedGenGridDisplayScale | undefined {
  const config: GenGridDisplayScaleConfig =
    typeof input === 'number' ? { divisor: input } : { ...input };
  const divisor = Number(config.divisor);
  if (!Number.isFinite(divisor) || divisor <= 0) return undefined;
  return {
    ...config,
    divisor,
    tooltip: config.tooltip ?? 'both',
  };
}

export function resolveDisplayScale(
  raw: GenGridDisplayScaleInput | undefined,
  args: GenGridMetaResolverArgs
): ResolvedGenGridDisplayScale | undefined {
  if (raw == null) return undefined;

  let resolved: GenGridDisplayScaleInput | undefined = raw;
  if (typeof raw === 'function') {
    resolved = raw(args);
    if (resolved == null) return undefined;
  }

  if (typeof resolved === 'number' || (typeof resolved === 'object' && 'divisor' in resolved)) {
    return normalizeDisplayScaleConfig(resolved as number | GenGridDisplayScaleConfig);
  }

  return undefined;
}

export function scaleNumericByDisplayScale(
  value: number,
  scale: ResolvedGenGridDisplayScale
): number {
  return value / scale.divisor;
}

export function resolveSemanticType(
  meta: GenGridColumnMeta | undefined,
  args: GenGridMetaResolverArgs
): 'amount' | 'percent' | undefined {
  const raw = meta?.semanticType;
  if (raw == null) return undefined;
  if (typeof raw === 'function') {
    return raw(args);
  }
  return raw;
}

function formatAmountNumber(value: number, meta?: GenGridColumnMeta): string {
  return String(formatCellValue(value, { ...meta, format: 'number' }));
}

export function buildDisplayScaleTooltip(
  rawValue: unknown,
  scale: ResolvedGenGridDisplayScale,
  meta?: GenGridColumnMeta
): string | undefined {
  const mode = scale.tooltip ?? 'both';
  if (mode === 'off') return undefined;

  const rawNumber = toFiniteNumber(rawValue);
  if (rawNumber == null) return undefined;

  const scaledNumber = scaleNumericByDisplayScale(rawNumber, scale);
  const unitSuffix = scale.unitLabel ? scale.unitLabel : '';
  const rawText = formatAmountNumber(rawNumber, meta);
  const scaledText = `${formatAmountNumber(scaledNumber, meta)}${unitSuffix}`;

  if (mode === 'raw') return rawText;
  if (mode === 'scaled') return scaledText;
  if (rawText === scaledText && !unitSuffix) return rawText;
  return `${rawText} (${scaledText})`;
}

export function resolveGenGridCellTooltip<TData>(args: {
  meta?: GenGridColumnMeta;
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  value: unknown;
  getCellTooltip?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
    columnId: string;
    value: unknown;
  }) => string | undefined;
}): string | undefined {
  const { meta, row, rowId, rowIndex, columnId, value, getCellTooltip } = args;
  const resolverArgs: GenGridMetaResolverArgs<TData> = { row, rowId, columnId, value };

  const fromGrid = getCellTooltip?.({ row, rowId, rowIndex, columnId, value });
  if (fromGrid != null) return fromGrid;

  if (typeof meta?.getCellTooltip === 'function') {
    return meta.getCellTooltip(resolverArgs);
  }

  const semanticType = resolveSemanticType(meta, resolverArgs);
  if (semanticType === 'amount') {
    const scale = resolveDisplayScale(meta?.displayScale as GenGridDisplayScaleInput | undefined, resolverArgs);
    if (scale) {
      const semanticTooltip = buildDisplayScaleTooltip(value, scale, meta);
      if (semanticTooltip) return semanticTooltip;
    }
  }

  return typeof meta?.tooltip === 'string' ? meta.tooltip : undefined;
}

export function resolveExportNumericValue(
  rawValue: unknown,
  meta: GenGridColumnMeta | undefined,
  args: GenGridMetaResolverArgs
): unknown {
  const semanticType = resolveSemanticType(meta, args);
  if (semanticType !== 'amount') return rawValue;

  const rawNumber = toFiniteNumber(rawValue);
  if (rawNumber == null) return rawValue;

  const scale = resolveDisplayScale(meta?.displayScale as GenGridDisplayScaleInput | undefined, args);
  if (!scale) return rawValue;

  const exportMode = scale.export ?? 'display';
  if (exportMode === 'raw') return rawNumber;
  return scaleNumericByDisplayScale(rawNumber, scale);
}

export function appendDisplayScaleCellSuffix(
  formatted: ReactNode,
  scale: ResolvedGenGridDisplayScale | undefined
): ReactNode {
  const suffix = scale?.cellUnitLabel ?? scale?.unitLabel;
  if (!suffix || formatted == null || formatted === '') return formatted;
  if (typeof formatted === 'string' || typeof formatted === 'number') {
    return `${String(formatted)}${suffix}`;
  }
  return formatted;
}
