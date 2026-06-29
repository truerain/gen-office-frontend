<!-- packages/gen-datagrid-crud/.docs/implementation-log.md
Records GenDataGridCrud package planning and implementation changes.
-->

# GenDataGridCrud 구현 로그

## 2026-06-30

### Gate 11.3 Field error marker 연결

- `DataGridCrudUiState.fieldErrors`를 `GenDataGrid`의 `getCellValidation`과 compose하도록 wrapper를 보강했다.
- field error key 규칙을 `${rowId}.${columnId}`로 고정했다.
- field error가 있는 cell은 `severity: 'error'`와 message를 반환하고, field error가 없으면 app이 제공한 기존 `gridProps.getCellValidation` 결과를 유지한다.
- validation 실패 후 cell marker와 기존 app validation이 함께 유지되는 테스트를 추가했다.
- 관련 파일: `src/GenDataGridCrud.tsx`, `test/thinShell.test.tsx`, `.docs/gate-11-crud-mutation-plan.md`, `.docs/gen-datagrid-crud-package-design.md`, `.docs/implementation-log.md`

## 2026-06-30

### Gate 11.2 Commit validation 구현

- `GenDataGridCrudProps.validateCommit`을 추가해 commit 전 업무 검증을 실행할 수 있게 했다.
- `DataGridCrudValidationResult`, `DataGridCrudFieldErrors` public type과 `onValidationError` callback을 추가했다.
- validation 실패 시 `onCommit` 호출을 차단하고 `fieldErrors`, `validationError`를 `DataGridCrudUiState`에 보관하도록 했다.
- Save 성공 또는 Reset 시 validation state를 정리하도록 처리했다.
- validation 실패 시 commit이 호출되지 않고 field errors가 state로 발행되는 테스트를 추가했다.
- 관련 파일: `src/GenDataGridCrud.tsx`, `src/GenDataGridCrud.types.ts`, `src/crud/useDataGridCrudController.tsx`, `src/index.ts`, `test/thinShell.test.tsx`, `.docs/gate-11-crud-mutation-plan.md`, `.docs/gen-datagrid-crud-package-design.md`, `.docs/implementation-log.md`

## 2026-06-30

### Gate 11.1 Created row store 구현

- `GenDataGridCrudProps.createRow`와 `createdRowPosition`을 추가했다.
- controller가 local `createdRows`를 보관하고 `gridData`를 `data`와 합성해 `GenDataGrid`에 전달하도록 변경했다.
- created row는 row status `created`로 표시하고, Save 시 created row의 dirty patch를 `changeSet.created`에 병합한다.
- created row patch가 `changeSet.updated`에 중복으로 남지 않도록 필터링했다.
- Reset은 local created rows와 grid dirty marker를 함께 정리하고, Delete는 created row를 local store에서 제거하도록 처리했다.
- 관련 파일: `src/GenDataGridCrud.tsx`, `src/GenDataGridCrud.types.ts`, `src/crud/useDataGridCrudController.tsx`, `src/components/DataGridCrudActionBar.tsx`, `test/thinShell.test.tsx`, `src/stories/GenDataGridCrud.stories.tsx`, `.docs/gate-11-crud-mutation-plan.md`, `.docs/gen-datagrid-crud-package-design.md`, `.docs/implementation-log.md`

### Gate 10 Storybook 후보 추가

- Gate 10.7 Storybook smoke 후보를 추가했다.
- readonly ActionBar, dirty save shell, custom action context 흐름을 수동 확인할 수 있게 했다.
- 관련 파일: `src/stories/GenDataGridCrud.stories.tsx`, `package.json`, `.docs/gate-10-thin-shell-plan.md`, `.docs/implementation-log.md`

### Gate 10 thin shell 검증 및 handle flush 보강

