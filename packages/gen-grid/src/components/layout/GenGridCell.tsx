// packages/gen-grid/src/components/layout/GenGridCell.tsx

import * as React from 'react';
import { flexRender, type Cell } from '@tanstack/react-table';

import bodyStyles from './GenGridBody.module.css';
import pinningStyles from './GenGridPinning.module.css';

import { getCellStyle } from './cellStyles';
import { getMeta, type GenGridColumnMeta } from './utils';
import { formatCellValue } from './cellFormat';
import { SELECTION_COLUMN_ID } from '../../features/row-selection/rowSelection';
import { ROW_NUMBER_COLUMN_ID } from '../../features/row-number/useRowNumberColumn';
import { useGenGridContext } from '../../core/context/GenGridProvider';
import { focusGridCell } from '../../features/active-cell/cellDom';

export type GenGridCellProps<TData> = {
  cell: Cell<TData, unknown>;
  rowId: string;
  rowStyle?: React.CSSProperties;

  isActive: boolean;
  isEditing: boolean;
  isInSelectedRange?: boolean;

  /** ✅ Step11: dirty 표시 */
  isDirty?: boolean;

  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  getCellClassName?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
    columnId: string;
    value: unknown;
  }) => string | undefined;
  getCellStyle?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
    columnId: string;
    value: unknown;
  }) => React.CSSProperties | undefined;

  cellProps: React.TdHTMLAttributes<HTMLTableCellElement>;
  isRowSpanCovered?: boolean;
  cellRowSpan?: number;
  hideBottomBorder?: boolean;

  onCommitValue: (nextValue: unknown) => void;
  onCommitEdit: () => void;
  onApplyValue: (nextValue: unknown) => void;
  onCancelEdit: (opts?: { preserve?: boolean }) => void;

  /** ✅ Tab / Shift+Tab 편집 이동 */
  onTab?: (dir: 1 | -1) => void;
};

function pickRowStyleForCell(style?: React.CSSProperties): React.CSSProperties | undefined {
  if (!style) return undefined;
  return {
    background: style.background,
    backgroundColor: style.backgroundColor,
    color: style.color,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    border: style.border,
    borderTop: style.borderTop,
    borderRight: style.borderRight,
    borderBottom: style.borderBottom,
    borderLeft: style.borderLeft,
  };
}

type GenGridTreeMeta = {
  treeColumnId?: string;
  indentPx?: number;
  depthByRowId?: Record<string, number>;
  hasChildrenByRowId?: Record<string, boolean>;
  orphanRowIds?: string[];
  expandedRowIds?: Record<string, boolean>;
  isExpanded?: (rowId: string) => boolean;
  toggleRow?: (rowId: string) => void;
};

type ContentEditableEditorProps = {
  value: unknown;
  onChange: (next: string) => void;
  onCommit: (nextValue?: string) => void;
  onCancel: () => void;
  onEscFocus?: () => void;
  onTabMove?: (dir: 1 | -1) => void;
  multiline?: boolean;
  style?: React.CSSProperties;
  allowArrowNavigation?: boolean;
  sanitizeInput?: (next: string) => string;
};

function getCaretOffset(root: HTMLElement): number | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;
  const pre = document.createRange();
  pre.setStart(root, 0);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length;
}

function setCaretOffset(root: HTMLElement, offset: number) {
  const target = Math.max(0, Math.min(offset, root.textContent?.length ?? 0));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current: Node | null = walker.nextNode();
  let remaining = target;

  while (current) {
    const len = current.textContent?.length ?? 0;
    if (remaining <= len) {
      const range = document.createRange();
      range.setStart(current, remaining);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    remaining -= len;
    current = walker.nextNode();
  }

  const fallback = document.createRange();
  fallback.selectNodeContents(root);
  fallback.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(fallback);
}

function sanitizeNumberText(value: string): string {
  let out = '';
  let hasDot = false;
  let hasSign = false;

  for (const ch of value) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
      continue;
    }
    if (ch === '-' && !hasSign && out.length === 0) {
      out += ch;
      hasSign = true;
      continue;
    }
    if (ch === '.' && !hasDot) {
      out += ch;
      hasDot = true;
    }
  }

  return out;
}

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

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
}

