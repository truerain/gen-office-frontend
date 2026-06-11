<!-- packages/gen-datagrid/docs/log/implementation-log.md
Records meaningful GenDataGrid implementation decisions and progress.
-->

# GenDataGrid Implementation Log

용어 기준: 구현 로그와 QA 보정 기록의 공통 용어는 `../reference/terminology.md`를 따른다.

## 2026-06-08

### Documentation Baseline

- Added `../plan/div-datagrid-development-plan.md` to define the div-based DataGrid development direction.
- Added `../plan/mvp-test-gates.md` to define gate-based implementation and testing criteria.
- Added `../reference/api-comparison-with-gen-grid.md` to compare existing GenGrid API with proposed GenDataGrid API.
- Added `../reference/api-structure.md` to regroup GenDataGrid API into Core, State, Feature, Rendering, Column, Instance, and Extension API categories.

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

- Added `../architecture/gate-1-2-architecture.md` with Mermaid diagrams for:
  - component relationships
  - render data flow
  - active cell interaction flow
- Documented current Phase 1/Gate 2 boundaries, implemented state surface, and deferred features.

### Gate 1 And Gate 2 Completion

- Marked Gate 1 and Gate 2 as complete for Gate 3 entry in `../plan/mvp-test-gates.md`.
- Completion basis:
  - baseline build and SSR/source tests cover the div DOM contract, table tag exclusion, active cell markers, roving tab stop, root-scoped lookup, per-row height, and TanStack column state.
  - Vitest/jsdom interaction tests cover arrow key movement, multiple grid isolation, and interactive descendant keydown bypass.
  - `../architecture/gate-1-2-architecture.md` documents the current component relationship, render data flow, and active cell interaction flow.
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
- Added `../architecture/gate-3-architecture.md` for the current Gate 3 range selection architecture.

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

### Gate 4 Editing API Baseline

- Added public editing types:
  - `GenDataGridEditType`
  - `GenDataGridEditOption`
  - `GenDataGridEditableContext`
  - `GenDataGridEditorContext`
  - `GenDataGridEditorFactory`
  - `GenDataGridCellValueChange`
- Added editing props:
  - `readOnly`
  - `readonly`
  - `editOnActiveCell`
  - `keepEditingOnNavigate`
  - `editorFactory`
  - `isCellEditable`
  - `onCellValueChange`
- Added `src/core/table/tanstack-table.ts` to extend TanStack `ColumnMeta` with editing meta:
  - `editable`
  - `editType`
  - `editOptions`
  - `getEditOptions`
  - `editPlaceholder`
  - `renderEditor`
- Imported the TanStack metadata augmentation from the package entrypoint.
- Runtime editing behavior is intentionally not implemented in this slice.

### Gate 4 Editable Cell Predicate

- Added `features/editing/editableCell.ts` to resolve whether a cell can enter editing mode.
- Added editable predicate precedence:
  - `readOnly` / `readonly`
  - grid-level `isCellEditable(ctx)`
  - column meta `editable`
  - column editor capability
- Wired `DataGridBody` to calculate editable state from TanStack row/cell models.
- Added `data-editable-cell="true"` to editable body cells.
- Added Vitest/jsdom coverage for:
  - column meta editable markers
  - `readOnly` disabling editable markers
  - grid-level editable predicate precedence
  - `renderEditor` columns treated as editable by default
- Added `../architecture/gate-4-architecture.md` for the current Gate 4 editing predicate architecture.

### Gate 4 Editing Runtime Baseline

- Added `features/editing/useCellEditing.ts` to manage the active editing cell and draft value.
- Wired edit entry from:
  - active editable cell `Enter`
  - active editable cell `F2`
  - editable cell double-click
- Added runtime editor rendering precedence:
  - column meta `renderEditor`
  - grid-level `editorFactory`
  - built-in default editor
- Added built-in editor surfaces for:
  - text
  - number
  - date
  - select
  - textarea
  - checkbox
- Added edit lifecycle behavior:
  - `data-editing-cell="true"` marker for the active editor cell
  - Escape cancel without emitting changes
  - activating another cell cancels the current editor without emitting changes
  - mouse interaction inside editor controls does not reactivate the parent cell
  - Enter commit through `onCellValueChange`
  - `applyValue(nextValue)` for custom editors
- Kept row data mutation out of this slice. The parent must apply `onCellValueChange` to `data` if the committed value should be reflected in rendered rows.
- Deferred advanced blur/portal policy, printable-key edit entry, `editOnActiveCell`, `keepEditingOnNavigate`, and paste application.
- Added Vitest/jsdom coverage for:
  - double-click edit entry
  - keyboard edit entry
  - Escape cancel
  - other-cell activation cancel
  - select editor mouse down passthrough
  - Enter commit callback
  - custom editor `applyValue`

