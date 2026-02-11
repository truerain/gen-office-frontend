// packages/gen-grid/src/components/layout/GenGridCell.tsx

import * as React from 'react';
import { flexRender, type Cell } from '@tanstack/react-table';

import bodyStyles from './GenGridBody.module.css';
import pinningStyles from './GenGridPinning.module.css';

import { getCellStyle } from './cellStyles';
import { getMeta } from './utils';
import { formatCellValue } from './cellFormat';
import { SELECTION_COLUMN_ID } from '../../features/selection/selection';
import { ROW_NUMBER_COLUMN_ID } from '../../features/row-number/useRowNumberColumn';
import { useGenGridContext } from '../../core/context/GenGridProvider';
import { focusGridCell } from '../../features/active-cell/cellDom';

export type GenGridCellProps<TData> = {
  cell: Cell<TData, unknown>;
  rowId: string;

  isActive: boolean;
  isEditing: boolean;

  /** ✅ Step11: dirty 표시 */
  isDirty?: boolean;

  enablePinning?: boolean;
  enableColumnSizing?: boolean;

  cellProps: React.HTMLAttributes<HTMLTableCellElement>;

  onCommitValue: (nextValue: unknown) => void;
  onCommitEdit: () => void;
  onApplyValue: (nextValue: unknown) => void;
  onCancelEdit: (opts?: { preserve?: boolean }) => void;

  /** ✅ Tab / Shift+Tab 편집 이동 */
  onTab?: (dir: 1 | -1) => void;
};

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
  onCommit: () => void;
  onCancel: () => void;
  onEscFocus?: () => void;
  onTabMove?: (dir: 1 | -1) => void;
  multiline?: boolean;
  style?: React.CSSProperties;
  allowArrowNavigation?: boolean;
};

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
      el.textContent = nextText;
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
      onCommit();
      onTabMove?.(e.shiftKey ? -1 : 1);
      return;
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      e.stopPropagation();
      setAutoSelectActive(false);
      onCommit();
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
      onInput={() => {
        setAutoSelectActive(false);
        onChange(ref.current?.textContent ?? '');
      }}
      onMouseDown={() => {
        setAutoSelectActive(false);
      }}
      onBlur={() => {
        didAutoSelectRef.current = false;
        pendingAutoSelectRef.current = false;
        setAutoSelectActive(false);
        onCommit();
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
    isActive,
    isEditing,
    isDirty,
    enablePinning,
    enableColumnSizing,
    cellProps,
    onCommitValue,
    onCommitEdit,
    onApplyValue,
    onCancelEdit,
    onTab,
  } = props;

  const colId = cell.column.id;
  const table = cell.getContext().table;
  const pinned = cell.column.getIsPinned();
  const meta = getMeta(cell.column.columnDef) as any;

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

  const alignClass =
    meta?.align === 'right'
      ? bodyStyles.alignRight
      : meta?.align === 'center'
        ? bodyStyles.alignCenter
        : bodyStyles.alignLeft;

  const [draft, setDraft] = React.useState<unknown>(cell.getValue());

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

  const commitDraft = React.useCallback(() => {
    const currentValue = cell.getValue();
    // eslint-disable-next-line no-console
    let nextValue: unknown = draft;
    if (meta?.editType === 'number') {
      const n = typeof draft === 'number' ? draft : Number(draft);
      if (!Number.isNaN(n) && draft !== '') nextValue = n;
    } else if (meta?.editType === 'checkbox') {
      nextValue = Boolean(draft);
    }

    if (Object.is(currentValue, nextValue)) {
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
              setDraft(next);
            }}
            onCommit={commitDraft}
            onCancel={() => cancel({ preserve: false })}
            onEscFocus={focusActiveCell}
            onTabMove={onTab}
            style={commonEditorStyle}
            allowArrowNavigation={Boolean(options.keepEditingOnNavigate)}
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
              setDraft(next);
            }}
          />
        );
      case 'textarea':
        return (
          <ContentEditableEditor
            value={draft ?? ''}
            onChange={(next) => {
              // eslint-disable-next-line no-console
              setDraft(next);
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
              setDraft(next);
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
              setDraft(next);
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
              setDraft(next);
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
      onChange: setDraft,
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
      onChange: setDraft,
      onCommit: commitDraft,
      onCancel: cancel,
      onTab,
      commitValue: onCommitValue,
      applyValue: onApplyValue,
    }) ??
    renderDefaultEditor();

  const displayContent = meta?.renderCell
    ? (
      <div style={{display: "flex", justifyContent: "center" }}>
        {meta.renderCell({
          value: cell.getValue(),
          row: cell.row.original,
          rowId,
          columnId: colId,
          commitValue: onCommitValue,
        })}
      </div>
    )
    : meta?.format
      ? (formatCellValue(cell.getValue(), meta) as any)
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
      ]
        .filter(Boolean)
        .join(' ')}
      style={getCellStyle(cell.column, {
        enablePinning,
        enableColumnSizing,
        isHeader: false,
      })}
      data-rowid={rowId}
      data-colid={colId}
      data-active-cell={isActive && !isEditing ? 'true' : undefined}
      data-editing-cell={isEditing ? 'true' : undefined}
      data-dirty={isDirty ? 'true' : undefined}
      data-pinned={pinned ? 'true' : undefined}
      data-tree-depth={isTreeColumn ? String(treeDepth) : undefined}
      data-tree-orphan={isTreeColumn && treeIsOrphan ? 'true' : undefined}
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
        : nonEditingContent}
    </td>
  );
}
