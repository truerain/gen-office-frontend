// apps/demo/src/pages/demo/plan-scope/AssignPooledDialog.tsx
// Dialog to assign selected Actual rows to a new or compatible existing Pooled item.

import { useEffect, useMemo, useState } from 'react';

import { Button, Input, SimpleDialog } from '@gen-office/ui';

import {
  assignToExistingPooled,
  assignToNewPooled,
  compatiblePooled,
  planScopeCounts,
  previewPlanScopeAfterAssign,
  suggestPooledCode,
  suggestPooledName,
  validateSelection,
  type PlanScopeState,
} from './planScopeModel';

import styles from './PlanScopeDemoPage.module.css';

type AssignTarget = { type: 'new' } | { type: 'existing'; pooledId: string };

type AssignPooledDialogProps = {
  open: boolean;
  state: PlanScopeState;
  selectedIds: readonly string[];
  onOpenChange: (open: boolean) => void;
  onApply: (next: PlanScopeState) => void;
};

export function AssignPooledDialog({
  open,
  state,
  selectedIds,
  onOpenChange,
  onApply,
}: AssignPooledDialogProps) {
  const validation = useMemo(
    () => validateSelection(state.actuals, selectedIds),
    [state.actuals, selectedIds]
  );

  const common = validation.ok ? validation.common : null;
  const compatible = useMemo(
    () => (common ? compatiblePooled(state.pooled, common) : []),
    [common, state.pooled]
  );

  const [target, setTarget] = useState<AssignTarget>({ type: 'new' });
  const [name, setName] = useState('');

  useEffect(() => {
    if (!open) return;
    if (common) {
      setName(suggestPooledName(common));
      setTarget({ type: 'new' });
    }
  }, [open, common]);

  const previewCounts = useMemo(() => {
    if (!validation.ok) return planScopeCounts(state);
    if (target.type === 'new') {
      return previewPlanScopeAfterAssign(state, selectedIds, { type: 'new' });
    }
    return previewPlanScopeAfterAssign(state, selectedIds, {
      type: 'existing',
      pooledId: target.pooledId,
    });
  }, [state, selectedIds, target, validation.ok]);

  const currentCounts = planScopeCounts(state);

  function handleApply() {
    if (!validation.ok) return;
    try {
      const next =
        target.type === 'new'
          ? assignToNewPooled(state, selectedIds, name)
          : assignToExistingPooled(state, target.pooledId, selectedIds);
      onApply(next);
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
      title="Pooled에 넣기"
      size="xl"
      resizable
      initialWidth={720}
      initialHeight={560}
      footer={
        <div className={styles.dialogFooter}>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button variant="primary" disabled={!validation.ok} onClick={handleApply}>
            적용
          </Button>
        </div>
      }
    >
      <div className={styles.dialogBody}>
        <div className={styles.dialogSection}>
          <div className={styles.dialogLabel}>선택 Actual</div>
          <div>{selectedIds.length}건</div>
        </div>

        {!validation.ok ? (
          <div className={styles.dialogError}>{validation.reason}</div>
        ) : (
          <>
            <div className={styles.dialogSection}>
              <div className={styles.dialogLabel}>공통 차원</div>
              <div className={styles.dimensionSummary}>
                <span>계정: {common!.acctName}</span>
                {common!.deptName ? <span>부서: {common!.deptName}</span> : <span>부서: *</span>}
                {common!.ccName ? <span>CC: {common!.ccName}</span> : <span>CC: *</span>}
              </div>
            </div>

            <div className={styles.dialogSection}>
              <div className={styles.dialogLabel}>대상 Pooled</div>
              <div className={styles.targetList}>
                <label className={styles.targetOption}>
                  <input
                    type="radio"
                    name="assign-target"
                    checked={target.type === 'new'}
                    onChange={() => setTarget({ type: 'new' })}
                  />
                  <span>+ 신규 Pooled</span>
                </label>
                {compatible.map((item) => (
                  <label key={item.id} className={styles.targetOption}>
                    <input
                      type="radio"
                      name="assign-target"
                      checked={target.type === 'existing' && target.pooledId === item.id}
                      onChange={() => setTarget({ type: 'existing', pooledId: item.id })}
                    />
                    <span>
                      {item.name} ({item.memberIds.length}건)
                    </span>
                  </label>
                ))}
                {compatible.length === 0 ? (
                  <div className={styles.dialogHint}>호환되는 기존 Pooled가 없습니다.</div>
                ) : null}
              </div>
            </div>

            {target.type === 'new' ? (
              <div className={styles.dialogSection}>
                <div className={styles.dialogLabel}>Pooled 명칭</div>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
                <div className={styles.dialogHint}>코드: {suggestPooledCode(common!)}</div>
              </div>
            ) : null}

            <div className={styles.dialogSection}>
              <div className={styles.dialogLabel}>PlanScope 미리보기</div>
              <div className={styles.previewCounts}>
                <span>Actual {currentCounts.actual}</span>
                <span>Pooled {currentCounts.pooled}</span>
                <span>PlanScope {currentCounts.planScope}</span>
                <span>→</span>
                <span>Actual {previewCounts.actual}</span>
                <span>Pooled {previewCounts.pooled}</span>
                <span>PlanScope {previewCounts.planScope}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </SimpleDialog>
  );
}