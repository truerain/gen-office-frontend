// packages/gen-datagrid/test/interaction.test.tsx
// Verifies GenDataGrid DOM interaction behavior with Vitest and jsdom.

import * as React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';

import { GenDataGrid } from '../src';
import type { GenDataGridHandle } from '../src';

type Person = {
  id: string;
  name: string;
  age: number;
};

const rows: Person[] = [
  { id: '1', name: 'Ada', age: 37 },
  { id: '2', name: 'Grace', age: 41 },
];

const columns = [
  { accessorKey: 'name', header: 'Name', size: 120 },
  { accessorKey: 'age', header: 'Age', size: 80 },
];

const editableColumns = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 120,
    cell: ({ getValue }: { getValue: () => unknown }) => (
      <input aria-label="name editor" defaultValue={String(getValue())} />
    ),
  },
  { accessorKey: 'age', header: 'Age', size: 80 },
];

const editabilityColumns = [
  { accessorKey: 'name', header: 'Name', size: 120, meta: { editable: true } },
  { accessorKey: 'age', header: 'Age', size: 80, meta: { editable: false } },
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

function renderGrid(gridId = 'test-grid') {
  return render(
    <GenDataGrid
      gridId={gridId}
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
    />
  );
}

beforeAll(() => {
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

  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  });
});

afterEach(() => {
  vi.mocked(window.navigator.clipboard.writeText).mockClear();
  cleanup();
});

