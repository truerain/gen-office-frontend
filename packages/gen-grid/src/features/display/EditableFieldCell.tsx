// packages/gen-grid/src/features/display/EditableFieldCell.tsx
// Opt-in display wrapper that draws an inset border for editable-looking cells.

import type * as React from 'react';
import styles from './EditableFieldCell.module.css';

export type EditableFieldCellAlign = 'left' | 'center' | 'right';

export type EditableFieldCellProps = {
  children?: React.ReactNode;
  value?: unknown;
  align?: EditableFieldCellAlign;
  className?: string;
  /** When true, render plain text without field chrome. */
  disabled?: boolean;
  /**
   * Fill the cell for textarea-style columns (top-aligned td).
   * Uses pre-wrap and top content alignment instead of single-line chrome height.
   */
  multiline?: boolean;
};

function formatDisplayValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

export function EditableFieldCell(props: EditableFieldCellProps) {
  const {
    children,
    value,
    align = 'left',
    className,
    disabled = false,
    multiline = false,
  } = props;
  const content = children ?? formatDisplayValue(value);
  const alignClass =
    align === 'right' ? styles.alignRight : align === 'center' ? styles.alignCenter : styles.alignLeft;

  return (
    <div
      className={[
        styles.field,
        alignClass,
        multiline ? styles.multiline : '',
        disabled ? styles.disabled : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {content}
    </div>
  );
}
