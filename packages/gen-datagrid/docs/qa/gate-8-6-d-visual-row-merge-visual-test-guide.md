<!-- packages/gen-datagrid/docs/qa/gate-8-6-d-visual-row-merge-visual-test-guide.md
Manual QA checklist for Gate 8.6-d visual row merge behavior.
-->

# Gate 8.6-d Visual Row Merge Visual Test Guide

## Storybook

- `Gate86VisualRowMerge`
- `Gate86VisualRowMergeVirtualized`
- `Gate86VisualRowMergeFeatureSplit`
- `Gate86VisualRowMergeManual`

## Standard Body Checks

- Merge-enabled columns show the first value for an adjacent equal-value group.
- Middle and end cells in the same group keep their cell area but hide repeated content.
- The last cell in a group restores the closing row border.
- Non-merge columns keep normal cell rendering.
- Row number, row status, and row selection system columns do not merge.

## Interaction Checks

- A covered cell can still become the active cell.
- Keyboard navigation still moves by actual cell coordinates.
- Range selection remains cell-based.
- Editing a covered editable cell keeps the existing edit behavior.
- Dirty, deleted, selected, active, editing, and validation markers remain visible over merge styling.

## Virtualized Checks

- Long repeated groups keep normal merge markers while scrolling.
- If the real group start row is above the viewport, the first visible continuation row shows the group value.
- The first visible continuation row exposes `data-visual-row-merge-display="visible-start"`.
- Fast scrolling does not remove actual body cell DOM ownership or focus behavior.

## Feature Split Checks

- In `Gate86VisualRowMergeFeatureSplit`, the `Role` column shows continuation cell values but does not render a sticky merge label.
- In `Gate86VisualRowMergeFeatureSplit`, the `Location` column hides continuation cell values but still renders a sticky merge label.
- `visualRowMerge: true` keeps the same full behavior as before the option split.

## Sticky Label Checks

- In the virtualized story, scrolling into the middle of a long group shows a sticky merge label for center user columns.
- The sticky label follows the rendered column width, including `columnFitMode="grow"`.
- The sticky label is not focusable and does not intercept pointer events.
- The sticky label does not replace the real cell DOM or clipboard semantics.

## Known Limitations

- Sticky merge labels are implemented for center user columns.
- Pinned-column sticky merge labels are deferred because pinned offsets use separate sticky positioning rules.
- Non-virtual continuation value rendering is deferred; non-virtual visual merge markers and hidden repeated content are supported.
- `visualRowMerge.compare` and `visualRowMerge.getValue` are deferred; MVP comparison uses `Object.is`.
