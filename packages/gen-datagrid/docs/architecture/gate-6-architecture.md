<!-- packages/gen-datagrid/docs/architecture/gate-6-architecture.md
Documents the Gate 6 filtering, footer, pagination, and dirty state architecture.
-->

# GenDataGrid Gate 6 Architecture

Gate 6 adds filtering, footer rows, grid-level footer bar rendering, pagination, and dirty state on top of the Gate 5 div grid layout. This document tracks the current Gate 6 slice.

## Implemented Slice

- `columnFilters`, `defaultColumnFilters`, `onColumnFiltersChange`, `globalFilter`, `defaultGlobalFilter`, and `onGlobalFilterChange` are public filtering state props.
- `pagination`, `defaultPagination`, and `onPaginationChange` are public pagination state props.
- `enableColumnFilters`, `enableGlobalFilter`, `enableFooterRow`, `enableStickyFooterRow`, `enableFooter`, `enablePagination`, and `enableDirtyState` are public feature flags.
- `useDataGridTable` wires TanStack column filters, global filter, filtered row model, pagination state, and pagination row model.
- `DataGridHeader` renders a column filter trigger and minimal input popover for filterable columns.
- `DataGridRoot` renders the global filter input above the table viewport.
- `.gen-datagrid__viewport` is the only table scroll container. Header, body, and footer row scroll together, while pagination and `DataGridFooterBar` stay outside the table viewport.
- `DataGridFooterRow` renders TanStack footer groups through column `footer` definitions and shares the same ordered visible columns and `grid-template-columns` source as header/body.
- `DataGridFooterBar` renders the grid-level `footer` or `renderFooter` slot below pagination.
- Dirty state is tracked in `DataGridRoot` from committed `onCellValueChange` events and delete requests.
- Body rows and cells render dirty/deleted DOM markers:
  - `data-dirty-cell="true"`
  - `data-dirty-row="true"`
  - `data-deleted-row="true"`
- `GenDataGridHandle` exposes `resetDirtyState(rowIds?)`, `commitDirtyState(rowIds?)`, `deleteRows(rowIds)`, and `getDirtyState()`.
- `Gate6FilteringFooterPaginationDirtyState` provides the Storybook visual-check scenario for filters, footer row, sticky footer row, pagination, dirty markers, deleted row markers, and footer bar behavior.
- Baseline SSR coverage verifies footer row, filter trigger, pagination, footer bar, and viewport markers.
- Vitest coverage verifies column/global filtering, pagination, dirty state, and delete-row marker behavior.

## Component Relationship

`DataGridRoot` owns Gate 6 composition and state bridging.

```mermaid
flowchart TD
  Props["GenDataGridProps<br/>Gate 6 API"]
  Root["DataGridRoot<br/>composition + bridge state"]
  Table["useDataGridTable<br/>TanStack filters + pagination"]
  GlobalFilter["Global filter<br/>fixed above viewport"]
  Viewport["DataGrid viewport<br/>scroll container"]
  Header["DataGridHeader<br/>column filter triggers"]
  FilterPopover["Header filter popover<br/>column.setFilterValue"]
  Body["DataGridBody<br/>filtered/paginated rows"]
  FooterRow["DataGridFooterRow<br/>footer groups"]
  ExternalFooter["DataGridFooterBar<br/>footer / renderFooter"]
  Pagination["Pagination controls<br/>table page actions"]
  Dirty["Dirty state<br/>cell/row/delete markers"]
  Handle["GenDataGridHandle<br/>dirty/delete actions"]
  Template["gridTemplateColumns<br/>shared column source"]

  Props --> Root
  Root --> Table
  Root --> GlobalFilter
  Root --> Viewport
  Viewport --> Header
  Viewport --> Body
  Viewport --> FooterRow
  Root --> ExternalFooter
  Root --> Pagination
  Root --> Dirty
  Root --> Handle
  Table --> Header
  Table --> Body
  Table --> FooterRow
  Table --> Pagination
  Header --> FilterPopover
  Table --> Template
  Template --> Header
  Template --> Body
  Template --> FooterRow
  Dirty --> Body
  Dirty --> ExternalFooter
```

