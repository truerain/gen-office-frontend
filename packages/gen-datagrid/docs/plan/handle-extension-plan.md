<!-- packages/gen-datagrid/docs/plan/handle-extension-plan.md
Plans Gate 9, the GenDataGridHandle and data ownership readiness gate.
-->

# Gate 9. Handle / Data Ownership Readiness Plan

## Goal

Gate 9는 `GenDataGridCrud`가 얇은 workflow/controller로 구현될 수 있도록
`GenDataGridHandle`의 CRUD 선행 API를 정리하고 구현한다.

핵심 방향:

- `GenDataGrid`가 이미 가진 edit, dirty, delete, selection 상태를 CRUD 패키지가 중복 구현하지 않는다.
- App 화면은 기본적으로 controlled mode를 사용한다.
- Handle은 controlled `data`를 몰래 mutation하지 않는다.
- Uncontrolled data mutation API는 정책 결정 후 후속 slice로 둔다.

관련 문서:

- App 사용 기준: `../reference/controlled-uncontrolled-app-guide.md`
- Architecture: `../architecture/handle-data-ownership-architecture.md`
- CRUD package design: `../../../gen-datagrid-crud/.docs/gen-datagrid-crud-package-design.md`

## Gate 9 Scope

### 9.1 Handle Generic And Existing API Alignment

Status: complete.

구현:

- `GenDataGridHandle<TData = unknown>`로 generic 정리
- `GenDataGrid` forwarded ref 타입을 generic handle과 맞춤
- 기존 method 유지:
  - `rootElement`
  - `clearSelection()`
  - `copySelection(options?)`
  - `scrollToCell(coord)`
  - `clearColumnFilters()`
  - `clearGlobalFilter()`
  - `clearFilters()`
  - `resetDirtyState(rowIds?)`
  - `commitDirtyState(rowIds?)`
  - `deleteRows(rowIds)`
  - `getDirtyState()`

Acceptance:

- 기존 interaction/baseline test가 깨지지 않는다.
- package public export type이 generic handle을 노출한다.

### 9.2 Data Snapshot API

Status: complete.

구현:

- `getData(): TData[]`
- `getRow(rowId: string): TData | undefined`

정책:

- controlled mode에서는 현재 `data` 기반 snapshot을 반환한다.
- uncontrolled mode에서는 내부 rows snapshot을 반환한다.
- 필터/페이지 적용 후 visible rows가 아니라 grid source rows 기준 snapshot을 반환한다.
- row id 조회는 `getRowId(row, index)` 기준으로 한다.

Acceptance:

- controlled data에서 `getData()`가 consumer data snapshot을 반환한다.
- uncontrolled `defaultData`에서 `getData()`가 내부 rows snapshot을 반환한다.
- `getRow(rowId)`는 row id 기준으로 정확한 row를 반환한다.

### 9.3 ChangeSet API

Status: complete.

구현:

- `GenDataGridChangeSet<TData>` type 추가
- `getChangeSet(): GenDataGridChangeSet<TData>` 추가

초기 type:

```ts
type GenDataGridChangeSet<TData> = {
  created: TData[];
  updated: {
    rowId: string;
    row: TData;
    patch: Record<string, unknown>;
    cells: GenDataGridDirtyCell[];
  }[];
  deleted: {
    rowId: string;
    row?: TData;
  }[];
  dirtyState: GenDataGridDirtyState;
};
```

정책:

- `updated`는 `dirtyCells`를 row id로 group해서 만든다.
- 기본 patch key는 `columnId`를 사용한다.
- accessorFn 또는 field mapping이 필요한 column은 `GenDataGridCrud.makePatch`에서 보강한다.
- `created`는 `insertRows()` 전까지 빈 배열이다.
- `deleted`는 `deletedRowIdList`와 current source row snapshot으로 만든다.

Acceptance:

- dirty cell 여러 개가 row 단위 updated item 하나로 묶인다.
- deleted row id가 `deleted`에 포함된다.
- row snapshot이 있으면 deleted item에 `row`가 포함된다.
- created row 미구현 상태에서는 `created`가 빈 배열이다.

### 9.4 Accept Changes API

Status: complete.

구현:

- `acceptChanges(rowIds?: readonly string[]): void`

정책:

- save success 후 baseline acceptance를 표현하는 명시적 이름이다.
- 초기 구현은 `commitDirtyState(rowIds?)`와 같은 marker 정리 동작을 수행한다.
- controlled `data`는 mutation하지 않는다.
- app은 저장 성공 후 새 `data`와 `dataVersion`을 내려주는 것이 기본이다.

Acceptance:

- `acceptChanges()` 호출 시 dirty/deleted marker가 정리된다.
- controlled data array는 변경되지 않는다.
- `commitDirtyState()`는 backward compatibility를 위해 유지된다.

### 9.5 Editing Flush API

Status: complete.

구현:

- `flushEditing(): Promise<void>`
- `cancelEditing(): void`

정책:

- active editor가 없으면 no-op이다.
- `flushEditing()`은 user-triggered commit과 같은 editing lifecycle을 사용해야 한다.
- `cancelEditing()`은 `onCellValueChange`를 발생시키지 않고 편집을 종료해야 한다.
- DOM blur 직접 호출에 의존하는 CRUD wrapper를 줄이는 것이 목표다.

Acceptance:

- active editor가 없을 때 안전하게 resolve된다.
- built-in editor가 active일 때 `flushEditing()`으로 commit된다.
- `cancelEditing()`은 value change callback 없이 editing state를 종료한다.

## Deferred From Gate 9

다음 API는 Gate 9에서 type 또는 문서 후보로만 유지하고 구현하지 않는다.

- `revertChanges(rowIds?)`
- `insertRows(rows, options?)`
- `load(nextData, options?)`
- `hardReset()`
- controlled current row API

Deferred 이유:

- controlled/uncontrolled data ownership 차이가 크다.
- row creation은 `GenDataGridCrud` 구현 중 중복 정도를 보고 grid handle로 올릴지 결정해야 한다.
- controlled data mutation callback이 아직 없다.

## Recommended Implementation Order

1. 9.1 Handle generic alignment
2. 9.2 `getData()` / `getRow()`
3. 9.3 `getChangeSet()`
4. 9.4 `acceptChanges()`
5. 9.5 `flushEditing()` / `cancelEditing()`

이 순서는 낮은 위험의 snapshot API부터 시작하고, editing lifecycle과 엮이는 flush API를 마지막에
붙이기 위한 것이다.

## Verification

권장 검증:

```bash
pnpm --filter @gen-office/gen-datagrid exec tsc --noEmit
pnpm --filter @gen-office/gen-datagrid test
pnpm check:encoding
```

테스트 후보:

- handle type export smoke test
- controlled `getData()` / `getRow()` test
- uncontrolled `getData()` / `getRow()` test
- dirty cells to `getChangeSet()` grouping test
- deleted rows in `getChangeSet()` test
- `acceptChanges()` marker reset test
- `flushEditing()` built-in editor commit interaction test
- `cancelEditing()` no-change interaction test

## Gate 9 Exit Criteria

- Gate 9 scope API가 `GenDataGridHandle<TData>`에 구현되어 있다.
- API reference와 comparison 문서의 handle 상태가 구현과 일치한다.
- controlled data mutation 금지 정책이 테스트 또는 문서로 고정되어 있다.
- `GenDataGridCrud` Gate 10이 `getData`, `getChangeSet`, `acceptChanges`, `flushEditing`에 의존할 수 있다.
