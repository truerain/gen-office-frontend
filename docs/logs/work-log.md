# 작업 로그

이 문서는 리포지토리 수준의 소스 및 문서 변경 이력을 기록합니다.

## 2026-08-04

### GenGrid onRowDoubleClick 추가

- gen-datagrid와 동일하게 `onRowDoubleClick` public prop을 gen-grid에 추가했다. 더블클릭 시 앱 콜백과 기존 셀 편집 시작이 공존한다.
- 관련 파일: `packages/gen-grid/src/**`, `packages/gen-grid/docs/implementation-log.md`, `docs/logs/work-log.md`

### 결재함 목록/상세 전환 transition 추가

- 우측 pane에서 목록과 상세를 겹쳐 두고 opacity + translateX(약 200ms)로 전환하도록 변경했다.
- `prefers-reduced-motion`이면 transition을 끈다.
- 관련 파일: `apps/demo/src/pages/approval/inbox/ApprovalInboxPage.tsx`, `ApprovalInboxPage.module.css`


### 결재함 더블클릭 상세 전환 수정

- 원인: `gen-datagrid` dist에 `onRowDoubleClick` 미반영 + 행 단위 이벤트 미연결.
- 행(`DataGridBodyRow`) 더블클릭으로 상세 진입하도록 보강하고 packages dist를 재빌드했다.
- `GenDataGridCrud`에서 `onRowDoubleClick`을 gridStateProps 이후에 명시 전달하도록 수정했다.
- 관련 파일: `packages/gen-datagrid/src/renderers/div-grid/DataGridBodyRow.tsx`, `packages/gen-datagrid-crud/src/GenDataGridCrud.tsx`, `apps/demo/src/pages/approval/inbox/ApprovalInboxPage.tsx`


### 결재함 UI TreeView + list/detail 재구성

- FilterBar/탭을 제거하고 좌측 `TreeView`(품의/결재함 상태 leaf) + 우측 목록/상세 전환으로 재구성했다.
- 행 더블클릭 상세 진입을 위해 `GenDataGrid.onRowDoubleClick`을 추가하고 ApprovalInbox에 연결했다.
- mock 문서에 `box: request|inbox`를 추가해 품의/결재함 목록을 분리했다.
- 관련 파일: `packages/gen-datagrid/**`, `apps/demo/src/pages/approval/inbox/**`, `apps/demo/src/mocks/data/approvalInbox.ts`, `apps/demo/src/mocks/handlers/approval.handlers.ts`, `docs/logs/work-log.md`

### 결재함(250100) 화면 Mock 연결

- `ApprovalInboxPage`를 추가하고 메뉴 `250100`의 `execComponent`를 `CoActualsPage`에서 `ApprovalInboxPage`로 교체했다.
- SplitLayout 기반 대기/완료/반려 함 + 상세 패널 + 승인/반려 Mock API를 연결했다.
- 관련 파일: `apps/demo/src/pages/approval/inbox/**`, `apps/demo/src/mocks/data/approvalInbox.ts`, `apps/demo/src/mocks/handlers/approval.handlers.ts`, `apps/demo/src/mocks/data/menu.ts`, `apps/demo/src/app/config/componentRegistry.dynamic.ts`, `docs/logs/work-log.md`


### GenGrid resetScrollOnDataVersion 추가

- `gen-grid`에 `resetScrollOnDataVersion` public prop을 추가해 `dataVersion` 변경 시 viewport 스크롤을 첫 row로 초기화할 수 있게 했다.
- Pagination Demo `gridProps`에 `resetScrollOnDataVersion: true`를 연결했다.
- 관련 파일: `packages/gen-grid/src/GenGrid.types.ts`, `packages/gen-grid/src/components/base/GenGridBase.tsx`, `apps/demo/src/pages/demo/pagination/PaginationDemoPage.tsx`, `packages/gen-grid/docs/implementation-log.md`, `packages/gen-datagrid/docs/reference/api-comparison-with-gen-grid.md`, `docs/logs/work-log.md`

## 2026-08-03

### ActualsPage 조회 후 스크롤 초기화 방식 전환

