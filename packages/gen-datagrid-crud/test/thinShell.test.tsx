// packages/gen-datagrid-crud/test/thinShell.test.tsx
// Verifies the GenDataGridCrud Gate 10 thin shell behavior.

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';

import { DataGridCrudActionBar, GenDataGridCrud } from '../src';
import type { DataGridCrudUiState } from '../src';

type Person = {
  id: string;
  name: string;
  age: number;
};

const rows: Person[] = [
  { id: '1', name: 'Ada', age: 37 },
  { id: '2', name: 'Grace', age: 41 },
];

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name', size: 120, meta: { editable: true } },
  { accessorKey: 'age', header: 'Age', size: 80 },
];

function getCell(root: ParentNode, rowId: string, columnId: string) {
  const cell = root.querySelector<HTMLElement>(
    `[data-gen-datagrid-cell="true"][data-cell-kind="body"][data-rowid="${rowId}"][data-colid="${columnId}"]`
  );
  if (!cell) {
    throw new Error(`Missing cell ${rowId}/${columnId}`);
  }
  return cell;
}

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(performance.now()), 0),
  });
  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    value: (handle: number) => window.clearTimeout(handle),
  });
  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    value: ResizeObserverMock,
  });
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: ResizeObserverMock,
  });
});

afterEach(() => {
  cleanup();
});

describe('GenDataGridCrud thin shell', () => {
  it('flushes the active editor, commits the change set, and accepts markers on save', async () => {
    const onCommit = vi.fn(async () => ({ ok: true }));
    const { container, getByRole } = render(
      <GenDataGridCrud
        title="People"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onCommit={onCommit}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Saved' } });
    fireEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit.mock.calls[0]?.[0].changeSet.updated).toEqual([
        {
          rowId: '1',
          row: rows[0],
          patch: { name: 'Ada Saved' },
          cells: [
            {
              rowId: '1',
              columnId: 'name',
              previousValue: 'Ada',
              value: 'Ada Saved',
            },
          ],
        },
      ]);
      expect(firstCell.dataset.dirtyCell).toBeUndefined();
    });
  });

  it('resets dirty markers through the reset action', async () => {
    const { container, getByRole } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onCommit={async () => ({ ok: true })}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Dirty' } });
    fireEvent.keyDown(editor, { key: 'Enter' });

    await waitFor(() => {
      expect(firstCell.dataset.dirtyCell).toBe('true');
    });

    fireEvent.click(getByRole('button', { name: 'Reset' }));

    await waitFor(() => {
      expect(firstCell.dataset.dirtyCell).toBeUndefined();
    });
  });

  it('deletes the current row through the delete action when no rows are selected', async () => {
    const { container, getByRole } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onCommit={async () => ({ ok: true })}
      />
    );

    const secondCell = getCell(container, '2', 'name');
    fireEvent.mouseDown(secondCell, { button: 0 });

    await waitFor(() => {
      expect(secondCell.closest('[role="row"]')?.getAttribute('data-current-row')).toBe('true');
    });

    fireEvent.click(getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(secondCell.closest('[role="row"]')?.getAttribute('data-deleted-row')).toBe('true');
    });
  });

  it('renders ActionBar from state and actionApi without needing grid access', () => {
    const state: DataGridCrudUiState<Person> = {
      readonly: false,
      data: rows,
      dirtyState: {
        cells: [],
        rowIds: ['1'],
        deletedRowIds: [],
      },
      dirty: true,
      isCommitting: false,
      currentRowId: '1',
      selectedRowIds: [],
      filterEnabled: false,
      columnReorderEnabled: false,
    };
    const actionApi = {
      addRow: vi.fn(),
      deleteSelectedRows: vi.fn(),
      save: vi.fn(async () => {}),
      reset: vi.fn(),
      clearFilters: vi.fn(),
      toggleFilters: vi.fn(),
      toggleColumnReorder: vi.fn(),
      exportExcel: vi.fn(),
    };
    const { getByRole } = render(
      <DataGridCrudActionBar state={state} actionApi={actionApi} options={{ title: 'People' }} />
    );

    fireEvent.click(getByRole('button', { name: 'Save' }));
    fireEvent.click(getByRole('button', { name: 'Filter' }));

    expect(actionApi.save).toHaveBeenCalledTimes(1);
    expect(actionApi.toggleFilters).toHaveBeenCalledTimes(1);
  });
});
