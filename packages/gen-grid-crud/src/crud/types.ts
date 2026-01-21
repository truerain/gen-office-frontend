// packages/gen-grid-crud/src/crud/types.ts

export type CrudMode = 'row' | 'cell'; // 편집 UX 방식(확장용)

export type CrudRowId = string | number;

export type CrudChange<TData> =
  | { type: 'create'; row: TData; tempId: CrudRowId }
  | { type: 'update'; rowId: CrudRowId; patch: Partial<TData> }
  | { type: 'delete'; rowId: CrudRowId }
  | { type: 'undelete'; rowId: CrudRowId };

export type PendingIndex<TData> = {
  created: Map<CrudRowId, TData>;
  updated: Map<CrudRowId, Partial<TData>>;
  deleted: Set<CrudRowId>;
  log: CrudChange<TData>[];
};

export type ApplyDiffRowStatus = 'clean' | 'created' | 'updated' | 'deleted';

export type ApplyDiffResult<TData> = {
  /** 그리드 렌더 데이터 */
  viewData: readonly TData[];

  /** viewData의 각 rowId (created 포함) */
  viewRowIds: readonly CrudRowId[];

  /** rowId -> viewData index */
  viewIndexById: Map<CrudRowId, number>;

  /** rowId -> status/patch */
  rowStateById: Map<
    CrudRowId,
    { status: ApplyDiffRowStatus; patch?: Partial<TData> }
  >;

  createdRowIds: readonly CrudRowId[];
  dirty: boolean;
};

export type UseMakePatch<TData> = (args: {
  rowId: CrudRowId;
  columnId: string;
  value: unknown;
}) => Partial<TData>;
