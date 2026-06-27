<!-- packages/gen-datagrid/docs/architecture/gate-8-6-d-visual-row-merge-architecture.md
Documents the Gate 8.6-d Visual Row Merge architecture, API contract, and phased implementation plan.
-->

# GenDataGrid Gate 8.6-d Visual Row Merge Architecture

Gate 8.6-d adds visual row merge for repeated values in the same column. The feature must be designed for virtualized grids first because most production usage is expected to use virtualization.

This feature is a visual merge, not a structural DOM merge. Body cell DOM nodes remain addressable by `rowId + columnId` so active cell, keyboard navigation, range selection, editing, clipboard, dirty state, and validation can keep their existing cell-level contracts.

## Goals

- Show repeated adjacent values in a column as one visual group.
- Support virtualized rows without losing the group label when the real group start row is outside the viewport.
- Add a sticky merge label so the current group value remains visible while scrolling through a long group.
- Keep the actual data model, row model, focus model, and clipboard model cell-based.
- Exclude system columns from merge behavior.

## Non-Goals

- Do not remove covered cell DOM nodes.
- Do not implement native `rowSpan`.
- Do not make merged groups a new selection or editing unit.
- Do not change copy/paste semantics; copied data remains actual cell data.
- Do not make sticky merge labels editable.

## Planned API

MVP starts with a column meta option:

```ts
meta: {
  visualRowMerge: true
}
```

`true` enables the full MVP behavior: base merge markers, virtual continuation values, and virtual sticky merge labels. Consumers can split the virtual behaviors when needed:

```ts
meta: {
  visualRowMerge: {
    enabled: true,
    showContinuationValue: true,
    stickyLabel: false
  }
}
```

Option meaning:

| Option | Default when enabled | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Enables base visual row merge state calculation and DOM markers. |
| `showContinuationValue` | `true` | In virtualized mode, shows the group value on the first visible continuation cell through `data-visual-row-merge-display="visible-start"`. |
| `stickyLabel` | `true` | In virtualized mode, renders a non-interactive sticky label overlay for continuing groups. |

The default comparison is `Object.is(currentValue, previousValue)` against the same column in the current row model order.

Deferred extension shape:

```ts
meta: {
  visualRowMerge: {
    enabled: true,
    showContinuationValue?: boolean,
    stickyLabel?: boolean,
    compare?: (current: unknown, previous: unknown) => boolean,
    getValue?: (ctx: GenDataGridVisualRowMergeContext<TData>) => unknown
  }
}
```

The first implementation should avoid exposing `compare` and `getValue` until the base rendering and virtualization contract is proven.

## Row Model Basis

Merge groups are calculated from the TanStack row model after filtering, sorting, tree expansion, pagination, and other row-model transformations that affect the rendered order.

The merge calculation must not use DOM adjacency. In virtualized mode, many adjacent rows are not mounted, so DOM-only comparison cannot determine whether a rendered row is a real start, middle, end, or continuation of a group.

## Merge State

Each merge-enabled user cell receives one merge state:

```ts
type GenDataGridVisualRowMergeState =
  | 'single'
  | 'start'
  | 'middle'
  | 'end';
```

Virtual rendering can add a display override:

```ts
type GenDataGridVisualRowMergeDisplayState =
  | GenDataGridVisualRowMergeState
  | 'visible-start';
```

State meaning:

| State | Meaning | Content |
| --- | --- | --- |
| `single` | No adjacent same-value merge group | show |
| `start` | First row of an actual merge group | show |
| `middle` | Covered row inside a group | hide by default |
| `end` | Last row of a group | hide by default; restore closing border |
| `visible-start` | First visible row of a continuing virtualized group | show |

## DOM Contract

The body cell DOM remains present for every user cell.

Planned markers:

```html
<div
  data-gen-datagrid-cell="true"
  data-cell-kind="body"
  data-rowid="42"
  data-colid="department"
  data-visual-row-merge="middle"
/>
```

For a virtualized continuation label:

```html
<div
  data-visual-row-merge="middle"
  data-visual-row-merge-display="visible-start"
/>
```

Sticky labels should be rendered as a separate non-interactive overlay/layer in the viewport, not by moving or reparenting body cells.

## Interaction Contract

- Active cell remains actual `rowId + columnId`.
- Covered cells can still become active.
- Covered cells keep existing editability rules.
- Range selection remains cell-based.
- Clipboard copy remains actual cell values, not visually collapsed values.
- Dirty, deleted, validation, selected, active, and editing markers remain cell markers.
- Active/editing/validation markers must visually win over merge styling.

