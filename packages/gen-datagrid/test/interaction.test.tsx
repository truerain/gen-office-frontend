// packages/gen-datagrid/test/interaction.test.tsx
// Verifies GenDataGrid DOM interaction behavior with Vitest and jsdom.

import * as React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';

import { GenDataGrid } from '../src';
import type { GenDataGridHandle } from '../src';
import { createEditorBlurHandler } from '../src/features/editing/blurPolicy';
import { focusCellInRoot } from '../src/core/dom/cellDom';

type Person = {
  id: string;
  name: string;
  age: number;
};

const rows: Person[] = [
  { id: '1', name: 'Ada', age: 37 },
  { id: '2', name: 'Grace', age: 41 },
];

const virtualRows: Person[] = Array.from({ length: 200 }, (_, index) => ({
  id: String(index + 1),
  name: `Person ${index + 1}`,
  age: 20 + (index % 50),
}));

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

function getHeaderCell(root: ParentNode, columnId: string) {
  const cell = root.querySelector<HTMLElement>(
    `[data-gen-datagrid-cell="true"][data-cell-kind="header"][data-colid="${columnId}"]`
  );
  if (!cell) {
    throw new Error(`Missing header cell ${columnId}`);
  }
  return cell;
}

function getResizeHandle(root: ParentNode, columnId: string) {
  const headerCell = getHeaderCell(root, columnId);
  const handle = headerCell.querySelector<HTMLElement>(
    '[data-column-resize-handle="true"]'
  );
  if (!handle) {
    throw new Error(`Missing resize handle ${columnId}`);
  }
  return handle;
}

function getReorderHandle(root: ParentNode, columnId: string) {
  const headerCell = getHeaderCell(root, columnId);
  const handle = headerCell.querySelector<HTMLElement>(
    '[data-column-reorder-handle="true"]'
  );
  if (!handle) {
    throw new Error(`Missing reorder handle ${columnId}`);
  }
  return handle;
}

function createDataTransfer() {
  const store = new Map<string, string>();
  return {
    effectAllowed: '',
    dropEffect: '',
    setData: vi.fn((type: string, value: string) => {
      store.set(type, value);
    }),
    getData: vi.fn((type: string) => store.get(type) ?? ''),
  };
}

function createClipboardData(text: string) {
  return {
    getData: vi.fn((type: string) => (type === 'text/plain' ? text : '')),
  };
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

  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
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
  vi.mocked(window.navigator.clipboard.writeText).mockClear();
  cleanup();
});

