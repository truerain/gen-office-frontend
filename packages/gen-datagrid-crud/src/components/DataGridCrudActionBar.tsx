// packages/gen-datagrid-crud/src/components/DataGridCrudActionBar.tsx
// Renders the presentational action bar for GenDataGridCrud.

import * as React from 'react';
import {
  Columns3,
  Download,
  ListFilter,
  RotateCcw,
  Save,
  Trash2,
  Plus,
} from 'lucide-react';
import { Button } from '@gen-office/ui';

import type {
  DataGridCrudActionApi,
  DataGridCrudActionBarOptions,
  DataGridCrudActionContext,
  DataGridCrudActionItem,
  DataGridCrudBuiltInActionKey,
  DataGridCrudUiState,
} from '../GenDataGridCrud.types';

const DEFAULT_BUILT_INS: readonly DataGridCrudBuiltInActionKey[] = [
  'add',
  'delete',
  'save',
  'reset',
  'filter',
  'columnReorder',
  'excel',
];

function resolveRule<TData>(
  rule: boolean | ((ctx: DataGridCrudActionContext<TData>) => boolean) | undefined,
  fallback: boolean,
  ctx: DataGridCrudActionContext<TData>
) {
  if (typeof rule === 'function') return rule(ctx);
  if (typeof rule === 'boolean') return rule;
  return fallback;
}

function getLabelText(label: React.ReactNode, fallback: string) {
  return typeof label === 'string' ? label : fallback;
}

export function DataGridCrudActionBar<TData>(props: {
  state: DataGridCrudUiState<TData>;
  actionApi: DataGridCrudActionApi;
  options?: DataGridCrudActionBarOptions<TData>;
  className?: string;
}) {
  const { state, actionApi, options, className } = props;
  const ctx = React.useMemo<DataGridCrudActionContext<TData>>(
    () => ({ state, actionApi }),
    [actionApi, state]
  );
  const includeBuiltIns = options?.includeBuiltIns ?? DEFAULT_BUILT_INS;

  const builtInActions = React.useMemo<DataGridCrudActionItem<TData>[]>(() => {
    const actions: Record<DataGridCrudBuiltInActionKey, DataGridCrudActionItem<TData>> = {
      add: {
        key: 'add',
        label: 'Add',
        icon: <Plus aria-hidden size={16} />,
        order: 10,
        disabled: (item) => item.state.readonly || item.state.isCommitting,
        onClick: (item) => item.actionApi.addRow(),
      },
      delete: {
        key: 'delete',
        label: 'Delete',
        icon: <Trash2 aria-hidden size={16} />,
        order: 20,
        disabled: (item) =>
          item.state.readonly ||
          item.state.isCommitting ||
          (item.state.selectedRowIds.length === 0 && !item.state.currentRowId),
        onClick: (item) => item.actionApi.deleteSelectedRows(),
      },
      save: {
        key: 'save',
        label: 'Save',
        icon: <Save aria-hidden size={16} />,
        order: 30,
        disabled: (item) => item.state.readonly || item.state.isCommitting,
        loading: (item) => item.state.isCommitting,
        onClick: (item) => item.actionApi.save(),
      },
      reset: {
        key: 'reset',
        label: 'Reset',
        icon: <RotateCcw aria-hidden size={16} />,
        order: 40,
        disabled: (item) => !item.state.dirty || item.state.isCommitting,
        onClick: (item) => item.actionApi.reset(),
      },
      filter: {
        key: 'filter',
        label: 'Filter',
        icon: <ListFilter aria-hidden size={16} />,
        side: 'right',
        order: 10,
        disabled: (item) => item.state.isCommitting,
        onClick: (item) => item.actionApi.toggleFilters(),
      },
      columnReorder: {
        key: 'columnReorder',
        label: 'Columns',
        icon: <Columns3 aria-hidden size={16} />,
        side: 'right',
        order: 20,
        disabled: (item) => item.state.isCommitting,
        onClick: (item) => item.actionApi.toggleColumnReorder(),
      },
      excel: {
        key: 'excel',
        label: 'Excel',
        icon: <Download aria-hidden size={16} />,
        side: 'right',
        order: 30,
        disabled: (item) => item.state.isCommitting,
        onClick: (item) => item.actionApi.exportExcel(),
      },
    };
    return includeBuiltIns.map((key) => actions[key]).filter(Boolean);
  }, [includeBuiltIns]);

  const visibleActions = React.useMemo(
    () =>
      [...builtInActions, ...(options?.customActions ?? [])]
        .filter((item) => !resolveRule(item.hidden, false, ctx))
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [builtInActions, ctx, options?.customActions]
  );
  const leftActions = visibleActions.filter((item) => (item.side ?? 'left') === 'left');
  const rightActions = visibleActions.filter((item) => item.side === 'right');
  const title = options?.title;

  const renderAction = (item: DataGridCrudActionItem<TData>) => {
    const disabled = resolveRule(item.disabled, false, ctx);
    const loading = resolveRule(item.loading, false, ctx);
    const label = item.label;
    const ariaLabel = getLabelText(label, item.key);
    return (
      <Button
        key={item.key}
        type="button"
        size="sm"
        variant={item.key === 'save' ? 'brand' : 'secondary'}
        leftIcon={item.icon}
        disabled={disabled}
        loading={loading}
        title={ariaLabel}
        aria-label={ariaLabel}
        onClick={() => void item.onClick?.(ctx)}
      >
        {label}
      </Button>
    );
  };

  return (
    <div className={['gen-datagrid-crud-actionbar', className].filter(Boolean).join(' ')}>
      <div className="gen-datagrid-crud-actionbar__left">
        {title ? <div className="gen-datagrid-crud-actionbar__title">{title}</div> : null}
        {options?.showTotalRows !== false ? (
          <div className="gen-datagrid-crud-actionbar__total">
            {state.data.length.toLocaleString()} rows
          </div>
        ) : null}
        <div className="gen-datagrid-crud-actionbar__actions">
          {leftActions.map(renderAction)}
        </div>
      </div>
      <div className="gen-datagrid-crud-actionbar__right">
        {rightActions.map(renderAction)}
      </div>
    </div>
  );
}
