// packages/gen-grid-crud/src/GenGridCrud.tsx
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { applyDiff } from './crud/applyDiff';
import { usePendingChanges } from './crud/usePendingChanges';
import type { CrudRowId } from './crud/types';
import type { GenGridCrudProps, CrudUiState } from './GenGridCrud.types';
import { CrudActionBar } from './components/CrudActionBar';

// ✅ 실제 GenGrid import로 교체
import { GenGrid } from '@gen-office/gen-grid';

/** RowStatus 시스템 컬럼 예시 */
function useCrudRowStatusColumn<TData>(args: {
  getStatus: (rowId: CrudRowId) => 'clean' | 'created' | 'updated' | 'deleted';
}): ColumnDef<TData> {
  const { getStatus } = args;
  return React.useMemo(() => {
    return {
      id: '__crud_status__',
      header: '',
      size: 44,
      enableSorting: false,
      enableColumnFilter: false,
      meta: { align: 'center', mono: true },
      cell: ({ row }: any) => {
        const rowId = row.id as CrudRowId;
        const s = getStatus(rowId);
        const label = s === 'clean' ? '' : s === 'created' ? '+' : s === 'updated' ? '•' : '×';
        return (
          <span aria-label={s} title={s} style={{ fontWeight: 700 }}>
            {label}
          </span>
        );
      },
    } as ColumnDef<TData>;
  }, [getStatus]);
}

function shallowDiffPatch<TData extends Record<string, any>>(
  prev: TData,
  next: TData,
  keys: readonly string[]
): Partial<TData> {
  const patch: Partial<TData> = {};
  let changed = false;

  for (const k of keys) {
    if (!Object.is(prev[k], next[k])) {
      (patch as any)[k] = next[k];
      changed = true;
    }
  }

  return changed ? patch : {};
}

/**
 * columns에서 patch 비교용 key 추출:
 * - accessorKey(string) 우선 사용
 * - 없으면 빈 배열 (이 경우 makePatch 기반으로 처리하기 어렵기 때문에, 기본 diff는 못 함)
 */
function getEditableKeysFromColumns<TData>(columns: readonly ColumnDef<TData, any>[]): string[] {
  const keys: string[] = [];
  for (const c of columns as any[]) {
    const k = c.accessorKey;
    if (typeof k === 'string') keys.push(k);
  }
  return keys;
}