- `ActualsPage` 조회 리셋을 `key` 재마운트 패턴 대신 `dataVersion + resetScrollOnDataVersion` 옵션 기반으로 전환했다.
- `GenDataGrid`에 `resetScrollOnDataVersion` public prop을 추가해 재조회 시 첫 row 스크롤 초기화를 명시적으로 제어할 수 있게 했다.
- 관련 파일: `packages/gen-datagrid/src/GenDataGrid.types.ts`, `packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx`, `apps/demo/src/pages/co/actuals/ActualsPage.tsx`, `packages/gen-datagrid/docs/reference/api-structure.md`, `packages/gen-datagrid/docs/reference/api-comparison-with-gen-grid.md`, `packages/gen-datagrid/docs/log/implementation-log.md`, `docs/logs/work-log.md`

### Pagination Demo page jump 노출 기준 조정

- Pagination Demo에서 page jump 입력이 기본 데이터셋에서도 보이도록 `hideWhenPageCountBelow` 값을 `1`로 낮췄다.
- 관련 파일: `apps/demo/src/pages/demo/pagination/PaginationDemoPage.tsx`, `docs/logs/work-log.md`

### Pagination Demo에 페이지 직접 이동(Input+버튼) 옵션 적용

- `gen-grid`에 추가한 `pageJumpOptions`를 Pagination Demo의 `gridProps`에 연결했다.
- 페이지 수가 충분할 때만 입력 UI가 보이도록 `hideWhenPageCountBelow`를 함께 설정했다.
- 관련 파일: `apps/demo/src/pages/demo/pagination/PaginationDemoPage.tsx`, `docs/logs/work-log.md`

## 2026-07-28

### Server-Side Sort defaultSorting / Reset / 토글 기준 반영

- default sort baseline, 다이얼로그 Reset, ActionBar Sort primary 기준을 문서·CRUD에 반영했다.
- 관련 파일: `docs/gen-grid/server-side-sort-architecture.md`, `packages/gen-grid-crud/**`, `apps/demo/.../PaginationDemoPage.tsx`

### formatServerSortQuery를 field:asc,field:desc 로 변경

- 정렬 query가 SQL처럼 보이지 않도록 `field:dir` 스펙으로 통일했다.
- 관련 파일: `packages/gen-grid-crud/src/features/server-sort/serverSortColumns.ts`, `docs/gen-grid/server-side-sort-*.md`

### Server-Side Sort Spring Boot 샘플 문서 추가

- `formatServerSortQuery` 결과를 화이트리스트 검증 후 `Pageable`/`Sort`로 쓰는 Spring Boot 예제를 문서화했다.
- 관련 파일: `docs/gen-grid/server-side-sort-spring-boot-sample.md`

### Server-Side Sort DnD UX CRUD 승격

- demo Sort DnD UX를 `gen-grid-crud` built-in으로 승격하고 demo 전용 다이얼로그를 제거했다.
- 관련 파일: `packages/gen-grid-crud/src/components/CrudServerSortDialog.*`, `apps/demo/.../PaginationDemoPage.tsx`, `docs/gen-grid/server-side-sort-architecture.md`

### Server-Side Sort 우선순위 DnD (demo 실험)

- Pagination Demo `ServerSortPriorityDialog`는 **단일 컬럼 목록**에서 방향(없음/오름/내림) 선택 + 선택 행 DnD로 우선순위를 바꾼다.
- CRUD built-in Sort 대신 `customActions`로 열어, 패키지 승격 여부를 demo에서 판단한다.
- 관련 파일: `apps/demo/src/pages/demo/pagination/ServerSortPriorityDialog.tsx`, `PaginationDemoPage.tsx`

### Server-Side Sort 다이얼로그 UX 변경

- Sort 다이얼로그를 전체 컬럼 나열 + 없음/오름/내림 선택 방식으로 바꿨다.
- 관련 파일: `packages/gen-grid-crud/src/components/CrudServerSortDialog.tsx`, `docs/gen-grid/server-side-sort-architecture.md`

### Server-Side Sort 다이얼로그 높이 보정

- `CrudServerSortDialog`에 `initialHeight={360}`을 지정해 SimpleDialog body 접힘(콘텐츠 미표시)을 수정했다.
- 관련 파일: `packages/gen-grid-crud/src/components/CrudServerSortDialog.tsx`, `CrudServerSortDialog.module.css`

