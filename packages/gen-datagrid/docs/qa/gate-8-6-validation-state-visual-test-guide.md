<!-- packages/gen-datagrid/docs/qa/gate-8-6-validation-state-visual-test-guide.md
Documents manual visual checks for Gate 8.6-c validation state markers.
-->

# Gate 8.6-c Validation State Visual Test Guide

## Storybook

- Story: `gen-datagrid/Gates/Baseline/Gate86ValidationState`

## Manual Checks

- Score cells below 90 show an error marker.
- Error cells expose `data-validation-state="error"` and `aria-invalid="true"`.
- Hampton location cells and layout-related note cells show warning markers.
- Warning cells expose `data-validation-state="warning"` and do not set `aria-invalid`.
- Hovering a marked cell shows the validation message through the browser title tooltip.
- Row number and row status system columns do not receive validation markers.
- Clicking or editing a marked cell keeps the existing active cell and editing behavior unchanged.

## Scope Notes

- Validation is display-only in Gate 8.6-c.
- The grid does not block edits, reject paste operations, or run internal value validation.
