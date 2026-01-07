import { useState } from 'react';
import { flexRender, type Cell, type RowData } from '@tanstack/react-table';
import { cn } from '@gen-office/utils';
import type { BorderStyle, CellEditEvent } from '../../types';
import { EditableCell } from '../EditableCell';
import styles from './ColumnCell.module.css';

export interface ColumnCellProps<TData extends RowData> {
  cell: Cell<TData, unknown>;
  sticky?: boolean;
  stickyLeft?: number;
  bordered?: BorderStyle;
  isLastColumn?: boolean;
  onCellEdit?: (event: CellEditEvent<TData>) => void | Promise<void>;
  className?: string;
}

export function ColumnCell<TData extends RowData>({
  cell,
  sticky = false,
  stickyLeft = 0,
  bordered = 'horizontal',
  isLastColumn = false,
  onCellEdit,
  className,
}: ColumnCellProps<TData>) {
  const meta = cell.column.columnDef.meta;
  const [isEditing, setIsEditing] = useState(false);

  const isEditable = meta?.editable && onCellEdit;

  const handleCellClick = () => {
    if (isEditable && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleSave = async (newValue: any) => {
    const oldValue = cell.getValue();
    
    if (oldValue !== newValue && onCellEdit) {
      await onCellEdit({
        row: cell.row.original,
        columnId: cell.column.id,
        oldValue,
        newValue,
      });
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <td
      className={cn(
        styles.td,
        sticky && styles.sticky,
        bordered === 'horizontal' && styles.borderedHorizontal,
        bordered === 'vertical' && styles.borderedVertical,
        bordered === 'all' && styles.borderedAll,
        (bordered === 'vertical' || bordered === 'all') && isLastColumn && styles.lastColumn,
        isEditable && styles.editable,
        isEditing && styles.editing,
        meta?.cellClassName,
        className
      )}
      style={{
        width: meta?.width,
        minWidth: meta?.minWidth,
        maxWidth: meta?.maxWidth,
        textAlign: meta?.align || 'left',
        ...(sticky && { left: `${stickyLeft}px` }),
      }}
      onClick={handleCellClick}
    >
      {isEditing ? (
        <EditableCell
          value={cell.getValue()}
          editType={meta?.editType}
          editOptions={meta?.editOptions}
          editValidator={meta?.editValidator}
          editPlaceholder={meta?.editPlaceholder}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        flexRender(cell.column.columnDef.cell, cell.getContext())
      )}
    </td>
  );
}