### Server-Side Sort Phase 0·2 구현

- gen-grid에 `enableSorting`을 공개하고, gen-grid-crud에 ActionBar Sort 다이얼로그·`onSortingChange` 계약을 추가했다.
- Pagination Demo에서 서버 정렬(전체 집합 정렬 후 페이지 슬라이스) 시나리오를 검증용으로 연동했다.
- 관련 파일: `packages/gen-grid/**`, `packages/gen-grid-crud/**`, `apps/demo/src/pages/demo/pagination/PaginationDemoPage.tsx`, `docs/gen-grid/server-side-sort-architecture.md`

### Server-Side Sort 아키텍처·계획 문서 추가

- 서버 페이징용 Sort 팝오버 시나리오의 아키텍처와 Phase 0~2 구현 계획을 문서화했다.
- 관련 파일: `docs/gen-grid/server-side-sort-architecture.md`, `docs/logs/decisions.md`

## 2026-07-27

### GenCalendar 패키지 1차 구현 (P0–P8)

- `@gen-office/gen-calendar`를 추가하고 월간/주간 뷰, 선택, 드래그 이동/리사이즈, 기본 반복 전개, demo/Storybook 연동을 구현했다.
- 관련 파일: `packages/gen-calendar/**`, `apps/demo/src/pages/demo/calendar/**`, `AGENTS.md`, `docs/logs/decisions.md`

## 2026-07-24

### MultiMonthPicker 2년 헤더 1줄 정리

- MultiMonthPicker 2년 보기에서 헤더를 1줄로 줄였습니다 (범위 문구 제거, 연도만 Prev/Next 사이 배치).
- 관련 파일: `packages/ui/src/composed/DatePicker/MultiMonthPicker.tsx`, `packages/ui/src/composed/DatePicker/DatePicker.module.css`, `packages/ui/docs/implementation-log.md`

## 2026-07-24

### MultiMonthPicker 추가

- `@gen-office/ui`에 비연속 다중 월 선택 `MultiMonthPicker`를 추가했습니다 (`visibleYears` 1|2, Clear/Confirm).
- 관련 파일: `packages/ui/src/composed/DatePicker/MultiMonthPicker.tsx`, `packages/ui/src/composed/DatePicker/MultiMonthPicker.types.ts`, `packages/ui/docs/implementation-log.md`, `apps/demo/src/pages/demo/datepicker/DatePickerDemoPage.tsx`

## 2026-07-24

### DatePicker Storybook 스토리 추가

- `@gen-office/ui` DatePicker 계열 컴포넌트 Storybook 스토리를 추가했습니다.
- 관련 파일: `packages/ui/src/composed/DatePicker/DatePicker.stories.tsx`, `packages/ui/docs/implementation-log.md`

## 2026-07-24

### TreeView Refresh 버튼 옵션 추가

- `@gen-office/ui` TreeView 헤더에 선택적 Refresh 버튼을 추가했습니다 (`showRefresh`, `onRefresh`).
- 관련 파일: `packages/ui/src/composed/TreeView/TreeView.types.ts`, `packages/ui/src/composed/TreeView/TreeView.tsx`, `packages/ui/src/composed/TreeView/TreeView.stories.tsx`, `packages/ui/docs/implementation-log.md`

## 2026-07-07

### GenDataGrid mask edit type 및 demo 연계 계획 문서화

- `GenDataGrid` built-in `editType: 'mask'` 구현 계획을 패키지 문서 아래에 추가했습니다.
- `dateTime`, `combo`, `lookup`, `multiSelect` 등 후속 editType 확장 후보를 패키지 로드맵 문서로 정리했습니다.
- demo app에서 mask editor를 확인하기 위한 화면 구성, 메뉴 연결, 검증 시나리오를 root demo 문서로 분리했습니다.
- 관련 파일: `packages/gen-datagrid/docs/plan/edit-type-extension-roadmap.md`, `packages/gen-datagrid/docs/plan/masked-edit-type-plan.md`, `packages/gen-datagrid/docs/README.md`, `packages/gen-datagrid/docs/plan/remaining-work-plan.md`, `packages/gen-datagrid/docs/log/implementation-log.md`, `docs/demo/gen-datagrid-mask-edit-demo-plan.md`, `docs/logs/work-log.md`

