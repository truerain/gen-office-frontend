// packages/gen-datagrid-crud/src/index.ts
// Exposes the public GenDataGridCrud package API.

import './index.css';

export { GenDataGridCrud } from './GenDataGridCrud';
export { DataGridCrudActionBar } from './components/DataGridCrudActionBar';
export { useDataGridCrudController } from './crud/useDataGridCrudController';
export type {
  DataGridCrudActionApi,
  DataGridCrudActionBarOptions,
  DataGridCrudActionContext,
  DataGridCrudActionItem,
  DataGridCrudBuiltInActionKey,
  DataGridCrudCommitArgs,
  DataGridCrudCommitResult,
  DataGridCrudController,
  DataGridCrudUiState,
  GenDataGridCrudProps,
} from './GenDataGridCrud.types';
