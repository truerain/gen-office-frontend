// packages/gen-grid/src/features/editing/inlineEditorMetrics.ts
// Shared inline field height tokens (tracks GenGrid --gen-grid-row-height).

/** Vertical inset from row height used by EditableFieldCell / inline editors. */
export const GEN_GRID_INLINE_FIELD_INSET_PX = 14;

/** CSS var set on GenGrid root; equals calc(rowHeight - inset). */
export const GEN_GRID_INLINE_FIELD_HEIGHT_VAR = 'var(--gen-grid-inline-field-height)';
