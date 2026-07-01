// packages/gen-datagrid-crud/test/thinShell.test.tsx
// Verifies the GenDataGridCrud Gate 10 thin shell behavior.

import * as React from 'react';
import type { GenDataGridColumnDef } from '@gen-office/gen-datagrid';
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

const columns: GenDataGridColumnDef<Person, unknown>[] = [
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
  it('selects text on focus by default for CRUD editors', async () => {
    const selectSpy = vi
      .spyOn(window.HTMLInputElement.prototype, 'select')
      .mockImplementation(() => undefined);
    const { container } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.focus(editor);

    expect(selectSpy).toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('allows gridProps to opt out of default select-on-focus', async () => {
    const selectSpy = vi
      .spyOn(window.HTMLInputElement.prototype, 'select')
      .mockImplementation(() => undefined);
    const { container } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        gridProps={{ editSelectOnFocus: false }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.focus(editor);

    expect(selectSpy).not.toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('continues editing on click by default for CRUD editors', async () => {
    const { container } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    const secondCell = getCell(container, '2', 'name');
    fireEvent.doubleClick(firstCell);

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBe('true');
    });

    fireEvent.mouseDown(secondCell, { button: 0 });

    await waitFor(() => {
      const secondEditor = secondCell.querySelector<HTMLInputElement>(
        'input[aria-label="name editor"]'
      );
      expect(secondCell.dataset.activeCell).toBe('true');
      expect(secondCell.dataset.editingCell).toBe('true');
      expect(secondEditor).not.toBeNull();
      expect(document.activeElement).toBe(secondEditor);
    });
  });

  it('continues editing on click by default for virtualized CRUD editors', async () => {
    const { container } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        gridProps={{
          enableVirtualization: true,
          rowHeight: 36,
          style: { height: 240 },
        }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    const secondCell = getCell(container, '2', 'name');
    fireEvent.doubleClick(firstCell);

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBe('true');
    });

    fireEvent.mouseDown(secondCell, { button: 0 });

    await waitFor(() => {
      const secondEditor = secondCell.querySelector<HTMLInputElement>(
        'input[aria-label="name editor"]'
      );
      expect(secondCell.dataset.activeCell).toBe('true');
      expect(secondCell.dataset.editingCell).toBe('true');
      expect(secondEditor).not.toBeNull();
      expect(document.activeElement).toBe(secondEditor);
    });
  });

  it('allows gridProps to opt out of default click edit continuation', async () => {
    const { container } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        gridProps={{
          editPolicy: {
            continueTriggers: {
              click: false,
            },
          },
        }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    const secondCell = getCell(container, '2', 'name');
    fireEvent.doubleClick(firstCell);

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBe('true');
    });

    fireEvent.mouseDown(secondCell, { button: 0 });

    await waitFor(() => {
      expect(secondCell.dataset.activeCell).toBe('true');
      expect(secondCell.dataset.editingCell).toBeUndefined();
      expect(secondCell.querySelector('input[aria-label="name editor"]')).toBeNull();
    });
  });

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

  it('creates a local row, folds its edits into created changes, and clears it after save', async () => {
    const onCommit = vi.fn(async () => ({ ok: true }));
    const { container, getByRole } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        createRow={() => ({ id: 'new-1', name: 'New Person', age: 0 })}
        onCommit={onCommit}
      />
    );

    fireEvent.click(getByRole('button', { name: 'Add' }));

    const createdCell = await waitFor(() => getCell(container, 'new-1', 'name'));
    expect(createdCell.closest('[role="row"]')?.querySelector('[data-row-status="created"]')).toBeTruthy();

    fireEvent.doubleClick(createdCell);
    const editor = createdCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Created Ada' } });
    fireEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit.mock.calls[0]?.[0].changeSet.created).toEqual([
        { id: 'new-1', name: 'Created Ada', age: 0 },
      ]);
      expect(onCommit.mock.calls[0]?.[0].changeSet.updated).toEqual([]);
    });
  });

  it('blocks commit and publishes field errors when commit validation fails', async () => {
    const onCommit = vi.fn(async () => ({ ok: true }));
    const onStateChange = vi.fn();
    const onValidationError = vi.fn();
    const { container, getByRole } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        validateCommit={() => ({
          valid: false,
          fieldErrors: { '1.name': 'Name is required' },
        })}
        onValidationError={onValidationError}
        onStateChange={onStateChange}
        onCommit={onCommit}
        gridProps={{
          getCellValidation: ({ columnId }) =>
            columnId === 'age'
              ? { severity: 'warning', message: 'Age warning' }
              : undefined,
        }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    const ageCell = getCell(container, '1', 'age');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: '' } });
    fireEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onCommit).not.toHaveBeenCalled();
      expect(onValidationError).toHaveBeenCalledWith({
        error: undefined,
        fieldErrors: { '1.name': 'Name is required' },
      });
      expect(
        onStateChange.mock.calls.some(
          ([state]: [DataGridCrudUiState<Person>]) =>
            state.fieldErrors['1.name'] === 'Name is required'
        )
      ).toBe(true);
      expect(firstCell.dataset.validationState).toBe('error');
      expect(firstCell.getAttribute('title')).toBe('Name is required');
      expect(ageCell.dataset.validationState).toBe('warning');
      expect(ageCell.getAttribute('title')).toBe('Age warning');
    });
  });

  it('keeps pending changes and maps commit field errors when commit returns not ok', async () => {
    const onCommit = vi.fn(async () => ({
      ok: false,
      error: new Error('Server rejected'),
      fieldErrors: { 'new-1.name': 'Server name error' },
    }));
    const onCommitError = vi.fn();
    const { container, getByRole } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        createRow={() => ({ id: 'new-1', name: 'New Person', age: 0 })}
        onCommit={onCommit}
        onCommitError={onCommitError}
      />
    );

    fireEvent.click(getByRole('button', { name: 'Add' }));
    const createdCell = await waitFor(() => getCell(container, 'new-1', 'name'));

    fireEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommitError).toHaveBeenCalledTimes(1);
      expect(createdCell.closest('[role="row"]')?.querySelector('[data-row-status="created"]')).toBeTruthy();
      expect(createdCell.dataset.validationState).toBe('error');
      expect(createdCell.getAttribute('title')).toBe('Server name error');
    });
  });

  it('passes the current export source through the Excel action shell', async () => {
    const onExport = vi.fn();
    const { getByRole } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        createRow={({ data }) => ({ id: `new-${data.length}`, name: 'New Person', age: 0 })}
        onExport={onExport}
      />
    );

    fireEvent.click(getByRole('button', { name: 'Add' }));
    await waitFor(() => getCell(document, 'new-2', 'name'));
    fireEvent.click(getByRole('button', { name: 'Excel' }));

    await waitFor(() => {
      expect(onExport).toHaveBeenCalledTimes(1);
      expect(onExport.mock.calls[0]?.[0].sourceData).toEqual(rows);
      expect(onExport.mock.calls[0]?.[0].createdRows).toEqual([
        { id: 'new-2', name: 'New Person', age: 0 },
      ]);
      expect(onExport.mock.calls[0]?.[0].data).toEqual([
        { id: 'new-2', name: 'New Person', age: 0 },
        ...rows,
      ]);
    });
  });

  it('disables Excel when no export handler is provided', () => {
    const { getByRole } = render(
      <GenDataGridCrud
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
      />
    );

    expect((getByRole('button', { name: 'Excel' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('renders ActionBar from state and actionApi without needing grid access', () => {
    const state: DataGridCrudUiState<Person> = {
      readonly: false,
      canCreateRow: true,
      canExport: true,
      data: rows,
      sourceData: rows,
      createdRows: [],
      createdRowIds: [],
      dirtyState: {
        cells: [],
        rowIds: ['1'],
        deletedRowIds: [],
      },
      dirty: true,
      isCommitting: false,
      fieldErrors: {},
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