export function GenGridCrud<TData>(props: GenGridCrudProps<TData>) {
  const {
    data,
    columns,
    getRowId,

    createRow,
    makePatch, // (현재 GenGrid 타입으로는 columnId/value가 안 넘어오므로 "보조" 용도)
    deleteMode = 'selected',

    onCommit,
    isCommitting: isCommittingControlled,
    onCommitSuccess,
    onCommitError,
    beforeCommit,

    showActionBar = true,
    actionBarPosition = 'top',

    selectedRowIds: selectedRowIdsControlled,
    onSelectedRowIdsChange,

    // ✅ GenGrid에는 없음: Crud 내부에서만 상태로 유지할 수 있음
    activeCell,
    onActiveCellChange,

    onStateChange,

    gridProps,
  } = props;

  // --- selection: (GenGrid에 props가 없으니) 지금은 Crud 내부 상태로만 유지
  // 나중에 GenGrid가 selection API를 제공하면 여기 매핑
  const [selectedRowIdsUncontrolled, setSelectedRowIdsUncontrolled] = React.useState<readonly CrudRowId[]>([]);
  const selectedRowIds = selectedRowIdsControlled ?? selectedRowIdsUncontrolled;

  const setSelectedRowIds = React.useCallback(
    (next: readonly CrudRowId[]) => {
      onSelectedRowIdsChange?.(next);
      if (selectedRowIdsControlled == null) setSelectedRowIdsUncontrolled(next);
    },
    [onSelectedRowIdsChange, selectedRowIdsControlled]
  );

  // --- pending changes
  const pendingApi = usePendingChanges<TData>();

  // --- row status column prepend
  const statusCol = useCrudRowStatusColumn<TData>({
    getStatus: (rowId) => pendingApi.getRowStatus(rowId),
  });

  const mergedColumns = React.useMemo(
    () => [statusCol, ...(columns as ColumnDef<TData, any>[])],
    [statusCol, columns]
  );

  // --- diff 적용
  const diff = React.useMemo(
    () =>
      applyDiff({
        baseData: data,
        getRowId,
        pending: pendingApi.pending,
        insertCreated: { mode: 'end' },
        deletedVisibility: 'hide',
      }),
    [data, getRowId, pendingApi.pending]
  );

  // ✅ GenGrid는 mutable array를 요구
  const gridData = React.useMemo<TData[]>(
    () => Array.from(diff.viewData),
    [diff.viewData]
  );

  // ✅ GenGrid getRowId는 (row) => string
  const genGridGetRowId = React.useCallback(
    (row: TData) => String(getRowId(row, -1)),
    [getRowId]
  );

  // --- committing state
  const [isCommittingLocal, setIsCommittingLocal] = React.useState(false);
  const isCommitting = isCommittingControlled ?? isCommittingLocal;

  // --- Action handlers
  const handleAdd = React.useCallback(() => {
    if (!createRow) return;
    const row = createRow();
    pendingApi.addRow(row);
  }, [createRow, pendingApi]);

  const handleDelete = React.useCallback(() => {
    // ⚠️ 현재 GenGridProps엔 selection 연동이 없으므로,
    // selectedRowIds는 외부/내부에서 따로 관리해야 함.
    // 테스트용으로만 유지.
    let targets: readonly CrudRowId[] = [];

    if (deleteMode === 'selected') {
      targets = selectedRowIds;
    } else if (deleteMode === 'activeRow') {
      const rowId = activeCell?.rowId;
      targets = rowId != null ? [rowId] : [];
    }

    if (!targets.length) return;
    pendingApi.deleteRowIds(targets);
    setSelectedRowIds([]);
  }, [deleteMode, selectedRowIds, activeCell, pendingApi, setSelectedRowIds]);

  const handleReset = React.useCallback(() => {
    pendingApi.reset();
  }, [pendingApi]);

  const handleSave = React.useCallback(async () => {
    const changes = pendingApi.changes;
    if (!changes.length) return;

    const stateForGuard: CrudUiState<TData> = {
      baseData: data,
      viewData: diff.viewData,
      changes,
      dirty: pendingApi.dirty,
      selectedRowIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      isCommitting,
    };

    const ok = await beforeCommit?.(stateForGuard);
    if (ok === false) return;

    try {
      if (isCommittingControlled == null) setIsCommittingLocal(true);

      const result = await onCommit({
        changes,
        ctx: { baseData: data, viewData: diff.viewData },
      });

      if (result.ok) {
        pendingApi.reset();
        onCommitSuccess?.({ nextData: result.nextData });
      } else {
        onCommitError?.({ error: result.error, fieldErrors: result.fieldErrors });
      }
    } catch (e) {
      onCommitError?.({ error: e });
    } finally {
      if (isCommittingControlled == null) setIsCommittingLocal(false);
    }
  }, [
    pendingApi,
    onCommit,
    onCommitSuccess,
    onCommitError,
    beforeCommit,
    data,
    diff.viewData,
    selectedRowIds,
    activeCell,
    isCommitting,
    isCommittingControlled,
  ]);

  // --- GenGrid에서 넘어온 nextData를 pending diff로 변환
  // 비교 기준: accessorKey 기반 (기본)
  const diffKeys = React.useMemo(() => getEditableKeysFromColumns(columns), [columns]);

  // GenGrid가 onDataChange로 주는 배열은 "viewData"의 최신 상태라고 가정
  const handleGridDataChange = React.useCallback(
    (nextViewData: TData[]) => {
      // 1) created row / deleted row 같은 구조 변화를 GenGrid가 직접 만들 수는 없다고 가정
      //    (row 추가/삭제는 CrudActionBar에서만)
      // 2) 따라서 여기서는 "기존 viewData의 row들에 대한 값 변경"만 patch로 환산

      // 빠른 lookup: 현재 viewData id -> row
      const prevById = new Map<string, TData>();
      for (let i = 0; i < gridData.length; i++) {
        const r = gridData[i]!;
        prevById.set(genGridGetRowId(r), r);
      }

      for (let i = 0; i < nextViewData.length; i++) {
        const nextRow = nextViewData[i]!;
        const idStr = genGridGetRowId(nextRow);
        const prevRow = prevById.get(idStr);
        if (!prevRow) continue;

        // patch 생성
        if (diffKeys.length > 0 && typeof prevRow === 'object' && typeof nextRow === 'object') {
          const patch = shallowDiffPatch(prevRow as any, nextRow as any, diffKeys);
          if (Object.keys(patch).length) {
            // CrudRowId는 string|number인데, GenGrid는 string id니까 여기선 string 사용
            pendingApi.updateRow(idStr, patch as any);
          }
        } else {
          // accessorKey가 없는 컬럼이면 기본 diff로는 patch를 못 만듦.
          // 이 경우 GenGrid 쪽에서 "어떤 셀이 바뀌었는지" 이벤트를 노출해야 함(onCellValueChange 등).
          // 최소한의 fallback: row 전체 교체(비추천) — 여기선 하지 않음.
        }
      }

      // ⚠️ GenGrid는 controlled에서 onDataChange를 요구하므로 호출 자체는 해야 함.
      // 하지만 Crud는 baseData를 소유하지 않으므로, 여기서 baseData를 바꾸지 않는다.
      // 대신 "즉시 화면 반영"은 pendingApi.updateRow → applyDiff → gridData 재계산으로 해결.
    },
    [gridData, genGridGetRowId, pendingApi, diffKeys]
  );

  // --- state publish
  React.useEffect(() => {
    onStateChange?.({
      baseData: data,
      viewData: diff.viewData,
      changes: pendingApi.changes,
      dirty: pendingApi.dirty,
      selectedRowIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      isCommitting,
    });
  }, [
    onStateChange,
    data,
    diff.viewData,
    pendingApi.changes,
    pendingApi.dirty,
    selectedRowIds,
    activeCell,
    isCommitting,
  ]);

  const actionBarNode =
    showActionBar ? (
      <CrudActionBar<TData>
        state={{
          baseData: data,
          viewData: diff.viewData,
          changes: pendingApi.changes,
          dirty: pendingApi.dirty,
          selectedRowIds,
          activeRowId: activeCell?.rowId,
          activeColumnId: activeCell?.columnId,
          isCommitting,
        }}
        onAdd={createRow ? handleAdd : undefined}
        onDelete={handleDelete}
        onReset={handleReset}
        onSave={handleSave}
      />
    ) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, flex: 1}}>
      {(actionBarPosition === 'top' || actionBarPosition === 'both') && actionBarNode}

      <GenGrid<TData>
        data={gridData}
        onDataChange={handleGridDataChange}
        dataVersion={gridProps?.dataVersion}
        columns={mergedColumns as ColumnDef<TData, any>[]}
        getRowId={genGridGetRowId}
        {...gridProps}
      />

      {(actionBarPosition === 'bottom' || actionBarPosition === 'both') && actionBarNode}
    </div>
  );
}