## 2026-06-11
- 다음은 Storybook 테스트 후 수정사항 임

### Gate 4 Active Cell Reclick Edit Entry

- Added an edit entry path for clicking an already active editable cell.
- Kept first click on an inactive cell as activation-only behavior.
- Preserved existing double-click, Enter, and F2 edit entry paths.
- Kept interactive descendants excluded from cell activation and edit entry.
- Added Vitest/jsdom coverage for:
  - inactive editable cell first click activates without editing
  - second click on the same active editable cell enters edit mode

### Gate 4 Cell Edit API Surface

- Added `../reference/cell-edit-api.md` to define Cell Edit public props, column meta, editor context, commit event, implemented behavior, and deferred policies.
- Added grid-level `editSelectOnFocus`.
- Added grid-level `editCommitOnBlur`.
- Added column meta `editSelectOnFocus`.
- Added column meta `editCommitOnBlur`.
- Added `selectOnFocus` to `editorFactory` context.
- Added `commitOnBlur` to `editorFactory` context.
- Added `tabNavigate(direction)` to `editorFactory` context.
- Unified `renderEditor` and `editorFactory` so both receive the same `GenDataGridEditorContext`, including resolved editor metadata, `selectOnFocus`, `commitOnBlur`, and `tabNavigate(direction)`.
- Wired `editSelectOnFocus` to the built-in input editor focus behavior.
- Wired `editCommitOnBlur` to built-in editor blur behavior and other-cell activation.
- Wired Tab/Shift+Tab to active-cell navigation outside edit mode.
- Wired Tab/Shift+Tab inside built-in editors to commit and move to the next or previous editable cell.
- Kept column meta precedence over the grid-level defaults.
- Documented deferred edit policies:
  - `editOnActiveCell`
  - `keepEditingOnNavigate`
  - printable-key edit entry
  - advanced blur/portal policy
  - paste application
  - dirty state integration
- Added Vitest/jsdom coverage for:
  - grid-level select-on-focus behavior
  - column-level select-on-focus override
  - grid-level commit-on-blur behavior
  - commit before other-cell activation when commit-on-blur is enabled
  - Tab/Shift+Tab active-cell navigation
  - Tab/Shift+Tab edit commit and editable-cell navigation

### Gate 4 Storybook Number Editor Sample

- Added a `Score` number column to the Gate 4 editing Storybook scenario.
- Wired the column with `meta.editType: 'number'`.
- Converted committed `score` values back to `number` in the Storybook example state update.

### Range Selection Native Text Selection Guard

- Prevented browser-native text selection when body cell range selection starts.
- Added `user-select: none` to grid body cells and restored `user-select: text` for active editors.
- Added Vitest/jsdom coverage that cell range selection cancels the native mouse default while root empty-area mouse behavior remains uncancelled.

### Range Selection Scrollbar Guard

- Kept selected ranges when the grid root scrollbar is clicked or dragged.
- Preserved the existing empty root-area click behavior that clears selection.
- Added Vitest/jsdom coverage for root scrollbar mouse down versus root empty-area mouse down.

### Gate 4 Editing Runtime Refactor

- Split editor context construction from `DataGridBody` into `features/editing/editorContext.ts`.
- Split editor rendering precedence and built-in editor controls into `features/editing/renderEditor.tsx`.
- Split editable-cell Tab target calculation into `features/editing/editNavigation.ts`.
- Kept edit commit/cancel side effects and active-cell orchestration in `DataGridBody` so future dirty state and keep-editing navigation policies can be attached without changing row/body ownership.

### Gate 4 Completion

- Kept `editOnActiveCell` and `keepEditingOnNavigate` as reserved public props and added runtime warnings when they are enabled.
- Documented paste application, data mutation, dirty-state integration, printable-key edit entry, and advanced blur/portal policy as deferred beyond Gate 4.
- Marked Gate 4 complete for Gate 5 entry in `../plan/mvp-test-gates.md`.
- Completion basis:
  - baseline build and SSR/source tests cover the public export, div DOM contract, row height, root-scoped lookup, and TanStack column state.
  - Vitest/jsdom interaction tests cover editable markers, edit entry, commit/cancel, blur commit, Tab/Shift+Tab navigation, custom editor context, reserved prop warnings, range selection guards, clipboard copy, and multiple-grid ownership.
  - `../architecture/gate-4-architecture.md` documents the current editing component relationship, runtime flow, implemented API surface, and deferred features.
