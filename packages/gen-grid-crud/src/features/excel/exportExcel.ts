import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import ExcelJS from 'exceljs';

import type {
  CrudUiState,
  ExcelExportOptions,
  GenGridCrudProps,
} from '../../GenGridCrud.types';
import type { CrudRowId } from '../../crud/types';

type TranslateLike = (
  key: string,
  options?: { defaultValue?: string; [key: string]: unknown }
) => string;

type ExportMeta<TData> = {
  format?: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'datetime' | 'boolean' | 'triangleNumber';
  trueLabel?: string;
  falseLabel?: string;
  emptyLabel?: string;
  exportValue?: (args: {
    value: unknown;
    row: TData;
    rowId: string;
    columnId: string;
  }) => unknown;
  rowSpan?: boolean | ((args: { row: TData; rowId: string; columnId: string }) => boolean);
  rowSpanValueGetter?: (args: {
    row: TData;
    rowId: string;
    columnId: string;
    value: unknown;
  }) => unknown;
  rowSpanComparator?: (a: unknown, b: unknown, args: { columnId: string }) => boolean;
};

type ExportLeafColumn<TData> = {
  id: string;
  header: string;
  accessorKey?: string;
  accessorFn?: ((row: TData, index: number) => unknown) | undefined;
  meta?: ExportMeta<TData>;
  size?: number;
  align?: 'left' | 'center' | 'right';
};

type ExportRowSpanModel = {
  isCovered: (rowIndex: number, columnId: string) => boolean;
  getRowSpan: (rowIndex: number, columnId: string) => number;
  getAnchorRowIndex: (rowIndex: number, columnId: string) => number | undefined;
};

type ExportHeaderNode = {
  label: string;
  columnId?: string;
  children?: ExportHeaderNode[];
};

type ExportHeaderCell = {
  row: number;
  colStart: number;
  colEnd: number;
  rowSpan: number;
  colSpan: number;
  label: string;
};

type ExcelBorderSide = {
  style?: ExcelJS.BorderStyle;
  color?: ExcelJS.Color;
};

type ExportCrudExcelArgs<TData> = {
  excelExport: ExcelExportOptions<TData>;
  stateForExport: CrudUiState<TData>;
  columns: readonly ColumnDef<TData, any>[];
  title?: string;
  viewData: readonly TData[];
  rowSelectionIds: readonly CrudRowId[];
  getPendingRowId: (row: TData) => CrudRowId;
  gridProps?: GenGridCrudProps<TData>['gridProps'];
  t: TranslateLike;
  onCommitError?: (result: { error: unknown; fieldErrors?: Record<string, string> }) => void;
};

const SYSTEM_COLUMN_IDS = new Set(['__select__', '__rowNumber__', '__row_status__']);
const EXCEL_DEFAULT_ROW_HEIGHT_PX = 20;
const EXCEL_DEFAULT_ROW_HEIGHT_PT = Math.round(EXCEL_DEFAULT_ROW_HEIGHT_PX * 0.75 * 100) / 100;
const EXCEL_GRID_BORDER_COLOR = { argb: 'FFD0D5DD' } as unknown as ExcelJS.Color;
const EXCEL_GRID_BORDER: ExcelBorderSide = { style: 'thin', color: EXCEL_GRID_BORDER_COLOR };

const CSS_BORDER_STYLE_TO_EXCEL: Record<string, ExcelJS.BorderStyle | undefined> = {
  solid: 'thin',
  dashed: 'dashed',
  dotted: 'dotted',
  double: 'double',
  none: undefined,
};

const NAMED_COLOR_TO_HEX: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  gray: '#808080',
  grey: '#808080',
  red: '#FF0000',
  green: '#008000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  orange: '#FFA500',
};