## Virtualization Contract

Virtualized support is required for MVP.

The implementation is split into two concepts:

- Actual merge state: computed from the full current row model.
- Display state: computed from the current virtual viewport.

When a long group starts above the viewport, the first actually visible row in that group should be displayed as `visible-start` so the user can still see the group value. This must be based on the viewport-visible range, not only the overscan-rendered range, because overscan rows may be mounted outside the user's visible area.

`showContinuationValue` controls this cell-level display state independently from sticky label rendering. Non-virtual continuation value rendering is deferred because the standard body does not currently maintain a viewport-visible row range; it would require a separate scroll/measurement path for the non-virtual body.

## Sticky Merge Label Contract

Sticky merge label is included in the Gate 8.6-d scope, but implemented after the base merge metadata and visible continuation logic.

Rules:

- Sticky labels are read-only visual labels.
- Sticky labels follow horizontal scroll and column width.
- Sticky labels should use the same left/width geometry as the merge-enabled column cell.
- Sticky labels must not receive focus.
- Sticky labels must not replace real cell content for accessibility or keyboard behavior.
- Pinned columns need separate handling because their sticky offsets differ from center columns.

MVP sticky support should start with user columns in the center scroll zone. Pinned-column sticky merge labels can be a follow-up if the offset interaction becomes too large.

`stickyLabel` controls this overlay independently from `showContinuationValue`. A column may hide repeated continuation cell content while still showing the sticky overlay, or show continuation cell content without rendering the sticky overlay.

## Implementation Slices

### 1. Architecture / Contract

Status: complete after this document.

- Decide planned API.
- Define merge state and display state.
- Define virtualization and sticky label policy.
- Define interaction and non-goals.

### 2. Merge Metadata Calculation

Status: complete.

- Add column meta typing for `visualRowMerge`.
- Build merge metadata from the current TanStack row model.
- Exclude system columns.
- Add unit tests for `single`, `start`, `middle`, and `end`.

### 3. Non-Sticky Visual Rendering

Status: complete.

- Pass merge state to `DataGridBodyRow`.
- Add body cell DOM markers.
- Hide covered content and adjust borders without changing row height.
- Preserve active, selected, editing, dirty, deleted, and validation behavior.
- Add non-virtual and virtual Storybook examples.

### 4. Virtual Visible Continuation

Status: complete.

- Determine the actual viewport-visible row range.
- Add `visible-start` display state for continuing groups.
- Avoid overscan-only label jumps.
- Add interaction tests for long virtual groups.

### 5. Sticky Merge Label

Status: complete for center user columns. Pinned-column sticky merge labels remain deferred.

- Render a non-interactive sticky label layer in the viewport.
- Sync label position with horizontal scroll and column sizing.
- Start with center user columns.
- Document pinned-column limitation or add pinned support if scope remains manageable.

### 6. QA / Documentation

Status: complete.

- Add a visual test guide.
- Add Storybook manual checks for normal merge, virtual continuation, and sticky label.
- Update API reference and comparison docs once public types are added.

### 7. Feature Split

Status: complete.

- Extend `visualRowMerge` from a boolean-only flag to a boolean-or-object option.
- Keep `visualRowMerge: true` backward-compatible with the previous full behavior.
- Allow `showContinuationValue` and `stickyLabel` to be enabled independently.
- Add Storybook and interaction tests for split behavior.

## Risks

- Sticky labels can conflict with sticky header, pinned columns, and active cell focus outlines.
- Dynamic row height can make sticky label placement harder if labels depend on measured row boundaries.
- Overscan can make labels appear before the user reaches the group unless viewport-visible range is used.
- Editing covered cells may feel surprising because the displayed label can come from a group value while the active cell is still a specific row cell.
- Non-virtual continuation display needs its own visible-row measurement path because the standard body currently renders without virtualizer range metadata.

## Acceptance Criteria

- Merge groups are computed from current row model order, not DOM order.
- Virtualized long groups keep a visible group label when the real start row is outside the viewport.
- Sticky merge label keeps the current group value visible while scrolling vertically.
- Body cell DOM nodes remain available for every row/column coordinate.
- Active cell, selection, editing, validation, dirty state, and clipboard behavior remain cell-based.
- System columns are excluded.
