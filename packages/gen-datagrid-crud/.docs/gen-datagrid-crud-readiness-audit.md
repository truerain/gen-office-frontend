<!-- packages/gen-datagrid-crud/.docs/gen-datagrid-crud-readiness-audit.md
Audits GenDataGrid public capabilities needed by a thin CRUD wrapper.
-->

# GenDataGrid CRUD Readiness Audit

## 목적

`@gen-office/gen-datagrid-crud`가 자체 grid 상태 관리자가 되지 않도록, `@gen-office/gen-datagrid`가 이미 제공하는 기능과 CRUD shell에 필요한 public surface를 점검한다.

## 이미 사용할 수 있는 GenDataGrid 기능

### Data와 ownership

- `data`, `defaultData`
- `getRowId(row, index)`
- `dataVersion`

App이 서버 저장 성공 후 `data`와 `dataVersion`을 갱신하면 controlled 화면의 baseline을 명확하게 교체할 수 있다.

### Editing과 dirty state

- `editorFactory`, `isCellEditable`, `readOnly` / `readonly`
- `enableDirtyState`, `onDirtyStateChange`
- handle `getDirtyState()`
- handle `resetDirtyState(rowIds?)`
- handle `commitDirtyState(rowIds?)`
- handle `acceptChanges(rowIds?)`
- handle `getChangeSet()`
- handle `flushEditing()`
- handle `cancelEditing()`

CRUD save는 active editor를 flush한 뒤 `getChangeSet()`을 읽고, 성공 시 `acceptChanges()`를 호출한다.

### Delete와 row status

- handle `deleteRows(rowIds)`
- `deleteRowsBehavior`
- `onRowsDelete`
- `enableRowStatus`
- `rowStatusResolver`

삭제 marker는 `GenDataGrid`가 소유한다. CRUD 패키지는 current/selected row를 판단하고 delete action만 연결한다.

### Selection과 current row

- `enableRowSelection`
- `rowSelection`, `defaultRowSelection`, `onRowSelectionChange`
- `enableCurrentRowHighlight`
- `onCurrentRowChange`

ActionBar의 delete, custom action context, app detail 영역 연결에 사용한다.

### Filtering과 column state

- `enableColumnFilters`, `columnFilters`, `onColumnFiltersChange`
- `enableGlobalFilter`, `globalFilter`, `onGlobalFilterChange`
- handle `clearColumnFilters()`, `clearGlobalFilter()`, `clearFilters()`
- `enableColumnReorder`, `columnOrder`, `onColumnOrderChange`

Gate 10에서는 filter enable toggle과 clear shell만 연결하고, 세부 controlled filter UI는 app 또는 후속 gate에서 다룬다.

### Validation 표시

- `getCellValidation(ctx)`

Gate 10에서는 commit validation orchestration을 구현하지 않는다. Gate 11에서 CRUD field error를 `getCellValidation`과 연결한다.

## Gate 10 기준 준비 상태

Gate 10에 필요한 선행 조건은 충족되었다.

- `flushEditing()`으로 active editor 값을 저장 전에 반영할 수 있다.
- `getChangeSet()`으로 created/updated/deleted 형태의 변경 묶음을 읽을 수 있다.
- `acceptChanges()`와 `resetDirtyState()`로 저장 성공/취소 후 marker를 정리할 수 있다.
- `deleteRows()`로 삭제 marker를 grid 내부 상태에 위임할 수 있다.
- `getData()`와 `getRow(rowId)`로 commit 직전 snapshot을 조회할 수 있다.

## 아직 Gate 11 이후로 남길 항목

- created row store와 insert workflow
- field validation orchestration과 cell marker 연결
- real Excel export
- app page migration
- `GenGridCrud` 호환 adapter 또는 migration guide
- uncontrolled data load/revert API 확장 여부

## 결론

`gen-datagrid-crud`는 Gate 10에서 얇은 shell로 구현하는 것이 맞다. CRUD 패키지는 `GenDataGrid`의 dirty/edit/delete/selection 상태를 복제하지 않고, ActionBar와 workflow orchestration만 담당한다.
