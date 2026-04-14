// packages/gen-grid-crud/src/components/CrudActionBar.tsx

import * as React from 'react';

import { Columns3, ListFilter, RotateCcw, Save, SquareMinus, SquarePlus } from 'lucide-react';

import {
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gen-office/ui';
import type {
  CrudActionApi,
  CrudActionButtonItem,
  CrudActionButtonStyle,
  CrudActionContext,
  CrudActionComboItem,
  CrudActionComboValue,
  CrudActionCheckboxItem,
  CrudActionCheckboxValue,
  CrudActionItem,
  CrudBuiltInActionKey,
  CrudUiState,
} from '../GenGridCrud.types';
import { useTranslation } from 'react-i18next';

import styles from './CrudActionBar.module.css';

const DEFAULT_BUILT_INS: readonly CrudBuiltInActionKey[] = [
  'add',
  'delete',
  'save',
  'columnReorder',
  'filter',
];

function ExcelSvgIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="none" {...props}>
      <rect x="7.5" y="3" width="13.5" height="18" rx="2" fill="currentColor" opacity="0.2" />
      <rect x="3" y="5.5" width="9.5" height="13" rx="1.5" fill="currentColor" />
      <path
        d="M6 9L7.25 11L8.5 9H9.85L8 12L9.9 15H8.5L7.25 13L6 15H4.6L6.5 12L4.65 9H6Z"
        fill="white"
      />
      <path d="M12.75 8.5H18.5M12.75 12H18.5M12.75 15.5H18.5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

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

function resolveComboValue<TData>(
  value: CrudActionComboValue<TData> | undefined,
  ctx: CrudActionContext<TData>
): string | undefined {
  if (typeof value === 'function') return value(ctx);
  if (typeof value === 'string') return value;
  return undefined;
}

function resolveCheckboxValue<TData>(
  checked: CrudActionCheckboxValue<TData> | undefined,
  ctx: CrudActionContext<TData>
): boolean {
  if (typeof checked === 'function') return checked(ctx);
  if (typeof checked === 'boolean') return checked;
  return false;
}

export function CrudActionBar<TData>(props: {
  title?: string;
  state: CrudUiState<TData>;
  actionApi: CrudActionApi;
  totalRowCount?: number;
  filterEnabled?: boolean;
  actionButtonStyle?: CrudActionButtonStyle;
  includeBuiltIns?: readonly CrudBuiltInActionKey[];
  customActions?: readonly CrudActionItem<TData>[];
}) {
  const {
    title,
    state,
    actionApi,
    totalRowCount,
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
  const labelExcel = t('crud.excel', { defaultValue: 'Excel' });
  const labelReset = t('crud.reset', { defaultValue: 'Reset' });
  const labelColumnReorder = t('crud.column_reorder', { defaultValue: 'Column Reorder' });

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
        icon: <SquarePlus aria-hidden size={16} />,
        side: 'left',
        order: 10,
        variant: actionButtonStyle === 'icon' ? 'ghost' : 'secondary',
        disabled: (c) => !c.api.add || c.state.isCommitting,
        onClick: (c) => c.api.add?.(),
      },
      delete: {
        key: 'delete',
        label: labelDelete,
        icon: <SquareMinus aria-hidden size={16} />,
        side: 'left',
        order: 20,
        variant: actionButtonStyle === 'icon' ? 'ghost' : 'secondary',
        disabled: (c) => {
          if (!c.api.deleteSelected || c.state.isCommitting) return true;
          const mode = c.state.deleteMode ?? 'selected';
          if (mode === 'activeRow') return c.state.activeRowId == null;
          return c.state.rowSelection.length === 0;
        },
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
      columnReorder: {
        key: 'columnReorder',
        label: labelColumnReorder,
        icon: <Columns3 aria-hidden size={16} />,
        side: 'right',
        order: 20,
        variant:
          state.columnReorderEnabled
            ? 'primary'
            : actionButtonStyle === 'icon'
              ? 'ghost'
              : 'secondary',
        disabled: (c) => !c.api.toggleColumnReorder || c.state.isCommitting,
        onClick: (c) => c.api.toggleColumnReorder?.(),
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
      excel: {
        key: 'excel',
        label: labelExcel,
        icon: <ExcelSvgIcon aria-hidden width={24} height={24} />,
        side: 'right',
        order: 30,
        variant: actionButtonStyle === 'icon' ? 'ghost' : 'secondary',
        disabled: (c) => !c.api.exportExcel || c.state.isCommitting,
        onClick: (c) => c.api.exportExcel?.(),
      },
    };

    return builtIns.map((key) => byKey[key]).filter(Boolean);
  }, [
    actionButtonStyle,
    builtIns,
    filterEnabled,
    labelAdd,
    labelColumnReorder,
    labelDelete,
    labelExcel,
    labelFilter,
    labelReset,
    labelSave,
    state.columnReorderEnabled,
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

  const totalRowsText = React.useMemo(() => {
    const viewCount = state.viewData.length;
    const viewText = viewCount.toLocaleString();

    if (typeof totalRowCount === 'number' && Number.isFinite(totalRowCount)) {
      const resolvedTotal = Math.max(0, Math.floor(totalRowCount));
      const totalText = resolvedTotal.toLocaleString();
      return t('common:total_rows', { defaultValue:'{row}', row: `${viewText}/${totalText}` });
    }

    return t('common:total_rows', { defaultValue:'{row}', row: viewText });
  }, [state.viewData.length, t, totalRowCount]);

  const renderAction = (action: CrudActionItem<TData>) => {
    const style = action.style ?? actionButtonStyle;
    const labelNode = action.label ?? action.key;
    const ariaLabel = getLabelString(labelNode, action.key);
    const disabled = resolveRule(action.disabled, false, ctx);
    const wrapperClassName = action.itemClassName
      ? `${styles.actionItem} ${action.itemClassName}`
      : styles.actionItem;

    if (style === 'combo') {
      const comboAction = action as CrudActionComboItem<TData>;
      const value = resolveComboValue(comboAction.value, ctx);
      return (
        <div key={action.key} className={wrapperClassName} style={action.itemStyle}>
          <div className={styles.controlAction}>
            {comboAction.label ? <span className={styles.controlLabel}>{comboAction.label}</span> : null}
            <Select
              value={value}
              onValueChange={(nextValue) => void comboAction.onValueChange?.(nextValue, ctx)}
              disabled={disabled}
            >
              <SelectTrigger
                className={
                  comboAction.triggerClassName
                    ? `${styles.comboTrigger} ${comboAction.triggerClassName}`
                    : styles.comboTrigger
                }
                style={comboAction.triggerStyle}
                aria-label={ariaLabel}
                title={ariaLabel}
              >
                <SelectValue placeholder={comboAction.placeholder ?? 'Select'} />
              </SelectTrigger>
              <SelectContent>
                {comboAction.options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    if (style === 'checkbox') {
      const checkboxAction = action as CrudActionCheckboxItem<TData>;
      const checked = resolveCheckboxValue(checkboxAction.checked, ctx);
      return (
        <div key={action.key} className={wrapperClassName} style={action.itemStyle}>
          <label className={styles.checkboxAction} title={ariaLabel}>
            <Checkbox
              checked={checked}
              disabled={disabled}
              onCheckedChange={(nextChecked) =>
                void checkboxAction.onCheckedChange?.(nextChecked === true, ctx)
              }
              aria-label={ariaLabel}
            />
            <span className={styles.checkboxLabel}>{labelNode}</span>
          </label>
        </div>
      );
    }

    const buttonAction = action as CrudActionButtonItem<TData>;
    const isIcon = style === 'icon';
    return (
      <div key={action.key} className={wrapperClassName} style={action.itemStyle}>
        <Button
          type="button"
          variant={buttonAction.variant ?? (isIcon ? 'ghost' : 'secondary')}
          size={isIcon ? 'icon' : 'sm'}
          disabled={disabled}
          onClick={() => void buttonAction.onClick?.(ctx)}
          aria-label={ariaLabel}
          title={ariaLabel}
          leftIcon={!isIcon ? buttonAction.icon : undefined}
        >
          {isIcon ? (buttonAction.icon ?? labelNode) : labelNode}
        </Button>
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.leftActions}>
        {title && (
          <div className={`${styles.section} ${styles.title}`}>
            {title}
          </div>
        )}
        <div className={`${styles.section} ${styles.total}`}>
          <span>{totalRowsText}</span>
        </div>

        <div className={`${styles.section} ${styles.actions}`}>
          {leftActions.map(renderAction)}
        </div>
      </div>
      <div className={styles.rightActions}>
        {rightActions.map(renderAction)}
      </div>
    </div>
  );
}
