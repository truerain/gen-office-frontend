// apps/demo/src/pages/demo/plan-scope/AddMembersDialog.tsx
// Dialog to add non-member Actual rows into an existing Pooled item.

import { useMemo } from 'react';

import { Button, SimpleDialog } from '@gen-office/ui';
import type { CrudRowId } from '@gen-office/gen-grid-crud';

import { ActualPickerGrid } from './ActualPickerGrid';
import {
  addMembers,
  getNonMemberActuals,
  validateSelection,
  type PooledItem,
  type PlanScopeState,
} from './planScopeModel';

import styles from './PlanScopeDemoPage.module.css';

type AddMembersDialogProps = {
  open: boolean;
  state: PlanScopeState;
  pooled: PooledItem | null;
  selection: readonly CrudRowId[];
  onSelectionChange: (ids: readonly CrudRowId[]) => void;
  onOpenChange: (open: boolean) => void;
  onApply: (next: PlanScopeState) => void;
};

export function AddMembersDialog({
  open,
  state,
  pooled,
  selection,
  onSelectionChange,
  onOpenChange,
  onApply,
}: AddMembersDialogProps) {
  const candidates = useMemo(() => getNonMemberActuals(state.actuals), [state.actuals]);
  const validation = useMemo(
    () => validateSelection(state.actuals, selection),
    [state.actuals, selection]
  );

  const compatibleWithTarget = useMemo(() => {
    if (!pooled || !validation.ok) return false;
    const common = validation.common;
    return (
      common.acctCd === pooled.kept.acctCd &&
      common.ccCd === pooled.kept.ccCd &&
      common.deptCd === pooled.kept.deptCd &&
      common.collapsed.join('|') === pooled.collapsed.join('|')
    );
  }, [pooled, validation]);

  function handleApply() {
    if (!pooled || !validation.ok || !compatibleWithTarget) return;
    try {
      onApply(addMembers(state, pooled.id, selection));
      onSelectionChange([]);
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  return (
    <SimpleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={pooled ? `멤버 추가 — ${pooled.name}` : '멤버 추가'}
      size="xl"
      resizable
      initialWidth={960}
      initialHeight={720}
      footer={
        <div className={styles.dialogFooter}>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            variant="primary"
            disabled={!pooled || !validation.ok || !compatibleWithTarget || selection.length === 0}
            onClick={handleApply}
          >
            추가
          </Button>
        </div>
      }
    >
      <div className={styles.dialogPicker}>
        {!validation.ok && selection.length > 0 ? (
          <div className={styles.dialogError}>{validation.reason}</div>
        ) : null}
        {validation.ok && selection.length > 0 && !compatibleWithTarget ? (
          <div className={styles.dialogError}>
            선택한 Actual은 현재 Pooled와 호환되지 않습니다.
          </div>
        ) : null}
        <ActualPickerGrid
          actuals={candidates}
          height="100%"
          selection={selection}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </SimpleDialog>
  );
}
