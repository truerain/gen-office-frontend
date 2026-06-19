// packages/gen-datagrid/src/features/filtering/DataGridColumnFilter.tsx
// Renders the MVP per-column filter trigger and popover.

import * as React from 'react';
import { type Column } from '@tanstack/react-table';
import { Funnel } from 'lucide-react';

import {
  getColumnFilterInputValue,
  isColumnFilterActive,
  normalizeColumnFilterInput,
} from './filterModel';

type DataGridColumnFilterProps<TData> = {
  column: Column<TData, unknown>;
  columnId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DataGridColumnFilter<TData>({
  column,
  columnId,
  open,
  onOpenChange,
}: DataGridColumnFilterProps<TData>) {
  const filterValue = column.getFilterValue();

  return (
    <div className="gen-datagrid__filter">
      <button
        type="button"
        aria-label={`Filter ${columnId}`}
        aria-expanded={open}
        data-column-filter-trigger="true"
        data-filter-active={isColumnFilterActive(filterValue) ? 'true' : undefined}
        className="gen-datagrid__filter-trigger"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpenChange(!open);
        }}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <Funnel aria-hidden="true" size={13} strokeWidth={1.8} />
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label={`Filter ${columnId}`}
          data-column-filter-popover="true"
          className="gen-datagrid__filter-popover"
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
        >
          <input
            aria-label={`Filter ${columnId} value`}
            className="gen-datagrid__filter-input"
            value={getColumnFilterInputValue(filterValue)}
            onChange={(event) => {
              column.setFilterValue(normalizeColumnFilterInput(event.target.value));
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                onOpenChange(false);
              }
            }}
          />
          <button
            type="button"
            aria-label={`Clear filter ${columnId}`}
            className="gen-datagrid__filter-clear"
            onClick={(event) => {
              event.preventDefault();
              column.setFilterValue(undefined);
              onOpenChange(false);
            }}
          >
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}