## 2026-07-01

### CustomerInfoPage GenDataGridCrud 반복 렌더 보정

- CustomerInfoPage에서 `GenDataGridCrud`를 제거하면 다른 메뉴 로딩이 정상화되는 증상을 기준으로 CRUD state identity와 demo inline prop 경로를 보정했습니다.
- `GenDataGridCrud`가 `data`/`columns` 배열을 입력 참조 변경 시에만 복사하도록 변경하고, `DataGridCrudUiState`가 `createRow`/`onExport` 함수 identity 변화에 의존하지 않도록 수정했습니다.
- CustomerInfoPage/CustomerTable의 빈 rows, refetch/commit, createRow, gridProps, actionBar, onStateChange 콜백을 안정화했습니다.
- 원인과 해결, 재발 방지 기준을 `packages/gen-datagrid-crud/docs/customer-info-loading-loop.md`에 문서화하고 임시 진단 로그를 제거했습니다.
- 관련 파일: `packages/gen-datagrid-crud/src/GenDataGridCrud.tsx`, `packages/gen-datagrid-crud/src/crud/useDataGridCrudController.tsx`, `packages/gen-datagrid-crud/test/thinShell.test.tsx`, `packages/gen-datagrid-crud/docs/implementation-log.md`, `packages/gen-datagrid-crud/docs/customer-info-loading-loop.md`, `apps/demo/src/pages/customer/customer-info/CustomerInfoPage.tsx`, `apps/demo/src/pages/customer/customer-info/CustomerTable.tsx`

### GenDataGridCrud onStateChange ?? ?? ??

- `GenDataGridCrud`? `onStateChange`? callback identity ????? ?? ???? ??? ???? ???? ?? callback? ref? ???? ??????.
- CustomerInfoPage?? inline `onStateChange`?? ?? state? ???? ??? ?? ??? ??? ?? lazy page ??? ?? ? ?? ??? ??????.
- ?? ??: `packages/gen-datagrid-crud/src/crud/useDataGridCrudController.tsx`, `packages/gen-datagrid-crud/test/thinShell.test.tsx`, `packages/gen-datagrid-crud/docs/implementation-log.md`


### GenDataGrid 하단 frame border 보정

- 수평 scrollbar가 없을 때 DataGrid 하단 외곽선이 비어 보이지 않도록 root에 `border-bottom`을 추가했습니다.
- root frame border CSS 계약 테스트에 하단 border 검증을 추가했습니다.
- 관련 파일: `packages/gen-datagrid/src/index.css`, `packages/gen-datagrid/test/baseline.mjs`, `packages/gen-datagrid/docs/log/implementation-log.md`

### GenDataGrid 외곽 좌우 border 기본화

- DataGrid root가 좌우 frame border를 직접 그리도록 변경하고, row 마지막 cell의 `border-right`는 제거했습니다.
- cell separator와 외곽 border 역할을 분리해 왼쪽은 없고 오른쪽만 보이는 dashboard grid 표시 문제를 보정했습니다.
- 관련 파일: `packages/gen-datagrid/src/index.css`, `packages/gen-datagrid/test/baseline.mjs`, `packages/gen-datagrid/docs/log/implementation-log.md`

### GenDataGrid fill 모드 수평 스크롤 보정

- `columnFitMode: 'fill'`에서 마지막 header resize handle이 column track 바깥으로 3px 튀어나와 수평 scrollbar를 만들 수 있는 문제를 보정했습니다.
- resize handle을 column 내부에 배치하고, CSS 계약 테스트를 추가했습니다.
- 관련 파일: `packages/gen-datagrid/src/index.css`, `packages/gen-datagrid/test/baseline.mjs`, `packages/gen-datagrid/docs/log/implementation-log.md`

### GenDataGrid columnFitMode fill 추가

