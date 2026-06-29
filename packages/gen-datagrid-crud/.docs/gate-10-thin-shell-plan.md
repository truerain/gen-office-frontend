<!-- packages/gen-datagrid-crud/.docs/gate-10-thin-shell-plan.md
Defines the executable Gate 10 plan for the GenDataGridCrud thin shell.
-->

# Gate 10. GenDataGridCrud Thin Shell Plan

## 목표

Gate 10은 `@gen-office/gen-datagrid-crud`를 실제 workspace package로 만들고, `GenDataGrid` 위에 얇은 CRUD workflow shell과 ActionBar UI를 얹는 단계다.

이 gate는 완전한 CRUD mutation 구현이 아니라 다음 기반을 고정한다.

- package scaffold
- public type surface
- `GenDataGridCrud` wrapper
- `useDataGridCrudController`
- `DataGridCrudActionBar`
- Gate 9 handle API 기반 save/reset/delete shell
- 최소 workflow test

## 전제 조건

Gate 10은 Gate 9 완료를 전제로 한다.

필수 `GenDataGridHandle<TData>` API:

- `flushEditing()`
- `cancelEditing()`
- `getData()`
- `getRow(rowId)`
- `getChangeSet()`
- `acceptChanges(rowIds?)`
- `resetDirtyState(rowIds?)`
- `deleteRows(rowIds)`
- `clearFilters()`

현재 기준으로 Gate 10 진행 조건은 충족되었다.

## 범위

Gate 10에 포함한다.

- `packages/gen-datagrid-crud` package scaffold
- `GenDataGridCrud<TData>` wrapper
- `useDataGridCrudController<TData>` controller shell
- `DataGridCrudActionBar` presentational component
- readonly/filter/export/custom action shell
- save shell: `flushEditing -> getChangeSet -> onCommit -> acceptChanges`
- reset shell: `resetDirtyState`
- delete shell: current/selected row 기반 `deleteRows`
- package docs and implementation log
- minimal workflow tests

Gate 10에서 제외한다.

- created row 실제 삽입/편집 workflow
- full validation orchestration
- field error to `getCellValidation` integration
- real Excel file export
- app page migration
- `GenGridCrud` compatibility adapter

## Slice 10.1 Package Scaffold

Status: complete.

구현 파일:

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/index.ts`
- `src/index.css`
- `src/GenDataGridCrud.tsx`
- `src/GenDataGridCrud.types.ts`

결정:

- 패키지명은 `@gen-office/gen-datagrid-crud`로 둔다.
- `@gen-office/gen-datagrid`에 의존한다.
- 공통 UI는 `@gen-office/ui`를 사용한다.

## Slice 10.2 Public Type Model

Status: complete.

초기 public type:

- `GenDataGridCrudProps<TData>`
- `DataGridCrudUiState<TData>`
- `DataGridCrudActionApi`
- `DataGridCrudActionItem<TData>`
- `DataGridCrudCommitArgs<TData>`
- `DataGridCrudCommitResult<TData>`
- `DataGridCrudActionBarOptions<TData>`

원칙:

- CRUD 패키지는 grid의 dirty/delete/editing/selection state를 재구현하지 않는다.
- CRUD 패키지는 workflow state만 가진다.
- `gridProps`는 wrapper가 직접 소유하는 props를 제외하고 `GenDataGrid` 기능을 통과시킨다.

## Slice 10.3 Controller Shell

Status: complete.

`useDataGridCrudController` 책임:

- `GenDataGridHandle<TData>` ref 생성
- dirty state 수신
- current row 수신
- row selection controlled state 준비
- built-in action enabled/disabled 계산
- action API 생성
- save/reset/delete/filter/export action shell 제공

초기 action API:

- `save()`
- `reset()`
- `deleteSelectedRows()`
- `clearFilters()`
- `toggleFilters()`
- `toggleColumnReorder()`
- `exportExcel()`
- `addRow()`

Gate 10에서 `addRow()`와 `exportExcel()`은 shell만 제공한다.

## Slice 10.4 ActionBar UI Shell

Status: complete.

`DataGridCrudActionBar`는 presentational component다.

입력:

- `state`
- `actionApi`
- `options`
- `className`

기본 action:

- add
- delete
- save
- reset
- filter
- columnReorder
- excel

원칙:

- ActionBar는 grid ref를 직접 알지 않는다.
- ActionBar는 `GenDataGrid`를 import하지 않는다.
- 버튼은 한 줄 유지와 horizontal overflow 대응을 우선한다.

## Slice 10.5 GenDataGridCrud Wrapper

Status: complete.

`GenDataGridCrud<TData>` 책임:

- controller 생성
- ActionBar 렌더링
- `GenDataGrid` 렌더링
- wrapper-owned props와 `gridProps` 병합

완료 기준:

- wrapper가 `GenDataGrid`의 주요 props를 막지 않는다.
- app은 `gridProps`로 기존 `GenDataGrid` 기능을 사용할 수 있다.
- wrapper는 controlled data를 몰래 mutation하지 않는다.

## Slice 10.6 Minimal Workflow Verification

Status: complete.

검증 항목:

- active editor 상태에서 Save를 누르면 `flushEditing()` 후 `onCommit`이 호출된다.
- Save 성공 후 `acceptChanges()`로 dirty marker가 정리된다.
- Reset action은 dirty marker를 정리한다.
- Delete action은 selected row가 없을 때 current row를 삭제 대상으로 삼는다.
- ActionBar는 grid 접근 없이 `state`와 `actionApi`만으로 동작한다.

테스트 파일:

- `test/thinShell.test.tsx`

## Slice 10.7 Storybook Or Demo Candidate

Status: complete.

Gate 10에서는 Storybook 후보를 우선한다. 실제 app migration은 Gate 12에서 처리한다.

권장 stories:

- `ReadonlyWithActionBar`
- `DirtySaveShell`
- `CustomActions`

구현 파일:

- `src/stories/GenDataGridCrud.stories.tsx`

## Gate 10 Exit Criteria

- `@gen-office/gen-datagrid-crud` package scaffold가 존재한다.
- `GenDataGridCrud`를 import해서 렌더링할 수 있다.
- `DataGridCrudActionBar`는 grid를 직접 알지 않는다.
- `useDataGridCrudController`는 Gate 9 handle API로 save/reset/delete shell을 구성한다.
- CRUD 패키지는 `GenDataGrid` dirty/delete/editing/selection state를 중복 구현하지 않는다.
- TypeScript check, package build, minimal workflow test가 통과한다.
- 문서와 구현 로그가 갱신되어 있다.

## Verification

권장 명령:

```bash
pnpm --filter @gen-office/gen-datagrid exec tsc --noEmit
pnpm --filter @gen-office/gen-datagrid build
pnpm --filter @gen-office/gen-datagrid-crud exec tsc --noEmit
pnpm --filter @gen-office/gen-datagrid-crud test
pnpm --filter @gen-office/gen-datagrid-crud build
pnpm check:encoding
```

## 다음 Gate와의 경계

Gate 11로 넘긴다.

- created row store
- insert workflow
- validation orchestration
- field error state and marker integration
- real Excel export
- commit result advanced handling

Gate 12로 넘긴다.

- ActualsPage 같은 실제 app migration
- `GenGridCrud` migration guide
- app-level QA guide