- `GenDataGridCrud` 저장 흐름에서 active editor를 `flushEditing()`으로 커밋한 뒤 최신 grid handle에서 change set을 다시 읽도록 보강했다.
- Save 버튼은 active editor가 아직 dirty marker를 만들기 전에도 클릭할 수 있도록, readonly/committing 상태만으로 비활성화한다.
- `GenDataGrid`의 editing draft를 ref에도 보관해 외부 imperative handle이 같은 이벤트 턴에서 최신 editor 값을 읽을 수 있게 했다.
- Gate 10 최소 workflow 테스트를 추가했고 save/reset/delete/ActionBar contract를 검증했다.
- 관련 파일: `src/crud/useDataGridCrudController.tsx`, `src/components/DataGridCrudActionBar.tsx`, `test/thinShell.test.tsx`, `../gen-datagrid/src/features/editing/useCellEditing.ts`, `../gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx`

### Gate 10 thin shell 1차 구현

- `@gen-office/gen-datagrid-crud` package scaffold를 추가했다.
- `GenDataGridCrud`, `DataGridCrudActionBar`, `useDataGridCrudController`를 thin shell로 구현했다.
- controller는 Gate 9 `GenDataGridHandle` API를 사용해 save/reset/delete/filter/column reorder shell을 제공한다.
- save 흐름은 `flushEditing() -> getChangeSet() -> onCommit() -> acceptChanges()` 순서로 연결했다.
- add row와 real Excel export는 Gate 11/12 범위로 남기고 현재는 no-op shell로 둔다.
- 관련 파일: `package.json`, `tsconfig.json`, `vite.config.ts`, `src/index.ts`, `src/GenDataGridCrud.tsx`, `src/GenDataGridCrud.types.ts`, `src/crud/useDataGridCrudController.tsx`, `src/components/DataGridCrudActionBar.tsx`, `src/index.css`, `.docs/gate-10-thin-shell-plan.md`

### Gate 10 세부 실행 계획 문서화

- `GenDataGridCrud Thin Shell` 구현을 10.1-10.7 slice로 나누어 실행 계획을 문서화했다.
- package scaffold, public type model, controller shell, ActionBar shell, wrapper, minimal workflow, Storybook/demo 후보의 완료 기준을 정리했다.
- Gate 10과 Gate 11/12의 경계를 분리했다.
- 관련 파일: `.docs/gate-10-thin-shell-plan.md`, `.docs/README.md`, `.docs/implementation-log.md`

## 2026-06-29

### Gate 10 준비 문서 연결

- `gen-datagrid-crud` 구현을 Gate 10 `GenDataGridCrud Thin Shell`로 연결했다.
- 선행 조건을 Gate 9 `Handle / Data Ownership Readiness` 완료로 명시했다.
- 관련 파일: `.docs/README.md`, `.docs/implementation-log.md`

### GenDataGridHandle 선행 계획 연결

- `gen-datagrid-crud` 구현 전 필요한 `GenDataGridHandle` 확장 계획과 architecture 문서를 연결했다.
- `flushEditing`, `getData`, `getChangeSet`, `acceptChanges`를 CRUD save pipeline의 선행 조건으로 명시했다.
- `insertRows`와 `load`는 controlled/uncontrolled data ownership 결정 후 처리할 후속 slice로 분리했다.
- 관련 파일: `.docs/README.md`, `.docs/gen-datagrid-crud-readiness-audit.md`, `.docs/gen-datagrid-crud-package-design.md`, `.docs/implementation-log.md`

### 초기 설계 문서 작성

- `GenDataGrid`의 CRUD 준비도를 평가하고, 이미 제공하는 data/edit/dirty/delete/selection 기능과 부족한 public handle 후보를 정리했다.
- `gen-datagrid-crud`를 독자 상태 관리자가 아니라 얇은 workflow/controller와 ActionBar UI shell로 설계했다.
- 기존 `gen-grid-crud`에서 재사용할 수 있는 ActionBar, validation, export 구조와 새로 작성해야 하는 grid adapter 영역을 분리했다.
- 관련 파일: `.docs/README.md`, `.docs/gen-datagrid-crud-readiness-audit.md`, `.docs/gen-datagrid-crud-package-design.md`, `.docs/implementation-log.md`
