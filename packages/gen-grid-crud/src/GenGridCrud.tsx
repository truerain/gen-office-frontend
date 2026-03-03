// packages/gen-grid-crud/src/GenGridCrud.tsx
import * as React from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import ExcelJS from 'exceljs';

import { applyDiff } from './crud/applyDiff';
import { usePendingChanges } from './crud/usePendingChanges';
import type { CrudRowId } from './crud/types';
import type {
  GenGridCrudProps,
  CrudUiState,
  CrudPendingDiff,
  CrudActionApi,
  CrudCellPatch,
} from './GenGridCrud.types';
import { CrudActionBar } from './components/CrudActionBar';
import styles from './GenGridCrud.module.css';

import { GenGrid } from '@gen-office/gen-grid';

const CRUD_TEMP_ID_KEY = '__crud_temp_id__';
const SYSTEM_COLUMN_IDS = new Set(['__select__', '__rowNumber__', '__row_status__']);

type ExportMeta<TData> = {
  format?: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'datetime' | 'boolean';
  trueLabel?: string;
  falseLabel?: string;
  emptyLabel?: string;
  exportValue?: (args: {
    value: unknown;
    row: TData;
    rowId: string;
    columnId: string;
  }) => unknown;
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

type ExcelBorderSide = {
  style?: ExcelJS.BorderStyle;
  color?: ExcelJS.Color;
};

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

function sanitizeFileNameBase(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return 'export';
  return trimmed
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'export';
}

function sanitizeSheetName(input: string): string {
  const cleaned = input
    .replace(/[\[\]:*?/\\]/g, '_')
    .trim()
    .slice(0, 31);
  return cleaned || 'Sheet1';
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
  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
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

function getHeaderLabel(column: any): string {
  if (typeof column.header === 'string') return column.header;
  if (typeof column.header === 'number') return String(column.header);
  if (typeof column.id === 'string' && column.id) return column.id;
  if (typeof column.accessorKey === 'string' && column.accessorKey) return column.accessorKey;
  return 'column';
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

function formatExportValue<TData>(value: unknown, meta?: ExportMeta<TData>): unknown {
  if (!meta?.format) return value;
  switch (meta.format) {
    case 'boolean':
      if (value === true) return meta.trueLabel ?? 'Yes';
      if (value === false) return meta.falseLabel ?? 'No';
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
        .toUpperCase(); // RRGGBBAA
      return `${expanded.slice(6, 8)}${expanded.slice(0, 6)}`;
    }
    if (hex.length === 6) return `FF${hex.toUpperCase()}`;
    if (hex.length === 8) {
      const upper = hex.toUpperCase(); // RRGGBBAA
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

function buildExportColumns<TData>(columns: readonly ColumnDef<TData, any>[]): ExportLeafColumn<TData>[] {
  const leaves = collectLeafColumns(columns);
  const exportColumns: ExportLeafColumn<TData>[] = [];
  for (const col of leaves as any[]) {
    const id = typeof col.id === 'string'
      ? col.id
      : typeof col.accessorKey === 'string'
        ? col.accessorKey
        : '';
    if (!id || SYSTEM_COLUMN_IDS.has(id)) continue;
    exportColumns.push({
      id,
      header: getHeaderLabel(col),
      accessorKey: typeof col.accessorKey === 'string' ? col.accessorKey : undefined,
      accessorFn: typeof col.accessorFn === 'function' ? col.accessorFn : undefined,
      meta: col.meta as ExportMeta<TData> | undefined,
      size: typeof col.size === 'number' ? col.size : undefined,
      align: (col.meta?.align as 'left' | 'center' | 'right' | undefined) ?? undefined,
    });
  }
  return exportColumns;
}

function withTempId<TData>(row: TData, tempId: CrudRowId): TData {
  const next = { ...(row as any) } as any;
  Object.defineProperty(next, CRUD_TEMP_ID_KEY, {
    value: tempId,
    // keep temp id on row copies (spread/clone) so created rows remain editable
    enumerable: true,
  });
  return next as TData;
}

function getCrudRowId<TData>(row: TData, fallback: (row: TData) => CrudRowId): CrudRowId {
  const tempId = (row as any)[CRUD_TEMP_ID_KEY] as CrudRowId | undefined;
  return tempId ?? fallback(row);
}

function generateTempId(): CrudRowId {
  return `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}


/* RowStatus/patch 愿???좏떥 */
function shallowDiffPatch<TData extends Record<string, any>>(
  prev: TData,
  next: TData,
  keys: readonly string[]
): Partial<TData> {
  const patch: Partial<TData> = {};
  let changed = false;

  for (const k of keys) {
    if (!Object.is(prev[k], next[k])) {
      (patch as any)[k] = next[k];
      changed = true;
    }
  }

  return changed ? patch : {};
}

/**
 */
/*
 * columns?먯꽌 patch 鍮꾧탳???ъ슜??key 異붿텧:
 * - accessorKey(string) ?곗꽑 ?ъ슜
 * - ?놁쑝硫?鍮?諛곗뿴
 */
function getEditableKeysFromColumns<TData>(columns: readonly ColumnDef<TData, any>[]): string[] {
  const keys: string[] = [];
  for (const c of columns as any[]) {
    const k = c.accessorKey;
    if (typeof k === 'string') keys.push(k);
  }
  return keys;
}

function getFirstEditableColumnId<TData>(columns: readonly ColumnDef<TData, any>[]): string | null {
  for (const c of columns as any[]) {
    const k = c.accessorKey ?? c.id;
    if (typeof k === 'string') return k;
  }
  return null;
}

function buildPendingDiffFromPending<TData>(
  pending: { created: Map<CrudRowId, TData>; updated: Map<CrudRowId, Partial<TData>>; deleted: Set<CrudRowId> }
): CrudPendingDiff<TData> {
  const createdIds = new Set<CrudRowId>(pending.created.keys());
  const deletedIds = pending.deleted;

  const added: TData[] = [];
  for (const [id, row] of pending.created.entries()) {
    if (deletedIds.has(id)) continue;
    added.push(row);
  }

  const modified: { id: CrudRowId; patch: Partial<TData> }[] = [];
  for (const [id, patch] of pending.updated.entries()) {
    if (deletedIds.has(id)) continue;
    if (createdIds.has(id)) continue;
    modified.push({ id, patch });
  }

  const deleted: { id: CrudRowId }[] = [];
  for (const id of deletedIds) {
    if (createdIds.has(id)) continue;
    deleted.push({ id });
  }

  return { added, modified, deleted };
}

export function GenGridCrud<TData>(props: GenGridCrudProps<TData>) {
  const {
    title,
    data,
    columns,
    getRowId,

    createRow,
    // columnId/value -> patch 留ㅽ븨 ?⑥닔 (accessorKey媛 ?덉쑝硫?湲곕낯 ?숈옉?쇰줈??異⑸텇)
    makePatch, // columnId/value瑜?patch濡?蹂?섑븯???⑥닔 (accessorKey媛 ?덉쑝硫?湲곕낯 ?숈옉?쇰줈 異⑸텇)
    deleteMode = 'selected',

    onCommit,
    isCommitting: isCommittingControlled,
    onCommitSuccess,
    onCommitError,
    beforeCommit,

    actionBar,
    showActionBar = true,
    actionBarPosition = 'top',
    actionButtonStyle = 'text',

    rowSelection: rowSelectionControlledIds,
    onRowSelectionChange: onRowSelectionIdsChange,

    // active cell (?듭뀡)
    activeCell: activeCellControlled,
    onActiveCellChange,
    onActiveRowChange,

    onStateChange,
    onCellEdit,
    excelExport,
    editorFactory,

    clearDirtyOnRevert = true,

    gridProps,
  } = props;

  const actionBarEnabled = actionBar?.enabled ?? showActionBar;
  const resolvedActionBarPosition = actionBar?.position ?? actionBarPosition;
  const resolvedActionButtonStyle = actionBar?.defaultStyle ?? actionButtonStyle;
  const includedBuiltInActions = actionBar?.includeBuiltIns;
  const customActions = actionBar?.customActions;

  const [rowSelectionUncontrolled, setRowSelectionUncontrolled] = React.useState<readonly CrudRowId[]>([]);
  const rowSelectionIds = rowSelectionControlledIds ?? rowSelectionUncontrolled;

  const rowSelection = React.useMemo<RowSelectionState>(() => {
    const next: RowSelectionState = {};
    for (const id of rowSelectionIds) {
      next[String(id)] = true;
    }
    return next;
  }, [rowSelectionIds]);


  const setRowSelectionIds = React.useCallback(
    (next: readonly CrudRowId[]) => {
      onRowSelectionIdsChange?.(next);
      if (rowSelectionControlledIds == null) setRowSelectionUncontrolled(next);
    },
    [onRowSelectionIdsChange, rowSelectionControlledIds]
  );

  const [activeCellUncontrolled, setActiveCellUncontrolled] = React.useState<{ rowId: CrudRowId; columnId: string } | null>(null);
  const activeCell = activeCellControlled ?? activeCellUncontrolled;

  const setActiveCell = React.useCallback(
    (next: { rowId: CrudRowId; columnId: string } | null) => {
      onActiveCellChange?.(next);
      if (activeCellControlled == null) setActiveCellUncontrolled(next);
    },
    [onActiveCellChange, activeCellControlled]
  );

  const [filterEnabled, setFilterEnabled] = React.useState<boolean>(
    gridProps?.enableFiltering ?? false
  );

  React.useEffect(() => {
    if (gridProps?.enableFiltering == null) return;
    setFilterEnabled(Boolean(gridProps.enableFiltering));
  }, [gridProps?.enableFiltering]);

  const handleRowSelectionChange = React.useCallback(
    (next: RowSelectionState) => {
      const nextIds = Object.keys(next).filter((k) => next[k]);
      setRowSelectionIds(nextIds);
    },
    [setRowSelectionIds]
  );

    // --- committing state
  const [isCommittingLocal, setIsCommittingLocal] = React.useState(false);
  const isCommitting = isCommittingControlled ?? isCommittingLocal;

  
  // --- pending changes
  const pendingApi = usePendingChanges<TData>();

  // diffKeys: accessorKey 기반으로 patch 비교 키 추출
  const diffKeys = React.useMemo(() => getEditableKeysFromColumns(columns), [columns]);
  const firstEditableColumnId = React.useMemo(() => getFirstEditableColumnId(columns), [columns]);

  const activeCellForGrid = React.useMemo(
    () => (activeCell ? { rowId: String(activeCell.rowId), columnId: activeCell.columnId } : null),
    [activeCell]
  );
  const publishStateRef = React.useRef<string>("__init__");

  const publishStateKey = React.useMemo(() => {
    const selectedKey = rowSelectionIds.join(",");
    const activeRowKey = activeCell?.rowId ?? "";
    const activeColKey = activeCell?.columnId ?? "";
    const changesKey = pendingApi.changes.map((c) => {
      if (c.type === "create") return `c:${String(c.tempId)}`;
      if (c.type === "update") return `u:${String(c.rowId)}:${Object.keys(c.patch ?? {}).join("|")}`;
      if (c.type === "delete") return `d:${String(c.rowId)}`;
      if (c.type === "undelete") return `ud:${String(c.rowId)}`;
      return "";
    }).join(",");
    return [
      String(gridProps?.dataVersion ?? ""),
      String(pendingApi.dirty),
      selectedKey,
      `${activeRowKey}:${activeColKey}`,
      String(isCommitting),
      changesKey,
    ].join("||");
  }, [
    rowSelectionIds,
    activeCell?.rowId,
    activeCell?.columnId,
    pendingApi.changes,
    pendingApi.dirty,
    gridProps?.dataVersion,
    isCommitting,
  ]);

  const diff = React.useMemo(
    () =>
      applyDiff({
        baseData: data,
        getRowId,
        pending: pendingApi.pending,
        insertCreated: { mode: 'end' },
        deletedVisibility: 'hide',
      }),
    [data, getRowId, pendingApi.pending]
  );

  const tableMeta = React.useMemo(() => {
    const baseMeta = (gridProps as any)?.tableMeta ?? {};
    return {
      ...baseMeta,
      genGridCrud: {
        deleteRow: (rowId: CrudRowId) => pendingApi.deleteRowIds([rowId]),
      },
    };
  }, [gridProps, pendingApi]);

  const pendingDiff = React.useMemo(
    () => buildPendingDiffFromPending<TData>(pendingApi.pending),
    [pendingApi.pending]
  );

  // GenGrid???꾨떖??mutable array
  const gridData = React.useMemo<TData[]>(
    () => Array.from(diff.viewData),
    [diff.viewData]
  );

  // ??GenGrid getRowId??(row) => string
  // GenGrid??rowId瑜?string?쇰줈 ?ъ슜
  const genGridGetRowId = React.useCallback(
    (row: TData) => {
      const id = getCrudRowId(row, (r) => getRowId(r, -1));
      return String(id);
    },
    [getRowId]
  );

  // pending update용 rowId (number/string 그대로 유지)
  const getPendingRowId = React.useCallback(
    (row: TData) => getCrudRowId(row, (r) => getRowId(r, -1)),
    [getRowId]
  );

  const pendingRowIdByGridId = React.useMemo(() => {
    const map = new Map<string, CrudRowId>();
    for (const row of gridData) {
      const pendingId = getPendingRowId(row);
      map.set(String(pendingId), pendingId);
    }
    return map;
  }, [gridData, getPendingRowId]);

  const prevActiveRowIdRef = React.useRef<CrudRowId | null>(null);
  React.useEffect(() => {
    const nextActiveRowId = activeCell?.rowId ?? null;
    if (Object.is(prevActiveRowIdRef.current, nextActiveRowId)) return;
    prevActiveRowIdRef.current = nextActiveRowId;

    let row: TData | null = null;
    let rowIndex = -1;

    if (nextActiveRowId != null) {
      rowIndex = gridData.findIndex(
        (r) => String(getPendingRowId(r)) === String(nextActiveRowId)
      );
      if (rowIndex >= 0) row = gridData[rowIndex] ?? null;
    }

    onActiveRowChange?.({
      rowId: nextActiveRowId,
      row,
      rowIndex,
    });
  }, [activeCell?.rowId, getPendingRowId, gridData, onActiveRowChange]);

  const baseRowById = React.useMemo(() => {
    const map = new Map<CrudRowId, TData>();
    for (let i = 0; i < data.length; i++) {
      const row = data[i]!;
      map.set(getRowId(row, i), row);
    }
    return map;
  }, [data, getRowId]);

  const skipNextOnDataChangeRef = React.useRef(false);


  // --- Action handlers
  const handleAdd = React.useCallback(() => {
    if (!createRow) return;
    const tempId = generateTempId();
    const row = withTempId(createRow(), tempId);
    pendingApi.addRow(row, { tempId });
    if (firstEditableColumnId) {
      setActiveCell({ rowId: tempId, columnId: firstEditableColumnId });
    }
  }, [createRow, pendingApi, firstEditableColumnId, onActiveCellChange]);

  // ?좏깮/?쒖꽦 ??湲곗??쇰줈 pending delete 泥섎━
  const handleDelete = React.useCallback(() => {
    let targets: readonly CrudRowId[] = [];

    if (deleteMode === 'selected') {
      targets = rowSelectionIds.map(
        (rowId) => pendingRowIdByGridId.get(String(rowId)) ?? rowId
      );
    } else if (deleteMode === 'activeRow') {
      const rowId = activeCell?.rowId;
      targets = rowId != null ? [rowId] : [];
    }

    if (!targets.length) return;
    pendingApi.deleteRowIds(targets);
    setRowSelectionIds([]);
  }, [
    deleteMode,
    rowSelectionIds,
    activeCell,
    activeCellControlled,
    pendingApi,
    pendingRowIdByGridId,
    setRowSelectionIds,
  ]);

  const handleReset = React.useCallback(() => {
    pendingApi.reset();
  }, [pendingApi]);

  const handleToggleFilter = React.useCallback(() => {
    setFilterEnabled((prev) => !prev);
  }, []);

  const handleSave = React.useCallback(async () => {
    const changes = pendingApi.changes;
    if (!changes.length) return;

    const stateForGuard: CrudUiState<TData> = {
      baseData: data,
      viewData: diff.viewData,
      changes,
      pendingDiff,
      dirty: pendingApi.dirty,
      rowSelection: rowSelectionIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      isCommitting,
    };

    const ok = await beforeCommit?.(stateForGuard);
    if (ok === false) return;

    try {
      if (isCommittingControlled == null) setIsCommittingLocal(true);

      const result = await onCommit({
        changes,
        ctx: { baseData: data, viewData: diff.viewData },
      });

      if (result.ok) {
        pendingApi.reset();
        onCommitSuccess?.({ nextData: result.nextData });
      } else {
        onCommitError?.({ error: result.error, fieldErrors: result.fieldErrors });
      }
    } catch (e) {
      onCommitError?.({ error: e });
    } finally {
      if (isCommittingControlled == null) setIsCommittingLocal(false);
    }
  }, [
    pendingApi,
    onCommit,
    onCommitSuccess,
    onCommitError,
    beforeCommit,
    data,
    rowSelectionIds,
    activeCell, activeCellControlled,
    isCommitting,
    isCommittingControlled,
  ]);

  const handleExportExcel = React.useCallback(async () => {
    if (!excelExport) return;

    const stateForExport: CrudUiState<TData> = {
      baseData: data,
      viewData: diff.viewData,
      changes: pendingApi.changes,
      pendingDiff,
      dirty: pendingApi.dirty,
      rowSelection: rowSelectionIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      isCommitting,
    };

    const baseName = sanitizeFileNameBase(excelExport.fileName ?? title ?? 'export');
    const stampedName = `${baseName}_${toTimestamp()}.xlsx`;
    const sheetName = sanitizeSheetName(excelExport.sheetName ?? title ?? 'Sheet1');

    try {
      if (excelExport.mode === 'backend') {
        const backend = excelExport.backend;
        if (!backend?.endpoint) {
          throw new Error('[GenGridCrud] excelExport.backend.endpoint is required for backend mode.');
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
          throw new Error(`[GenGridCrud] excel export request failed: ${response.status}`);
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
      const selectedIds = new Set(rowSelectionIds.map((id) => String(id)));
      const sourceRows = onlySelected
        ? diff.viewData.filter((row) => selectedIds.has(String(getPendingRowId(row))))
        : diff.viewData;

      const exportColumns = buildExportColumns(columns);
      const headerSeen = new Map<string, number>();
      const resolvedColumns = exportColumns.map((col) => {
        const seq = (headerSeen.get(col.header) ?? 0) + 1;
        headerSeen.set(col.header, seq);
        const headerKey = seq === 1 ? col.header : `${col.header}_${seq}`;
        return { ...col, headerKey };
      });

      const preparedRows = sourceRows.map((row, rowIndex) => {
        const out: Record<string, string | number | boolean | null> = {};
        const styleValueByColumnId: Record<string, unknown> = {};
        const rowId = String(getPendingRowId(row));
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
            col.meta
          );
          out[col.headerKey] = coerceExportCellValue(normalized);
          styleValueByColumnId[col.id] = baseValue;
        }
        return { out, styleValueByColumnId };
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      worksheet.columns = resolvedColumns.map((col) => ({
        header: col.header,
        key: col.headerKey,
        width: toExcelColumnWidth(col.size, col.header),
      }));

      for (const row of preparedRows) {
        worksheet.addRow(row.out);
      }

      for (const col of resolvedColumns) {
        const worksheetColumn = worksheet.getColumn(col.headerKey);
        if (col.align) {
          worksheetColumn.alignment = { horizontal: col.align };
        }
      }

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      if (gridProps?.getRowStyle || gridProps?.getCellStyle) {
        for (let rowIndex = 0; rowIndex < preparedRows.length; rowIndex++) {
          const row = sourceRows[rowIndex]!;
          const rowId = String(getPendingRowId(row));
          const rowStyle = gridProps.getRowStyle?.({ row, rowId, rowIndex });
          const worksheetRow = worksheet.getRow(rowIndex + 2);

          for (let colIndex = 0; colIndex < resolvedColumns.length; colIndex++) {
            const col = resolvedColumns[colIndex]!;
            const cellStyle = gridProps.getCellStyle?.({
              row,
              rowId,
              rowIndex,
              columnId: col.id,
              value: preparedRows[rowIndex]!.styleValueByColumnId[col.id],
            });
            const cell = worksheetRow.getCell(colIndex + 1);
            applyExcelCellStyle(cell, rowStyle, cellStyle);
          }
        }
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
  }, [
    excelExport,
    data,
    diff.viewData,
    pendingApi.changes,
    pendingApi.dirty,
    pendingDiff,
    rowSelectionIds,
    activeCell?.rowId,
    activeCell?.columnId,
    isCommitting,
    title,
    columns,
    getPendingRowId,
    onCommitError,
    gridProps,
  ]);


  // GenGrid?먯꽌 ?꾨떖??viewData 蹂寃쎌쓣 pending patch濡?蹂??
  const handleGridDataChange = React.useCallback(
    (nextViewData: TData[]) => {
      if (skipNextOnDataChangeRef.current) {
        skipNextOnDataChangeRef.current = false;
        return;
      }

      const prevById = new Map<CrudRowId, TData>();
      for (let i = 0; i < gridData.length; i++) {
        const r = gridData[i]!;
        prevById.set(getPendingRowId(r), r);
      }

      for (let i = 0; i < nextViewData.length; i++) {
        const nextRow = nextViewData[i]!;
        const rowId = getPendingRowId(nextRow);
        const prevRow = prevById.get(rowId);
        if (!prevRow) continue;

        if (diffKeys.length > 0 && typeof prevRow === 'object' && typeof nextRow === 'object') {
          const patch = shallowDiffPatch(prevRow as any, nextRow as any, diffKeys);
          if (Object.keys(patch).length) {
            pendingApi.updateRow(rowId, patch as any);
          }
        } else {
        }
      }

    },
    [gridData, getPendingRowId, pendingApi, diffKeys]
  );

  const handleCellValueChange = React.useCallback(
    (args: { rowId: string; columnId: string; value: unknown }) => {
      const applyPatch = (targetRowId: CrudRowId, patch: Partial<TData>) => {
        if (!patch || Object.keys(patch).length === 0) return;
        if (clearDirtyOnRevert) {
          const baseRow = baseRowById.get(targetRowId);
          if (!baseRow) {
            pendingApi.updateRow(targetRowId, patch);
            return;
          }

          const keys = Object.keys(patch);
          const keysToClear = keys.filter((k) => Object.is((baseRow as any)[k], (patch as any)[k]));
          const keysToSet = keys.filter((k) => !Object.is((baseRow as any)[k], (patch as any)[k]));

          if (keysToSet.length) {
            const nextPatch: Partial<TData> = {};
            for (const k of keysToSet) (nextPatch as any)[k] = (patch as any)[k];
            pendingApi.updateRow(targetRowId, nextPatch);
          }

          if (keysToClear.length) {
            pendingApi.clearPatchKeys(targetRowId, keysToClear);
          }
          return;
        }
        pendingApi.updateRow(targetRowId, patch);
      };

      const pendingRowId = pendingRowIdByGridId.get(args.rowId) ?? args.rowId;
      const rowIndex = gridData.findIndex(
        (row) => String(getPendingRowId(row)) === String(pendingRowId)
      );
      const row = rowIndex >= 0 ? gridData[rowIndex] : undefined;
      const prevValue = row ? (row as any)[args.columnId] : undefined;
      let additionalPatches: readonly CrudCellPatch<TData>[] = [];
      if (row && !Object.is(prevValue, args.value)) {
        additionalPatches =
          onCellEdit?.({
          rowId: args.rowId,
          columnId: args.columnId,
          rowIndex,
          prevValue,
          nextValue: args.value,
          row,
          viewData: gridData,
        }) ?? [];
      }
      skipNextOnDataChangeRef.current = true;
      const patch =
        makePatch?.({ rowId: pendingRowId, columnId: args.columnId, value: args.value }) ??
        ({ [args.columnId]: args.value } as any);
      applyPatch(pendingRowId, patch);

      for (const extra of additionalPatches) {
        const targetRowId = pendingRowIdByGridId.get(String(extra.rowId)) ?? extra.rowId;
        applyPatch(targetRowId, extra.patch);
      }
    },
    [
      gridData,
      getPendingRowId,
      makePatch,
      onCellEdit,
      pendingApi,
      pendingRowIdByGridId,
      clearDirtyOnRevert,
      baseRowById,
    ]
  );

  // --- state publish
  React.useEffect(() => {
    if (publishStateRef.current === publishStateKey) return;
    publishStateRef.current = publishStateKey;
    onStateChange?.({
      baseData: data,
      viewData: diff.viewData,
      changes: pendingApi.changes,
      pendingDiff,
      dirty: pendingApi.dirty,
      rowSelection: rowSelectionIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      isCommitting,
    });
  }, [
    onStateChange,
    data,
    pendingApi.changes,
    pendingApi.dirty,
    rowSelectionIds,
    activeCell, activeCellControlled,
    isCommitting,
  ]);

  const actionApi = React.useMemo<CrudActionApi>(
    () => ({
      add: createRow ? handleAdd : undefined,
      deleteSelected: handleDelete,
      save: handleSave,
      reset: handleReset,
      toggleFilter: handleToggleFilter,
      exportExcel: excelExport ? handleExportExcel : undefined,
    }),
    [createRow, handleAdd, handleDelete, handleSave, handleReset, handleToggleFilter, excelExport, handleExportExcel]
  );

  const actionBarNode =
    actionBarEnabled ? (
      <CrudActionBar<TData>
        title={title}
        state={{
          baseData: data,
          viewData: diff.viewData,
          changes: pendingApi.changes,
          pendingDiff,
          dirty: pendingApi.dirty,
          rowSelection: rowSelectionIds,
          activeRowId: activeCell?.rowId,
          activeColumnId: activeCell?.columnId,
          isCommitting,
        }}
        actionApi={actionApi}
        filterEnabled={filterEnabled}
        actionButtonStyle={resolvedActionButtonStyle}
        includeBuiltIns={includedBuiltInActions}
        customActions={customActions}
      />
    ) : null;

  const mergedGridProps = React.useMemo(
    () => ({
      ...gridProps,
      enableFiltering: filterEnabled,
    }),
    [gridProps, filterEnabled]
  );

  return (
    <div className={styles.root}>
      {(resolvedActionBarPosition === 'top' || resolvedActionBarPosition === 'both') && (
        <div className={styles.actionBarTop}>{actionBarNode}</div>
      )}

      <div className={styles.gridArea}>
        <GenGrid<TData>
          data={gridData}
          onCellValueChange={handleCellValueChange}
          onDataChange={handleGridDataChange}
          dataVersion={gridProps?.dataVersion}
          columns={columns as ColumnDef<TData, any>[]}
          getRowId={genGridGetRowId}
          activeCell={activeCellForGrid}
          onActiveCellChange={(next) => setActiveCell(next)}
          rowStatusResolver={(rowId) => {
            const pendingRowId = pendingRowIdByGridId.get(String(rowId)) ?? rowId;
            return pendingApi.getRowStatus(pendingRowId);
          }}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
          {...mergedGridProps}
          tableMeta={tableMeta}
          editorFactory={editorFactory}
        />
      </div>

      {(resolvedActionBarPosition === 'bottom' || resolvedActionBarPosition === 'both') && (
        <div className={styles.actionBarBottom}>{actionBarNode}</div>
      )}
    </div>
  );
}
