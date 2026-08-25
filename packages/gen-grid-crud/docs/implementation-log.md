# GenGridCrud 구현 로그

## 2026-08-25

### GenGridCrudHandle updateRow / updateRows 추가

- 외부 팝업·폼에서 기존 행 필드를 pending update로 반영한다. `Partial<TData>` patch + rowId 형태이며 셀 편집과 동일한 `pendingApi.updateRow` 경로를 사용한다.
- 관련 파일: `src/GenGridCrudHandle.ts`, `src/GenGridCrud.tsx`, `src/index.ts`, `docs/app_guide/crud.md`

### GenGridCrudHandle로 외부 행 add/delete 공개

- `forwardRef` + `useImperativeHandle`로 `addRow` / `addRows` / `deleteRowIds` / `reset`을 노출한다.
- 팝업에서 고른 완성 `TData`를 pending create로 넣을 수 있다. ActionBar `createRow`와 별개이며 `CrudActionApi`는 확장하지 않았다.
- 관련 파일: `src/GenGridCrudHandle.ts`, `src/GenGridCrud.tsx`, `src/index.ts`, `docs/app_guide/crud.md`

## 2026-08-19

### refetch 시 pending 유지와 reset 계약 기록

- `data` refetch는 pending overlay를 유지한다. 수정 폐기는 `CrudActionApi.reset()`이다.
- `key` remount는 pending과 내부 UI state를 함께 버리므로 조회 단위 전환용으로 둔다. `resetOnDataVersion`/ref는 추가하지 않았다.
- 관련 파일: `src/GenGridCrud.types.ts`, `docs/logs/decisions.md`

## 2026-07-28

### Server-Side Sort default / Reset / 버튼 토글 기준

- `defaultSorting`을 baseline으로 쓰고, 다이얼로그 Reset은 해당 값으로 draft를 복원한다.
- ActionBar Sort primary는 `sorting.length > 0`이 아니라 default와 다를 때만 켠다.
- `isSameServerSorting` 헬퍼를 export한다.
- 관련 파일: `CrudServerSortDialog.tsx`, `CrudActionBar.tsx`, `GenGridCrud.tsx`, `serverSortColumns.ts`, Pagination Demo

### formatServerSortQuery 포맷을 field:dir 로 변경

- API sort 문자열을 `name:asc,score:desc` 형식으로 바꿔 SQL ORDER BY와 구분한다.
- Spring Boot 샘플 파서·아키텍처 문서를 동일 포맷으로 갱신했다.
- 관련 파일: `src/features/server-sort/serverSortColumns.ts`, `docs/gen-grid/server-side-sort-spring-boot-sample.md`

### Server-Side Sort DnD UX CRUD 승격

- demo에서 검증한 단일 목록 + 선택 행 DnD 우선순위를 `CrudServerSortDialog`로 승격했다.
- 스타일은 theme 토큰(`--color-*`)을 사용하고, Pagination Demo는 built-in `'sort'`로 되돌렸다.
- 관련 파일: `src/components/CrudServerSortDialog.tsx`, `CrudServerSortDialog.module.css`, `apps/demo/.../PaginationDemoPage.tsx`

### Server-Side Sort 다이얼로그 UX 변경

- 컬럼 추가 방식 대신 전체 컬럼 나열 + 없음/오름/내림 선택으로 변경했다.
- multi-sort 우선순위는 컬럼 나열 순서(선택된 항목)를 따른다.
- 관련 파일: `src/components/CrudServerSortDialog.tsx`, `CrudServerSortDialog.module.css`

### Server-Side Sort (ActionBar Sort 다이얼로그)

- built-in `'sort'`와 `sorting` / `onSortingChange` / `defaultSorting`을 추가했다.
- Sort 활성 시 GenGrid `enableSorting: false`로 헤더 클라이언트 정렬을 끈다.
- `CrudServerSortDialog`에서 multi-column Asc/Desc를 편집하고 확인 시 콜백만 호출한다(refetch는 소비자).
- `collectServerSortColumns` / `formatServerSortQuery` 헬퍼를 export한다.
- 관련 파일: `src/GenGridCrud.types.ts`, `src/GenGridCrud.tsx`, `src/components/CrudActionBar.tsx`, `src/components/CrudServerSortDialog.tsx`, `src/features/server-sort/serverSortColumns.ts`, `apps/demo/.../PaginationDemoPage.tsx`

## 2026-06-15

### 로그 관리 시작

- 패키지 구현 로그를 생성했습니다.
- 앞으로 이 패키지의 소스, API, 동작, 문서 변경 사항은 이 파일에 기록합니다.
