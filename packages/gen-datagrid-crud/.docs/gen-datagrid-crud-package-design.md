<!-- packages/gen-datagrid-crud/.docs/gen-datagrid-crud-package-design.md
Defines the package design for a thin CRUD shell over GenDataGrid.
-->

# GenDataGridCrud Package Design

## 목표

`@gen-office/gen-datagrid-crud`는 `@gen-office/gen-datagrid` 위에 CRUD 업무 흐름과 ActionBar UI를 제공하는 feature package다. 핵심 목표는 기존 `@gen-office/gen-grid-crud`의 사용성을 가져오되, `GenDataGrid`가 이미 가진 data/edit/dirty/delete/selection 기능을 중복 구현하지 않는 것이다.

## 패키지 책임

### 포함한다

- `GenDataGridCrud` wrapper
- `useDataGridCrudController`
- `DataGridCrudActionBar`
- save/reset/delete/filter/column reorder/export action shell
- custom action slot
- commit pipeline shell
- CRUD UI state publish

### 포함하지 않는다

- cell editing runtime 재구현
- dirty marker 재구현
- deleted row marker 재구현
- row selection engine 재구현
- filtering/pagination engine 재구현
- `GenDataGrid` 내부 data ownership 우회

## Public exports

```ts
export { GenDataGridCrud } from './GenDataGridCrud';
export { DataGridCrudActionBar } from './components/DataGridCrudActionBar';
export { useDataGridCrudController } from './crud/useDataGridCrudController';

export type {
  GenDataGridCrudProps,
  DataGridCrudUiState,
  DataGridCrudActionApi,
  DataGridCrudActionItem,
  DataGridCrudActionBarOptions,
  DataGridCrudCommitArgs,
  DataGridCrudCommitResult,
} from './GenDataGridCrud.types';
```

기본 사용자는 `GenDataGridCrud`를 사용한다. 특수 layout이 필요한 app은 `useDataGridCrudController`와 `DataGridCrudActionBar`를 직접 조합할 수 있다.

## 현재 디렉터리 구조

```text
packages/gen-datagrid-crud/
  package.json
  tsconfig.json
  vite.config.ts
  src/
    GenDataGridCrud.tsx
    GenDataGridCrud.types.ts
    index.ts
    index.css
    components/
      DataGridCrudActionBar.tsx
    crud/
      useDataGridCrudController.tsx
  test/
    thinShell.test.tsx
  .docs/
    README.md
    gen-datagrid-crud-readiness-audit.md
    gen-datagrid-crud-package-design.md
    gate-10-thin-shell-plan.md
    implementation-log.md
```

## Props model

```ts
type GenDataGridCrudProps<TData> = {
  title?: React.ReactNode;
  readonly?: boolean;
  data: readonly TData[];
  columns: readonly ColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
  dataVersion?: string | number;
  createRow?: (ctx: DataGridCrudCreateRowContext<TData>) => TData;
  createdRowPosition?: 'top' | 'bottom';
  onCommit?: (args: DataGridCrudCommitArgs<TData>) => Promise<DataGridCrudCommitResult<TData>>;
  beforeCommit?: (args: DataGridCrudCommitArgs<TData>) => boolean | Promise<boolean>;
  validateCommit?: (args: DataGridCrudCommitArgs<TData>) => DataGridCrudValidationResult | Promise<DataGridCrudValidationResult>;
  onCommitSuccess?: (result: { nextData?: readonly TData[] }) => void;
  onCommitError?: (result: { error: unknown; fieldErrors?: Record<string, string> }) => void;
  onValidationError?: (result: { error?: unknown; fieldErrors: DataGridCrudFieldErrors }) => void;
  actionBar?: DataGridCrudActionBarOptions<TData>;
  onStateChange?: (state: DataGridCrudUiState<TData>) => void;
  gridProps?: Omit<GenDataGridProps<TData>, GridPropsOwnedByCrud>;
};
```

`gridProps`는 wrapper가 소유하는 data, columns, dirty, row status, current row, row selection props를 제외한 `GenDataGrid` 기능을 통과시킨다.

## State model

```ts
type DataGridCrudUiState<TData> = {
  readonly: boolean;
  data: readonly TData[];
  dirtyState: GenDataGridDirtyState;
  dirty: boolean;
  isCommitting: boolean;
  fieldErrors: DataGridCrudFieldErrors;
  validationError?: unknown;
  currentRowId: string | null;
  selectedRowIds: string[];
  filterEnabled: boolean;
  columnReorderEnabled: boolean;
  lastChangeSet?: GenDataGridChangeSet<TData>;
};
```

`dirtyState`와 `lastChangeSet`은 `GenDataGrid` handle에서 읽은 상태를 기준으로 한다. CRUD controller는 별도 dirty model을 만들지 않는다.

## Save flow

```text
save()
  -> gridRef.current.flushEditing()
  -> latest gridRef.current.getChangeSet()
  -> fold created-row patches into changeSet.created
  -> validateCommit?.(...)
  -> beforeCommit?.(...)
  -> onCommit?.(...)
  -> gridRef.current.acceptChanges()
```

Save는 active editor가 dirty marker를 아직 만들기 전에도 누를 수 있어야 한다. 따라서 Save 버튼은 `dirty` 여부가 아니라 `readonly`와 `isCommitting`만으로 비활성화한다.

## Validation design

`validateCommit`은 `onCommit` 호출 전 업무 검증 단계다. 실패하면 `onCommit`을 호출하지 않고 `DataGridCrudUiState.fieldErrors`와 `validationError`에 결과를 보관한다.

Field error key는 `${rowId}.${columnId}` 형식을 사용한다. wrapper는 이 값을 `GenDataGrid`의 `getCellValidation`과 compose한다.

- field error가 있으면 `{ severity: 'error', message }`를 반환한다.
- field error가 없으면 app이 `gridProps.getCellValidation`으로 제공한 기존 validation 결과를 반환한다.
- Save 성공 또는 Reset 시 validation state를 정리한다.

## ActionBar design

Built-in action:

- `add`
- `delete`
- `save`
- `reset`
- `filter`
- `columnReorder`
- `excel`

ActionBar는 다음 입력만 사용한다.

- `state`
- `actionApi`
- `includeBuiltIns`
- `customActions`
- `title`
- `showTotalRows`

ActionBar는 grid ref를 직접 알지 않는다. grid 연결은 controller가 담당한다.

## Gate 경계

Gate 10:

- package scaffold
- wrapper/controller/actionbar
- save/reset/delete/filter/column reorder shell
- minimal workflow test

Gate 11:

- created row store: complete
- insert workflow: complete
- validation orchestration: complete
- field error marker: complete
- commit result 고도화

Gate 12:

- 실제 app migration
- `GenGridCrud` migration guide
- Excel export 실사용 연결

## 설계 결정

`gen-datagrid-crud`는 얇게 유지한다. CRUD 패키지가 grid 내부 상태를 많이 들기 시작하면 `GenDataGrid`와 상태가 이중화되므로, 필요한 기능은 먼저 `GenDataGrid` public handle 후보로 검토한다.
