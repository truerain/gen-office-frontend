<!-- packages/gen-datagrid/docs/log/planning-history.md
Summarizes completed GenDataGrid planning and gate history that no longer belongs in active plan documents.
-->

# GenDataGrid Planning History

이 문서는 완료된 계획과 gate 진행 이력을 요약한다. 앞으로 할 일은
`../plan/remaining-work-plan.md`에서만 관리한다.

## 2026-06-27

### Plan 문서 구조 정리

- `docs/plan`은 남은 작업만 관리하는 영역으로 축소했다.
- 기존 `div-datagrid-development-plan.md`와 `mvp-test-gates.md`의 완료된 gate 서술은 활성 plan에서 제거했다.
- 완료된 구현 이력은 `implementation-log.md`와 gate별 architecture 문서를 기준으로 추적한다.
- Gate 4.2 paste decision과 Gate 6.1 data ownership decision은 아래 결정 요약으로 보존한다.

## 완료된 Gate 요약

### Gate 1-2. Div Renderer Contract / Scoped Focus

- table 태그 없는 div grid DOM contract를 고정했다.
- root-scoped cell lookup, active cell, roving tabIndex, keyboard navigation을 구현했다.
- 관련 architecture: `../architecture/gate-1-2-architecture.md`

### Gate 3. Range Selection And Clipboard

- cell range selection, controlled/uncontrolled selected ranges, clipboard copy를 구현했다.
- plain-text paste application은 Gate 4.2에서 구현했다.
- paste-to-selection은 남은 작업으로 유지한다.
- 관련 architecture: `../architecture/gate-3-architecture.md`

### Gate 4. Editing

- editable predicate, built-in editors, custom editor hooks, edit lifecycle, blur policy, edit policy를 구현했다.
- reserved editing props의 실제 동작 여부는 남은 작업에서 재검토한다.
- 관련 architecture: `../architecture/gate-4-architecture.md`, `../architecture/gate-4-1-editing-policy-architecture.md`, `../architecture/gate-4-2-clipboard-paste-architecture.md`

### Gate 5. Pinning, Sizing, Reorder

- column pinning, sizing, same-zone reorder, pinned z-index layering을 구현했다.
- 관련 architecture: `../architecture/gate-5-architecture.md`

### Gate 6. Filtering, Footer, Pagination, Dirty State

- column/global filtering, footer, pagination, dirty state, data ownership MVP를 구현했다.
- advanced filter operators and typed filter editors는 남은 작업으로 유지한다.
- 관련 architecture: `../architecture/gate-6-architecture.md`

### Gate 7. Virtualization

- row virtualization, scroll restore, range auto-scroll, scroll-seeking placeholder, dynamic row measurement를 구현했다.
- column virtualization과 browser visual regression은 남은 작업으로 유지한다.
- 관련 architecture: `../architecture/gate-7-architecture.md`, `../architecture/gate-7-2-architecture.md`

### Gate 8.1-8.5. Boundary, Detail, Tree

- multi-grid boundary ownership, master-detail, nested grid composition, dynamic row height, tree row model을 구현했다.
- tree + master-detail combination, async tree loading, flat parentId adapter는 남은 작업으로 유지한다.
- 관련 architecture: `../architecture/gate-8-1-architecture.md`, `../architecture/gate-8-2-master-detail-architecture.md`, `../architecture/gate-8-3-nested-grid-composition-architecture.md`, `../architecture/gate-8-4-dynamic-row-height-architecture.md`, `../architecture/gate-8-5-tree-row-model-architecture.md`

### Gate 8.6. Span, Header Group, Validation, Visual Row Merge

- body column span, grouped header rendering, validation marker, visual row merge를 구현했다.
- visual row merge의 pinned sticky label, custom comparison, non-virtual continuation은 남은 작업으로 유지한다.
- 관련 architecture: `../architecture/gate-8-6-merge-span-validation-architecture.md`, `../architecture/gate-8-6-d-visual-row-merge-architecture.md`

### Gate 8.7. System Columns And Current Row

- row number, row selection, row status system columns를 구현했다.
- current row highlight를 active cell row 기반으로 구현했다.
- controlled current row API는 남은 작업으로 유지한다.
- 관련 architecture: `../architecture/gate-8-7-system-columns-architecture.md`, `../architecture/gate-8-7-a-current-row-highlight-architecture.md`

## 결정 요약

### Gate 4.2 Paste

- Plain-text paste는 active cell 기준으로 적용한다.
- accepted paste cell은 `onCellValueChange`를 재사용한다.
- GenDataGrid는 controlled `data`를 직접 mutation하지 않는다.
- paste error는 `pasteOptions.errorMode`, `failureBehavior`, `onError`로 보고한다.
- multi-cell selected range paste policy는 남은 작업으로 유지한다.

### Gate 6.1 Data Ownership

- `filterMode: 'manual'`은 local filtering을 비활성화하고 소비자 data를 그대로 렌더링한다.
- `paginationMode: 'manual'`은 현재 `data`를 현재 page로 보고, `totalRowCount`로 page count를 계산한다.
- `deleteRowsBehavior: 'mark'`는 row를 deleted marker로 숨긴다.
- `deleteRowsBehavior: 'removeUncontrolled'`는 uncontrolled data에서 row를 제거한다.
- controlled `data`는 항상 consumer-owned로 유지한다.
- `dataVersion` 변경은 dirty/deleted baseline reset 신호로 사용한다.
