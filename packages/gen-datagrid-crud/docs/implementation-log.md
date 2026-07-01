<!-- packages/gen-datagrid-crud/docs/implementation-log.md
Records implementation changes for the GenDataGridCrud package.
-->

# GenDataGridCrud 구현 로그

## 2026-07-01

### CRUD state 함수 identity 의존성 보정

- `DataGridCrudUiState`의 `canCreateRow`, `canExport` 계산이 `createRow`, `onExport` 함수 identity 변화에 의해 매 렌더 새 state를 만들지 않도록 boolean 값으로 분리했습니다.
- `GenDataGridCrud`가 `GenDataGrid`에 `data`와 `columns`를 전달할 때 매 렌더 배열을 복사하지 않고 입력 참조 변경 시에만 memoized copy를 만들도록 변경했습니다.
- inline `createRow`와 `onStateChange`가 함께 쓰여도 `onStateChange`가 반복 통지되지 않는 회귀 테스트를 추가했습니다.
- CustomerInfoPage에서 확인된 로딩 지연의 원인과 해결 내용을 `docs/customer-info-loading-loop.md`에 정리했습니다.
- 관련 파일: `src/GenDataGridCrud.tsx`, `src/crud/useDataGridCrudController.tsx`, `test/thinShell.test.tsx`, `docs/customer-info-loading-loop.md`

### onStateChange callback identity ?? ?? ??

- `GenDataGridCrud` ????? `onStateChange` prop identity ????? ?? state? ?? ???? ??? ?? callback? ref? ???? ????.
- inline `onStateChange`?? ?? state? ???? ??? callback ??? ??? ?? ??? ??? ? ?? ??? ???? ???? ????.
- ?? row? ?? ? `createdRowIds`? stable empty array? ???? inline `getRowId` ?????? state? ??? ??? ??.
- ?? ??: `src/crud/useDataGridCrudController.tsx`, `test/thinShell.test.tsx`


### gridProps DataGrid feature flag 전달 허용

- `GenDataGridCrud`가 고정하던 `enableDirtyState`, `enableRowStatus`, `enableCurrentRowHighlight`, `enableRowSelection`, `enableColumnFilters`, `enableColumnReorder`를 `gridProps`로 opt-out 또는 override할 수 있게 했다.
- CRUD가 소유해야 하는 data, columns, getRowId, controlled state callback은 계속 내부 소유로 유지했다.
- Dashboard처럼 읽기 전용으로 쓰는 CRUD 화면에서 row selection/status 시스템 컬럼을 숨길 수 있도록 테스트를 추가했다.
- 관련 파일: `src/GenDataGridCrud.types.ts`, `src/GenDataGridCrud.tsx`, `src/crud/useDataGridCrudController.tsx`, `test/thinShell.test.tsx`

### CRUD 편집 click continuation 기본 활성화

- `GenDataGridCrud`에서 `gridProps.editPolicy.continueTriggers.click`이 없으면 `true`를 적용해 편집 상태에서 다른 editable cell을 클릭할 때 즉시 편집 진입하도록 변경했다.
- `gridProps.editPolicy.continueTriggers.click: false`로 opt-out할 수 있도록 유지하고 thin shell 테스트를 추가했다.
- 관련 파일: `src/GenDataGridCrud.tsx`, `test/thinShell.test.tsx`, `docs/implementation-log.md`

### CRUD 편집 select-on-focus 기본 활성화

- `GenDataGridCrud`에서 `gridProps.editSelectOnFocus`가 없으면 `true`를 적용해 CRUD 편집 진입 시 전체 선택을 기본 활성화했다.
- `gridProps.editSelectOnFocus: false`로 opt-out할 수 있도록 유지하고 thin shell 테스트를 추가했다.
- 관련 파일: `src/GenDataGridCrud.tsx`, `test/thinShell.test.tsx`, `docs/implementation-log.md`

### GenDataGridColumnDef 기반 columns 타입 정리

- `GenDataGridCrudProps.columns` 타입을 TanStack `ColumnDef`에서 `GenDataGridColumnDef`로 변경했다.
- CRUD 래퍼가 GenDataGrid 전용 column meta 타입을 사용하도록 정리했다.
- 관련 파일: `src/GenDataGridCrud.types.ts`, `docs/implementation-log.md`
