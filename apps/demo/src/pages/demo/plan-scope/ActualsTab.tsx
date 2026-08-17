// apps/demo/src/pages/demo/plan-scope/ActualsTab.tsx
// Tab 1: browse non-member Actual rows and assign them to Pooled items.

import { useState } from 'react';

import { Button } from '@gen-office/ui';

import { ActualPickerGrid, useActualPickerSelection } from './ActualPickerGrid';
import { AssignPooledDialog } from './AssignPooledDialog';
import { getNonMemberActuals, type PlanScopeState } from './planScopeModel';

import styles from './PlanScopeDemoPage.module.css';

type ActualsTabProps = {
  state: PlanScopeState;
  onStateChange: (next: PlanScopeState) => void;
};

export function ActualsTab({ state, onStateChange }: ActualsTabProps) {
  const { selection, setSelection, clearSelection } = useActualPickerSelection();
  const [dialogOpen, setDialogOpen] = useState(false);
  const rows = getNonMemberActuals(state.actuals);

  function handleApply(next: PlanScopeState) {
    onStateChange(next);
    clearSelection();
  }

  return (
    <div className={styles.tabPanel}>
      <div className={styles.tabToolbar}>
        <Button
          variant="primary"
          disabled={selection.length === 0}
          onClick={() => setDialogOpen(true)}
        >
          Pooled에 넣기 ({selection.length})
        </Button>
        <span className={styles.tabHint}>
          Member가 아닌 Actual만 표시됩니다. 선택 후 신규 또는 호환 Pooled에 넣을 수 있습니다.
        </span>
      </div>
      <div className={styles.tabGrid}>
        <ActualPickerGrid
          actuals={rows}
          selection={selection}
          onSelectionChange={setSelection}
        />
      </div>
      <AssignPooledDialog
        open={dialogOpen}
        state={state}
        selectedIds={selection}
        onOpenChange={setDialogOpen}
        onApply={handleApply}
      />
    </div>
  );
}