describe('GenDataGrid interaction contract', () => {
  it('scrolls an active body cell out from under pinned columns when focusing', async () => {
    const root = document.createElement('div');
    const viewport = document.createElement('div');
    const pinnedHeader = document.createElement('div');
    const targetCell = document.createElement('div');

    viewport.dataset.genDatagridViewport = 'true';
    pinnedHeader.dataset.genDatagridCell = 'true';
    pinnedHeader.dataset.cellKind = 'header';
    pinnedHeader.dataset.pinnedCell = 'left';
    targetCell.dataset.genDatagridCell = 'true';
    targetCell.dataset.cellKind = 'body';
    targetCell.dataset.rowid = '1';
    targetCell.dataset.colid = 'role';
    targetCell.tabIndex = 0;

    Object.defineProperty(viewport, 'scrollLeft', {
      configurable: true,
      writable: true,
      value: 100,
    });
    viewport.getBoundingClientRect = () =>
      ({
        left: 0,
        right: 300,
        top: 0,
        bottom: 200,
        width: 300,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    pinnedHeader.getBoundingClientRect = () =>
      ({
        left: 0,
        right: 120,
        top: 0,
        bottom: 40,
        width: 120,
        height: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    targetCell.getBoundingClientRect = () =>
      ({
        left: 100,
        right: 220,
        top: 40,
        bottom: 76,
        width: 120,
        height: 36,
        x: 100,
        y: 40,
        toJSON: () => ({}),
      }) as DOMRect;

    viewport.append(pinnedHeader, targetCell);
    root.append(viewport);
    document.body.append(root);

    expect(focusCellInRoot(root, { rowId: '1', columnId: 'role' })).toBe(true);
    expect(viewport.scrollLeft).toBe(80);

    root.remove();
  });

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

    expect(
      fireEvent.mouseDown(getCell(container, '1', 'name'), {
        button: 0,
        clientX: 10,
        clientY: 10,
      })
    ).toBe(false);
    fireEvent.mouseOver(getCell(container, '2', 'age'), { clientX: 30, clientY: 40 });
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
    });
  });

  it('resets range selection to the navigated cell on keyboard navigation', async () => {
    const { container } = renderGrid();

    const firstCell = getCell(container, '1', 'name');
    fireEvent.mouseDown(firstCell, {
      button: 0,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.mouseOver(getCell(container, '2', 'age'), { clientX: 30, clientY: 40 });
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
    });

    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(getCell(container, '1', 'age').dataset.activeCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBeUndefined();
    });
  });

  it('extends range selection with Shift+Arrow while preserving the original anchor', async () => {
    const { container } = renderGrid();

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'ArrowRight', shiftKey: true });

    await waitFor(() => {
      expect(getCell(container, '1', 'age').dataset.activeCell).toBe('true');
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBe('true');
    });

    fireEvent.keyDown(getCell(container, '1', 'age'), {
      key: 'ArrowDown',
      shiftKey: true,
    });

    await waitFor(() => {
      expect(getCell(container, '2', 'age').dataset.activeCell).toBe('true');
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBe('true');
    });
  });

  it('does not extend range selection when the hovered cell changes without pointer movement', async () => {
    const { container } = renderGrid();

    fireEvent.mouseDown(getCell(container, '1', 'name'), {
      button: 0,
      clientX: 24,
      clientY: 24,
    });
    fireEvent.mouseOver(getCell(container, '2', 'age'), {
      clientX: 24,
      clientY: 24,
    });
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'age').dataset.selectedCell).toBeUndefined();
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

    fireEvent.mouseDown(getCell(container, '1', 'name'), {
      button: 0,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.mouseOver(getCell(container, '2', 'age'), { clientX: 30, clientY: 40 });
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
    fireEvent.mouseDown(firstCell, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseOver(getCell(container, '2', 'age'), { clientX: 30, clientY: 40 });
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

    fireEvent.mouseDown(getCell(container, '1', 'name'), {
      button: 0,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.mouseOver(getCell(container, '2', 'age'), { clientX: 30, clientY: 40 });
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

    fireEvent.mouseDown(getCell(container, '1', 'name'), {
      button: 0,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.mouseOver(getCell(container, '2', 'age'), { clientX: 30, clientY: 40 });
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

    fireEvent.mouseDown(getCell(container, '1', 'name'), {
      button: 0,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.mouseOver(getCell(container, '1', 'age'), { clientX: 30, clientY: 10 });
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

  it('exposes imperative scrollToCell without changing the active cell', async () => {
    const gridRef = React.createRef<GenDataGridHandle>();
    const onActiveCellChange = vi.fn();
    const scrollIntoViewSpy = vi.spyOn(window.HTMLElement.prototype, 'scrollIntoView');
    render(
      <GenDataGrid
        ref={gridRef}
        gridId="scroll-to-cell-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        defaultActiveCell={{ rowId: '1', columnId: 'name' }}
        onActiveCellChange={onActiveCellChange}
      />
    );

    gridRef.current?.scrollToCell({ rowId: '2', columnId: 'age' });

    await waitFor(() => {
      expect(onActiveCellChange).not.toHaveBeenCalled();
      expect(scrollIntoViewSpy).toHaveBeenCalled();
      expect(getCell(document.body, '2', 'age').dataset.activeCell).not.toBe('true');
    });

    scrollIntoViewSpy.mockRestore();
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

  it('renders only a visible virtual row range when virtualization is enabled', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="virtual-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        style={{ height: 240, width: 320 }}
      />
    );

    await waitFor(() => {
      const renderedRows = container.querySelectorAll(
        '[data-gen-datagrid-body="true"][data-virtualized-body="true"] [data-virtualized-row="true"]'
      );
      expect(renderedRows.length).toBeGreaterThan(0);
      expect(renderedRows.length).toBeLessThan(virtualRows.length);
    });
  });

  it('updates the rendered virtual row window on scroll', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="virtual-scroll-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        style={{ height: 240, width: 320 }}
      />
    );

    const viewport = container.querySelector<HTMLElement>('[data-gen-datagrid-viewport="true"]');
    if (!viewport) throw new Error('Missing virtual viewport');

    await waitFor(() => {
      expect(getCell(container, '1', 'name')).toBeTruthy();
    });

    Object.defineProperty(viewport, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 3600,
    });
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(container.querySelector('[data-rowid="1"]')).toBeNull();
      expect(container.querySelector('[data-rowid="100"]')).not.toBeNull();
    });
  });

  it('keeps keyboard ownership after manual virtual scroll moves the active row out of range', async () => {
    const onActiveCellChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="virtual-scroll-keyboard-ownership-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        defaultActiveCell={{ rowId: '1', columnId: 'name' }}
        onActiveCellChange={onActiveCellChange}
        style={{ height: 240, width: 320 }}
      />
    );

    const root = container.querySelector<HTMLElement>(
      '[data-grid-id="virtual-scroll-keyboard-ownership-grid"]'
    );
    const viewport = container.querySelector<HTMLElement>('[data-gen-datagrid-viewport="true"]');
    if (!root || !viewport) throw new Error('Missing virtual grid root');

    getCell(container, '1', 'name').focus();

    Object.defineProperty(viewport, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 3600,
    });
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(container.querySelector('[data-rowid="1"]')).toBeNull();
      expect(document.activeElement).toBe(root);
    });

    fireEvent.keyDown(root, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(onActiveCellChange).toHaveBeenCalledWith({
        rowId: '2',
        columnId: 'name',
      });
    });
  });

  it('disables scroll-seeking placeholders when scrollSeeking is false', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="virtual-scroll-seeking-off-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        scrollSeeking={false}
        style={{ height: 240, width: 320 }}
      />
    );

    const viewport = container.querySelector<HTMLElement>('[data-gen-datagrid-viewport="true"]');
    if (!viewport) throw new Error('Missing virtual viewport');

    Object.defineProperty(viewport, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 3600,
    });
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(container.querySelector('[data-scroll-seeking-row="true"]')).toBeNull();
      expect(container.querySelector('[data-rowid="100"]')).not.toBeNull();
    });
  });

  it('renders scroll-seeking placeholders when custom thresholds allow a shorter jump', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="virtual-scroll-seeking-custom-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        scrollSeeking={{
          enabled: true,
          jumpThresholdRows: 4,
          jumpThresholdViewports: 1,
          resetDelayMs: 1000,
        }}
        style={{ height: 240, width: 320 }}
      />
    );

    const viewport = container.querySelector<HTMLElement>('[data-gen-datagrid-viewport="true"]');
    if (!viewport) throw new Error('Missing virtual viewport');

    Object.defineProperty(viewport, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 360,
    });
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(container.querySelector('[data-scroll-seeking-row="true"]')).not.toBeNull();
    });
  });

  it('does not scroll a clicked virtual row to the top when it is already visible', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="virtual-visible-click-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        style={{ height: 240, width: 320 }}
      />
    );

    const viewport = container.querySelector<HTMLElement>('[data-gen-datagrid-viewport="true"]');
    if (!viewport) throw new Error('Missing virtual viewport');

    Object.defineProperty(viewport, 'scrollTop', {
      configurable: true,
      writable: true,
      value: 360,
    });
    fireEvent.scroll(viewport);

    await waitFor(() => {
      expect(container.querySelector('[data-rowid="12"]')).not.toBeNull();
    });

    fireEvent.mouseDown(getCell(container, '12', 'name'), {
      button: 0,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.mouseUp(window);

    await waitFor(() => {
      expect(viewport.scrollTop).toBe(360);
      expect(getCell(container, '12', 'name').dataset.activeCell).toBe('true');
    });
  });

  it('restores the active virtual row after scrolling it into range', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="virtual-active-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        activeCell={{ rowId: '120', columnId: 'name' }}
        style={{ height: 240, width: 320 }}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '120', 'name').dataset.activeCell).toBe('true');
    });
  });

  it('keeps pinned cell markers on rendered virtual rows', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="virtual-pinned-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        columnPinning={{ left: ['name'] }}
        activeCell={{ rowId: '80', columnId: 'name' }}
        style={{ height: 240, width: 320 }}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '80', 'name').dataset.pinnedCell).toBe('left');
    });
  });

  it('restores controlled selection styling when a virtual row enters the rendered range', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="virtual-selection-grid"
        data={virtualRows}
        columns={columns}
        getRowId={(row) => row.id}
        enableVirtualization
        activeCell={{ rowId: '90', columnId: 'name' }}
        selectedRanges={[
          {
            anchor: { rowId: '90', columnId: 'name' },
            focus: { rowId: '90', columnId: 'age' },
          },
        ]}
        style={{ height: 240, width: 320 }}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '90', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '90', 'age').dataset.selectedCell).toBe('true');
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

  it('merges grid and column editPolicy openOnEditStart values into the cell runtime contract', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="edit-policy-merge-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: { editable: true },
          },
          {
            accessorKey: 'age',
            header: 'Age',
            meta: {
              editable: true,
              editPolicy: {
                openOnEditStart: false,
              },
            },
          },
        ]}
        getRowId={(row) => row.id}
        editPolicy={{
          openOnEditStart: true,
        }}
      />
    );

    await waitFor(() => {
      expect(getCell(container, '1', 'name').dataset.editOpenOnStart).toBe('true');
      expect(getCell(container, '1', 'age').dataset.editOpenOnStart).toBeUndefined();
    });
  });

  it('does not start editing on reclick when editPolicy disables the reclick trigger', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="reclick-disabled-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editPolicy={{
          startTriggers: {
            reclick: false,
          },
        }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.mouseDown(firstCell, { button: 0 });

    await waitFor(() => {
      expect(firstCell.dataset.activeCell).toBe('true');
      expect(firstCell.dataset.editingCell).toBeUndefined();
    });

    fireEvent.mouseDown(firstCell, { button: 0 });

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(firstCell.querySelector('input[aria-label="name editor"]')).toBeNull();
    });
  });

  it('does not start editing on double click when editPolicy disables the doubleClick trigger', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="double-click-disabled-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editPolicy={{
          startTriggers: {
            doubleClick: false,
          },
        }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(firstCell.querySelector('input[aria-label="name editor"]')).toBeNull();
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

  it('does not start editing with Enter when editPolicy disables the enter trigger', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="enter-disabled-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editPolicy={{
          startTriggers: {
            enter: false,
          },
        }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'Enter' });

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(firstCell.querySelector('input[aria-label="name editor"]')).toBeNull();
    });
  });

  it('starts default cell editing with a printable key and replaces the initial draft', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="printable-key-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        defaultActiveCell={{ rowId: '1', columnId: 'name' }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'Z' });

    const editor = await waitFor(() =>
      firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]')
    );

    expect(editor).not.toBeNull();
    expect(editor?.value).toBe('Z');
  });

  it('does not auto-select the editor text when editing starts from a printable key', async () => {
    const selectSpy = vi
      .spyOn(window.HTMLInputElement.prototype, 'select')
      .mockImplementation(() => undefined);
    const { container } = render(
      <GenDataGrid
        gridId="printable-key-no-autoselect-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        defaultActiveCell={{ rowId: '1', columnId: 'name' }}
        editSelectOnFocus
      />
    );

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'Z' });

    const editor = await waitFor(() =>
      firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]')
    );

    expect(editor).not.toBeNull();
    expect(editor?.value).toBe('Z');
    expect(selectSpy).not.toHaveBeenCalled();
    selectSpy.mockRestore();
  });

  it('does not start editing with a printable key when editPolicy disables the printableKey trigger', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="printable-key-disabled-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        defaultActiveCell={{ rowId: '1', columnId: 'name' }}
        editPolicy={{
          startTriggers: {
            printableKey: false,
          },
        }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'Z' });

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(firstCell.querySelector('input[aria-label="name editor"]')).toBeNull();
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

  it('selects default textarea text on focus when editSelectOnFocus is enabled', async () => {
    const selectSpy = vi
      .spyOn(window.HTMLTextAreaElement.prototype, 'select')
      .mockImplementation(() => undefined);
    const { container } = render(
      <GenDataGrid
        gridId="textarea-select-on-focus-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'note',
            header: 'Note',
            meta: { editable: true, editType: 'textarea' },
          },
        ]}
        getRowId={(row) => row.id}
        editSelectOnFocus
      />
    );

    const firstCell = getCell(container, '1', 'note');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLTextAreaElement>('textarea[aria-label="note editor"]');
    if (!editor) throw new Error('Missing textarea editor');

    fireEvent.focus(editor);

    expect(selectSpy).toHaveBeenCalled();
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

  it('re-enters default cell editing with a printable key after Escape cancel', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="cancel-reenter-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        defaultActiveCell={{ rowId: '1', columnId: 'name' }}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    firstCell.focus();
    fireEvent.keyDown(firstCell, { key: 'A' });

    let editor = await waitFor(() =>
      firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]')
    );
    expect(editor).not.toBeNull();

    fireEvent.keyDown(editor as HTMLInputElement, { key: 'Escape' });

    await waitFor(() => {
      expect(firstCell.dataset.editingCell).toBeUndefined();
      expect(firstCell.querySelector('input[aria-label="name editor"]')).toBeNull();
      expect(firstCell.dataset.activeCell).toBe('true');
      expect(document.activeElement).toBe(firstCell);
    });

    fireEvent.keyDown(firstCell, { key: 'B' });

    editor = await waitFor(() =>
      firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]')
    );

    expect(editor).not.toBeNull();
    expect(editor?.value).toBe('B');
  });

  it('cancels editing and moves active cell only when editCommitOnBlur is disabled', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="activate-other-cell-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editCommitOnBlur={false}
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
      expect(getCell(container, '2', 'name').dataset.activeCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.editingCell).toBeUndefined();
    });
  });

  it('continues editing on click when editPolicy enables the click continuation trigger', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="click-continue-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editPolicy={{
          continueTriggers: {
            click: true,
          },
        }}
        onCellValueChange={onCellValueChange}
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
      const secondEditor = secondCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada',
      });
      expect(secondCell.dataset.activeCell).toBe('true');
      expect(secondCell.dataset.editingCell).toBe('true');
      expect(secondEditor).not.toBeNull();
      expect(document.activeElement).toBe(secondEditor);
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

  it('commits built-in cell editing on blur by default', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="blur-commit-edit-grid"
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

  it('commits current editing cell before activating another cell by default', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="activate-commit-edit-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
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

  it('does not commit popover editor blur when focus moves into a registered editor surface', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="portal-blur-edit-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: {
              editable: true,
              editType: 'text',
              renderEditor: (ctx) => {
                const surfaceRef = React.useRef<HTMLDivElement | null>(null);

                React.useEffect(() => {
                  const surface = surfaceRef.current;
                  if (!surface) return;
                  ctx.registerEditorSurface?.(surface);
                  return () => ctx.unregisterEditorSurface?.(surface);
                }, [ctx]);

                const handleBlur = createEditorBlurHandler({
                  blurOwnership: ctx.blurOwnership ?? 'inline',
                  commitOnBlur: ctx.commitOnBlur,
                  gridRoot: ctx.getGridRoot?.() ?? null,
                  getEditorSurfaces: () => ctx.getEditorSurfaces?.() ?? [],
                  commit: () => ctx.commit(),
                });

                return (
                  <>
                    <input
                      aria-label="name editor"
                      value={String(ctx.draftValue ?? '')}
                      onChange={(event) => ctx.setDraftValue(event.target.value)}
                      onBlur={handleBlur}
                    />
                    <div ref={surfaceRef} data-gen-datagrid-editor-surface="true" role="listbox">
                      <button type="button">Popover option</button>
                    </div>
                  </>
                );
              },
            },
          },
        ]}
        getRowId={(row) => row.id}
        editCommitOnBlur
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    const popoverButton = firstCell.querySelector<HTMLButtonElement>(
      'button[type="button"]'
    );
    if (!editor || !popoverButton) throw new Error('Missing popover editor');

    fireEvent.change(editor, { target: { value: 'Ada Portal' } });
    fireEvent.blur(editor, { relatedTarget: popoverButton });

    await waitFor(() => {
      expect(onCellValueChange).not.toHaveBeenCalled();
      expect(firstCell.dataset.editingCell).toBe('true');
    });
  });

  it('cancels modal-owned editing when another cell is activated', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="modal-activate-cancel-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: {
              editable: true,
              editBlurOwnership: 'modal',
              renderEditor: (ctx) => (
                <button type="button" onClick={() => ctx.applyValue('Modal Ada')}>
                  Apply modal value
                </button>
              ),
            },
          },
          { accessorKey: 'age', header: 'Age', meta: { editable: true } },
        ]}
        getRowId={(row) => row.id}
        editCommitOnBlur
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    const secondCell = getCell(container, '2', 'age');
    fireEvent.doubleClick(firstCell);
    fireEvent.mouseDown(secondCell, { button: 0 });

    await waitFor(() => {
      expect(onCellValueChange).not.toHaveBeenCalled();
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
      expect(getCell(container, '2', 'name').dataset.editingCell).toBe('true');
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
      expect(getCell(container, '1', 'name').dataset.editingCell).toBe('true');
    });
  });

  it('moves active cell only with Tab when editPolicy disables the tab continuation trigger', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="tab-continue-disabled-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editPolicy={{
          continueTriggers: {
            tab: false,
          },
        }}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Tab Off' } });
    fireEvent.keyDown(editor, { key: 'Tab' });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Tab Off',
      });
      expect(getCell(container, '2', 'name').dataset.activeCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.editingCell).toBeUndefined();
    });
  });

  it('moves active cell only with Arrow keys when editPolicy leaves the arrowKey continuation trigger disabled', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="arrow-continue-disabled-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        defaultSelectedRanges={[
          {
            anchor: { rowId: '1', columnId: 'name' },
            focus: { rowId: '1', columnId: 'name' },
          },
        ]}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Arrow Off' } });
    fireEvent.keyDown(editor, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Arrow Off',
      });
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBeUndefined();
      expect(getCell(container, '2', 'name').dataset.activeCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.editingCell).toBeUndefined();
    });
  });

  it('continues editing with Arrow keys when editPolicy enables the arrowKey continuation trigger', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="arrow-continue-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        editPolicy={{
          continueTriggers: {
            arrowKey: true,
          },
        }}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Arrow On' } });
    fireEvent.keyDown(editor, { key: 'ArrowDown' });

    await waitFor(() => {
      const secondEditor = getCell(container, '2', 'name').querySelector<HTMLInputElement>(
        'input[aria-label="name editor"]'
      );
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Arrow On',
      });
      expect(getCell(container, '2', 'name').dataset.activeCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.editingCell).toBe('true');
      expect(secondEditor).not.toBeNull();
      expect(document.activeElement).toBe(secondEditor);
    });
  });

  it('does not continue editing into a non-editable cell with Arrow keys', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="arrow-noneditable-stop-grid"
        data={rows}
        columns={[
          { accessorKey: 'name', header: 'Name', meta: { editable: true } },
          { accessorKey: 'age', header: 'Age', meta: { editable: false } },
        ]}
        getRowId={(row) => row.id}
        editPolicy={{
          continueTriggers: {
            arrowKey: true,
          },
        }}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.change(editor, { target: { value: 'Ada Arrow Stop' } });
    fireEvent.keyDown(editor, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Arrow Stop',
      });
      expect(getCell(container, '1', 'age').dataset.activeCell).toBe('true');
      expect(getCell(container, '1', 'age').dataset.editingCell).toBeUndefined();
      expect(
        getCell(container, '1', 'age').querySelector('input[aria-label="age editor"]')
      ).toBeNull();
    });
  });

  it('does not continue textarea editing with Arrow keys even when arrowKey continuation is enabled', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="textarea-arrow-local-grid"
        data={rows}
        columns={[
          { accessorKey: 'name', header: 'Name', meta: { editable: true, editType: 'textarea' } },
          { accessorKey: 'age', header: 'Age', meta: { editable: true, editType: 'textarea' } },
        ]}
        getRowId={(row) => row.id}
        editPolicy={{
          continueTriggers: {
            arrowKey: true,
          },
        }}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLTextAreaElement>('textarea[aria-label="name editor"]');
    if (!editor) throw new Error('Missing textarea editor');

    fireEvent.change(editor, { target: { value: 'Ada\nLine 2' } });
    fireEvent.keyDown(editor, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(onCellValueChange).not.toHaveBeenCalled();
      expect(firstCell.dataset.editingCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.editingCell).toBeUndefined();
    });
  });

  it('does not commit textarea editing on Enter', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="textarea-enter-newline-grid"
        data={rows}
        columns={[
          { accessorKey: 'name', header: 'Name', meta: { editable: true, editType: 'textarea' } },
        ]}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLTextAreaElement>('textarea[aria-label="name editor"]');
    if (!editor) throw new Error('Missing textarea editor');

    fireEvent.change(editor, { target: { value: 'Ada' } });
    fireEvent.keyDown(editor, { key: 'Enter' });

    await waitFor(() => {
      expect(onCellValueChange).not.toHaveBeenCalled();
      expect(firstCell.dataset.editingCell).toBe('true');
    });
  });

  it('keeps select Arrow keys editor-local even when arrowKey continuation is enabled', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="select-arrow-local-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: {
              editable: true,
              editType: 'select',
              editOptions: [
                { label: 'Ada', value: 'Ada' },
                { label: 'Grace', value: 'Grace' },
              ],
            },
          },
          { accessorKey: 'age', header: 'Age', meta: { editable: true } },
        ]}
        getRowId={(row) => row.id}
        editPolicy={{
          continueTriggers: {
            arrowKey: true,
          },
        }}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLSelectElement>('select[aria-label="name editor"]');
    if (!editor) throw new Error('Missing select editor');

    fireEvent.keyDown(editor, { key: 'ArrowDown' });

    await waitFor(() => {
      expect(onCellValueChange).not.toHaveBeenCalled();
      expect(firstCell.dataset.editingCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.editingCell).toBeUndefined();
    });
  });

  it('commits select editing on Enter', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="select-enter-commit-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: {
              editable: true,
              editType: 'select',
              editOptions: [
                { label: 'Ada', value: 'Ada' },
                { label: 'Grace', value: 'Grace' },
              ],
            },
          },
        ]}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLSelectElement>('select[aria-label="name editor"]');
    if (!editor) throw new Error('Missing select editor');

    fireEvent.change(editor, { target: { value: 'Grace' } });
    fireEvent.keyDown(editor, { key: 'Enter' });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Grace',
      });
      expect(firstCell.dataset.editingCell).toBeUndefined();
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
                  hasArrowNavigate: typeof ctx.arrowNavigate === 'function',
                  openOnEditStart: ctx.openOnEditStart,
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
      hasArrowNavigate: true,
      openOnEditStart: false,
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

  it('passes openOnEditStart to custom editors through editor context', async () => {
    const editorContextSpy = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="custom-editor-open-on-start-grid"
        data={rows}
        columns={[
          {
            accessorKey: 'name',
            header: 'Name',
            meta: {
              editable: true,
              editPolicy: {
                openOnEditStart: true,
              },
              renderEditor: (ctx) => {
                editorContextSpy(ctx.openOnEditStart);
                return <input aria-label="custom open editor" value={String(ctx.draftValue)} readOnly />;
              },
            },
          },
        ]}
        getRowId={(row) => row.id}
      />
    );

    fireEvent.doubleClick(getCell(container, '1', 'name'));

    await waitFor(() => {
      expect(editorContextSpy).toHaveBeenCalledWith(true);
      expect(
        getCell(container, '1', 'name').querySelector<HTMLInputElement>('input[aria-label="custom open editor"]')
      ).not.toBeNull();
    });
  });

  it('attempts to open the built-in select editor when openOnEditStart is enabled', async () => {
    const clickSpy = vi
      .spyOn(window.HTMLSelectElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const { container } = render(
      <GenDataGrid
        gridId="select-open-on-start-grid"
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
              editPolicy: {
                openOnEditStart: true,
              },
            },
          },
        ]}
        getRowId={(row) => row.id}
      />
    );

    fireEvent.doubleClick(getCell(container, '1', 'name'));

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled();
      expect(
        getCell(container, '1', 'name').querySelector<HTMLSelectElement>('select[aria-label="name editor"]')
      ).not.toBeNull();
    });

    clickSpy.mockRestore();
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

  it('reorders columns by dragging headers inside the same pinning zone', async () => {
    const onColumnOrderChange = vi.fn();
    const onColumnPinningChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="reorder-grid"
        data={rows}
        columns={editableColumns}
        getRowId={(row) => row.id}
        columnPinning={{ left: ['name', 'age'] }}
        onColumnOrderChange={onColumnOrderChange}
        onColumnPinningChange={onColumnPinningChange}
      />
    );

    const nameHeader = getHeaderCell(container, 'name');
    const ageHeader = getHeaderCell(container, 'age');
    const ageDragHandle = getReorderHandle(container, 'age');
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(ageDragHandle, { dataTransfer });
    fireEvent.dragOver(nameHeader, { dataTransfer });
    fireEvent.drop(nameHeader, { dataTransfer });

    await waitFor(() => {
      expect(onColumnOrderChange).toHaveBeenCalledWith(['age', 'name']);
      expect(onColumnPinningChange).toHaveBeenCalledWith({
        left: ['age', 'name'],
      });
    });
  });

  it('reorders pinned columns visually when pinning state is uncontrolled', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="uncontrolled-pinned-reorder-grid"
        data={rows}
        columns={editableColumns}
        getRowId={(row) => row.id}
        defaultColumnPinning={{ left: ['name', 'age'] }}
      />
    );

    const nameHeader = getHeaderCell(container, 'name');
    const ageDragHandle = getReorderHandle(container, 'age');
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(ageDragHandle, { dataTransfer });
    fireEvent.dragOver(nameHeader, { dataTransfer });
    fireEvent.drop(nameHeader, { dataTransfer });

    await waitFor(() => {
      const headerColumnIds = Array.from(
        container.querySelectorAll<HTMLElement>(
          '[data-gen-datagrid-cell="true"][data-cell-kind="header"]'
        )
      ).map((headerCell) => headerCell.dataset.colid);

      expect(headerColumnIds.slice(0, 2)).toEqual(['age', 'name']);
    });
  });

  it('blocks header drag reorder across pinning zones', async () => {
    const onColumnOrderChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="blocked-reorder-grid"
        data={rows}
        columns={editableColumns}
        getRowId={(row) => row.id}
        columnPinning={{ left: ['name'], right: ['age'] }}
        onColumnOrderChange={onColumnOrderChange}
      />
    );

    const nameHeader = getHeaderCell(container, 'name');
    const nameDragHandle = getReorderHandle(container, 'name');
    const ageHeader = getHeaderCell(container, 'age');
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(nameDragHandle, { dataTransfer });
    fireEvent.dragOver(ageHeader, { dataTransfer });
    fireEvent.drop(ageHeader, { dataTransfer });

    expect(onColumnOrderChange).not.toHaveBeenCalled();
  });

  it('does not start header reorder dragging from a resize handle', async () => {
    const onColumnOrderChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="resize-handle-drag-grid"
        data={rows}
        columns={editableColumns}
        getRowId={(row) => row.id}
        onColumnOrderChange={onColumnOrderChange}
      />
    );

    const resizeHandle = getResizeHandle(container, 'name');
    const ageHeader = getHeaderCell(container, 'age');
    const dataTransfer = createDataTransfer();

    fireEvent.dragStart(resizeHandle, { dataTransfer });
    fireEvent.dragOver(ageHeader, { dataTransfer });
    fireEvent.drop(ageHeader, { dataTransfer });

    expect(dataTransfer.setData).not.toHaveBeenCalled();
    expect(onColumnOrderChange).not.toHaveBeenCalled();
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
    fireEvent.mouseDown(firstCell, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseOver(getCell(container, '2', 'age'), { clientX: 30, clientY: 40 });
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
    fireEvent.mouseDown(firstCell, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseOver(getCell(container, '1', 'age'), { clientX: 30, clientY: 10 });
    fireEvent.mouseUp(window);
    fireEvent.keyDown(firstCell, { key: 'c', ctrlKey: true, shiftKey: true });

    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Name\tAge\nAda\t37'
      );
    });
  });

  it('pastes plain text values from the active cell into editable cells', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="paste-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.paste(firstCell, {
      clipboardData: createClipboardData('Lovelace\nHopper\n'),
    });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledTimes(2);
      expect(onCellValueChange).toHaveBeenNthCalledWith(1, {
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Lovelace',
      });
      expect(onCellValueChange).toHaveBeenNthCalledWith(2, {
        row: rows[1],
        rowId: '2',
        rowIndex: 1,
        columnId: 'name',
        previousValue: 'Grace',
        value: 'Hopper',
      });
      expect(getCell(container, '2', 'name').dataset.activeCell).toBe('true');
      expect(getCell(container, '1', 'name').dataset.selectedCell).toBe('true');
      expect(getCell(container, '2', 'name').dataset.selectedCell).toBe('true');
    });
  });

  it('reports paste errors while skipping non-editable cells by default', async () => {
    const onCellValueChange = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="paste-skip-error-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        pasteOptions={{
          errorMode: 'report',
          onError,
        }}
        onCellValueChange={onCellValueChange}
      />
    );

    fireEvent.paste(getCell(container, '1', 'name'), {
      clipboardData: createClipboardData('Ada Paste\t99'),
    });

    await waitFor(() => {
      expect(onCellValueChange).toHaveBeenCalledTimes(1);
      expect(onCellValueChange).toHaveBeenCalledWith({
        row: rows[0],
        rowId: '1',
        rowIndex: 0,
        columnId: 'name',
        previousValue: 'Ada',
        value: 'Ada Paste',
      });
      expect(onError).toHaveBeenCalledWith([
        expect.objectContaining({
          reason: 'nonEditableCell',
          rowId: '1',
          columnId: 'age',
          value: '99',
        }),
      ]);
    });
  });

  it('cancels the whole paste when failureBehavior is cancelPaste', async () => {
    const onCellValueChange = vi.fn();
    const onError = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="paste-cancel-error-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        pasteOptions={{
          errorMode: 'report',
          failureBehavior: 'cancelPaste',
          onError,
        }}
        onCellValueChange={onCellValueChange}
      />
    );

    fireEvent.paste(getCell(container, '1', 'name'), {
      clipboardData: createClipboardData('Ada Paste\t99'),
    });

    await waitFor(() => {
      expect(onCellValueChange).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith([
        expect.objectContaining({
          reason: 'nonEditableCell',
          rowId: '1',
          columnId: 'age',
          value: '99',
        }),
      ]);
      expect(getCell(container, '1', 'name').dataset.activeCell).toBe('true');
    });
  });

  it('does not intercept paste inside an active editor', async () => {
    const onCellValueChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        gridId="paste-editor-bypass-grid"
        data={rows}
        columns={[{ accessorKey: 'name', header: 'Name', meta: { editable: true } }]}
        getRowId={(row) => row.id}
        onCellValueChange={onCellValueChange}
      />
    );

    const firstCell = getCell(container, '1', 'name');
    fireEvent.doubleClick(firstCell);
    const editor = firstCell.querySelector<HTMLInputElement>('input[aria-label="name editor"]');
    if (!editor) throw new Error('Missing editor');

    fireEvent.paste(editor, {
      clipboardData: createClipboardData('Editor Paste'),
    });

    await waitFor(() => {
      expect(onCellValueChange).not.toHaveBeenCalled();
      expect(firstCell.dataset.editingCell).toBe('true');
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
    fireEvent.mouseDown(gridAFirstCell, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseOver(getCell(gridA, '1', 'age'), { clientX: 30, clientY: 10 });
    fireEvent.mouseUp(window);
    fireEvent.mouseDown(gridBFirstCell, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseOver(getCell(gridB, '2', 'name'), { clientX: 10, clientY: 40 });
    fireEvent.mouseUp(window);

    fireEvent.keyDown(gridBFirstCell, { key: 'c', ctrlKey: true });

    await waitFor(() => {
      expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Ada\nGrace'
      );
    });
  });

  it('filters rows from a header filter popover', async () => {
    const gridRef = React.createRef<GenDataGridHandle>();
    const { container } = render(
      <GenDataGrid
        ref={gridRef}
        gridId="filter-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        enableColumnFilters
      />
    );

    const nameHeader = getHeaderCell(container, 'name');
    const trigger = nameHeader.querySelector<HTMLButtonElement>(
      '[data-column-filter-trigger="true"]'
    );
    if (!trigger) throw new Error('Missing filter trigger');

    fireEvent.click(trigger);
    expect(nameHeader.dataset.filterOpen).toBe('true');
    expect(
      container.querySelector('[data-gen-datagrid-header="true"]')?.getAttribute(
        'data-filter-open'
      )
    ).toBe('true');
    expect(nameHeader.querySelector('[data-column-filter-popover="true"]')).not.toBeNull();

    const input = nameHeader.querySelector<HTMLInputElement>(
      'input[aria-label="Filter name value"]'
    );
    if (!input) throw new Error('Missing filter input');

    fireEvent.change(input, { target: { value: 'Grace' } });

    await waitFor(() => {
      expect(getCell(container, '2', 'name').textContent).toContain('Grace');
      expect(
        container.querySelector(
          '[data-gen-datagrid-cell="true"][data-cell-kind="body"][data-rowid="1"]'
        )
      ).toBeNull();
    });

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(nameHeader.dataset.filterOpen).toBeUndefined();
      expect(nameHeader.querySelector('[data-column-filter-popover="true"]')).toBeNull();
    });

    gridRef.current?.clearColumnFilters();

    await waitFor(() => {
      expect(getCell(container, '1', 'name').textContent).toContain('Ada');
      expect(getCell(container, '2', 'name').textContent).toContain('Grace');
    });
  });

  it('clears column and global filters through the imperative handle', async () => {
    const gridRef = React.createRef<GenDataGridHandle>();
    const { container } = render(
      <GenDataGrid
        ref={gridRef}
        gridId="clear-filters-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        enableColumnFilters
        enableGlobalFilter
      />
    );

    const globalInput = container.querySelector<HTMLInputElement>(
      'input[aria-label="Global filter"]'
    );
    if (!globalInput) throw new Error('Missing global filter input');
    fireEvent.change(globalInput, { target: { value: 'Ada' } });

    const nameHeader = getHeaderCell(container, 'name');
    const trigger = nameHeader.querySelector<HTMLButtonElement>(
      '[data-column-filter-trigger="true"]'
    );
    if (!trigger) throw new Error('Missing filter trigger');
    fireEvent.click(trigger);
    const columnInput = nameHeader.querySelector<HTMLInputElement>(
      'input[aria-label="Filter name value"]'
    );
    if (!columnInput) throw new Error('Missing filter input');
    fireEvent.change(columnInput, { target: { value: 'Grace' } });

    await waitFor(() => {
      expect(
        container.querySelector('[data-gen-datagrid-cell="true"][data-cell-kind="body"]')
      ).toBeNull();
    });

    gridRef.current?.clearFilters();

    await waitFor(() => {
      expect(globalInput.value).toBe('');
      expect(columnInput.value).toBe('');
      expect(getCell(container, '1', 'name').textContent).toContain('Ada');
      expect(getCell(container, '2', 'name').textContent).toContain('Grace');
    });
  });

  it('applies controlled global filter state to the row model', async () => {
    const { container } = render(
      <GenDataGrid
        gridId="global-filter-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        enableGlobalFilter
        globalFilter="Ada"
      />
    );

    await waitFor(() => {
      expect(getCell(container, '1', 'name').textContent).toContain('Ada');
      expect(
        container.querySelector(
          '[data-gen-datagrid-cell="true"][data-cell-kind="body"][data-rowid="2"]'
        )
      ).toBeNull();
    });
  });

  it('paginates rows with uncontrolled pagination controls', async () => {
    const { container, getByText } = render(
      <GenDataGrid
        gridId="pagination-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        enablePagination
        defaultPagination={{ pageIndex: 0, pageSize: 1 }}
      />
    );

    expect(getCell(container, '1', 'name').textContent).toContain('Ada');
    expect(
      container.querySelector(
        '[data-gen-datagrid-cell="true"][data-cell-kind="body"][data-rowid="2"]'
      )
    ).toBeNull();

    fireEvent.click(getByText('Next'));

    await waitFor(() => {
      expect(getCell(container, '2', 'name').textContent).toContain('Grace');
    });
  });

  it('marks dirty cells and exposes dirty state imperative actions', async () => {
    const gridRef = React.createRef<GenDataGridHandle>();
    const onDirtyStateChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        ref={gridRef}
        gridId="dirty-grid"
        data={rows}
        columns={editabilityColumns}
        getRowId={(row) => row.id}
        onDirtyStateChange={onDirtyStateChange}
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
      expect(firstCell.closest('[role="row"]')?.getAttribute('data-dirty-row')).toBe(
        'true'
      );
      expect(gridRef.current?.getDirtyState().rowIds).toEqual(['1']);
      expect(onDirtyStateChange).toHaveBeenLastCalledWith({
        cells: [
          {
            rowId: '1',
            columnId: 'name',
            previousValue: 'Ada',
            value: 'Ada Dirty',
          },
        ],
        rowIds: ['1'],
        deletedRowIds: [],
      });
    });

    gridRef.current?.resetDirtyState(['1']);

    await waitFor(() => {
      expect(firstCell.dataset.dirtyCell).toBeUndefined();
      expect(gridRef.current?.getDirtyState().rowIds).toEqual([]);
      expect(onDirtyStateChange).toHaveBeenLastCalledWith({
        cells: [],
        rowIds: [],
        deletedRowIds: [],
      });
    });
  });

  it('marks deleted rows through the imperative deleteRows action', async () => {
    const gridRef = React.createRef<GenDataGridHandle>();
    const onRowsDelete = vi.fn();
    const onDirtyStateChange = vi.fn();
    const { container } = render(
      <GenDataGrid
        ref={gridRef}
        gridId="delete-rows-grid"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        onRowsDelete={onRowsDelete}
        onDirtyStateChange={onDirtyStateChange}
      />
    );

    gridRef.current?.deleteRows(['2']);

    await waitFor(() => {
      expect(onRowsDelete).toHaveBeenCalledWith(['2']);
      expect(gridRef.current?.getDirtyState().deletedRowIds).toEqual(['2']);
      expect(getCell(container, '2', 'name').closest('[role="row"]')?.getAttribute(
        'data-deleted-row'
      )).toBe('true');
      expect(onDirtyStateChange).toHaveBeenLastCalledWith({
        cells: [],
        rowIds: ['2'],
        deletedRowIds: ['2'],
      });
    });

    gridRef.current?.resetDirtyState();

    await waitFor(() => {
      expect(gridRef.current?.getDirtyState().deletedRowIds).toEqual([]);
      expect(getCell(container, '2', 'name').closest('[role="row"]')?.getAttribute(
        'data-deleted-row'
      )).toBeNull();
      expect(onDirtyStateChange).toHaveBeenLastCalledWith({
        cells: [],
        rowIds: [],
        deletedRowIds: [],
      });
    });
  });
});