function ContentEditableEditor({
  value,
  onChange,
  onCommit,
  onCancel,
  onEscFocus,
  onTabMove,
  multiline,
  style,
  allowArrowNavigation,
  sanitizeInput,
}: ContentEditableEditorProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const didAutoSelectRef = React.useRef(false);
  const pendingAutoSelectRef = React.useRef(false);
  const autoSelectActiveRef = React.useRef(false);

  const setAutoSelectActive = (next: boolean) => {
    autoSelectActiveRef.current = next;
    const el = ref.current;
    if (el) {
      if (next) el.setAttribute('data-gen-grid-autoselect', 'true');
      else el.removeAttribute('data-gen-grid-autoselect');
    }
  };

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!didAutoSelectRef.current) {
      el.focus({ preventScroll: true });
      didAutoSelectRef.current = true;
    }
  }, []);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nextText = value == null ? '' : String(value);
    if (el.textContent !== nextText) {
      const caretOffset = document.activeElement === el ? getCaretOffset(el) : null;
      el.textContent = nextText;
      if (caretOffset != null) {
        setCaretOffset(el, caretOffset);
      }
    }
    if (pendingAutoSelectRef.current && document.activeElement === el) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      pendingAutoSelectRef.current = false;
      setAutoSelectActive(true);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const root = ref.current;
    const selection = window.getSelection();
    const isCollapsed = selection?.isCollapsed ?? false;
    const range = selection && selection.rangeCount ? selection.getRangeAt(0) : null;
    const hasValidRange =
      root && range && root.contains(range.startContainer) && root.contains(range.endContainer);

    const isCaretAtStart = () => {
      if (!root || !hasValidRange || !isCollapsed || !range) return false;
      const pre = document.createRange();
      pre.setStart(root, 0);
      pre.setEnd(range.startContainer, range.startOffset);
      return pre.toString().length === 0;
    };

    const isCaretAtEnd = () => {
      if (!root || !hasValidRange || !isCollapsed || !range) return false;
      const post = document.createRange();
      post.setStart(range.endContainer, range.endOffset);
      post.setEnd(root, root.childNodes.length);
      return post.toString().length === 0;
    };

    if (!allowArrowNavigation || !autoSelectActiveRef.current) {
      if (e.key === 'ArrowLeft' || e.key === 'Home') {
        if (!isCaretAtStart()) {
          e.stopPropagation();
        }
      }
      if (e.key === 'ArrowRight' || e.key === 'End') {
        if (!isCaretAtEnd()) {
          e.stopPropagation();
        }
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      setAutoSelectActive(false);
      const nextText = ref.current?.textContent ?? '';
      onCommit(sanitizeInput ? sanitizeInput(nextText) : nextText);
      onTabMove?.(e.shiftKey ? -1 : 1);
      return;
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      e.stopPropagation();
      setAutoSelectActive(false);
      const nextText = ref.current?.textContent ?? '';
      onCommit(sanitizeInput ? sanitizeInput(nextText) : nextText);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setAutoSelectActive(false);
      onCancel();
      onEscFocus?.();
      return;
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline={multiline ? 'true' : undefined}
      onFocus={() => {
        pendingAutoSelectRef.current = true;
      }}
      onBeforeInput={(e: React.FormEvent<HTMLDivElement>) => {
        if (!sanitizeInput) return;
        const inserted = (e.nativeEvent as InputEvent).data;
        if (!inserted) return;
        if (!/^[0-9.-]+$/.test(inserted)) {
          e.preventDefault();
        }
      }}
      onInput={() => {
        setAutoSelectActive(false);
        const root = ref.current;
        if (!root) {
          onChange('');
          return;
        }

        const raw = root.textContent ?? '';
        const next = sanitizeInput ? sanitizeInput(raw) : raw;

        if (next !== raw) {
          const caret = getCaretOffset(root);
          root.textContent = next;
          if (caret != null) {
            setCaretOffset(root, Math.min(caret, next.length));
          }
        }

        onChange(next);
      }}
      onMouseDown={() => {
        setAutoSelectActive(false);
      }}
      onBlur={() => {
        didAutoSelectRef.current = false;
        pendingAutoSelectRef.current = false;
        setAutoSelectActive(false);
        const rawText = ref.current?.textContent ?? '';
        const nextText = sanitizeInput ? sanitizeInput(rawText) : rawText;
        onChange(nextText);
        onCommit(nextText);
      }}
      onKeyDown={handleKeyDown}
      style={{
        ...style,
        whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
        overflow: 'hidden',
      }}
    />
  );
}

