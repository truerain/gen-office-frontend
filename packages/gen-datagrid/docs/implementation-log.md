<!-- packages/gen-datagrid/docs/implementation-log.md
Records meaningful GenDataGrid implementation decisions and progress.
-->

# GenDataGrid Implementation Log

## 2026-06-08

### Documentation Baseline

- Added `docs/div-datagrid-development-plan.md` to define the div-based DataGrid development direction.
- Added `docs/mvp-test-gates.md` to define gate-based implementation and testing criteria.
- Added `docs/api-comparison-with-gen-grid.md` to compare existing GenGrid API with proposed GenDataGrid API.
- Added `docs/api-structure.md` to regroup GenDataGrid API into Core, State, Feature, Rendering, Column, Instance, and Extension API categories.

### Package Baseline

- Added baseline package source files:
  - `src/index.ts`
  - `src/index.css`
  - `src/GenDataGrid.tsx`
  - `src/GenDataGrid.types.ts`
- Added a minimal `GenDataGrid` component that renders only the root div contract:
  - `role="grid"`
  - `data-gen-datagrid-root="true"`
- Kept the baseline component intentionally feature-free until Core API and Gate 1 renderer contract are implemented.

### Test Baseline

- Added `test/baseline.mjs` using Node's built-in `node:test` runner.
- Added package scripts:
  - `test`
  - `test:baseline`
- Baseline tests currently verify:
  - `GenDataGrid` is exported.
  - root div includes the baseline grid DOM contract.
  - table tags are not rendered.
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes.

### Agent Rules

- Added source file header comment rules to `frontend/AGENTS.md`.
- Added GenDataGrid documentation update rules to `frontend/AGENTS.md`.

### Gate 1 Minimal Renderer

- Added baseline div-grid renderer files under `src/renderers/div-grid`.
- Added `DataGridRoot`, `DataGridHeader`, `DataGridBody`, and `DataGridCell`.
- Added `gridTemplate.ts` to keep header/body row `grid-template-columns` from one source.
- Added `cellValue.ts` for simple baseline value resolution from `accessorKey` and `accessorFn`.
- Updated `GenDataGrid` to render header and body rowgroups without table tags.
- Added minimal CSS classes for root, rows, header cells, and body cells.
- Expanded baseline tests to verify:
  - header/body `rowgroup` contract
  - `columnheader` and `gridcell` roles
  - scoped cell data attributes
  - shared grid template output
  - no table tags
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes with 5 tests.

### Gate 2 Minimal Active Cell

- Added baseline active cell API:
  - `gridId`
  - `getGridId`
  - `activeCell`
  - `defaultActiveCell`
  - `onActiveCellChange`
- Added root-scoped DOM helper files under `src/core/dom`.
- Added `features/active-cell/navigation.ts` for keyboard navigation calculation.
- Updated `DataGridRoot` to manage controlled/uncontrolled active cell state.
- Added roving `tabIndex` behavior so only the active body cell receives `tabIndex={0}`.
- Added keyboard navigation handling for Arrow keys, Home, End, PageUp, and PageDown.
- Added active cell focus using root-scoped cell lookup.
- Expanded baseline tests to verify:
  - one active cell marker
  - one roving tab stop
  - controlled active cell rendering
  - root-scoped DOM lookup source rule
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes with 8 tests.
- Known limitation: keyboard behavior is currently covered through build and SSR/source tests only. Browser interaction testing should be added when a DOM interaction runner is introduced.

### Row Height Policy Update

- Updated docs to allow per-row height through `getRowHeight` in MVP when `enableVirtualization !== true`.
- Kept virtualized dynamic row measurement as an Extension API concern.
- Updated API and gate docs to distinguish:
  - non-virtualized per-row height resolver
  - virtualized dynamic height measurement

### Non-Virtualized Row Height Implementation

- Added `getRowHeight` to `GenDataGridProps`.
- Applied per-row height in `DataGridBody` through `--gen-datagrid-current-row-height`.
- Updated cell CSS to prefer row-specific height and fall back to `rowHeight`.
- Added a baseline SSR test for per-row height rendering.
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes with 9 tests.

### Storybook Baseline Page

- Added `src/stories/GenDataGrid.baseline.stories.tsx`.
- The story visually covers:
  - div header/body rendering
  - column width layout
  - per-row height through `getRowHeight`
  - default active cell outline
  - keyboard navigation after focusing/clicking a cell
- Verified the common Storybook build with `pnpm -C frontend/apps/storybook-all build`.


## 2026-06-09 New Agent session

### Phase 1 Core Table Adapter

- Added `src/core/table/useDataGridTable.ts` as the TanStack Table adapter for the div renderer.
- Moved row and visible column source data from raw `data/defaultData` arrays to TanStack row/header/column models.
- Added public controlled/uncontrolled state props for `columnOrder`, `columnVisibility`, and `columnSizing`.
- Updated the div header/body renderers to consume TanStack header groups, rows, visible cells, and column sizes.
- Kept the existing `data-gen-datagrid-root`, `data-grid-id`, `data-gen-datagrid-cell`, `data-rowid`, and `data-colid` DOM contract unchanged.
- Added baseline SSR coverage for TanStack column order, visibility, and sizing state.

