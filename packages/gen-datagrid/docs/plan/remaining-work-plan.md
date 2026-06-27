<!-- packages/gen-datagrid/docs/plan/remaining-work-plan.md
Tracks only remaining GenDataGrid work after completed gate history moved to logs and architecture documents.
-->

# GenDataGrid Remaining Work Plan

This document tracks remaining work only. Completed implementation history belongs in
`../log/implementation-log.md`; completed planning and gate history belongs in
`../log/planning-history.md`; design rationale belongs in the relevant
`../architecture/*` document.

## Current Status

GenDataGrid has implementation coverage for the main MVP surface:

- div renderer and scoped DOM contract
- active cell and keyboard navigation
- range selection and clipboard copy
- editing and paste MVP
- column sizing, pinning, and reorder
- filtering, footer, pagination, dirty state, and data ownership MVP
- row virtualization, dynamic row measurement, and scroll-seeking placeholders
- master-detail, nested grid composition, and tree rows
- body column span, grouped headers, validation markers, and visual row merge
- system columns and current row highlight

The remaining items below are extension, polish, or documentation-alignment work.

## Priority 1. Documentation Consistency

- Fix stale status text that still describes implemented features as planned.
- Repair or replace mojibake sections in older Korean documentation.
- Keep README links aligned with the new plan/log structure.
- Keep API reference implementation status aligned with current code.
- Keep each future implementation entry in Korean in `../log/implementation-log.md`.

## Priority 2. Visual Row Merge Follow-up

- Add sticky merge labels for pinned columns.
- Add non-virtual continuation value rendering if standard body viewport measurement is needed.
- Add `visualRowMerge.getValue` for custom merge comparison values.
- Add `visualRowMerge.compare` for custom equality.
- Define compatibility policy for visual row merge with tree rows, detail rows, and body col span.

## Priority 3. Header Group And Span Follow-up

- Define arbitrary `headerSpan` separately from TanStack nested column groups.
- Define pinned group header split/sticky behavior.
- Define `groupVisibilityToggle`.
- Decide resize/reorder/filter affordances for group headers.

## Priority 4. Current Row Controlled API

- Add `currentRowId`.
- Add `defaultCurrentRowId`.
- Define conflict policy when controlled `activeCell` and controlled `currentRowId` disagree.
- Decide whether current row can move independently from active cell after MVP.

## Priority 5. Virtualization Follow-up

- Add column virtualization if large column-count scenarios require it.
- Add browser-level visual regression coverage for virtualization-heavy stories.
- Add Storybook interaction or Playwright checks for large-row scroll behavior.

## Priority 6. Clipboard And Editing Follow-up

- Add paste-to-selection behavior for multi-cell selected ranges.
- Add clipboard value formatter policy.
- Add paste type coercion policy.
- Decide whether reserved `editOnActiveCell` and `keepEditingOnNavigate` should become active behavior or be removed.
- Refine popup/custom editor navigation policy once popup editor infrastructure is used by grid editors.

## Priority 7. Filtering Follow-up

- Add structured filter operators.
- Add typed filter editors.
- Add multi-condition filters.
- Expand manual/server filtering examples if application demos need them.

## Priority 8. Tree Follow-up

- Add async/lazy child loading API.
- Add flat parentId adapter if consumers need flat tree data.
- Define tree + master-detail combination policy.
- Define tree drag/drop reorder.
- Add `treeToggleColumnId` if consumers need a fixed tree toggle column.
- Add `treeCollapseBehavior` if descendant expansion reset policy must be configurable.
- Define server-side tree filtering semantics.

## Priority 9. Public API Surface Cleanup

- Reconcile documented instance API with implemented handle methods.
- Decide whether data mutation handle methods such as `getData`, `load`, `revertAll`,
  `acceptChanges`, and `hardReset` belong in GenDataGrid or in a higher-level CRUD package.
- Decide row/cell className and style callback API.
- Decide empty state and toolbar slot API.
- Split large API reference sections only after the public surface stabilizes further.

## Near-term Recommendation

Work next on documentation consistency before adding another feature. The current code is
ahead of some documents, and stale plan text is the main source of confusion.