export function GenGridCell<TData>(props: GenGridCellProps<TData>) {
  const { options } = useGenGridContext<TData>();
  const {
    cell,
    rowId,
    rowStyle,
    isActive,
    isEditing,
    isInSelectedRange,
    isDirty,
    enablePinning,
    enableColumnSizing,
    getCellClassName,
    getCellStyle: getCellStyleByRule,
    cellProps,
    isRowSpanCovered,
    cellRowSpan,
    hideBottomBorder,
    onCommitValue,
    onCommitEdit,
    onApplyValue,
    onCancelEdit,
    onTab,
  } = props;

  const colId = cell.column.id;
  const rowIndex = cell.row.index;
  const cellValue = cell.getValue();
  const table = cell.getContext().table;
  const pinned = cell.column.getIsPinned();
  const meta = getMeta(cell.column.columnDef) as (GenGridColumnMeta & Record<string, any>) | undefined;

  const isSystemCol = colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID;
  const treeMeta = ((table.options.meta as any)?.genGridTree ?? null) as GenGridTreeMeta | null;
  const firstVisibleColumnId = table.getVisibleLeafColumns()[0]?.id;
  const treeColumnId = treeMeta?.treeColumnId ?? firstVisibleColumnId;
  const isTreeColumn = Boolean(treeMeta) && !isSystemCol && colId === treeColumnId;
  const treeDepth = isTreeColumn ? (treeMeta?.depthByRowId?.[rowId] ?? 0) : 0;
  const treeHasChildren = isTreeColumn ? Boolean(treeMeta?.hasChildrenByRowId?.[rowId]) : false;
  const treeIsExpanded = treeHasChildren
    ? Boolean(treeMeta?.isExpanded?.(rowId) ?? treeMeta?.expandedRowIds?.[rowId])
    : false;
  const treeIsOrphan = isTreeColumn ? Boolean(treeMeta?.orphanRowIds?.includes(rowId)) : false;
  const treeIndentPx = Math.max(0, Number(treeMeta?.indentPx ?? 12) || 0);

  const effectiveMeta = React.useMemo(() => {
    if (!meta) return meta;
    if (meta.format) return meta;
    if (meta.semanticType === 'amount') {
      return { ...meta, format: 'number' as const };
    }
    if (meta.semanticType === 'percent') {
      return { ...meta, format: 'percent' as const };
    }
    return meta;
  }, [meta]);

  const semanticType = meta?.semanticType;
  const isNegativeStyleSupported = semanticType === 'amount' || semanticType === 'percent';
  const amountNegativeStyle =
    semanticType === 'amount'
      ? (meta?.amountOptions?.negativeStyle ?? 'both')
      : semanticType === 'percent'
        ? (meta?.percentOptions?.negativeStyle ?? 'none')
        : 'none';
  const amountNegativeColor =
    semanticType === 'amount'
      ? (meta?.amountOptions?.negativeColor ?? true)
      : semanticType === 'percent'
        ? (meta?.percentOptions?.negativeColor ?? false)
        : false;
  const numericCellValue = toFiniteNumber(cellValue);
  const isAmountNegative = isNegativeStyleSupported && numericCellValue != null && numericCellValue < 0;
  const amountNegativeText = isAmountNegative && amountNegativeColor;
  const amountNegativeTriangle =
    isAmountNegative && (amountNegativeStyle === 'triangle' || amountNegativeStyle === 'both');

  const percentMode = meta?.semanticType === 'percent' ? (meta?.percentOptions?.mode ?? 'plain') : 'plain';
  let percentDeltaDirection: 'up' | 'down' | null = null;

  if (semanticType === 'percent' && percentMode === 'delta' && numericCellValue != null) {
    const deltaFrom = meta?.percentOptions?.deltaFrom;
    let baselineValue: unknown;

    if (typeof deltaFrom === 'function') {
      baselineValue = deltaFrom({
        row: cell.row.original,
        rowId,
        columnId: colId,
        value: cellValue,
      });
    } else if (typeof deltaFrom === 'string' && isRecordLike(cell.row.original)) {
      baselineValue = cell.row.original[deltaFrom];
    } else {
      baselineValue = null;
    }

    const baselineNumber = toFiniteNumber(baselineValue);
    if (baselineNumber != null) {
      const rawDelta = numericCellValue - baselineNumber;
      if (rawDelta !== 0) {
        const invertDirection = Boolean(meta?.percentOptions?.invertDirection);
        const isUp = rawDelta > 0;
        percentDeltaDirection = invertDirection ? (isUp ? 'down' : 'up') : (isUp ? 'up' : 'down');
      }
    }
  }

  const alignClass =
    meta?.align === 'right'
      ? bodyStyles.alignRight
      : meta?.align === 'center'
        ? bodyStyles.alignCenter
        : bodyStyles.alignLeft;

  const [draft, setDraft] = React.useState<unknown>(cell.getValue());
  const normalizeEditValue = React.useCallback(
    (value: unknown) => {
      const normalize = meta?.editValueNormalizer as
        | ((args: { value: unknown; row: TData; rowId: string; columnId: string }) => unknown)
        | undefined;
      if (!normalize) return value;
      return normalize({
        value,
        row: cell.row.original,
        rowId,
        columnId: colId,
      });
    },
    [cell.row.original, colId, meta?.editValueNormalizer, rowId]
  );

  React.useEffect(() => {
    if (isEditing) {
      const nextValue = cell.getValue();
      // eslint-disable-next-line no-console
      setDraft(nextValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, rowId, colId]);

  const cancel = React.useCallback((opts?: { preserve?: boolean }) => {
    onCancelEdit(opts);
  }, [onCancelEdit]);
  const focusActiveCell = React.useCallback(() => {
    focusGridCell(rowId, colId);
  }, [rowId, colId]);

  const commitDraft = React.useCallback((forcedDraft?: unknown) => {
    const currentValue = cell.getValue();
    // eslint-disable-next-line no-console
    const sourceDraft = forcedDraft === undefined ? draft : forcedDraft;
    let nextValue: unknown = sourceDraft;
    if (meta?.editType === 'number') {
      const n = typeof sourceDraft === 'number' ? sourceDraft : Number(sourceDraft);
      if (!Number.isNaN(n) && sourceDraft !== '') nextValue = n;
    } else if (meta?.editType === 'checkbox') {
      nextValue = Boolean(sourceDraft);
    }

    const isCurrentEmpty = currentValue == null || currentValue === '';
    const isNextEmpty = nextValue == null || nextValue === '';
    const isSemanticallySame = Object.is(currentValue, nextValue) || (isCurrentEmpty && isNextEmpty);

    if (isSemanticallySame) {
      onCommitEdit();
      return;
    }

    onCommitValue(nextValue);
  }, [cell, draft, meta?.editType, onCommitEdit, onCommitValue]);

  const renderDefaultEditor = () => {
    const commonEditorStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      border: 'none',
      background: 'var(--grid-cell-bg)',
      font: 'inherit',
      color: 'inherit',
      borderRadius: '2px',
      outline: '1px solid var(--grid-cell-border)',
    };

    switch (meta?.editType) {
      case 'number':
        return (
          <ContentEditableEditor
            value={draft ?? ''}
            onChange={(next) => {
              // eslint-disable-next-line no-console
              setDraft(normalizeEditValue(next));
            }}
            onCommit={commitDraft}
            onCancel={() => cancel({ preserve: false })}
            onEscFocus={focusActiveCell}
            onTabMove={onTab}
            style={commonEditorStyle}
            allowArrowNavigation={Boolean(options.keepEditingOnNavigate)}
            sanitizeInput={sanitizeNumberText}
          />
        );
      case 'date':
        return (
          <input
            autoFocus
            onBlur={() => commitDraft()}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                e.stopPropagation();
                commitDraft();
                onTab?.(e.shiftKey ? -1 : 1);
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                commitDraft();
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cancel({ preserve: false });
                focusActiveCell();
                return;
              }
            }}
            style={commonEditorStyle}
            type="date"
            value={(draft ?? '') as any}
            placeholder={meta?.editPlaceholder}
            onChange={(e) => {
              const next = e.target.value;
              // eslint-disable-next-line no-console
              setDraft(normalizeEditValue(next));
            }}
          />
        );
      case 'textarea':
        return (
          <ContentEditableEditor
            value={draft ?? ''}
            onChange={(next) => {
              // eslint-disable-next-line no-console
              setDraft(normalizeEditValue(next));
            }}
            onCommit={commitDraft}
            onCancel={() => cancel({ preserve: false })}
            onEscFocus={focusActiveCell}
            onTabMove={onTab}
            multiline
            style={commonEditorStyle}
            allowArrowNavigation={Boolean(options.keepEditingOnNavigate)}
          />
        );
      case 'select':
        {
          const options = meta?.getEditOptions?.(cell.row.original) ?? meta?.editOptions ?? [];
        return (
          <select
            autoFocus
            onBlur={() => commitDraft()}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                e.stopPropagation();
                commitDraft();
                onTab?.(e.shiftKey ? -1 : 1);
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                commitDraft();
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cancel({ preserve: false });
                focusActiveCell();
                return;
              }
            }}
            style={commonEditorStyle}
            value={(draft ?? '') as any}
            onChange={(e) => {
              const next = e.target.value;
              // eslint-disable-next-line no-console
              setDraft(normalizeEditValue(next));
            }}
          >
            {options.map((opt: { label: string; value: string | number }) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );
        }
      case 'checkbox':
        return (
          <input
            autoFocus
            onBlur={() => commitDraft()}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                e.stopPropagation();
                commitDraft();
                onTab?.(e.shiftKey ? -1 : 1);
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                commitDraft();
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cancel({ preserve: false });
                focusActiveCell();
                return;
              }
            }}
            style={commonEditorStyle}
            type="checkbox"
            checked={Boolean(draft)}
            onChange={(e) => {
              const next = e.target.checked;
              // eslint-disable-next-line no-console
              setDraft(normalizeEditValue(next));
            }}
          />
        );
      case 'text':
      default:
        return (
          <ContentEditableEditor
            value={draft ?? ''}
            onChange={(next) => {
              // eslint-disable-next-line no-console
              setDraft(normalizeEditValue(next));
            }}
            onCommit={commitDraft}
            onCancel={() => cancel({ preserve: false })}
            onTabMove={onTab}
            onEscFocus={focusActiveCell}
            style={commonEditorStyle}
          />
        );
    }
  };

  const editor =
    meta?.renderEditor?.({
      value: draft,
      row: cell.row.original,
      rowId,
      columnId: colId,
      onChange: (next: unknown) => setDraft(normalizeEditValue(next)),
      onCommit: commitDraft,
      onCancel: cancel,
      onTab,
      commitValue: onCommitValue,
      applyValue: onApplyValue,
    }) ??
    options.editorFactory?.({
      value: draft,
      row: cell.row.original,
      rowId,
      columnId: colId,
      meta,
      editType: meta?.editType,
      onChange: (next: unknown) => setDraft(normalizeEditValue(next)),
      onCommit: commitDraft,
      onCancel: cancel,
      onTab,
      commitValue: onCommitValue,
      applyValue: onApplyValue,
    }) ??
    renderDefaultEditor();

  const hasColumnCellRenderer = Boolean((cell.column.columnDef.meta as any)?.__genGridHasUserCellRenderer);
  const displayValue =
    amountNegativeTriangle && numericCellValue != null
      ? Math.abs(numericCellValue)
      : cell.getValue();
  const displayContent = meta?.renderCell
    ? meta.renderCell({
        value: displayValue,
        row: cell.row.original,
        rowId,
        columnId: colId,
        commitValue: onCommitValue,
      })
    : hasColumnCellRenderer
      ? flexRender(cell.column.columnDef.cell, cell.getContext())
      : effectiveMeta?.format
        ? (formatCellValue(displayValue, effectiveMeta) as any)
        : flexRender(cell.column.columnDef.cell, cell.getContext());

  const nonEditingContent =
    !isTreeColumn
      ? displayContent
      : (
        <div className={bodyStyles.treeCellWrap} style={{ paddingInlineStart: `${treeDepth * treeIndentPx}px` }}>
          {treeHasChildren ? (
            <button
              type="button"
              className={bodyStyles.treeToggle}
              aria-label={treeIsExpanded ? 'Collapse row' : 'Expand row'}
              aria-expanded={treeIsExpanded}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                treeMeta?.toggleRow?.(rowId);
              }}
            >
              {treeIsExpanded ? (
                <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
                  <path d="M5 7l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" width="12" height="12" aria-hidden="true">
                  <path d="M7 5l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ) : (
            <span className={bodyStyles.treeTogglePlaceholder} aria-hidden="true" />
          )}
          <div className={bodyStyles.treeCellContent}>{displayContent}</div>
          {treeIsOrphan ? (
            <span className={bodyStyles.treeOrphanBadge} title="Orphan row">!</span>
          ) : null}
        </div>
      );

  return (
    <td
      className={[
        bodyStyles.td,
        alignClass,
        isSystemCol ? bodyStyles.selectCol : '',
        meta?.mono ? bodyStyles.mono : '',
        pinned ? pinningStyles.pinned : '',
        pinned === 'left' ? pinningStyles.pinnedLeft : '',
        pinned === 'right' ? pinningStyles.pinnedRight : '',
        isInSelectedRange ? bodyStyles.selectedRange : '',
        isRowSpanCovered ? bodyStyles.rowSpanCovered : '',
        !isEditing && amountNegativeText ? bodyStyles.semanticAmountNegativeText : '',
        !isEditing && percentMode === 'delta' ? bodyStyles.semanticPercentDelta : '',
        !isEditing && percentDeltaDirection === 'up' ? bodyStyles.semanticPercentDeltaUp : '',
        !isEditing && percentDeltaDirection === 'down' ? bodyStyles.semanticPercentDeltaDown : '',
        getCellClassName?.({
          row: cell.row.original,
          rowId,
          rowIndex,
          columnId: colId,
          value: cellValue,
        }) ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...getCellStyle(cell.column, {
          enablePinning,
          enableColumnSizing,
          isHeader: false,
        }),
        ...(pickRowStyleForCell(rowStyle) ?? {}),
        ...(hideBottomBorder ? { borderBottomColor: 'transparent' } : {}),
        ...(getCellStyleByRule?.({
          row: cell.row.original,
          rowId,
          rowIndex,
          columnId: colId,
          value: cellValue,
        }) ?? {}),
      }}
      data-rowid={rowId}
      data-colid={colId}
      data-active-cell={isActive && !isEditing ? 'true' : undefined}
      data-selected-range={isInSelectedRange ? 'true' : undefined}
      data-editing-cell={isEditing ? 'true' : undefined}
      data-dirty={isDirty ? 'true' : undefined}
      data-pinned={pinned ? 'true' : undefined}
      data-tree-depth={isTreeColumn ? String(treeDepth) : undefined}
      data-tree-orphan={isTreeColumn && treeIsOrphan ? 'true' : undefined}
      rowSpan={cellRowSpan && cellRowSpan > 1 ? cellRowSpan : undefined}
      {...cellProps}
      onKeyDown={(e) => {
        if (
          !isEditing &&
          isActive &&
          (e.key === ' ' || e.key === 'Spacebar') &&
          meta?.onSpace
        ) {
          e.preventDefault();
          meta.onSpace({
            value: cell.getValue(),
            row: cell.row.original,
            rowId,
            columnId: colId,
            commitValue: onCommitValue,
          });
          return;
        }
        cellProps.onKeyDown?.(e);
      }}
    >

      {isEditing 
        ? (<div 
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "1px",
              border: "0 none",
              boxSizing: "border-box",
            }}
          >
            {editor}
          </div>) 
        : (
          <span 
            className={[
              isRowSpanCovered ? bodyStyles.rowSpanCoveredContent : '',
              !isTreeColumn && amountNegativeTriangle ? bodyStyles.semanticAmountTriangleContent : '',
            ]
              .filter(Boolean)
              .join(' ')}
            >
            {nonEditingContent}
          </span>
        )}
    </td>
  );
}
