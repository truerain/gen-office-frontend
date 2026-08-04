# GenGrid 구현 로그

## 2026-08-04

### onRowDoubleClick public API 추가

- `GenGridProps.onRowDoubleClick`를 추가했다. body cell 더블클릭 시 콜백을 호출한다.
- 기존 `startEditing`은 유지한다. 편집 가능 셀이면 콜백 이후 편집이 시작되고, readonly/비편집 셀이면 콜백만 동작한다.
- 관련 파일: src/GenGrid.types.ts, src/features/editing/useCellEditing.ts, src/components/base/GenGridBase.tsx, src/components/layout/GenGridBody.tsx, GenGridVirtualBody.tsx

### dataVersion 기반 스크롤 초기화 옵션 추가

- GenGridProps에 `resetScrollOnDataVersion?: boolean`을 추가했다(기본값 `false`).
- `dataVersion` 변경 시 옵션이 켜진 경우 `.tableScroll` viewport의 `scrollTop`을 0으로 초기화한다. 최초 mount에서는 리셋하지 않는다.
- Pagination Demo의 `gridProps`에 연결해 재조회/페이지 변경 시 스크롤 리셋 동작을 확인할 수 있게 했다.
- 관련 파일: src/GenGrid.types.ts, src/components/base/GenGridBase.tsx, apps/demo/src/pages/demo/pagination/PaginationDemoPage.tsx

## 2026-08-03

### Pagination 직접 이동 옵션 추가

- pagination UI에 `pageJumpOptions` 공개 옵션을 추가했다. `enabled=true`일 때만 페이지 번호 입력과 이동 버튼을 표시한다.
- 직접 이동은 input 입력 후 Enter 또는 버튼 클릭 시에만 적용되며, 입력값은 `1 ~ pageCount` 범위로 자동 보정한다.
- 관련 파일: src/GenGrid.types.ts, src/components/base/GenGridBase.tsx, src/components/pagination/GenGridPagination.tsx, src/components/pagination/GenGridPagination.module.css, src/index.ts

## 2026-07-28

### enableSorting 공개 (Server-Side Sort Phase 0)

- GenGridProps/useGenGridTable에 enableSorting을 추가했다. false면 헤더 클라이언트 정렬과 getSortedRowModel을 끈다.
- tree/rowSpanning 모드에서는 기존과 같이 정렬을 강제 비활성한다.
- 관련 파일: src/GenGrid.types.ts, src/core/table/useGenGridTable.ts

## 2026-06-15

### 로그 관리 시작

- 패키지 구현 로그를 생성했습니다.
- 앞으로 이 패키지의 소스, API, 동작, 문서 변경 사항은 이 파일에 기록합니다.
