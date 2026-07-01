<!-- packages/gen-datagrid-crud/docs/implementation-log.md
Records implementation changes for the GenDataGridCrud package.
-->

# GenDataGridCrud 구현 로그

## 2026-07-01

### CRUD 편집 select-on-focus 기본 활성화

- `GenDataGridCrud` 내부에서 `gridProps.editSelectOnFocus ?? true` 기준으로 CRUD 화면의 기본 편집 진입 시 전체 선택을 활성화했다.
- `gridProps.editSelectOnFocus: false`를 넘기면 opt-out할 수 있도록 유지하고 thin shell 테스트를 추가했다.
- 관련 파일: `src/GenDataGridCrud.tsx`, `test/thinShell.test.tsx`, `docs/implementation-log.md`

### GenDataGridColumnDef 기반 columns 타입 정리

- `GenDataGridCrudProps.columns` 타입을 TanStack `ColumnDef`에서 `GenDataGridColumnDef`로 변경했다.
- CRUD 래퍼를 사용하는 앱 화면이 GenDataGrid 전용 column meta 타입을 직접 참조할 수 있도록 `gen-datagrid` public 타입과 맞췄다.
- 관련 파일: `src/GenDataGridCrud.types.ts`, `docs/implementation-log.md`
