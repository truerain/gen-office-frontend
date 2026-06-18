// packages/gen-datagrid/src/features/editing/renderEditor.tsx
// Renders built-in and custom cell editors for GenDataGrid.

import * as React from 'react';

import type {
  GenDataGridEditorContext,
  GenDataGridEditorFactory,
} from '../../GenDataGrid.types';
import { handleBuiltinEditorKeyDown } from './builtinEditorKeyboard';

function normalizeEditorValue(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;
  return String(value);
}

function useOpenOnEditStart<TElement extends HTMLElement>(
  ref: React.RefObject<TElement | null>,
  enabled: boolean,
  open: (element: TElement) => void
) {
  React.useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (!element) return;

    const frame = window.requestAnimationFrame(() => {
      const current = ref.current;
      if (!current) return;
      open(current);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [enabled, open, ref]);
}

function DefaultCellEditor<TData>({ ctx }: { ctx: GenDataGridEditorContext<TData> }) {
  const selectRef = React.useRef<HTMLSelectElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!ctx.commitOnBlur) return;
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    ctx.commit();
  };

  useOpenOnEditStart(selectRef, Boolean(ctx.openOnEditStart) && ctx.editType === 'select', (element) => {
    element.focus();
    element.click();
  });

  useOpenOnEditStart(
    inputRef,
    Boolean(ctx.openOnEditStart) && ctx.editType === 'date',
    (element) => {
      const pickerElement = element as HTMLInputElement & {
        showPicker?: () => void;
      };
      element.focus();
      if (typeof pickerElement.showPicker === 'function') {
        pickerElement.showPicker();
        return;
      }
      element.click();
    }
  );

  if (ctx.editType === 'textarea') {
    return (
      <textarea
        aria-label={`${ctx.columnId} editor`}
        autoFocus
        className="gen-datagrid__editor gen-datagrid__editor--textarea"
        placeholder={ctx.placeholder}
        value={String(normalizeEditorValue(ctx.draftValue))}
        onFocus={(event) => {
          if (!ctx.selectOnFocus) return;
          event.currentTarget.select();
        }}
        onChange={(event) => ctx.setDraftValue(event.currentTarget.value)}
        onBlur={handleBlur}
        onKeyDown={(event) => handleBuiltinEditorKeyDown(event, ctx)}
      />
    );
  }

  if (ctx.editType === 'select') {
    return (
      <select
        ref={selectRef}
        aria-label={`${ctx.columnId} editor`}
        autoFocus
        className="gen-datagrid__editor"
        value={String(normalizeEditorValue(ctx.draftValue))}
        onChange={(event) => ctx.setDraftValue(event.currentTarget.value)}
        onBlur={handleBlur}
        onKeyDown={(event) => handleBuiltinEditorKeyDown(event, ctx)}
      >
        {ctx.editOptions?.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (ctx.editType === 'checkbox') {
    return (
      <input
        aria-label={`${ctx.columnId} editor`}
        autoFocus
        className="gen-datagrid__editor"
        type="checkbox"
        checked={Boolean(ctx.draftValue)}
        onChange={(event) => ctx.setDraftValue(event.currentTarget.checked)}
        onBlur={handleBlur}
        onKeyDown={(event) => handleBuiltinEditorKeyDown(event, ctx)}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      aria-label={`${ctx.columnId} editor`}
      autoFocus
      className="gen-datagrid__editor"
      placeholder={ctx.placeholder}
      type={ctx.editType === 'number' || ctx.editType === 'date' ? ctx.editType : 'text'}
      value={String(normalizeEditorValue(ctx.draftValue))}
      onFocus={(event) => {
        if (!ctx.selectOnFocus) return;
        event.currentTarget.select();
      }}
      onChange={(event) => ctx.setDraftValue(event.currentTarget.value)}
      onBlur={handleBlur}
      onKeyDown={(event) => handleBuiltinEditorKeyDown(event, ctx)}
    />
  );
}

type RenderCellEditorArgs<TData> = {
  ctx: GenDataGridEditorContext<TData>;
  renderEditor?: (ctx: GenDataGridEditorContext<TData>) => React.ReactNode;
  editorFactory?: GenDataGridEditorFactory<TData>;
};

export function renderCellEditor<TData>({
  ctx,
  renderEditor,
  editorFactory,
}: RenderCellEditorArgs<TData>) {
  return renderEditor?.(ctx) ?? editorFactory?.(ctx) ?? <DefaultCellEditor ctx={ctx} />;
}
