<!-- packages/gen-datagrid/docs/architecture/gate-8-7-a-current-row-highlight-architecture.md
Documents the GenDataGrid Gate 8.7-a current row highlight implementation.
-->

# GenDataGrid Gate 8.7-a Current Row Highlight Architecture

Gate 8.7-a adds a current row concept for external Master/Detail layouts. This is separate from checkbox row selection and from range selection.

## Status

Implemented. The first slice derives current row from `activeCell?.rowId`.

## Public API

```ts
type GenDataGridProps<TData> = {
  enableCurrentRowHighlight?: boolean;
  onCurrentRowChange?: (rowId: string | null) => void;
};
```

Deferred:

- `currentRowId`
- `defaultCurrentRowId`
- controlled current row independent from active cell
- conflict policy between controlled `activeCell` and controlled current row

## State Policy

- `activeCell` remains the focus, keyboard, and edit target.
- `rowSelection` remains checkbox/system selection state.
- `currentRow` is the business row context for external Master/Detail layouts.
- In this slice, current row is always `activeCell?.rowId ?? null`.
- Data cell click and keyboard navigation update current row through active cell movement.
- System column clicks do not update current row because they do not update active cell.

## Render Contract

When `enableCurrentRowHighlight` is enabled, the matching body row receives:

```txt
data-current-row="true"
```

The marker is emitted by both standard and virtual body paths through `DataGridBodyRow`.

## Storybook

`Gate82MasterDetailRow` includes:

- the existing embedded detail panel behavior
- a second external detail grid below the master grid
- `enableCurrentRowHighlight`
- `onCurrentRowChange` to drive the external detail grid data

## Tests

Interaction tests cover:

- initial current row marker from default active cell
- current row update on body cell click
- current row update on keyboard movement
- system column click no-op behavior