- `GenDataGrid`의 `columnFitMode`에 `fill` 옵션을 추가해 viewport 폭에 맞춰 column 폭을 확대/축소하도록 변경했습니다.
- `fill` 축소는 column `minSize`를 하한으로 사용하며, DashboardDemoPage 상단 GenDataGridCrud grid에 `columnFitMode: 'fill'`을 적용했습니다.
- 관련 파일: `packages/gen-datagrid/src/GenDataGrid.types.ts`, `packages/gen-datagrid/src/renderers/div-grid/gridTemplate.ts`, `packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx`, `packages/gen-datagrid/test/interaction.test.tsx`, `packages/gen-datagrid/docs/reference/api-structure.md`, `packages/gen-datagrid/docs/reference/api-comparison-with-gen-grid.md`, `packages/gen-datagrid/docs/architecture/gate-8-6-merge-span-validation-architecture.md`, `packages/gen-datagrid/docs/log/implementation-log.md`, `apps/demo/src/pages/demo/dashboard/DashboardDemoPage.tsx`

### GenDataGridCrud gridProps feature flag 전달 허용

- `GenDataGridCrud`가 내부에서 고정하던 DataGrid feature flag를 `gridProps`로 전달할 수 있게 변경했습니다.
- `enableRowSelection`, `enableRowStatus`, `enableDirtyState` 등을 dashboard 같은 읽기 전용 CRUD 화면에서 끌 수 있도록 했고, DashboardDemoPage 상단 grid에 적용했습니다.
- CRUD가 소유해야 하는 data, columns, getRowId, controlled state callback은 계속 내부에서 관리합니다.
- 관련 파일: `packages/gen-datagrid-crud/src/GenDataGridCrud.types.ts`, `packages/gen-datagrid-crud/src/GenDataGridCrud.tsx`, `packages/gen-datagrid-crud/src/crud/useDataGridCrudController.tsx`, `packages/gen-datagrid-crud/test/thinShell.test.tsx`, `apps/demo/src/pages/demo/dashboard/DashboardDemoPage.tsx`, `packages/gen-datagrid-crud/docs/implementation-log.md`

### DashboardDemoPage GenDataGridCrud 전환

- demo dashboard 화면의 상단 3개 CRUD grid를 `GenGridCrud`에서 `GenDataGridCrud`로 전환했습니다.
- 컬럼 타입을 `GenDataGridColumnDef`로 바꾸고, `fitColumns`는 `columnFitMode: 'grow'`, `enableActiveRowHighlight`는 `enableCurrentRowHighlight`로 치환했습니다.
- `GenDataGridCrud`에서 아직 지원하지 않는 `getCellStyle`, `rowSpanning`, `rowSpanningMode` 설정은 제거하고 column meta `visualRowMerge`로 가능한 병합 표시만 반영했습니다.
- 관련 파일: `apps/demo/src/pages/demo/dashboard/DashboardDemoPage.tsx`, `docs/logs/work-log.md`

### GenDataGrid 편집 진단 로그 제거

- CustomerInfoPage에서 편집 셀 클릭 전환이 정상 동작함을 확인해 임시 `debugEditing` prop과 console debug 출력 경로를 제거했습니다.
- 실제 편집 전환 보정 로직은 유지하고, demo customer table의 `gridProps.debugEditing` 설정도 제거했습니다.
- 관련 파일: `packages/gen-datagrid/src/GenDataGrid.types.ts`, `packages/gen-datagrid/src/renderers/div-grid/DataGridCell.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridBodyRow.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridVirtualBody.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx`, `apps/demo/src/pages/customer/customer-info/CustomerTable.tsx`, `packages/gen-datagrid/docs/log/implementation-log.md`, `packages/gen-datagrid/docs/reference/api-structure.md`

### GenDataGrid 편집 전환 mousedown focus 경합 보정

- CustomerInfoPage 진단 로그에서 `virtualContinueClickEditStart`까지 도달하는 것을 확인했고, 이후 기존 editor blur가 새 편집 상태와 경합할 수 있는 경로를 보정했습니다.
- 편집 중 다른 cell을 클릭하는 경우 target cell의 즉시 focus를 생략해 blur commit/cancel이 새 editor 시작을 덮지 않도록 했습니다.
- 관련 파일: `packages/gen-datagrid/src/renderers/div-grid/DataGridCell.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridBodyRow.tsx`, `packages/gen-datagrid/docs/log/implementation-log.md`

### GenDataGrid 편집 진단 로그 추가

