<!-- packages/gen-datagrid-crud/docs/implementation-log.md
Records implementation changes for the GenDataGridCrud package.
-->

# GenDataGridCrud 구현 로그

## 2026-07-01

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
