// apps/demo/src/pages/demo/plan-scope/PooledTab.tsx
// Tab 2: master/detail view of Pooled items and their Member Actual rows.

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudRowId } from '@gen-office/gen-grid-crud';
import { Button, SplitLayout } from '@gen-office/ui';

import { AddMembersDialog } from './AddMembersDialog';
import {
  formatCollapsedDimensions,
  formatKeptDimensions,
  getMembers,
  removeMembers,
  unpool,
  type ActualItem,
  type PlanScopeState,
  type PooledItem,
} from './planScopeModel';

import styles from './PlanScopeDemoPage.module.css';

function formatAmount(value: number) {
  return value.toLocaleString('ko-KR');
}

function createMasterColumns(): ColumnDef<PooledItem, unknown>[] {
  return [
    { accessorKey: 'code', header: '코드', size: 140 },
    { accessorKey: 'name', header: '명칭', size: 180 },
    {
      id: 'kept',
      header: '공통 차원',
      size: 180,
      cell: ({ row }) => formatKeptDimensions(row.original),
    },
    {
      id: 'collapsed',
      header: '접힘',
      size: 90,
      cell: ({ row }) => formatCollapsedDimensions(row.original),
      meta: { align: 'center' },
    },
    {
      id: 'memberCount',
      header: 'Member',
      size: 90,
      cell: ({ row }) => row.original.memberIds.length,
      meta: { align: 'center' },
    },
  ];
}

function createMemberColumns(): ColumnDef<ActualItem, unknown>[] {
  return [
    { accessorKey: 'acctCd', header: '계정코드', size: 110, meta: { align: 'center' } },
    { accessorKey: 'acctName', header: '계정명', size: 140 },
    { accessorKey: 'ccCd', header: 'CC', size: 100, meta: { align: 'center' } },
    { accessorKey: 'ccName', header: 'CC명', size: 120 },
    { accessorKey: 'deptCd', header: '부서코드', size: 100, meta: { align: 'center' } },
    { accessorKey: 'deptName', header: '부서명', size: 120 },
    {
      accessorKey: 'actualTotal',
      header: '전년실적',
      size: 120,
      cell: ({ getValue }) => formatAmount(Number(getValue()) || 0),
      meta: { align: 'right', mono: true },
    },
  ];
}

type PooledTabProps = {
  state: PlanScopeState;
  onStateChange: (next: PlanScopeState) => void;
};

export function PooledTab({ state, onStateChange }: PooledTabProps) {
  const masterColumns = useMemo(() => createMasterColumns(), []);
  const memberColumns = useMemo(() => createMemberColumns(), []);
  const [selectedPooledId, setSelectedPooledId] = useState<string | null>(
    state.pooled[0]?.id ?? null
  );
  const [memberSelection, setMemberSelection] = useState<readonly CrudRowId[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [pickerSelection, setPickerSelection] = useState<readonly CrudRowId[]>([]);

  const selectedPooled = state.pooled.find((item) => item.id === selectedPooledId) ?? null;
  const members = selectedPooled ? getMembers(state.actuals, selectedPooled.id) : [];

  function handleRemoveMembers() {
    if (memberSelection.length === 0) return;
    onStateChange(removeMembers(state, memberSelection));
    setMemberSelection([]);
    if (selectedPooled && memberSelection.length === selectedPooled.memberIds.length) {
      setSelectedPooledId(null);
    }
  }

  function handleUnpool() {
    if (!selectedPooled) return;
    onStateChange(unpool(state, selectedPooled.id));
    setSelectedPooledId(null);
    setMemberSelection([]);
  }

  return (
    <div className={styles.tabPanel}>
      <SplitLayout
        className={styles.splitLayout}
        leftWidth="42%"
        minLeftWidth={320}
        resizable
        left={
          <div className={styles.pane}>
            <div className={styles.paneHeader}>
              <span>Pooled 목록</span>
              <span className={styles.paneMeta}>{state.pooled.length}건</span>
            </div>
            <div className={styles.paneGrid}>
              <GenGridCrud<PooledItem>
                data={state.pooled}
                columns={masterColumns}
                getRowId={(row) => row.id}
                readonly
                activeCell={
                  selectedPooledId
                    ? { rowId: selectedPooledId, columnId: 'code' }
                    : null
                }
                onActiveCellChange={(next) => {
                  setSelectedPooledId(next?.rowId != null ? String(next.rowId) : null);
                  setMemberSelection([]);
                }}
                onCommit={async ({ ctx }) => ({ ok: true, nextData: ctx.viewData })}
                actionBar={{
                  enabled: true,
                  position: 'top',
                  defaultStyle: 'text',
                  showTotalRows: true,
                }}
                gridProps={{
                  height: '100%',
                  enableVirtualization: true,
                  enableColumnSizing: true,
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                }}
              />
            </div>
          </div>
        }
        right={
          <div className={styles.pane}>
            <div className={styles.paneHeader}>
              <span>
                {selectedPooled ? `Member — ${selectedPooled.name}` : 'Member를 선택하세요'}
              </span>
              <div className={styles.paneActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!selectedPooled}
                  onClick={() => {
                    setPickerSelection([]);
                    setAddDialogOpen(true);
                  }}
                >
                  멤버 추가
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={memberSelection.length === 0}
                  onClick={handleRemoveMembers}
                >
                  제외
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={!selectedPooled}
                  onClick={handleUnpool}
                >
                  해제
                </Button>
              </div>
            </div>
            <div className={styles.paneGrid}>
              <GenGridCrud<ActualItem>
                data={members}
                columns={memberColumns}
                getRowId={(row) => row.id}
                readonly
                rowSelection={memberSelection}
                onRowSelectionChange={setMemberSelection}
                onCommit={async ({ ctx }) => ({ ok: true, nextData: ctx.viewData })}
                actionBar={{
                  enabled: true,
                  position: 'top',
                  defaultStyle: 'text',
                  showTotalRows: true,
                }}
                gridProps={{
                  height: '100%',
                  enableVirtualization: true,
                  enableColumnSizing: true,
                  checkboxSelection: true,
                  rowHeight: 34,
                }}
              />
            </div>
          </div>
        }
      />
      <AddMembersDialog
        open={addDialogOpen}
        state={state}
        pooled={selectedPooled}
        selection={pickerSelection}
        onSelectionChange={setPickerSelection}
        onOpenChange={setAddDialogOpen}
        onApply={onStateChange}
      />
    </div>
  );
}
