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
  onApplyValue: (nextValue: unknown) => void;
  onCancelEdit: () => void;

  /** ✅ Tab / Shift+Tab 편집 이동 */
  onTab?: (dir: 1 | -1) => void;
};

type ContentEditableEditorProps = {
  value: unknown;
  onChange: (next: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  onTabMove?: (dir: 1 | -1) => void;
  multiline?: boolean;
  style?: React.CSSProperties;
};

function ContentEditableEditor({
  value,
  onChange,
  onCommit,
  onCancel,
  onTabMove,
  multiline,
  style,
}: ContentEditableEditorProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const didAutoSelectRef = React.useRef(false);
  const pendingAutoSelectRef = React.useRef(false);

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

    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      onCommit();
      onTabMove?.(e.shiftKey ? -1 : 1);
      return;
    }
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      e.stopPropagation();
      onCommit();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onCancel();
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
      onInput={() => onChange(ref.current?.textContent ?? '')}
      onBlur={() => {
        didAutoSelectRef.current = false;
        pendingAutoSelectRef.current = false;
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
    onApplyValue,
    onCancelEdit,
    onTab,
  } = props;

  React.useEffect(() => {
    if (isEditing && !isActive) onCancelEdit();
  }, [isEditing, isActive, onCancelEdit]);

  const colId = cell.column.id;
  const pinned = cell.column.getIsPinned();
  const meta = getMeta(cell.column.columnDef) as any;

  const isSystemCol = colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID;

  const alignClass =
    meta?.align === 'right'
      ? bodyStyles.alignRight
      : meta?.align === 'center'
        ? bodyStyles.alignCenter
        : bodyStyles.alignLeft;

  const [draft, setDraft] = React.useState<unknown>(cell.getValue());

  React.useEffect(() => {
    if (isEditing) setDraft(cell.getValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, rowId, colId]);

  const cancel = React.useCallback(() => {
    onCancelEdit();
  }, [onCancelEdit]);

  const commitDraft = React.useCallback(() => {
    const currentValue = cell.getValue();

    let nextValue: unknown = draft;
    if (meta?.editType === 'number') {
      const n = typeof draft === 'number' ? draft : Number(draft);
      if (!Number.isNaN(n) && draft !== '') nextValue = n;
    } else if (meta?.editType === 'checkbox') {
      nextValue = Boolean(draft);
    }

    if (Object.is(currentValue, nextValue)) {
      onCancelEdit();
      return;
    }

    onCommitValue(nextValue);
  }, [cell, draft, meta?.editType, onCancelEdit, onCommitValue]);

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
            onChange={(next) => setDraft(next)}
            onCommit={commitDraft}
            onCancel={cancel}
            onTabMove={onTab}
            style={commonEditorStyle}
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
                cancel();
                return;
              }
            }}
            style={commonEditorStyle}
            type="date"
            value={(draft ?? '') as any}
            placeholder={meta?.editPlaceholder}
            onChange={(e) => setDraft(e.target.value)}
          />
        );
      case 'textarea':
        return (
          <ContentEditableEditor
            value={draft ?? ''}
            onChange={(next) => setDraft(next)}
            onCommit={commitDraft}
            onCancel={cancel}
            onTabMove={onTab}
            multiline
            style={commonEditorStyle}
          />
        );
      case 'select':
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
                cancel();
                return;
              }
            }}
            style={commonEditorStyle}
            value={(draft ?? '') as any}
            onChange={(e) => setDraft(e.target.value)}
          >
            {(meta?.editOptions ?? []).map((opt: { label: string; value: string | number }) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );
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
                cancel();
                return;
              }
            }}
            style={commonEditorStyle}
            type="checkbox"
            checked={Boolean(draft)}
            onChange={(e) => setDraft(e.target.checked)}
          />
        );
      case 'text':
      default:
        return (
          <ContentEditableEditor
            value={draft ?? ''}
            onChange={(next) => setDraft(next)}
            onCommit={commitDraft}
            onCancel={cancel}
            onTabMove={onTab}
            style={commonEditorStyle}
          />
        );
    }
  };

  const editor =
    meta?.renderEditor?.({
      value: draft,
      onChange: setDraft,
      onCommit: commitDraft,
      onCancel: cancel,
      onTab,
      commitValue: onCommitValue,
      applyValue: onApplyValue,
    }) ?? renderDefaultEditor();

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
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
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
        : meta?.renderCell
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
            : flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}
