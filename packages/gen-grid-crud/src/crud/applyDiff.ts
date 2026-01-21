// packages/gen-grid-crud/src/crud/applyDiff.ts
import type { ApplyDiffResult, CrudRowId, PendingIndex } from './types';

type InsertCreated =
  | { mode: 'start' }
  | { mode: 'end' }
  | { mode: 'before'; rowId: CrudRowId }
  | { mode: 'after'; rowId: CrudRowId };

type ViewEntry<TData> = { id: CrudRowId; row: TData; created?: boolean };

export function applyDiff<TData>(args: {
  baseData: readonly TData[];
  getRowId: (row: TData, index: number) => CrudRowId;
  pending: PendingIndex<TData>;

  insertCreated?: InsertCreated;

  applyPatch?: (row: TData, patch: Partial<TData>) => TData;

  /**
   * deleted row를 화면에서 숨길지/표시할지
   * - hide: 보통 CRUD UX 추천
   * - show: “줄 그어 표시” 같은 UX 필요할 때
   */
  deletedVisibility?: 'hide' | 'show';
}): ApplyDiffResult<TData> {
  const {
    baseData,
    getRowId,
    pending,
    insertCreated = { mode: 'end' },
    applyPatch = (row, patch) => ({ ...(row as any), ...(patch as any) }) as TData,
    deletedVisibility = 'hide',
  } = args;

  const createdEntries: ViewEntry<TData>[] = [];
  for (const [tempId, row] of pending.created.entries()) {
    // created row가 deleted로 마킹된 상태(특수 케이스)면 status는 deleted로 처리
    createdEntries.push({ id: tempId, row, created: true });
  }

  const rowStateById = new Map<
    CrudRowId,
    { status: 'clean' | 'created' | 'updated' | 'deleted'; patch?: Partial<TData> }
  >();

  // base entries를 만들면서 rowStateById 채움
  const baseEntries: ViewEntry<TData>[] = [];
  for (let i = 0; i < baseData.length; i++) {
    const baseRow = baseData[i]!;
    const id = getRowId(baseRow, i);

    const isDeleted = pending.deleted.has(id);
    const patch = pending.updated.get(id);

    if (isDeleted) {
      rowStateById.set(id, { status: 'deleted' });
      if (deletedVisibility === 'show') {
        const row = patch ? applyPatch(baseRow, patch) : baseRow;
        baseEntries.push({ id, row });
      }
      continue;
    }

    if (patch) {
      rowStateById.set(id, { status: 'updated', patch });
      baseEntries.push({ id, row: applyPatch(baseRow, patch) });
      continue;
    }

    rowStateById.set(id, { status: 'clean' });
    baseEntries.push({ id, row: baseRow });
  }

  // created 상태도 rowStateById에 넣어줌(rowStatus column에서 동일 lookup 가능)
  for (const e of createdEntries) {
    const createdDeleted = pending.deleted.has(e.id);
    rowStateById.set(e.id, { status: createdDeleted ? 'deleted' : 'created' });
  }

  // --- 세그먼트 방식으로 created 삽입
  const viewEntries: ViewEntry<TData>[] = [];

  if (createdEntries.length === 0) {
    viewEntries.push(...baseEntries);
  } else {
    switch (insertCreated.mode) {
      case 'start': {
        // deletedVisibility=hide일 때 created 중 deleted로 마킹된 것은 숨길지 정책이 필요
        for (const c of createdEntries) {
          if (pending.deleted.has(c.id) && deletedVisibility === 'hide') continue;
          viewEntries.push(c);
        }
        viewEntries.push(...baseEntries);
        break;
      }
      case 'end': {
        viewEntries.push(...baseEntries);
        for (const c of createdEntries) {
          if (pending.deleted.has(c.id) && deletedVisibility === 'hide') continue;
          viewEntries.push(c);
        }
        break;
      }
      case 'before':
      case 'after': {
        const targetId = insertCreated.rowId;
        let inserted = false;

        for (const e of baseEntries) {
          if (!inserted && insertCreated.mode === 'before' && e.id === targetId) {
            for (const c of createdEntries) {
              if (pending.deleted.has(c.id) && deletedVisibility === 'hide') continue;
              viewEntries.push(c);
            }
            inserted = true;
          }

          viewEntries.push(e);

          if (!inserted && insertCreated.mode === 'after' && e.id === targetId) {
            for (const c of createdEntries) {
              if (pending.deleted.has(c.id) && deletedVisibility === 'hide') continue;
              viewEntries.push(c);
            }
            inserted = true;
          }
        }

        // target을 못 찾으면 end로 fallback
        if (!inserted) {
          for (const c of createdEntries) {
            if (pending.deleted.has(c.id) && deletedVisibility === 'hide') continue;
            viewEntries.push(c);
          }
        }
        break;
      }
    }
  }

  // --- 결과 구축
  const viewIndexById = new Map<CrudRowId, number>();
  const viewData: TData[] = [];
  const viewRowIds: CrudRowId[] = [];

  for (let i = 0; i < viewEntries.length; i++) {
    const { id, row } = viewEntries[i]!;
    viewIndexById.set(id, i);
    viewRowIds.push(id);
    viewData.push(row);
  }

  const createdRowIds = createdEntries.map((e) => e.id);
  const dirty =
    pending.created.size > 0 || pending.updated.size > 0 || pending.deleted.size > 0;

  return {
    viewData,
    viewRowIds,
    viewIndexById,
    rowStateById,
    createdRowIds,
    dirty,
  };
}
