// packages/gen-grid-crud/src/components/CrudActionBar.tsx

import * as React from 'react';
import { Button } from '@gen-office/ui';
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
      <div>Rows: {state.viewData.length}</div>
      <div style={{ flex: 1 }} />

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onAdd}
        disabled={!onAdd || isCommitting}
      >
        Add
      </Button>

      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() => onDelete?.(selectedRowIds)}
        disabled={!onDelete || isCommitting || selectedRowIds.length === 0}
      >
        Delete
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onReset}
        disabled={!onReset || isCommitting || !dirty}
      >
        Reset
      </Button>

      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={onSave}
        disabled={!onSave || isCommitting || !dirty}
      >
        {isCommitting ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}

