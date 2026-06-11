<!-- packages/gen-datagrid/docs/architecture/gate-1-2-architecture.md
Documents the Gate 1 and Gate 2 GenDataGrid component relationships and data flow.
-->

# GenDataGrid Gate 1-2 Architecture

This document describes the current architecture after Phase 1 and Gate 2 baseline work.

## Component Relationship

```mermaid
flowchart TD
  GenDataGrid["GenDataGrid<br/>public component"]
  Props["GenDataGridProps<br/>public API"]
  Root["DataGridRoot<br/>state + composition"]
  Adapter["useDataGridTable<br/>TanStack adapter"]
  TanStack["TanStack Table<br/>row/header/column model"]
  Header["DataGridHeader<br/>header groups"]
  Body["DataGridBody<br/>row model + visible cells"]
  Cell["DataGridCell<br/>body cell DOM contract"]
  Template["gridTemplate<br/>column size to CSS grid"]
  CellDom["cellDom + selectors<br/>root-scoped lookup/focus"]
  Navigation["active-cell/navigation<br/>keyboard coordinate math"]
  Css["index.css<br/>baseline layout"]

  Props --> GenDataGrid
  GenDataGrid --> Root
  Root --> Adapter
  Adapter --> TanStack
  Root --> Header
  Root --> Body
  Root --> Template
  Root --> CellDom
  Root --> Navigation
  Header --> TanStack
  Body --> TanStack
  Body --> Cell
  Cell --> Root
  Css --> Root
  Css --> Header
  Css --> Body
  Css --> Cell
```

## Render Data Flow

```mermaid
flowchart LR
  Input["props<br/>data, columns, getRowId,<br/>column state"]
  Adapter["useDataGridTable"]
  Table["TanStack table"]
  HeaderModel["headerGroups"]
  RowModel["rowModel.rows"]
  Columns["visibleLeafColumns"]
  Template["grid-template-columns"]
  Header["DataGridHeader"]
  Body["DataGridBody"]
  Cells["DataGridCell"]

  Input --> Adapter
  Adapter --> Table
  Table --> HeaderModel
  Table --> RowModel
  Table --> Columns
  Columns --> Template
  HeaderModel --> Header
  Template --> Header
  RowModel --> Body
  Template --> Body
  Body --> Cells
```

## Interaction Flow

```mermaid
sequenceDiagram
  participant User
  participant Cell as DataGridCell
  participant Root as DataGridRoot
  participant Nav as active-cell/navigation
  participant Dom as cellDom

  User->>Cell: mouse down or focus
  Cell->>Root: onActiveCellChange(rowId, columnId)
  User->>Root: keydown Arrow/Home/End/Page
  Root->>Root: ignore interactive descendants
  Root->>Nav: resolveNextActiveCell(activeCell, rows, columns, key)
  Nav-->>Root: next active cell
  Root->>Root: update controlled/uncontrolled activeCell
  Root->>Dom: focusCellInRoot(root, activeCell)
  Dom->>Dom: root.querySelector scoped cell lookup
```

## Current Boundaries

- `GenDataGrid` is the public entry point and delegates rendering to `DataGridRoot`.
- `DataGridRoot` owns composition, active cell state, keyboard handling, grid id resolution, and root-scoped focus.
- `useDataGridTable` is the Phase 1 adapter between public props and TanStack table state/model.
- `DataGridHeader` and `DataGridBody` consume TanStack models instead of raw `columns` and `data`.
- `DataGridCell` owns the body cell DOM contract and activation event.
- DOM lookup must remain root-scoped through `cellDom` and `selectors`; global `document.querySelector` is not allowed for cell focus.

## Implemented State Surface

- `activeCell`, `defaultActiveCell`, `onActiveCellChange`
- `columnOrder`, `defaultColumnOrder`, `onColumnOrderChange`
- `columnVisibility`, `defaultColumnVisibility`, `onColumnVisibilityChange`
- `columnSizing`, `defaultColumnSizing`, `onColumnSizingChange`
- `rowHeight`, `getRowHeight` for non-virtualized rendering

## Not Yet Implemented

- Range selection and clipboard
- Editing lifecycle
- Column pinning, resize handles, and reorder UI
- Filtering, footer, pagination, and dirty state
- Row virtualization
- Playwright or Storybook test runner browser automation
