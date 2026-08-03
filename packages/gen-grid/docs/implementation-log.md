# GenGrid 구현 로그

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
