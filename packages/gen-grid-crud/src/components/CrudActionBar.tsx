// packages/gen-grid-crud/src/components/CrudActionBar.tsx

import * as React from 'react';

import { CircleDot, ListFilter, ListPlus, ListX, RotateCcw, Save } from 'lucide-react';

import { Button } from '@gen-office/ui';
import type {
  CrudActionApi,
  CrudActionButtonStyle,
  CrudActionContext,
  CrudActionItem,
  CrudBuiltInActionKey,
  CrudUiState,
} from '../GenGridCrud.types';
import { useTranslation } from 'react-i18next';

import styles from './CrudActionBar.module.css';

const DEFAULT_BUILT_INS: readonly CrudBuiltInActionKey[] = ['add', 'delete', 'save', 'filter'];

function resolveRule<TData>(
  rule: boolean | ((ctx: CrudActionContext<TData>) => boolean) | undefined,
  fallback: boolean,
  ctx: CrudActionContext<TData>
): boolean {
  if (typeof rule === 'function') return rule(ctx);
  if (typeof rule === 'boolean') return rule;
  return fallback;
}

function getLabelString(label: React.ReactNode, fallback: string): string {
  return typeof label === 'string' ? label : fallback;
}

export function CrudActionBar<TData>(props: {
  title?: string;
  state: CrudUiState<TData>;
  actionApi: CrudActionApi;
  filterEnabled?: boolean;
  actionButtonStyle?: CrudActionButtonStyle;
  includeBuiltIns?: readonly CrudBuiltInActionKey[];
  customActions?: readonly CrudActionItem<TData>[];
}) {
  const {
    title,
    state,
    actionApi,
    filterEnabled,
    actionButtonStyle = 'text',
    includeBuiltIns,
    customActions = [],
  } = props;
  const { t } = useTranslation('common');
  const labelAdd = t('crud.add');
  const labelDelete = t('crud.delete');
  const labelSave = t('crud.save');
  const labelFilter = t('crud.filter');
  const translatedReset = t('crud.reset');
  const labelReset = translatedReset === 'crud.reset' ? 'Reset' : translatedReset;

  const ctx = React.useMemo<CrudActionContext<TData>>(
    () => ({ state, api: actionApi }),
    [state, actionApi]
  );

  const builtIns = includeBuiltIns ?? DEFAULT_BUILT_INS;

  const builtInActions = React.useMemo<CrudActionItem<TData>[]>(() => {
    const byKey: Record<CrudBuiltInActionKey, CrudActionItem<TData>> = {
      add: {
        key: 'add',
        label: labelAdd,
        icon: <ListPlus aria-hidden size={16} />,
        side: 'left',
        order: 10,
        variant: actionButtonStyle === 'icon' ? 'ghost' : 'secondary',
        disabled: (c) => !c.api.add || c.state.isCommitting,
        onClick: (c) => c.api.add?.(),
      },
      delete: {
        key: 'delete',
        label: labelDelete,
        icon: <ListX aria-hidden size={16} />,
        side: 'left',
        order: 20,
        variant: actionButtonStyle === 'icon' ? 'ghost' : 'secondary',
        disabled: (c) =>
          !c.api.deleteSelected || c.state.isCommitting || c.state.selectedRowIds.length === 0,
        onClick: (c) => c.api.deleteSelected?.(),
      },
      save: {
        key: 'save',
        label: labelSave,
        icon: <Save aria-hidden size={16} />,
        side: 'left',
        order: 30,
        variant: actionButtonStyle === 'icon' ? 'ghost' : 'brand',
        disabled: (c) => !c.api.save || !c.state.dirty || c.state.isCommitting,
        onClick: (c) => c.api.save?.(),
      },
      filter: {
        key: 'filter',
        label: labelFilter,
        icon: <ListFilter aria-hidden size={16} />,
        side: 'right',
        order: 10,
        variant: filterEnabled ? 'primary' : actionButtonStyle === 'icon' ? 'ghost' : 'secondary',
        disabled: (c) => !c.api.toggleFilter,
        onClick: (c) => c.api.toggleFilter?.(),
      },
      reset: {
        key: 'reset',
        label: labelReset,
        icon: <RotateCcw aria-hidden size={16} />,
        side: 'left',
        order: 40,
        variant: actionButtonStyle === 'icon' ? 'ghost' : 'secondary',
        disabled: (c) => !c.state.dirty || c.state.isCommitting,
        onClick: (c) => c.api.reset(),
      },
    };

    return builtIns.map((key) => byKey[key]).filter(Boolean);
  }, [
    actionButtonStyle,
    builtIns,
    filterEnabled,
    labelAdd,
    labelDelete,
    labelFilter,
    labelReset,
    labelSave,
  ]);

  const allActions = React.useMemo(
    () => [...builtInActions, ...customActions],
    [builtInActions, customActions]
  );

  const visibleActions = React.useMemo(
    () => allActions.filter((action) => resolveRule(action.visible, true, ctx)),
    [allActions, ctx]
  );

  const leftActions = React.useMemo(
    () =>
      visibleActions
        .filter((action) => (action.side ?? 'left') === 'left')
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [visibleActions]
  );

  const rightActions = React.useMemo(
    () =>
      visibleActions
        .filter((action) => (action.side ?? 'left') === 'right')
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    [visibleActions]
  );

  const renderAction = (action: CrudActionItem<TData>) => {
    const style = action.style ?? actionButtonStyle;
    const isIcon = style === 'icon';
    const labelNode = action.label ?? action.key;
    const ariaLabel = getLabelString(labelNode, action.key);
    const disabled = resolveRule(action.disabled, false, ctx);

    return (
      <Button
        key={action.key}
        type="button"
        variant={action.variant ?? (isIcon ? 'ghost' : 'secondary')}
        size={isIcon ? 'icon' : 'sm'}
        disabled={disabled}
        onClick={() => void action.onClick?.(ctx)}
        aria-label={ariaLabel}
        title={ariaLabel}
        leftIcon={!isIcon ? action.icon : undefined}
      >
        {isIcon ? (action.icon ?? labelNode) : labelNode}
      </Button>
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.leftActions}>
        {title && (
          <div className={styles.title}>
            <span><CircleDot size={8} /> </span>
            {title}
          </div>
        )}
        <div className={styles.total}>
          <span>{t('common.total_rows', { count: state.viewData.length })}</span>
        </div>

        <div className={styles.actions}>
          {leftActions.map(renderAction)}
        </div>
      </div>
      <div className={styles.rightActions}>
        {rightActions.map(renderAction)}
      </div>
    </div>
  );
}
