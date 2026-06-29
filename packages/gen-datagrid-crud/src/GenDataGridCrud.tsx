// packages/gen-datagrid-crud/src/GenDataGridCrud.tsx
// Provides the public thin CRUD wrapper over GenDataGrid.

import * as React from 'react';
import { GenDataGrid } from '@gen-office/gen-datagrid';

import { DataGridCrudActionBar } from './components/DataGridCrudActionBar';
import type { GenDataGridCrudProps } from './GenDataGridCrud.types';
import { useDataGridCrudController } from './crud/useDataGridCrudController';

export function GenDataGridCrud<TData>(props: GenDataGridCrudProps<TData>) {
  const {
    title,
    readonly = false,
    data,
    columns,
    getRowId,
    dataVersion,
    onCommit,
    beforeCommit,
    onCommitSuccess,
    onCommitError,
    actionBar,
    onStateChange,
    gridProps,
    className,
    style,
  } = props;
  const controller = useDataGridCrudController<TData>({
    readonly,
    data,
    onCommit,
    beforeCommit,
    onCommitSuccess,
    onCommitError,
    onStateChange,
  });
  const actionBarEnabled = actionBar?.enabled ?? true;

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
          {...controller.gridStateProps}
          ref={controller.gridRef}
          data={[...data]}
          columns={[...columns]}
          getRowId={getRowId}
          dataVersion={dataVersion}
          readOnly={readonly}
          readonly={readonly}
        />
      </div>
    </div>
  );
}
