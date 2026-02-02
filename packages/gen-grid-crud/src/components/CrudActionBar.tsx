// packages/gen-grid-crud/src/components/CrudActionBar.tsx

import * as React from 'react';

import { CircleDot } from 'lucide-react';

import { Button } from '@gen-office/ui';
import type { CrudRowId } from '../crud/types';
import type { CrudUiState } from '../GenGridCrud.types';

import styles from './CrudActionBar.module.css'

export function CrudActionBar<TData>(props: {
  title?: string;
  state: CrudUiState<TData>;
  onAdd?: () => void;
  onDelete?: (rowIds: readonly CrudRowId[]) => void;
  onSave?: () => void;
  onReset?: () => void;
  onToggleFilter?: () => void;
  filterEnabled?: boolean;
}) {
  const { title, state, onAdd, onDelete, onSave, onReset, onToggleFilter, filterEnabled } = props;
  const { dirty, isCommitting, selectedRowIds } = state;

  return (
    <div className={styles.root}>
      <div className={styles.leftActions}>
        {title && (
          <div className={styles.title}>
            <span><CircleDot size={8} /> </span>
            {title}
          </div>
        )}
        <div className={styles.total}>
          <span>(Total: {state.viewData.length} rows)</span>
        </div>

        <div className={styles.actions}>
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
            variant="secondary"
            size="sm"
            onClick={() => {
                            if(!onDelete || isCommitting || selectedRowIds.length === 0) return;
                            onDelete?.(selectedRowIds)
                          }}
          >
            Delete
          </Button>
        </div>
      </div>
      <div className={styles.rightActions}>
        <Button
          type="button"
          variant={filterEnabled ? 'primary' : 'secondary'}
          size="sm"
          onClick={onToggleFilter}
          disabled={!onToggleFilter}
          >
            Filter
        </Button>
      </div>
    </div>
  );
}