function toTimestamp(now = new Date()): string {
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

function sanitizeFileNameBase(input: string, fallback = 'export'): string {
  const trimmed = input.trim();
  if (!trimmed) return fallback;
  return trimmed
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || fallback;
}

function sanitizeSheetName(input: string, fallback = 'Sheet1'): string {
  const cleaned = input
    .replace(/[\[\]:*?/\\]/g, '_')
    .trim()
    .slice(0, 31);
  return cleaned || fallback;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseFileNameFromContentDisposition(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  const plainMatch = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
  return plainMatch?.[1] ?? null;
}

function collectLeafColumns<TData>(columns: readonly ColumnDef<TData, any>[]): Array<ColumnDef<TData, any>> {
  const leaves: Array<ColumnDef<TData, any>> = [];
  const walk = (defs: readonly ColumnDef<TData, any>[]) => {
    for (const def of defs as any[]) {
      const children = def.columns as readonly ColumnDef<TData, any>[] | undefined;
      if (Array.isArray(children) && children.length > 0) {
        walk(children);
        continue;
      }
      leaves.push(def);
    }
  };
  walk(columns);
  return leaves;
}

function getColumnIdForExport<TData>(column: ColumnDef<TData, any>): string {
  const col = column as any;
  if (typeof col.id === 'string' && col.id) return col.id;
  if (typeof col.accessorKey === 'string' && col.accessorKey) return col.accessorKey;
  return '';
}

function getHeaderLabel(column: any, fallback = 'column'): string {
  if (typeof column.header === 'string') return column.header;
  if (typeof column.header === 'number') return String(column.header);
  if (typeof column.id === 'string' && column.id) return column.id;
  if (typeof column.accessorKey === 'string' && column.accessorKey) return column.accessorKey;
  return fallback;
}

function getValueByAccessorKey(row: unknown, accessorKey: string): unknown {
  if (!accessorKey.includes('.')) return (row as any)?.[accessorKey];
  const tokens = accessorKey.split('.');
  let current: any = row;
  for (const token of tokens) {
    if (current == null) return undefined;
    current = current[token];
  }
  return current;
}

function formatExportValue<TData>(
  value: unknown,
  meta: ExportMeta<TData> | undefined,
  labels: { yes: string; no: string }
): unknown {
  if (!meta?.format) return value;
  switch (meta.format) {
    case 'boolean':
      if (value === true) return meta.trueLabel ?? labels.yes;
      if (value === false) return meta.falseLabel ?? labels.no;
      return meta.emptyLabel ?? '';
    case 'date':
    case 'datetime': {
      if (value == null || value === '') return '';
      const d = value instanceof Date ? value : new Date(String(value));
      if (Number.isNaN(d.getTime())) return value;
      const yyyy = d.getFullYear().toString();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      if (meta.format === 'date') return `${yyyy}-${mm}-${dd}`;
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }
    default:
      return value;
  }
}

function coerceExportCellValue(value: unknown): string | number | boolean | null {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function toExcelColumnWidth(size?: number, header?: string): number {
  if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
    return Math.max(8, Math.min(80, Math.round(size / 7)));
  }
  const base = header ? Math.ceil(header.length * 1.6) : 12;
  return Math.max(8, Math.min(40, base));
}

function toExcelRowHeightPt(rowHeightPx?: number): number {
  if (typeof rowHeightPx !== 'number' || !Number.isFinite(rowHeightPx) || rowHeightPx <= 0) {
    return EXCEL_DEFAULT_ROW_HEIGHT_PT;
  }
  return Math.round(rowHeightPx * 0.75 * 100) / 100;
}

function resolveExcelNumFmt<TData>(meta?: ExportMeta<TData>): string | undefined {
  if (!meta?.format) return undefined;
  switch (meta.format) {
    case 'number':
      return '#,##0';
    case 'triangleNumber':
      return '#,##0;△#,##0';
    case 'percent':
      return '0.00%';
    case 'currency':
      return '"₩"#,##0';
    default:
      return undefined;
  }
}

function toHexByte(value: number): string {
  const safe = Math.max(0, Math.min(255, Math.round(value)));
  return safe.toString(16).padStart(2, '0').toUpperCase();
}

function parseCssColorToArgb(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined;
  const raw = input.trim();
  if (!raw) return undefined;

  const lowered = raw.toLowerCase();
  const namedColor = NAMED_COLOR_TO_HEX[lowered];
  const value = namedColor ?? raw;

  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      const rrggbb = hex
        .split('')
        .map((ch) => ch + ch)
        .join('')
        .toUpperCase();
      return `FF${rrggbb}`;
    }
    if (hex.length === 4) {
      const expanded = hex
        .split('')
        .map((ch) => ch + ch)
        .join('')
        .toUpperCase();
      return `${expanded.slice(6, 8)}${expanded.slice(0, 6)}`;
    }
    if (hex.length === 6) return `FF${hex.toUpperCase()}`;
    if (hex.length === 8) {
      const upper = hex.toUpperCase();
      return `${upper.slice(6, 8)}${upper.slice(0, 6)}`;
    }
    return undefined;
  }

  const rgbMatch = value.match(/^rgba?\((.+)\)$/i);
  if (!rgbMatch?.[1]) return undefined;
  const parts = rgbMatch[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 3) return undefined;
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  if (![r, g, b].every(Number.isFinite)) return undefined;
  const alpha = parts.length >= 4 ? Number(parts[3]) : 1;
  const a255 = Number.isFinite(alpha) ? (alpha <= 1 ? alpha * 255 : alpha) : 255;
  return `${toHexByte(a255)}${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

function toExcelColor(input: unknown): ExcelJS.Color | undefined {
  const argb = parseCssColorToArgb(input);
  return argb ? ({ argb } as ExcelJS.Color) : undefined;
}

function toExcelBorderStyle(style: string | undefined, widthPx?: number): ExcelJS.BorderStyle | undefined {
  if (style) return CSS_BORDER_STYLE_TO_EXCEL[style];
  if (typeof widthPx === 'number' && Number.isFinite(widthPx)) {
    if (widthPx >= 3) return 'thick';
    if (widthPx >= 2) return 'medium';
  }
  return 'thin';
}

function parseBorderValue(input: unknown): ExcelBorderSide | undefined {
  if (typeof input === 'number') {
    return { style: toExcelBorderStyle(undefined, input) };
  }
  if (typeof input !== 'string') return undefined;
  const raw = input.trim();
  if (!raw) return undefined;

  const widthMatch = raw.match(/(\d+(?:\.\d+)?)px/i);
  const widthPx = widthMatch?.[1] ? Number(widthMatch[1]) : undefined;
  const styleToken = raw
    .toLowerCase()
    .split(/\s+/)
    .find((token) => token in CSS_BORDER_STYLE_TO_EXCEL);
  const style = toExcelBorderStyle(styleToken, widthPx);
  if (!style) return undefined;

  const hexColorMatch = raw.match(/#[0-9a-fA-F]{3,8}/);
  const rgbColorMatch = raw.match(/rgba?\([^)]+\)/i);
  let color = hexColorMatch?.[0] ? toExcelColor(hexColorMatch[0]) : undefined;
  if (!color && rgbColorMatch?.[0]) color = toExcelColor(rgbColorMatch[0]);
  if (!color) {
    const named = raw
      .split(/\s+/)
      .map((token) => token.trim())
      .find((token) => Boolean(toExcelColor(token)));
    if (named) color = toExcelColor(named);
  }

  return {
    style,
    color,
  };
}

function getBorderSideFromStyles(
  rowStyle: React.CSSProperties | undefined,
  cellStyle: React.CSSProperties | undefined,
  key: 'Top' | 'Right' | 'Bottom' | 'Left'
): ExcelBorderSide | undefined {
  const prop = `border${key}` as keyof React.CSSProperties;
  const anyBorder = (cellStyle?.border ?? rowStyle?.border) as unknown;
  const sideBorder = (cellStyle?.[prop] ?? rowStyle?.[prop]) as unknown;
  return parseBorderValue(sideBorder ?? anyBorder);
}

function applyExcelCellStyle(
  cell: ExcelJS.Cell,
  rowStyle: React.CSSProperties | undefined,
  cellStyle: React.CSSProperties | undefined
) {
  const color = toExcelColor(cellStyle?.color ?? rowStyle?.color);
  const fontWeight = cellStyle?.fontWeight ?? rowStyle?.fontWeight;
  const bold =
    typeof fontWeight === 'number'
      ? fontWeight >= 600
      : typeof fontWeight === 'string'
        ? (fontWeight.toLowerCase() === 'bold' ||
          fontWeight.toLowerCase() === 'bolder' ||
          Number(fontWeight) >= 600)
        : undefined;

  if (color || bold !== undefined) {
    cell.font = {
      ...(cell.font ?? {}),
      ...(color ? { color } : {}),
      ...(bold !== undefined ? { bold } : {}),
    };
  }

  const fillColor = toExcelColor(cellStyle?.backgroundColor ?? rowStyle?.backgroundColor);
  if (fillColor) {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: fillColor,
    };
  }

  const top = getBorderSideFromStyles(rowStyle, cellStyle, 'Top');
  const right = getBorderSideFromStyles(rowStyle, cellStyle, 'Right');
  const bottom = getBorderSideFromStyles(rowStyle, cellStyle, 'Bottom');
  const left = getBorderSideFromStyles(rowStyle, cellStyle, 'Left');
  if (top || right || bottom || left) {
    cell.border = {
      ...(cell.border ?? {}),
      ...(top ? { top } : {}),
      ...(right ? { right } : {}),
      ...(bottom ? { bottom } : {}),
      ...(left ? { left } : {}),
    };
  }
}

function applyExcelOuterBorder(worksheet: ExcelJS.Worksheet, totalRows: number, totalCols: number) {
  if (totalRows <= 0 || totalCols <= 0) return;

  for (let rowIndex = 1; rowIndex <= totalRows; rowIndex++) {
    for (let colIndex = 1; colIndex <= totalCols; colIndex++) {
      if (
        rowIndex !== 1 &&
        rowIndex !== totalRows &&
        colIndex !== 1 &&
        colIndex !== totalCols
      ) {
        continue;
      }

      const cell = worksheet.getRow(rowIndex).getCell(colIndex);
      const prev = cell.border ?? {};
      cell.border = {
        ...prev,
        ...(rowIndex === 1 ? { top: prev.top ?? EXCEL_GRID_BORDER } : {}),
        ...(rowIndex === totalRows ? { bottom: prev.bottom ?? EXCEL_GRID_BORDER } : {}),
        ...(colIndex === 1 ? { left: prev.left ?? EXCEL_GRID_BORDER } : {}),
        ...(colIndex === totalCols ? { right: prev.right ?? EXCEL_GRID_BORDER } : {}),
      };
    }
  }
}

function applyExcelDefaultGridBorder(
  worksheet: ExcelJS.Worksheet,
  totalRows: number,
  totalCols: number
) {
  if (totalRows <= 0 || totalCols <= 0) return;

  for (let rowIndex = 1; rowIndex <= totalRows; rowIndex++) {
    for (let colIndex = 1; colIndex <= totalCols; colIndex++) {
      const cell = worksheet.getRow(rowIndex).getCell(colIndex);
      const prev = cell.border ?? {};
      cell.border = {
        top: prev.top ?? EXCEL_GRID_BORDER,
        right: prev.right ?? EXCEL_GRID_BORDER,
        bottom: prev.bottom ?? EXCEL_GRID_BORDER,
        left: prev.left ?? EXCEL_GRID_BORDER,
      };
    }
  }
}

function buildExportColumns<TData>(
  columns: readonly ColumnDef<TData, any>[],
  headerFallback: string
): ExportLeafColumn<TData>[] {
  const leaves = collectLeafColumns(columns);
  const exportColumns: ExportLeafColumn<TData>[] = [];
  for (const col of leaves as any[]) {
    const id = getColumnIdForExport(col);
    if (!id || SYSTEM_COLUMN_IDS.has(id)) continue;
    exportColumns.push({
      id,
      header: getHeaderLabel(col, headerFallback),
      accessorKey: typeof col.accessorKey === 'string' ? col.accessorKey : undefined,
      accessorFn: typeof col.accessorFn === 'function' ? col.accessorFn : undefined,
      meta: col.meta as ExportMeta<TData> | undefined,
      size: typeof col.size === 'number' ? col.size : undefined,
      align: (col.meta?.align as 'left' | 'center' | 'right' | undefined) ?? undefined,
    });
  }
  return exportColumns;
}

const ROW_SPAN_KEY_SEP = '\u0000';

function toRowSpanCellKey(rowIndex: number, columnId: string): string {
  return `${rowIndex}${ROW_SPAN_KEY_SEP}${columnId}`;
}

function buildExportRowSpanModel<TData>(
  rows: readonly TData[],
  rowIds: readonly string[],
  columns: readonly ExportLeafColumn<TData>[]
): ExportRowSpanModel {
  const anchorSpanByKey = new Map<string, number>();
  const coveredKeys = new Set<string>();
  const coveredToAnchorIndex = new Map<string, number>();
  const runByColumn = new Map<
    string,
    {
      anchorRowIndex: number;
      value: unknown;
      comparator: (a: unknown, b: unknown, args: { columnId: string }) => boolean;
    }
  >();

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]!;
    const rowId = rowIds[rowIndex]!;

    for (const col of columns) {
      const columnId = col.id;
      const key = toRowSpanCellKey(rowIndex, columnId);
      const meta = col.meta;
      const rowSpanRule = meta?.rowSpan;
      const canSpan =
        rowSpanRule === true
          ? true
          : typeof rowSpanRule === 'function'
            ? Boolean(rowSpanRule({ row, rowId, columnId }))
            : false;

      if (!canSpan) {
        runByColumn.delete(columnId);
        continue;
      }

      let baseValue: unknown;
      if (col.accessorKey) {
        baseValue = getValueByAccessorKey(row, col.accessorKey);
      } else if (col.accessorFn) {
        baseValue = col.accessorFn(row, rowIndex);
      } else {
        baseValue = (row as any)?.[columnId];
      }

      const mergeValue = meta?.rowSpanValueGetter
        ? meta.rowSpanValueGetter({ row, rowId, columnId, value: baseValue })
        : baseValue;
      const comparator = meta?.rowSpanComparator ?? ((a: unknown, b: unknown) => Object.is(a, b));

      const prev = runByColumn.get(columnId);
      if (prev && prev.comparator(prev.value, mergeValue, { columnId })) {
        coveredKeys.add(key);
        coveredToAnchorIndex.set(key, prev.anchorRowIndex);
        const anchorKey = toRowSpanCellKey(prev.anchorRowIndex, columnId);
        anchorSpanByKey.set(anchorKey, (anchorSpanByKey.get(anchorKey) ?? 1) + 1);
        runByColumn.set(columnId, { ...prev, value: mergeValue });
        continue;
      }

      anchorSpanByKey.set(key, 1);
      runByColumn.set(columnId, {
        anchorRowIndex: rowIndex,
        value: mergeValue,
        comparator,
      });
    }
  }

  return {
    isCovered: (rowIndex: number, columnId: string) =>
      coveredKeys.has(toRowSpanCellKey(rowIndex, columnId)),
    getRowSpan: (rowIndex: number, columnId: string) =>
      anchorSpanByKey.get(toRowSpanCellKey(rowIndex, columnId)) ?? 1,
    getAnchorRowIndex: (rowIndex: number, columnId: string) =>
      coveredToAnchorIndex.get(toRowSpanCellKey(rowIndex, columnId)),
  };
}

function buildExportHeaderTree<TData>(
  columns: readonly ColumnDef<TData, any>[],
  exportColumnIds: ReadonlySet<string>,
  headerFallback: string
): ExportHeaderNode[] {
  const walk = (defs: readonly ColumnDef<TData, any>[]): ExportHeaderNode[] => {
    const nodes: ExportHeaderNode[] = [];
    for (const def of defs as any[]) {
      const children = def.columns as readonly ColumnDef<TData, any>[] | undefined;
      if (Array.isArray(children) && children.length > 0) {
        const childNodes = walk(children);
        if (childNodes.length === 0) continue;
        nodes.push({
          label: getHeaderLabel(def, headerFallback),
          children: childNodes,
        });
        continue;
      }

      const columnId = getColumnIdForExport(def);
      if (!columnId || !exportColumnIds.has(columnId)) continue;
      nodes.push({
        label: getHeaderLabel(def, headerFallback),
        columnId,
      });
    }
    return nodes;
  };

  return walk(columns);
}

function getExportHeaderDepth(nodes: readonly ExportHeaderNode[]): number {
  if (nodes.length === 0) return 1;
  let maxDepth = 1;
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      maxDepth = Math.max(maxDepth, 1 + getExportHeaderDepth(node.children));
    }
  }
  return maxDepth;
}

function buildExportHeaderCells(
  nodes: readonly ExportHeaderNode[],
  maxDepth: number
): { cellsByRow: ExportHeaderCell[][]; leafColumnIds: string[] } {
  const cellsByRow: ExportHeaderCell[][] = Array.from({ length: maxDepth }, () => []);
  const leafColumnIds: string[] = [];

  const walk = (node: ExportHeaderNode, row: number, colStart: number): number => {
    if (!node.children || node.children.length === 0) {
      const colEnd = colStart;
      const rowSpan = Math.max(1, maxDepth - row + 1);
      cellsByRow[row - 1]!.push({
        row,
        colStart,
        colEnd,
        rowSpan,
        colSpan: 1,
        label: node.label,
      });
      if (node.columnId) leafColumnIds.push(node.columnId);
      return colStart + 1;
    }

    let nextCol = colStart;
    for (const child of node.children) {
      nextCol = walk(child, row + 1, nextCol);
    }
    const colEnd = Math.max(colStart, nextCol - 1);
    cellsByRow[row - 1]!.push({
      row,
      colStart,
      colEnd,
      rowSpan: 1,
      colSpan: Math.max(1, colEnd - colStart + 1),
      label: node.label,
    });
    return nextCol;
  };

  let start = 1;
  for (const node of nodes) {
    start = walk(node, 1, start);
  }

  for (const row of cellsByRow) {
    row.sort((a, b) => a.colStart - b.colStart);
  }

  return { cellsByRow, leafColumnIds };
}

export async function exportCrudExcel<TData>(args: ExportCrudExcelArgs<TData>) {
  const {
    excelExport,
    stateForExport,
    columns,
    title,
    viewData,
    rowSelectionIds,
    getPendingRowId,
    gridProps,
    t,
    onCommitError,
  } = args;

  const exportFallbackName = t('common.export', { defaultValue: 'export' });
  const sheetFallbackName = t('common.sheet1', { defaultValue: 'Sheet1' });
  const baseName = sanitizeFileNameBase(
    excelExport.fileName ?? title ?? exportFallbackName,
    exportFallbackName
  );
  const stampedName = `${baseName}_${toTimestamp()}.xlsx`;
  const sheetName = sanitizeSheetName(
    excelExport.sheetName ?? title ?? sheetFallbackName,
    sheetFallbackName
  );

  try {
    if (excelExport.mode === 'backend') {
      const backend = excelExport.backend;
      if (!backend?.endpoint) {
        throw new Error(
          t('crud.excel_backend_endpoint_required', {
            defaultValue:
              '[GenGridCrud] excelExport.backend.endpoint is required for backend mode.',
          })
        );
      }

      const method = backend.method ?? 'POST';
      const payload =
        backend.buildPayload?.({ state: stateForExport, columns, title }) ?? undefined;
      const headers = { ...(backend.headers ?? {}) };
      let url = backend.endpoint;
      let body: BodyInit | undefined;

      if (method === 'GET' && payload) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(payload)) {
          if (value == null) continue;
          if (Array.isArray(value)) {
            params.append(key, value.map((item) => String(item)).join(','));
          } else if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
        const query = params.toString();
        if (query) {
          url += (url.includes('?') ? '&' : '?') + query;
        }
      } else if (payload) {
        if (!Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
          headers['Content-Type'] = 'application/json';
        }
        body = JSON.stringify(payload);
      }

      const response = await fetch(url, {
        method,
        headers,
        body,
        credentials: backend.credentials,
      });

      if (!response.ok) {
        throw new Error(
          t('crud.excel_export_request_failed', {
            defaultValue:
              '[GenGridCrud] excel export request failed: {{status}}',
            status: response.status,
          })
        );
      }

      const blob = await response.blob();
      const serverFileName = parseFileNameFromContentDisposition(
        response.headers.get('content-disposition')
      );
      const finalName = serverFileName || stampedName;
      downloadBlob(blob, finalName);
      return;
    }

    const onlySelected = Boolean(excelExport.frontend?.onlySelected);
    const defaultBorder = Boolean(excelExport.defaultBorder);
    const excelRowHeightPt = toExcelRowHeightPt(excelExport.rowHeight);
    const selectedIds = new Set(rowSelectionIds.map((id) => String(id)));
    const sourceRows = onlySelected
      ? viewData.filter((row) => selectedIds.has(String(getPendingRowId(row))))
      : viewData;
    const sourceRowIds = sourceRows.map((row) => String(getPendingRowId(row)));

    const headerFallback = t('common.column', { defaultValue: 'Column' });
    const exportColumns = buildExportColumns(columns, headerFallback);
    const headerSeen = new Map<string, number>();
    const resolvedColumnsRaw = exportColumns.map((col) => {
      const seq = (headerSeen.get(col.header) ?? 0) + 1;
      headerSeen.set(col.header, seq);
      const headerKey = seq === 1 ? col.header : `${col.header}_${seq}`;
      return { ...col, headerKey };
    });
    const exportColumnIdSet = new Set(exportColumns.map((col) => col.id));
    const headerTree = buildExportHeaderTree(
      columns,
      exportColumnIdSet,
      headerFallback
    );
    const headerDepth = getExportHeaderDepth(headerTree);
    const { cellsByRow: headerCellsByRow, leafColumnIds } = buildExportHeaderCells(
      headerTree,
      headerDepth
    );
    const resolvedById = new Map(resolvedColumnsRaw.map((col) => [col.id, col] as const));
    const resolvedColumns =
      leafColumnIds.length === resolvedColumnsRaw.length
        ? leafColumnIds.map((id) => resolvedById.get(id)).filter((col): col is typeof resolvedColumnsRaw[number] => Boolean(col))
        : resolvedColumnsRaw;
    const rowSpanningEnabled = Boolean(gridProps?.rowSpanning);
    const rowSpanningMode = gridProps?.rowSpanningMode ?? 'real';
    const rowSpanModel = rowSpanningEnabled
      ? buildExportRowSpanModel(sourceRows, sourceRowIds, resolvedColumns)
      : null;

    const preparedRows = sourceRows.map((row, rowIndex) => {
      const out: Record<string, string | number | boolean | null> = {};
      const styleValueByColumnId: Record<string, unknown> = {};
      const rowId = sourceRowIds[rowIndex]!;
      for (const col of resolvedColumns) {
        let baseValue: unknown;
        if (col.accessorKey) {
          baseValue = getValueByAccessorKey(row, col.accessorKey);
        } else if (col.accessorFn) {
          baseValue = col.accessorFn(row, rowIndex);
        } else {
          baseValue = (row as any)?.[col.id];
        }
        const customValue = col.meta?.exportValue?.({
          value: baseValue,
          row,
          rowId,
          columnId: col.id,
        });
        const normalized = formatExportValue(
          customValue === undefined ? baseValue : customValue,
          col.meta,
          {
            yes: t('common.yes', { defaultValue: 'Yes' }),
            no: t('common.no', { defaultValue: 'No' }),
          }
        );
        const isCovered =
          Boolean(rowSpanModel) && rowSpanModel!.isCovered(rowIndex, col.id);
        out[col.headerKey] =
          isCovered ? '' : coerceExportCellValue(normalized);
        styleValueByColumnId[col.id] = baseValue;
      }
      return { out, styleValueByColumnId };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = resolvedColumns.map((col) => ({
      key: col.headerKey,
      width: toExcelColumnWidth(col.size, col.header),
    }));

    worksheet.properties.defaultRowHeight = excelRowHeightPt;

    for (let rowIndex = 1; rowIndex <= headerDepth; rowIndex++) {
      worksheet.getRow(rowIndex).height = excelRowHeightPt;
    }

    const totalHeaderCols = resolvedColumns.length;
    for (const rowCells of headerCellsByRow) {
      for (const cellDef of rowCells) {
        const cell = worksheet.getCell(cellDef.row, cellDef.colStart);
        cell.value = cellDef.label;
        if (cellDef.colSpan > 1 || cellDef.rowSpan > 1) {
          worksheet.mergeCells(
            cellDef.row,
            cellDef.colStart,
            cellDef.row + cellDef.rowSpan - 1,
            cellDef.colEnd
          );
        }
      }
    }

    for (let r = 1; r <= headerDepth; r++) {
      for (let c = 1; c <= totalHeaderCols; c++) {
        const cell = worksheet.getCell(r, c);
        cell.font = { ...(cell.font ?? {}), bold: true };
        cell.alignment = {
          ...(cell.alignment ?? {}),
          vertical: 'middle',
          horizontal: 'center',
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        };
      }
    }

    for (const row of preparedRows) {
      worksheet.addRow(row.out);
    }

    if (rowSpanModel && rowSpanningMode === 'real') {
      for (let rowIndex = 0; rowIndex < preparedRows.length; rowIndex++) {
        for (let colIndex = 0; colIndex < resolvedColumns.length; colIndex++) {
          const col = resolvedColumns[colIndex]!;
          const span = rowSpanModel.getRowSpan(rowIndex, col.id);
          if (span <= 1) continue;
          const startRow = headerDepth + rowIndex + 1;
          const endRow = startRow + span - 1;
          const excelCol = colIndex + 1;
          worksheet.mergeCells(startRow, excelCol, endRow, excelCol);
        }
      }
    }

    for (const col of resolvedColumns) {
      const worksheetColumn = worksheet.getColumn(col.headerKey);
      if (col.align) {
        worksheetColumn.alignment = { horizontal: col.align };
      }
      const numFmt = resolveExcelNumFmt(col.meta);
      if (numFmt) {
        worksheetColumn.numFmt = numFmt;
      }
    }

    for (let r = 1; r <= headerDepth; r++) {
      for (let c = 1; c <= totalHeaderCols; c++) {
        const cell = worksheet.getCell(r, c);
        cell.alignment = {
          ...(cell.alignment ?? {}),
          vertical: 'middle',
          horizontal: 'center',
        };
      }
    }

    if (defaultBorder) {
      applyExcelDefaultGridBorder(
        worksheet,
        preparedRows.length + headerDepth,
        resolvedColumns.length
      );
    }

    if (
      gridProps?.getRowStyle ||
      gridProps?.getCellStyle ||
      (rowSpanModel && rowSpanningMode === 'visual')
    ) {
      for (let rowIndex = 0; rowIndex < preparedRows.length; rowIndex++) {
        const worksheetRow = worksheet.getRow(rowIndex + headerDepth + 1);

        for (let colIndex = 0; colIndex < resolvedColumns.length; colIndex++) {
          const col = resolvedColumns[colIndex]!;
          const isCovered =
            Boolean(rowSpanModel) && rowSpanModel!.isCovered(rowIndex, col.id);
          const anchorRowIndex =
            isCovered ? rowSpanModel!.getAnchorRowIndex(rowIndex, col.id) : undefined;
          const styleRowIndex =
            rowSpanningMode === 'visual' && anchorRowIndex != null ? anchorRowIndex : rowIndex;
          const styleRow = sourceRows[styleRowIndex]!;
          const styleRowId = sourceRowIds[styleRowIndex]!;
          const rowStyle = gridProps?.getRowStyle?.({
            row: styleRow,
            rowId: styleRowId,
            rowIndex: styleRowIndex,
          });
          const cellStyle = gridProps?.getCellStyle?.({
            row: styleRow,
            rowId: styleRowId,
            rowIndex: styleRowIndex,
            columnId: col.id,
            value: preparedRows[rowIndex]!.styleValueByColumnId[col.id],
          });
          const cell = worksheetRow.getCell(colIndex + 1);
          applyExcelCellStyle(cell, rowStyle, cellStyle);

          if (rowSpanModel && rowSpanningMode === 'visual') {
            const span = rowSpanModel.getRowSpan(rowIndex, col.id);
            if (!isCovered && span > 1) {
              const prev = cell.border ?? {};
              cell.border = {
                ...prev,
                bottom: undefined,
              };
            } else if (isCovered && anchorRowIndex != null) {
              const anchorSpan = rowSpanModel.getRowSpan(anchorRowIndex, col.id);
              const isLastInSpan = rowIndex === anchorRowIndex + anchorSpan - 1;
              const prev = cell.border ?? {};
              cell.border = {
                ...prev,
                top: undefined,
                ...(isLastInSpan ? {} : { bottom: undefined }),
              };
            }
          }
        }
      }
    }

    if (!defaultBorder) {
      applyExcelOuterBorder(worksheet, preparedRows.length + headerDepth, resolvedColumns.length);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, stampedName);
  } catch (error) {
    onCommitError?.({ error });
    // eslint-disable-next-line no-console
    console.error(error);
  }
}