describe('GenDataGrid interaction contract', () => {
  it('moves the active cell with arrow keys', async () => {
    const { container } = renderGrid();

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'ArrowRight' });

    const nextCell = getCell(container, '1', 'age');
    await waitFor(() => {
      expect(nextCell.dataset.activeCell).toBe('true');
      expect(nextCell.tabIndex).toBe(0);
      expect(firstCell.tabIndex).toBe(-1);
    });
  });

  it('moves the active cell with Tab and Shift+Tab inside the grid', async () => {
    const { container } = renderGrid();

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'Tab' });

    await waitFor(() => {
      expect(getCell(container, '1', 'age').dataset.activeCell).toBe('true');
    });

    fireEvent.keyDown(getCell(container, '1', 'age'), { key: 'Tab', shiftKey: true });

    await waitFor(() => {
      expect(firstCell.dataset.activeCell).toBe('true');
    });
  });

  it('keeps keyboard navigation scoped to the focused grid', async () => {
    const { container } = render(
      <>
        <GenDataGrid
          gridId="grid-a"
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
        />
        <GenDataGrid
          gridId="grid-b"
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
        />
      </>
    );

    const gridA = container.querySelector<HTMLElement>('[data-grid-id="grid-a"]');
    const gridB = container.querySelector<HTMLElement>('[data-grid-id="grid-b"]');
    if (!gridA || !gridB) throw new Error('Missing test grids');

    const gridAFirstCell = getCell(gridA, '1', 'name');
    gridAFirstCell.focus();
    fireEvent.keyDown(gridAFirstCell, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(getCell(gridA, '1', 'age').dataset.activeCell).toBe('true');
      expect(getCell(gridB, '1', 'name').dataset.activeCell).toBe('true');
      expect(getCell(gridB, '1', 'age').dataset.activeCell).toBeUndefined();
    });
  });

  it('does not consume navigation keys from interactive descendants', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="editable-grid"
        data={rows}
        columns={editableColumns}
        getRowId={(row) => row.id}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    const input = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!input) throw new Error('Missing cell input');

    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(firstCell.dataset.activeCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.activeCell).toBeUndefined();
    });
  });

  it('selects a cell range with root-level mouse delegation', async () => {
    const { container } = renderGrid();

    expect(fireEvent.mouseDown(getCell(container, '1', 'name'), { button: 0 })).toBe(
      false
    );
    fireEvent.mouseOver(getCell(container, '2', 'age'));
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
    });
  });

  it('does not prevent native mouse behavior outside range selection targets', async () => {
    const { container } = renderGrid();
    const root = container.querySelector<HTMLElement>('[data-grid-id="test-grid"]');
    if (!root) throw new Error('Missing grid root');

    expect(fireEvent.mouseDown(root, { button: 0 })).toBe(true);
  });

  it('extends the last range from its anchor with Shift selection', async () => {
    const { container } = renderGrid();

    fireEvent.mouseDown(getCell(container, '1', 'name'), { button: 0 });
    fireEvent.mouseUp(window);
    fireEvent.mouseDown(getCell(container, '2', 'age'), { button: 0, shiftKey: true });
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
    });
  });

  it('adds a separate range with Ctrl selection', async () => {
    const { container } = renderGrid();

    fireEvent.mouseDown(getCell(container, '1', 'name'), { button: 0 });
    fireEvent.mouseUp(window);
    fireEvent.mouseDown(getCell(container, '2', 'age'), { button: 0, ctrlKey: true });
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBeUndefined();
    });
  });

  it('renders default selected ranges', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="default-selection-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        defaultSelectedRanges={[
          {
            anchor: { rowId: '1', columnId: 'name' },
            focus: { rowId: '2', columnId: 'age' },
          },
        ]}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
    });
  });

  it('renders controlled selected ranges', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="controlled-selection-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        selectedRanges={[
          {
            anchor: { rowId: '2', columnId: 'age' },
            focus: { rowId: '2', columnId: 'age' },
          },
        ]}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBeUndefined();
    });
  });

  it('emits selected range changes without mutating controlled selection', async () => {
    const onSelectedRangesChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="controlled-selection-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        selectedRanges={[]}
        onSelectedRangesChange={onSelectedRangesChange}
      />
    );

    fireEvent.mouseDown(getCell(container, '1', 'name'), { button: 0 });
    fireEvent.mouseOver(getCell(container, '2', 'age'));
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(onSelectedRangesChange).toHaveBeenLastCalledWith([
        {
          anchor: { rowId: '1', columnId: 'name' },
          focus: { rowId: '2', columnId: 'age' },
        },
      ]);
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBeUndefined();
    });
  });

  it('clears selection with Escape', async () => {
    const { container } = renderGrid();

    const firstCell = getCell(container, '1', 'name');
    fireEvent.mouseDown(firstCell, { button: 0 });
    fireEvent.mouseOver(getCell(container, '2', 'age'));
    fireEvent.mouseUp(window);
    fireEvent.keyDown(firstCell, { key: 'Escape' });

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBeUndefined();
    });
  });

  it('clears selection when the root empty area is clicked', async () => {
    const { container } = renderGrid();
    const root = container.querySelector<HTMLElement>('[data-grid-id="test-grid"]');
    if (!root) throw new Error('Missing grid root');

    fireEvent.mouseDown(getCell(container, '1', 'name'), { button: 0 });
    fireEvent.mouseOver(getCell(container, '2', 'age'));
    fireEvent.mouseUp(window);
    fireEvent.mouseDown(root, { button: 0 });

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBeUndefined();
    });
  });

  it('keeps selection when the root scrollbar is clicked', async () => {
    const { container } = renderGrid();
    const root = container.querySelector<HTMLElement>('[data-grid-id="test-grid"]');
    if (!root) throw new Error('Missing grid root');

    Object.defineProperty(root, 'clientWidth', {
      configurable: true,
      value: 180,
    });
    Object.defineProperty(root, 'clientHeight', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(root, 'scrollHeight', {
      configurable: true,
      value: 160,
    });
    root.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        right: 200,
        bottom: 120,
        width: 200,
        height: 120,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    fireEvent.mouseDown(getCell(container, '1', 'name'), { button: 0 });
    fireEvent.mouseOver(getCell(container, '2', 'age'));
    fireEvent.mouseUp(window);
    fireEvent.mouseDown(root, { button: 0, clientX: 190, clientY: 20 });

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
    });
  });

  it('exposes imperative clearSelection and copySelection actions', async () => {
    const gridRef = React.createRef<GenDataGridHandle>();
    const { container } = render(
      <GenDataGrid
        ref={gridRef}
        gridId="imperative-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
      />
    );

    fireEvent.mouseDown(getCell(container, '1', 'name'), { button: 0 });
    fireEvent.mouseOver(getCell(container, '1', 'age'));
    fireEvent.mouseUp(window);

    await gridRef.current?.copySelection();
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith('Ada\t37');
    expect(gridRef.current?.rootElement?.dataset.gridId).toBe('imperative-grid');

    gridRef.current?.clearSelection();
    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBeUndefined();
    });
  });

  it('emits clearSelection without mutating controlled selection', async () => {
    const gridRef = React.createRef<GenDataGridHandle>();
    const onSelectedRangesChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        ref={gridRef}
        gridId="controlled-clear-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        selectedRanges={[
          {
            anchor: { rowId: '1', columnId: 'name' },
            focus: { rowId: '1', columnId: 'name' },
          },
        ]}
        onSelectedRangesChange={onSelectedRangesChange}
      />
    );

    gridRef.current?.clearSelection();

    await waitFor(() => {
      expect(onSelectedRangesChange).toHaveBeenLastCalledWith([]);
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
    });
  });

  it('marks editable cells from column meta', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="editable-marker-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.editableCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.editableCell).toBeUndefined();
    });
  });

  it('does not mark editable cells when readOnly is true', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="readonly-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        readOnly
      />
    );

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.editableCell).toBeUndefined();
    });
  });

  it('uses grid-level editable predicate before column meta', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="editable-predicate-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        isCellEditable={({ rowId }) => rowId === '2'}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.editableCell).toBeUndefined();
      expect(getCell(container, '2', 'name').dataset.editableCell).toBe('true');
    });
  });

  it('treats renderEditor columns as editable by default', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="render-editor-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: {
              renderEditor: ({ draftValue }) => (
                <input aria-label="editor" defaultValue={String(draftValue)} />
              ),
            },
          },
        ]}
        getRowId={(row) => row.id}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.editableCell).toBe('true');
    });
  });

  it('starts default cell editing on double click', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="double-click-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);

    await waitFor(() => {
      const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
      expect(firstCell.dataset.editingCell).toBe('true');
      expect(editor?.value).toBe('Ada');
    });
  });

  it('starts default cell editing with Enter or F2 on the active cell', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="keyboard-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'F2' });

    await waitFor(() => {
      expect(
        firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]')
      ).not.toBeNull();
    });
  });

  it('starts editing when an editable active cell is clicked again', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="active-cell-reclick-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
      />
    );

    const secondRowNameCell = getCell(container, '2', 'name');
    fireEvent.mouseDown(secondRowNameCell, { button: 0 });

    await waitFor(() => {
      expect(secondRowNameCell.dataset.activeCell).toBe('true');
      expect(secondRowNameCell.dataset.editingCell).toBeUndefined();
    });

    fireEvent.mouseDown(secondRowNameCell, { button: 0 });

    await waitFor(() => {
      expect(secondRowNameCell.dataset.editingCell).toBe('true');
      expect(
        secondRowNameCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]')
      ).not.toBeNull();
    });
  });

  it('selects default input text on focus when editSelectOnFocus is enabled', async () => {
    const selectSpy = vi
      .spyOn(window.HTMLInputElement.prototype, 'select')
      .mockImplementation(() => undefined);
    const { container } = render(
      <GenDataGrid
        gridId="select-on-focus-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editSelectOnFocus
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

  it('uses column editSelectOnFocus before the grid default', async () => {
    const selectSpy = vi
      .spyOn(window.HTMLInputElement.prototype, 'select')
      .mockImplementation(() => undefined);
    const { container } = render(
      <GenDataGrid
        gridId="column-select-on-focus-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: { editable: true, editSelectOnFocus: false },
          },
        ]}
        getRowId={(row) => row.id}
        editSelectOnFocus
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

  it('cancels cell editing with Escape', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="cancel-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Lovelace' } });
    fireEvent.keyDown(editor, { key: 'Escape' });

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(firstCell.querySelector('input[aria-label="name editor"]')).toBeNull();
      expect(onCellValueChange).not.toHaveBeenCalled();
    });
  });

  it('cancels cell editing when another cell is activated', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="activate-other-cell-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBe('true');
    });

    fireEvent.mouseDown(getCell(container, '2', 'name'), { button: 0 });

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(firstCell.querySelector('input[aria-label="name editor"]')).toBeNull();
      expect(onCellValueChange).not.toHaveBeenCalled();
    });
  });

  it('does not intercept mouse down inside a select editor', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="select-editor-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: {
              editType: 'select',
              editOptions: [
                { label: 'Ada', value: 'Ada' },
                { label: 'Grace', value: 'Grace' },
              ],
            },
          },
        ]}
        getRowId={(row) => row.id}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLSelectElement>(
      'select[aria-label="name editor"]'
    );
    if (!editor) throw new Error('Missing select editor');

    expect(fireEvent.mouseDown(editor, { button: 0 })).toBe(true);
    expect(firstCell.dataset.editingCell).toBe('true');
  });

  it('commits cell editing with Enter', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="commit-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Lovelace' } });
    fireEvent.keyDown(editor, { key: 'Enter' });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Lovelace',
      });
      expect(firstCell.dataset.editingCell).toBeUndefined();
    });
  });

  it('commits built-in cell editing on blur when editCommitOnBlur is enabled', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="blur-commit-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editCommitOnBlur
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Blur' } });
    fireEvent.blur(editor);

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Blur',
      });
      expect(firstCell.dataset.editingCell).toBeUndefined();
    });
  });

  it('commits current editing cell before activating another cell when editCommitOnBlur is enabled', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="activate-commit-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editCommitOnBlur
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    const secondCell = getCell(container, '2', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Click Commit' } });
    fireEvent.mouseDown(secondCell, { button: 0 });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Click Commit',
      });
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(secondCell.dataset.activeCell).toBe('true');
    });
  });

  it('commits editing and moves to the next editable cell with Tab', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="tab-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Tab' } });
    fireEvent.keyDown(editor, { key: 'Tab' });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Tab',
      });
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(getCell(container, '2', 'name').dataset.activeCell).toBe('true');
    });
  });

  it('commits editing and moves to the previous editable cell with Shift+Tab', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="shift-tab-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        defaultActiveCell={{ rowId: '2', columnId: 'name' }}
        onCellValueChange={onCellValueChange}
      />
    );

    const secondCell = getCell(container, '2', 'name');
    fireEvent.doubleClick(secondCell);
    const editor = secondCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Grace Tab' } });
    fireEvent.keyDown(editor, { key: 'Tab', shiftKey: true });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[1],
        rowId: '2',
        rowIndex: 1,
        columnId: 'name',
        previousValue: 'Grace',
        value: 'Grace Tab',
      });
      expect(secondCell.dataset.editingCell).toBeUndefined();
      expect(getCell(container, '1', 'name').dataset.activeCell).toBe('true');
    });
  });

  it('renders custom editors and applies values through editor context', async () => {
    const onCellValueChange = vi.fn();
    const editorContextSpy = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="custom-editor-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: {
              editable: true,
              editType: 'text',
              editPlaceholder: 'Custom placeholder',
              editSelectOnFocus: true,
              editCommitOnBlur: true,
              renderEditor: (ctx) => {
                editorContextSpy({
                  editType: ctx.editType,
                  placeholder: ctx.placeholder,
                  selectOnFocus: ctx.selectOnFocus,
                  commitOnBlur: ctx.commitOnBlur,
                  hasTabNavigate: typeof ctx.tabNavigate === 'function',
                });
                return (
                  <button type="button" onClick={() => ctx.applyValue('Custom Ada')}>
                    Apply custom value
                  </button>
                );
              },
            },
          },
        ]}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const button = firstCell.querySelector<HTMLButtonElement>('button');
    if (!button) throw new Error('Missing custom editor');

    expect(editorContextSpy).toHaveBeenCalledWith({
      editType: 'text',
      placeholder: 'Custom placeholder',
      selectOnFocus: true,
      commitOnBlur: true,
      hasTabNavigate: true,
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Custom Ada',
      });
    });
  });

  it('warns when reserved editing policy props are enabled', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    render(
      <GenDataGrid
        gridId="reserved-editing-props-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editOnActiveCell
        keepEditingOnNavigate
      />
    );

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        'GenDataGrid: editOnActiveCell is reserved for a later editing policy slice and is not implemented yet.'
      );
      expect(warnSpy).toHaveBeenCalledWith(
        'GenDataGrid: keepEditingOnNavigate is reserved for a later editing policy slice and is not implemented yet.'
      );
    });

    warnSpy.mockRestore();
  });

  it('does not start range selection from interactive descendants', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="editable-grid"
        data={rows}
        columns={editableColumns}
        getRowId={(row) => row.id}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    const input = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!input) throw new Error('Missing cell input');

    fireEvent.mouseDown(input, { button: 0 });
    fireEvent.mouseOver(getCell(container, '2', 'age'));
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBeUndefined();
    });
  });

  it('copies the selected range with Ctrl+C', async () => {
    const { container } = renderGrid();

    const firstCell = getCell(container, '1', 'name');
    fireEvent.mouseDown(firstCell, { button: 0 });
    fireEvent.mouseOver(getCell(container, '2', 'age'));
    fireEvent.mouseUp(window);
    fireEvent.keyDown(firstCell, { key: 'c', ctrlKey: true });

    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Ada\t37\nGrace\t41'
      );
    });
  });

  it('copies headers with Shift+Ctrl+C', async () => {
    const { container } = renderGrid();

    const firstCell = getCell(container, '1', 'name');
    fireEvent.mouseDown(firstCell, { button: 0 });
    fireEvent.mouseOver(getCell(container, '1', 'age'));
    fireEvent.mouseUp(window);
    fireEvent.keyDown(firstCell, { key: 'c', ctrlKey: true, shiftKey: true });

    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Name\tAge\nAda\t37'
      );
    });
  });

  it('copies only the focused grid selection', async () => {
    const { container } = render(
      <>
        <GenDataGrid
          gridId="grid-a"
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
        />
        <GenDataGrid
          gridId="grid-b"
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
        />
      </>
    );

    const gridA = container.querySelector<HTMLElement>('[data-grid-id="grid-a"]');
    const gridB = container.querySelector<HTMLElement>('[data-grid-id="grid-b"]');
    if (!gridA || !gridB) throw new Error('Missing test grids');

    const gridAFirstCell = getCell(gridA, '1', 'name');
    const gridBFirstCell = getCell(gridB, '1', 'name');
    fireEvent.mouseDown(gridAFirstCell, { button: 0 });
    fireEvent.mouseOver(getCell(gridA, '1', 'age'));
    fireEvent.mouseUp(window);
    fireEvent.mouseDown(gridBFirstCell, { button: 0 });
    fireEvent.mouseOver(getCell(gridB, '2', 'name'));
    fireEvent.mouseUp(window);

    fireEvent.keyDown(gridBFirstCell, { key: 'c', ctrlKey: true });

    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Ada\nGrace'
      );
    });
  });
});
