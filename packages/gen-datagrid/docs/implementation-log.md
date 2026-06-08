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
