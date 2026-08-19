# GenGrid 구현 로그

## 2026-08-19

### textarea 표시가 개행을 버리던 문제

- contenteditable 커밋이 `textContent`라 Enter/`<br>`이 한 줄로 붙었다. multiline은 `innerText`로 읽고 쓴다.
- `editType: 'textarea'` 셀에 `pre-wrap`을 기본 적용해 표시도 여러 줄로 보이게 했다.
- 관련 파일: `src/components/layout/GenGridCell.tsx`, `GenGridBody.module.css`

### textarea 에디터가 행 높이를 채우고 행을 늘리지 않음

- td에 `max-height`를 두어 셀 내용이 행 높이를 키우지 않게 했다. rowspan은 `--gen-grid-cell-row-span`으로 배수를 연다.
- 편집 래퍼를 셀에 absolute fill하고, multiline 에디터는 내부 스크롤한다.
- 관련 파일: `src/components/layout/GenGridBody.module.css`, `GenGridCell.tsx`

## 2026-08-18

### 헤더 sortCount undefined 가드

- 정렬 비활성 시 `state.sorting`이 없어서 `length` 접근이 깨질 수 있어 `sorting?.length ?? 0`으로 막았다.
- 관련 파일: `src/components/layout/GenGridHeader.tsx`

### 헤더 다중 정렬을 Ctrl로 바꾸고 순번 표시

- TanStack 기본 Shift 대신 Ctrl(macOS는 Cmd)로 컬럼을 추가 정렬한다.
- 정렬 컬럼이 2개 이상일 때 헤더 아이콘 옆에 `getSortIndex() + 1` 순번을 표시한다.
- 관련 파일: `src/core/table/useGenGridTable.ts`, `src/components/layout/GenGridHeader.tsx`, `GenGridHeader.module.css`, `src/GenGrid.types.ts`

## 2026-08-13

### sticky footer 고정 컬럼 z-index 보정

- sticky footer 칸은 `z-index: header(20)`인데, 고정 컬럼 인라인이 `pinned(15)`라 가로 스크롤 시 일반 footer 칸에 가려졌다.
- footer 고정 컬럼은 헤더와 같이 `header + 3`으로 올려 좌우 스크롤에도 위에 남게 했다.
- 관련 파일: `src/components/layout/cellStyles.ts`, `GenGridFooter.tsx`, `GenGridPinning.module.css`

## 2026-08-12

### rowspan 구간 ActiveRowHighlight 확장 보류

- span 컬럼 active 시 covered 행까지 highlight를 퍼뜨리는 안은 채택하지 않고 보류한다.
- 현재 동작은 active 물리 행만 highlight한다. 재검토 포인트는 `docs/logs/decisions.md`에 기록했다.
- 관련 파일: docs/gen-grid/row-spanning.md, docs/logs/decisions.md

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
