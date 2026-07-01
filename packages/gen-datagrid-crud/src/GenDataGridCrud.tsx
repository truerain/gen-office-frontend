// packages/gen-datagrid-crud/src/GenDataGridCrud.tsx
// Provides the public thin CRUD wrapper over GenDataGrid.

import * as React from 'react';
import { GenDataGrid } from '@gen-office/gen-datagrid';
import type {
  GenDataGridCellValidation,
  GenDataGridValidationContext,
} from '@gen-office/gen-datagrid';

import { DataGridCrudActionBar } from './components/DataGridCrudActionBar';
import type {
  DataGridCrudFieldErrors,
  GenDataGridCrudProps,
} from './GenDataGridCrud.types';
import { useDataGridCrudController } from './crud/useDataGridCrudController';

function getFieldError(
  fieldErrors: DataGridCrudFieldErrors,
  rowId: string,
  columnId: string
) {
  return fieldErrors[`${rowId}.${columnId}`];
}

export function GenDataGridCrud<TData>(props: GenDataGridCrudProps<TData>) {
  const {
    title,
    readonly = false,
    data,
    columns,
    getRowId,
    dataVersion,
    createRow,
    createdRowPosition,
    onCommit,
    beforeCommit,
    validateCommit,
    onCommitSuccess,
    onCommitError,
    onValidationError,
    onExport,
    actionBar,
    onStateChange,
    gridProps,
    className,
    style,
  } = props;
  const controller = useDataGridCrudController<TData>({
    readonly,
    data,
    getRowId,
    createRow,
    createdRowPosition,
    onCommit,
    beforeCommit,
    validateCommit,
    onCommitSuccess,
    onCommitError,
    onValidationError,
    onExport,
    onStateChange,
  });
  const actionBarEnabled = actionBar?.enabled ?? true;
  const userGetCellValidation = gridProps?.getCellValidation;
  const getCellValidation = React.useCallback(
    (
      ctx: GenDataGridValidationContext<TData>
    ): GenDataGridCellValidation | null | undefined => {
      const message = getFieldError(controller.state.fieldErrors, ctx.rowId, ctx.columnId);
      if (message) {
        return {
          severity: 'error',
          message,
        };
      }

      return userGetCellValidation?.(ctx);
    },
    [controller.state.fieldErrors, userGetCellValidation]
  );

  return (
    <div className={['gen-datagrid-crud', className].filter(Boolean).join(' ')} style={style}>
      {actionBarEnabled ? (
        <DataGridCrudActionBar
          className="gen-datagrid-crud__action-bar"
          state={controller.state}
          actionApi={controller.actionApi}
          options={{ title, ...actionBar }}
        />
      ) : null}
      <div className="gen-datagrid-crud__grid">
        <GenDataGrid<TData>
          {...gridProps}
          editSelectOnFocus={gridProps?.editSelectOnFocus ?? true}
          {...controller.gridStateProps}
          ref={controller.gridRef}
          data={[...controller.gridData]}
          columns={[...columns]}
          getRowId={getRowId}
          dataVersion={dataVersion}
          readOnly={readonly}
          readonly={readonly}
          getCellValidation={getCellValidation}
        />
      </div>
    </div>
  );
}