- `GenDataGrid`에 `debugEditing` prop을 추가해 편집 cell 클릭 전환이 어느 단계에서 막히는지 브라우저 콘솔에서 확인할 수 있도록 했습니다.
- CustomerInfoPage 확인을 위해 demo customer table의 `gridProps.debugEditing`을 임시 활성화했습니다.
- 관련 파일: `packages/gen-datagrid/src/GenDataGrid.types.ts`, `packages/gen-datagrid/src/features/editing/debugEditing.ts`, `packages/gen-datagrid/src/renderers/div-grid/DataGridCell.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridBodyRow.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridVirtualBody.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx`, `apps/demo/src/pages/customer/customer-info/CustomerTable.tsx`, `packages/gen-datagrid/docs/log/implementation-log.md`, `packages/gen-datagrid/docs/reference/api-structure.md`

### GenDataGrid 편집 셀 클릭 전환 보정

- 편집 상태에서 다른 editable cell을 클릭해 바로 편집으로 이어갈 때 기존 셀 focus 복원 로직이 새 editor focus와 경합하지 않도록 패키지 내부 클릭 전환 경로를 보정했습니다.
- 일반 editor blur/cancel의 focus 복원 동작은 유지하고, 다른 셀 활성화로 편집을 종료하는 경로만 focus 복원 없는 deactivate 콜백을 사용하도록 분리했습니다.
- 관련 파일: `packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx`, `packages/gen-datagrid/src/renderers/div-grid/DataGridVirtualBody.tsx`, `packages/gen-datagrid/docs/log/implementation-log.md`

### GenDataGridCrud 클릭 편집 이어지기 기본값 적용

- `GenDataGridCrud`의 CRUD 기본 UX로 `editPolicy.continueTriggers.click`을 기본 활성화해 편집 상태에서 다른 editable cell 클릭 시 즉시 편집으로 이어지도록 변경했습니다.
- 사용자가 `gridProps.editPolicy.continueTriggers.click: false`를 전달하면 기본값을 opt-out할 수 있도록 유지했습니다.
- 관련 파일: `packages/gen-datagrid-crud/src/GenDataGridCrud.tsx`, `packages/gen-datagrid-crud/test/thinShell.test.tsx`, `packages/gen-datagrid-crud/docs/implementation-log.md`, `packages/gen-datagrid/src/index.ts`, `packages/gen-datagrid/docs/log/implementation-log.md`, `packages/gen-datagrid/docs/reference/api-structure.md`, `packages/gen-datagrid/docs/reference/api-comparison-with-gen-grid.md`

### GenDataGridCrud 편집 선택 기본값 적용

- `GenDataGridCrud`가 업무 CRUD 기본 UX로 `editSelectOnFocus`를 기본 활성화하도록 변경했습니다.
- 소비자가 `gridProps.editSelectOnFocus: false`를 넘기면 기존처럼 opt-out할 수 있도록 유지했습니다.
- 관련 파일: `packages/gen-datagrid-crud/src/GenDataGridCrud.tsx`, `packages/gen-datagrid-crud/test/thinShell.test.tsx`, `apps/demo/src/pages/customer/customer-info/CustomerInfoColumns.tsx`, `packages/gen-datagrid-crud/docs/implementation-log.md`

### GenDataGrid 컬럼 타입 정리

- `GenDataGridColumnMeta`와 `GenDataGridColumnDef` public 타입을 추가하고 `GenDataGridCrud`도 해당 컬럼 타입을 사용하도록 정리했습니다.
- demo의 GenDataGrid 사용 화면인 고객 정보, Actuals 컬럼 정의를 GenDataGrid 전용 타입과 meta로 전환했습니다.
- 관련 파일: `packages/gen-datagrid/src/GenDataGrid.types.ts`, `packages/gen-datagrid/src/core/table/tanstack-table.ts`, `packages/gen-datagrid/src/index.ts`, `packages/gen-datagrid-crud/src/GenDataGridCrud.types.ts`, `apps/demo/src/pages/customer/customer-info/CustomerInfoColumns.tsx`, `apps/demo/src/pages/co/actuals/ActualsColumns.tsx`

### CustomerInfoPage GenDataGridCrud 전환