- `useDataGridTable` wires TanStack column filters, global filter, and pagination state.
- `DataGridHeader` renders per-column filter triggers and the inline filter popover.
- `DataGridBody` renders the current row model and receives dirty cell/row marker sets.
- `DataGridFooterRow` renders TanStack footer groups with the same visible column model and grid template as header/body.
- `DataGridRoot` owns global filter input, the table viewport, pagination controls, and `DataGridFooterBar`.
- Header/body/footer row share the viewport scroll area. Pagination and `DataGridFooterBar` are outside that scroll area.

## Data Flow

Filtering and pagination stay in the TanStack adapter. Controlled props win over uncontrolled defaults:

- `columnFilters`, `defaultColumnFilters`, `onColumnFiltersChange`
- `globalFilter`, `defaultGlobalFilter`, `onGlobalFilterChange`
- `pagination`, `defaultPagination`, `onPaginationChange`

The renderer consumes `table.getRowModel().rows`, so enabling pagination switches the body to the paginated row model. Footer rows use `table.getFooterGroups()` and the same ordered visible columns used by header/body.

```mermaid
flowchart LR
  ColumnInput["Column filter input"] --> ColumnState["columnFilters state"]
  GlobalInput["Global filter input"] --> GlobalState["globalFilter state"]
  ColumnState --> Adapter["useDataGridTable"]
  GlobalState --> Adapter
  Adapter --> Filtered["getFilteredRowModel"]
  Filtered --> PaginationState["pagination state"]
  PaginationState --> Paged["getPaginationRowModel"]
  Paged --> Body["DataGridBody rows"]
  Filtered --> FooterContext["renderFooter rows"]
  Adapter --> FooterGroups["getFooterGroups"]
  FooterGroups --> FooterRow["DataGridFooterRow"]
```

## Dirty State

Dirty state is grid-local application state, not TanStack state. `DataGridRoot` wraps `onCellValueChange` and records changed cells when `previousValue` and `value` are not `Object.is` equal.

Dirty state currently marks committed cell edits only. The grid does not mutate `data`; consumers still own data updates.

Imperative handle additions:

- `resetDirtyState(rowIds?)`
- `commitDirtyState(rowIds?)`
- `deleteRows(rowIds)`
- `getDirtyState()`

`commitDirtyState` currently clears tracked dirty markers like `resetDirtyState`. A later data mutation slice can distinguish baseline acceptance from visual reset if the package takes ownership of data state.

```mermaid
sequenceDiagram
  participant Editor as Cell editor
  participant Root as DataGridRoot
  participant Dirty as Dirty state
  participant Body as DataGridBody
  participant App as Consumer callbacks
  participant Handle as GenDataGridHandle

  Editor->>Root: onCellValueChange(args)
  Root->>Dirty: record dirty cell when value changed
  Root->>App: onCellValueChange(args)
  Dirty->>Body: dirtyCellIds / dirtyRowIds
  Body-->>Body: render data-dirty-cell / data-dirty-row
  Handle->>Root: deleteRows(rowIds)
  Root->>Dirty: add deletedRowIds
  Root->>App: onRowsDelete(rowIds)
  Dirty->>Body: deletedRowIds
  Body-->>Body: render data-deleted-row
```

## DOM Contract

Gate 6 adds these DOM markers:

- `data-column-filter-trigger="true"`
- `data-column-filter-popover="true"`
- `data-global-filter="true"`
- `data-gen-datagrid-viewport="true"`
- `data-gen-datagrid-footer-row="true"`
- `data-cell-kind="footer"`
- `data-gen-datagrid-pagination="true"`
- `data-gen-datagrid-footer-bar="true"`
- `data-dirty-cell="true"`
- `data-dirty-row="true"`
- `data-deleted-row="true"`

The no-table-tags contract remains unchanged.

## Deferred

- Manual/server filtering and pagination totals.
- Page size selector.
- Delete-row data mutation; `deleteRows(rowIds)` currently emits a delete request and marks rows as deleted.
- Dirty baseline integration with `dataVersion`.
- Advanced filter operators and typed filter editors.
