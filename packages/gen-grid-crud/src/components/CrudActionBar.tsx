// packages/gen-grid-crud/src/components/CrudActionBar.tsx

import * as React from 'react';
import type { CrudRowId } from '../crud/types';
import type { CrudUiState } from '../GenGridCrud.types';

export function CrudActionBar<TData>(props: {
  state: CrudUiState<TData>;
  onAdd?: () => void;
  onDelete?: (rowIds: readonly CrudRowId[]) => void;
  onSave?: () => void;
  onReset?: () => void;
}) {
  const { state, onAdd, onDelete, onSave, onReset } = props;
  const { dirty, isCommitting, selectedRowIds } = state;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 8 }}>
      <button type="button" onClick={onAdd} disabled={!onAdd || isCommitting}>
        Add
      </button>

      <button
        type="button"
        onClick={() => onDelete?.(selectedRowIds)}
        disabled={!onDelete || isCommitting || selectedRowIds.length === 0}
      >
        Delete
      </button>

      <div style={{ flex: 1 }} />

      <button type="button" onClick={onReset} disabled={!onReset || isCommitting || !dirty}>
        Reset
      </button>

      <button type="button" onClick={onSave} disabled={!onSave || isCommitting || !dirty}>
        {isCommitting ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