- 고객 정보 화면의 CRUD 그리드 래퍼를 `GenGridCrud`에서 `GenDataGridCrud`로 전환했습니다.
- `changeSet` 기반 저장 콜백과 내장 선택 삭제 액션을 사용하도록 타입과 컬럼 구성을 정리했습니다.
- 관련 파일: `apps/demo/src/pages/customer/customer-info/CustomerInfoPage.tsx`, `apps/demo/src/pages/customer/customer-info/CustomerTable.tsx`, `apps/demo/src/pages/customer/customer-info/CustomerInfoColumns.tsx`, `docs/logs/work-log.md`

## 2026-06-30

### ActualsPage GenDataGridCrud gridProps 정리

- `GenDataGridCrud`가 소유하는 row selection 옵션을 `ActualsPage`의 `gridProps`에서 제거해 demo build 타입 오류를 정리했다.
- 시스템 컬럼 중앙 정렬 보강 검증 과정에서 발견된 app integration 설정 불일치를 보정했다.
- 관련 파일: `apps/demo/src/pages/co/actuals/ActualsPage.tsx`, `docs/logs/work-log.md`

## 2026-06-25

### 제안 평가 응답 규칙 추가

- 사용자 제안이나 질의에 대해 장점 중심으로 반응하지 않고 목적, 전제, 리스크, 대안, 유지보수 비용을 함께 검토하도록 `AGENTS.md`에 응답 평가 규칙을 추가했습니다.
- "가능함"과 "권장됨"을 구분하고, 정보가 부족한 경우 필요한 가정과 확인 사항을 먼저 밝히도록 명시했습니다.
- 관련 파일: `AGENTS.md`, `docs/logs/work-log.md`

## 2026-06-22

### AGENTS 한글 문서 편집 규칙 추가

- 한글 문서 수정 시 Windows PowerShell Get-Content/Set-Content 대신 UTF-8 Node.js 스크립트를 우선 사용하도록 규칙을 추가했습니다.
- 긴 한글 본문을 powershell.exe -Command로 전달하지 않고 Node helper script 또는 apply_patch를 사용하도록 명시했습니다.
- 관련 파일: AGENTS.md

## 2026-06-19

### Showcase decisions.md → apps/showcase/docs/logs/

- Showcase 전용 결정 로그를 `apps/showcase/docs/logs/decisions.md`로 분리했습니다.
- repo 전역 `docs/logs/decisions.md`는 monorepo 전역 결정만 유지하고, 분리 결정 항목을 추가했습니다.
- plan·AGENTS·doc-work-log 참조 경로를 갱신했습니다.

변경 영역:

- 문서 관리 체계
- Showcase 결정 로그

관련 파일:

- `apps/showcase/docs/logs/decisions.md`
- `docs/logs/decisions.md`
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md`
- `apps/showcase/docs/plan/07-mvp-decisions.md`
- `apps/showcase/docs/plan/README.md`
- `AGENTS.md`
- `docs/logs/doc-work-log.md`

### Showcase MVP 의사결정 문서화

- Vercel 공개·단일 도메인·apps/showcase 빌드, URL–MDI 전 화면, Login 제거 결정을 `07-mvp-decisions.md`, `decisions.md`에 반영했습니다.

변경 영역:

- Showcase MVP 의사결정

관련 파일:

- `apps/showcase/docs/plan/07-mvp-decisions.md`
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md`
- `apps/showcase/docs/plan/README.md`
- `apps/showcase/docs/logs/decisions.md`
- `docs/logs/doc-work-log.md`

### docs/logs/doc-work-log.md 추가

- 문서 전용 작업 이력을 `docs/logs/doc-work-log.md`에 분리·기록했습니다.
- Showcase plan 문서 신규 작성 및 01-positioning 설득 포인트 보강 내역을 반영했습니다.

변경 영역:

- 문서 관리 체계

관련 파일:

- `docs/logs/doc-work-log.md`
- `docs/logs/work-log.md`

### Showcase 01-positioning 설득 포인트 보강

- 레거시(Nexacro 등) 익숙함, 생산성, AI 하네스(바이브 코딩), React 대중성, 미래지향성 5축 설득 포인트를 반영했습니다.

변경 영역:

- Showcase 기획 문서

관련 파일:

- `apps/showcase/docs/plan/01-positioning-and-audience.md`
- `apps/showcase/docs/plan/README.md`
- `docs/logs/doc-work-log.md`

### apps/showcase 기획 문서 추가

- SI 원청 PM용 GenOffice Showcase(Nexacro 대체 설득 데모) 기획 문서를 `apps/showcase/docs/plan/`에 작성했습니다.
- 포지셔닝, PM 데모 시나리오 A~D, IA, Nexacro 비교, demo 연동 스펙, Gap·로드맵을 분리해 정리했습니다.

변경 영역:

- Showcase 앱 기획 (앱 스캐폴딩은 미착수)

관련 파일:

- `apps/showcase/docs/plan/README.md`
- `apps/showcase/docs/plan/01-positioning-and-audience.md`
- `apps/showcase/docs/plan/02-demo-scenarios.md`
- `apps/showcase/docs/plan/03-information-architecture.md`
- `apps/showcase/docs/plan/04-nexacro-comparison.md`
- `apps/showcase/docs/plan/05-demo-integration.md`
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md`
- `docs/logs/doc-work-log.md`

## 2026-06-15

### 로그 역순 정렬 규칙 추가

- 새 로그 항목을 파일 앞쪽에 추가하도록 `AGENTS.md` 규칙을 보강했습니다.
- 로그 파일은 최신 항목이 위로 오도록 역순으로 관리합니다.
- 같은 날짜 섹션 안에서도 최신 작업을 위에 추가합니다.

변경 영역:

- 문서 관리 체계
- AI 코딩 규칙

관련 파일:

- `AGENTS.md`
- `docs/logs/work-log.md`

### 작업 로그 관리 시작

- 리포지토리 수준의 작업 로그 관리를 시작했습니다.
- 패키지별 구현 로그 파일을 추가했습니다.
- 앞으로 파일을 변경하는 작업은 반드시 문서 로그를 남기도록 `AGENTS.md` 규칙을 업데이트했습니다.

변경 영역:

- 문서 관리 체계
- AI 코딩 작업 흐름

관련 파일:

- `AGENTS.md`
- `docs/logs/work-log.md`
- `docs/logs/decisions.md`
- `packages/*/docs/implementation-log.md`

### 빌드 가이드 역할 정리

- `docs/01.BUILD_GUIDE.md`를 빌드, 실행, 트러블슈팅 전용 문서로 다시 작성했습니다.
- 오래된 패키지명과 깨진 한글 내용을 현재 워크스페이스 구조 기준으로 정리했습니다.
- `AGENTS.md`의 검증 섹션에서 빌드 가이드를 참조하도록 연결했습니다.

변경 영역:

- 문서 구조
- 빌드 및 실행 가이드
- AI 에이전트 검증 규칙

관련 파일:

- `docs/01.BUILD_GUIDE.md`
- `AGENTS.md`
- `docs/logs/work-log.md`
- `docs/logs/decisions.md`

### 로그 한국어 작성 규칙 추가

- 작업 로그와 결정 로그를 한국어로 작성하도록 `AGENTS.md` 규칙을 추가했습니다.
- 기존 로그 시작 항목을 한국어로 정리했습니다.

변경 영역:

- 문서 관리 체계
- AI 코딩 규칙

관련 파일:

- `AGENTS.md`
- `docs/logs/work-log.md`
- `docs/logs/decisions.md`
- `packages/*/docs/implementation-log.md`

### 충돌 해결 후 에이전트 규칙 보강

- 다른 작업에서 정리된 `gen-datagrid` 문서 구조를 인정하고, `AGENTS.md`의 `GenDataGrid` 문서 경로를 현재 구조에 맞췄습니다.
- 중복된 `GenDataGrid` 문서 규칙을 정리했습니다.
- 깨진 한국어 로그 내용을 읽을 수 있는 한국어로 다시 정리했습니다.

변경 영역:

- AI 에이전트 규칙
- 문서 로그
- GenDataGrid 문서 경로

관련 파일:

- `AGENTS.md`
- `docs/logs/work-log.md`
- `docs/logs/decisions.md`
- `packages/gen-datagrid/docs/log/implementation-log.md`
