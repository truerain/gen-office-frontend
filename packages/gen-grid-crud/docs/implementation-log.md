# GenGridCrud 구현 로그

## 2026-07-28

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