### Gate 2 Interaction Test Baseline

- Added Vitest, jsdom, and Testing Library dependencies for DOM interaction tests.
- Added `test/interaction.test.tsx` to cover:
  - Arrow key active cell movement
  - multiple grid keyboard isolation
  - interactive descendant keydown bypass for grid navigation
- Added `test:interaction` and included it in the package `test` script.
- Verified `pnpm -C frontend/packages/gen-datagrid run test:interaction` passes with 3 tests.

### Architecture Diagram

- Added `docs/gate-1-2-architecture.md` with Mermaid diagrams for:
  - component relationships
  - render data flow
  - active cell interaction flow
- Documented current Phase 1/Gate 2 boundaries, implemented state surface, and deferred features.

### Gate 1 And Gate 2 Completion

- Marked Gate 1 and Gate 2 as complete for Gate 3 entry in `docs/mvp-test-gates.md`.
- Completion basis:
  - baseline build and SSR/source tests cover the div DOM contract, table tag exclusion, active cell markers, roving tab stop, root-scoped lookup, per-row height, and TanStack column state.
  - Vitest/jsdom interaction tests cover arrow key movement, multiple grid isolation, and interactive descendant keydown bypass.
  - `docs/gate-1-2-architecture.md` documents the current component relationship, render data flow, and active cell interaction flow.
- Browser-level visual/real viewport automation remains deferred until Playwright or Storybook test runner is introduced.

### Gate 3 Range Selection Slice

- Added `features/range-selection/rangeSelection.ts` for range coordinate and containment helpers.
- Added `features/range-selection/useRangeSelection.ts` for root-level mouse range selection.
- Wired `DataGridRoot` to handle `onMouseDown` and `onMouseOver` through range selection delegation.
- Updated `DataGridBody` and `DataGridCell` to render `data-selected-cell="true"` for cells inside the current range.
- Added selected cell baseline styling in `src/index.css`.
- Added Vitest/jsdom interaction coverage for:
  - drag range selection
  - interactive descendant guard for range selection
- Added `docs/gate-3-architecture.md` for the current Gate 3 range selection architecture.

### Gate 3 Clipboard Copy Slice

- Added range bounds normalization to `features/range-selection/rangeSelection.ts`.
- Added `features/range-selection/clipboard.ts` for clipboard matrix building, text serialization, value stringification, and paste text parsing helpers.
- Added `features/range-selection/useClipboardActions.ts` for focused grid copy actions.
- Added public props:
  - `enableRangeSelection`
  - `enableClipboard`
  - `clipboardOptions.includeHeader`
- Wired `Ctrl/Cmd+C` to copy the current selected range and `Shift+Ctrl/Cmd+C` to include headers.
- Added Vitest coverage for:
  - range bounds normalization
  - clipboard escaping and serialization
  - clipboard text parsing
  - selected range copy
  - header-included copy
  - focused grid copy ownership
- Added `Gate3RangeSelection` Storybook story for manual range selection checks.
- Deferred paste application until data mutation and editing policies are introduced.

### Gate 3 Shift And Additive Selection

- Expanded internal range selection state from a single range to `GenDataGridRangeSelections`.
- Added Shift selection behavior to extend the last range from its anchor.
- Added Ctrl/Meta selection behavior to append a separate range.
- Updated selected cell calculation to mark cells included by any internal range.
- Added Vitest/jsdom interaction coverage for:
  - Shift range extension
  - Ctrl additive range selection

### Gate 3 Controlled Selection API

- Added public range selection props:
  - `selectedRanges`
  - `defaultSelectedRanges`
  - `onSelectedRangesChange`
- Exported `GenDataGridCellCoord`, `GenDataGridRangeSelection`, and `GenDataGridRangeSelections` from the package entrypoint.
- Updated `useRangeSelection` to support controlled and uncontrolled selection state.
- Added Vitest/jsdom coverage for:
  - default selected ranges rendering
  - controlled selected ranges rendering
  - controlled change callbacks without internal mutation

### Gate 3 Clear And Imperative Handle

- Added `GenDataGridHandle` with:
  - `rootElement`
  - `clearSelection()`
  - `copySelection(options)`
- Changed `GenDataGrid` forwarded ref from `HTMLDivElement` to `GenDataGridHandle`.
- Added selection clear behavior for:
  - `Escape`
  - root empty area click
  - imperative `clearSelection()`
- Added Vitest/jsdom coverage for:
  - Escape clear
  - root empty area clear
  - imperative `copySelection()`
  - imperative `clearSelection()`
  - controlled clear callback without internal mutation
- Marked Gate 3 complete for Gate 4 entry with paste application explicitly deferred.
