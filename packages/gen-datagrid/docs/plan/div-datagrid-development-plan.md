# GenDataGrid div 기반 개발 계획

## 1. 목적

`gen-datagrid`는 기존 `gen-grid`의 기능과 경험을 바탕으로 하되, 렌더링 계층을 `table` 태그가 아닌 `div` 기반 DataGrid 구조로 새로 설계한다.

핵심 목표는 다음과 같다.

- `TanStack Table`의 row/column model, sorting, filtering, sizing, pinning 상태 모델은 활용한다.
- DOM 렌더링은 `div role="grid"` 기반으로 구성한다.
- 셀 선택, 편집, range selection, context menu, keyboard navigation을 grid instance 단위로 안전하게 처리한다.
- 향후 `grid in grid`, master-detail, tree/detail panel, virtualization 확장에 적합한 구조를 만든다.
- 기존 `gen-grid`의 문제였던 table DOM 의존, selector 분산, renderer 중복, layout 과밀을 초기 구조에서 분리한다.

## 2. 기존 gen-grid에서 가져갈 것과 버릴 것

### 유지할 개념

- TanStack 기반 column/row state
- column sizing, column visibility, column order, column pinning
- active cell, range selection, clipboard copy/paste
- editable cell, custom editor, editor factory
- row number, row selection, row status
- filtering popover, semantic display, display scale
- dirty state, imperative handle
- tree row model의 데이터 모델 개념

### 재설계할 것

- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<th>`, `<colgroup>` 기반 렌더링
- `td[data-rowid][data-colid]` selector
- global `document.querySelector` 기반 cell focus
- `GenGridBody`와 `GenGridVirtualBody`의 중복 렌더링 로직
- `components/layout`에 집중된 거대 파일 구조
- native `colSpan`, `rowSpan` 의존
- table flow 기반 spacer row virtualization

### 초기에는 제외하거나 제한할 기능

- real `rowSpan`: div 기반에서는 native rowSpan이 없으므로 초기에는 `visual merge`만 지원한다.
- 복잡한 grouped header span: CSS grid span으로 재정의한 뒤 단계적으로 지원한다.
- tree + row merge 동시 지원: 초기에는 별도 조합으로 검증한다.
- nested grid range selection 연동: grid boundary 설계 후 단계적으로 확장한다.

## 3. 기본 DOM 구조

```tsx
<div
  role="grid"
  data-gen-datagrid-root="true"
  data-grid-id={gridId}
  tabIndex={0}
>
  <div role="rowgroup" data-gen-datagrid-header="true">
    <div role="row" data-row-index={0}>
      <div
        role="columnheader"
        data-gen-datagrid-cell="true"
        data-cell-kind="header"
        data-colid={columnId}
      />
    </div>
  </div>

  <div role="rowgroup" data-gen-datagrid-body="true">
    <div role="row" data-rowid={rowId} data-row-index={rowIndex}>
      <div
        role="gridcell"
        data-gen-datagrid-cell="true"
        data-cell-kind="body"
        data-rowid={rowId}
        data-colid={columnId}
      />
    </div>
  </div>
</div>
```

필수 DOM 계약:

- 모든 grid root는 `data-gen-datagrid-root="true"`와 고유 `data-grid-id`를 가진다.
- 모든 셀은 `data-gen-datagrid-cell="true"`를 가진다.
- body cell은 `data-rowid`, `data-colid`를 가진다.
- 이벤트 처리 시 `closest('[data-gen-datagrid-root]')`가 현재 root인지 확인한다.
- nested grid 이벤트는 부모 grid가 소비하지 않도록 root boundary에서 차단한다.

## 4. 권장 프로젝트 구조

```txt
src/
  index.ts
  index.css
  GenDataGrid.tsx
  GenDataGrid.types.ts

  core/
    table/
      useDataGridTable.ts
      tanstack-table.ts
    context/
      DataGridProvider.tsx
    dom/
      cellDom.ts
      gridDom.ts
      selectors.ts
    state/
      activeCell.ts
      selection.ts

  renderers/
    div-grid/
      DataGridRoot.tsx
      DataGridHeader.tsx
      DataGridBody.tsx
      DataGridVirtualBody.tsx
      DataGridRow.tsx
      DataGridCell.tsx
      DataGridFooterRow.tsx
      DataGridFooterBar.tsx
      gridTemplate.ts
      divGrid.module.css
    overlays/
      SelectionOverlay.tsx
      EditorOverlay.tsx
      ContextMenu.tsx

  features/
    active-cell/
      useActiveCellNavigation.ts
    range-selection/
      useRangeSelection.ts
      clipboard.ts
    editing/
      useCellEditing.ts
      editors/
        PopupEditor.tsx
        ModalEditor.tsx
        MonthEditor.tsx
    filtering/
      filterModel.ts
      DataGridColumnFilter.tsx
    pinning/
      pinningState.ts
    row-number/
      useRowNumberColumn.ts
    row-selection/
      rowSelectionColumn.tsx
    row-status/
      rowStatusColumn.tsx
    tree/
      useTreeRowModel.ts
    dirty/
      useDirtyState.ts
    data/
      useGridData.ts

  columns/
    columnMeta.ts
    columnHelpers.ts
    semanticDisplay.ts
    cellFormat.ts

  types/
    public.ts
    internal.ts
    handle.ts

  validation/
    types.ts
```

구조 원칙:

- `core`는 TanStack adapter, context, DOM contract, 공통 상태를 담당한다.
- `renderers`는 UI 렌더링만 담당한다.
- `features`는 가능한 한 headless hook으로 유지한다.
- public type은 `components`나 `renderers`에서 export하지 않는다.
- `stories`는 패키지 `src` 밖에 두거나 빌드 exclude 대상으로 둔다.

## 5. 컬럼 폭과 레이아웃 전략

`table`의 `<colgroup>`을 대체하기 위해 CSS grid template을 사용한다.

```ts
const gridTemplateColumns = visibleColumns
  .map((column) => `${column.getSize()}px`)
  .join(' ');
```

적용 위치:

- header row
- body row
- footer row
- virtual body row

기본 row style:

```tsx
<div
  role="row"
  style={{
    display: 'grid',
    gridTemplateColumns,
  }}
/>
```

컬럼 pinning:

- cell 단위 `position: sticky`
- left pinned: `left: column.getStart('left')`
- right pinned: `right: column.getAfter('right')`
- header/body/footer 모두 같은 pinning utility 사용
- z-index는 header, body pinned, active cell, editor overlay 순서로 계층화한다.

## 6. 이벤트 처리 전략

기존 gen-grid는 셀별 handler 조합이 많다. gen-datagrid는 root-level event delegation을 우선한다.

root에서 처리할 이벤트:

- `onKeyDown`
- `onMouseDown`
- `onMouseMove`
- `onMouseUp`
- `onDoubleClick`
- `onContextMenu`
- `onFocus`

cell에서 직접 처리할 이벤트:

- editor 내부 input/select/contenteditable 이벤트
- column resize handle
- column reorder drag handle
- tree expand button
- checkbox selection

이벤트 처리 규칙:

- target에서 가장 가까운 `data-gen-datagrid-root`가 현재 grid root가 아니면 무시한다.
- target에서 가장 가까운 `data-gen-datagrid-cell`을 찾아 row/column coord를 해석한다.
- editor, button, input, select, textarea, contenteditable 내부 이벤트는 grid navigation이 소비하지 않는다.
- nested grid는 독립 root로 취급한다.

## 7. 접근성 전략

div 기반이므로 ARIA를 명시한다.

- root: `role="grid"`
- header/body/footer group: `role="rowgroup"`
- row: `role="row"`
- header cell: `role="columnheader"`
- body cell: `role="gridcell"`
- selected cell/range: `aria-selected`
- active cell: roving `tabIndex` 또는 `aria-activedescendant`

초기 권장 방식은 roving `tabIndex`이다.

- active cell만 `tabIndex={0}`
- 나머지 셀은 `tabIndex={-1}`
- root keydown에서 active cell state를 이동한다.
- focus는 scoped DOM utility로 처리한다.

## 8. 가상화 전략

초기에는 row virtualization만 지원한다.

방식:

- `@tanstack/react-virtual` 유지
- scroll container는 grid root 내부 body viewport
- virtual item은 absolute positioning 또는 padding top/bottom block으로 배치
- table spacer row 방식은 사용하지 않는다.

권장 구조:

```tsx
<div data-gen-datagrid-body-viewport>
  <div style={{ height: totalSize, position: 'relative' }}>
    {virtualItems.map((item) => (
      <div
        role="row"
        style={{
          position: 'absolute',
          transform: `translateY(${item.start}px)`,
          height: item.size,
          display: 'grid',
          gridTemplateColumns,
        }}
      />
    ))}
  </div>
</div>
```

주의사항:

- `enableVirtualization !== true` 상태의 per-row height는 `getRowHeight`로 MVP에서 지원할 수 있다.
- `enableVirtualization === true` 상태의 dynamic row measurement는 별도 phase에서 지원한다.
- master-detail row는 virtualization measure 재계산이 필요하다.
- row merge와 virtualization은 초기에는 조합하지 않는다.

## 9. Span과 merge 전략

### column span

CSS grid의 `grid-column: span n`으로 구현한다.

제약:

- pinned zone을 넘는 span은 허용하지 않는다.
- system column은 span 대상에서 제외한다.
- span으로 덮인 셀은 DOM에서 렌더하지 않거나 hidden placeholder로 유지한다.

### row span

초기에는 native rowSpan이 없으므로 `visual merge`만 지원한다.

방식:

- 모든 row/cell DOM은 유지한다.
- covered cell은 content를 숨긴다.
- anchor cell과 covered cell의 border/background를 조정해 병합처럼 보이게 한다.
- keyboard navigation은 실제 셀 단위로 유지한다.

향후 real merge가 필요하면 CSS grid row span 또는 overlay cell 방식으로 별도 검토한다.

## 10. grid in grid 전략

gen-datagrid는 nested grid를 전제로 root boundary를 설계한다.

필수 조건:

- 각 grid는 독립 `gridId`를 가진다.
- 부모 grid event handler는 target root가 자신일 때만 동작한다.
- clipboard/range selection/context menu는 현재 focused grid instance만 처리한다.
- nested grid가 열릴 때 부모 virtualizer는 row height를 재측정한다.
- nested grid 내부 cell selector는 부모 grid selector에 잡히지 않는다.

권장 API:

```ts
type GenDataGridProps<TData> = {
  getGridId?: () => string;
  renderDetailPanel?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => React.ReactNode;
};
```

## 11. 개발 단계

단계별 구현 규칙:

- 각 phase 또는 gate가 구조를 바꾸면 해당 gate architecture 문서를 작성하거나 갱신한다.
- architecture 문서 파일명은 `gate-{n}-architecture.md` 또는 여러 gate를 함께 다루는 경우 `gate-{start}-{end}-architecture.md` 형식을 사용한다.
- architecture 문서에는 component relationship, render/data flow, interaction/event flow, 구현된 state/API surface, deferred feature를 포함한다.
- architecture 문서와 `mvp-test-gates.md`의 Status가 어긋나면 gate를 통과한 것으로 보지 않는다.

### Phase 0. 패키지 골격

- `package.json`, `tsconfig.json`, `vite.config.ts`, `src/index.ts` 구성
- public type 위치 확정
- Storybook 또는 demo 연결 방식 결정
- `docs`와 `src` 분리

완료 기준:

- 패키지 build 가능
- `GenDataGrid` 빈 컴포넌트 export 가능

### Phase 1. Core table adapter

- `useDataGridTable` 작성
- TanStack module augmentation 정리
- column helpers와 column meta 타입 분리
- row id, column id, visible columns, sizing state 정규화

완료 기준:

- data/columns를 받아 row model과 column model 생성
- column sizing/visibility/order 기본 동작 가능

### Phase 2. Div renderer 기본

- `DataGridRoot`, `DataGridHeader`, `DataGridBody`, `DataGridRow`, `DataGridCell` 구현
- CSS grid template 기반 column width 적용
- active cell 표시
- empty state 처리

완료 기준:

- table 태그 없이 header/body 렌더링
- column width가 header/body에 일관 적용
- 기본 스크롤 동작 확인

### Phase 3. DOM contract와 keyboard navigation

- `selectors.ts`, `cellDom.ts`, `gridDom.ts` 작성
- scoped focus/scroll utility 구현
- roving tabIndex 기반 keyboard navigation 구현
- multiple grid와 nested grid boundary 테스트

완료 기준:

- arrow/home/end/page navigation 가능
- 같은 화면의 여러 grid가 서로 간섭하지 않음

### Phase 4. Selection과 clipboard

- range selection hook 이식
- root-level mouse delegation 적용
- copy/copy with header 구현
- paste parsing helper는 유지하되 paste application은 data mutation/editing policy 이후로 deferred
- selected range overlay 또는 cell style 적용

완료 기준:

- drag range selection 가능
- keyboard copy 가능
- paste application deferred 상태가 문서화됨
- editor 내부 이벤트와 충돌하지 않음

### Phase 5. Editing

- `useCellEditing` 이식 및 DOM selector 추상화
- default editors 구현
- custom `renderEditor`, `editorFactory` 지원
- editor overlay와 inline editor 정책 정리

완료 기준:

- Enter/F2/double click/active-cell-reclick 지원
- `editOnActiveCell`은 reserved public prop으로 유지하고 navigation-editing policy slice까지 runtime warning 처리
- Tab/Shift+Tab 편집 이동 지원
- blur/commit/cancel 정책 명확화

### Phase 6. Pinning, resizing, reorder

- sticky pinned cell 구현
- column resize handle 구현
- column reorder drag/drop 구현
- header/body/footer z-index 정리

완료 기준:

- left/right pinned column 정상 표시
- resize 시 header/body/footer 폭 동기화
- reorder 시 pinning zone 규칙 유지

### Phase 7. Filtering, footer, pagination

- Keep the filter boundary in `features/filtering`. The MVP UI is a string-input popover, while `filterModel.ts` reserves structured values for future operators, typed editors, and multi-condition filters.

- filter popover 이식
- footer row 구현
- pagination 구현
- global filter/column filter 상태 연결

완료 기준:

- 기존 gen-grid의 기본 필터 UX 재현
- footer row와 sticky footer 옵션 동작

### Phase 8. Virtualization
- row virtualization 구현
- active cell scroll into view 보정
- pinned column과 virtualization 조합 검증
- dynamic height는 별도 backlog로 분리

#### Phase 8.1 Scroll-seeking follow-up

- Problem:
  - Fast scrollbar thumb drags across hundreds of pages can briefly leave the body visually empty while heavy cell content catches up.
  - Increasing `overscan` helps nearby scrolling, but does not materially solve large jump rendering gaps.
- Design:
  - Keep the current row virtualizer and fixed-height row model.
  - Add an `isScrolling`-based lightweight row path in `DataGridVirtualBody.tsx`.
  - While the virtualizer is actively scrolling, render simplified placeholder rows for non-active and non-editing rows.
  - Keep the active row and editing row on the full `DataGridBodyRow` path so focus restore, keyboard navigation, and edit state remain stable.
  - Placeholder rows must preserve:
    - the same `gridTemplateColumns`
    - the same row height
    - the same pinned-column sticky offsets
    - the same absolute row positioning in the virtual body
- Scope:
  - This is a rendering-performance fallback only.
  - It does not change the selection model, active-cell contract, or virtual row measurement contract.
- QA:
  - Verify that rapid thumb drag no longer shows a blank body region.
  - Verify that active-cell movement, editing, pinned columns, and focus restore behave the same after scrolling settles.

완료 기준:

- 대량 row 렌더링 성능 확보
- keyboard navigation 중 virtual row focus 정상

### Phase 9. Advanced features
#### Gate 3.1 Keyboard and selection follow-up

- `Shift + Arrow` range selection
- keyboard navigation anchor/focus policy alignment with mouse selection
- `scrollToCell(coord)` imperative handle

#### Gate 4.1 Editing policy follow-up

Editor 구현 계약 요약: [`editor-implementation-contract.md`](../reference/editor-implementation-contract.md)

- Gate 4.1-a printable-key edit entry
  - initial draft replacement policy
  - IME-safe entry guard
- Gate 4.1-b edit entry and opening policy
  - `editPolicy` public API with grid default and column override
  - `startTriggers`
    - `reclick: true`
    - `doubleClick: true`
    - `enter: true`
    - `f2: true`
    - `printableKey: true`
  - `continueTriggers`
    - `click: false`
    - `tab: true`
    - `arrowKey: false`
  - `openOnEditStart: false` default with grid-level and column-level override
  - previous editing cell defaults to `commit` before continuation movement
  - non-editable destination cell moves `activeCell` only
  - keep `openOnEditStart` as boolean in this slice; trigger-specific open rules deferred
  - implementation order
    - add public type and column meta support
    - resolve merged edit policy
    - apply start triggers
    - apply continuation triggers
    - propagate `openOnEditStart`
    - add Storybook and interaction coverage
  - status
    - complete
    - verified by Storybook manual testing and package interaction tests
    - native browser `select` immediate-open remains best-effort and may require a custom popup editor later
- Gate 4.1-c navigation while editing
  - built-in editor navigation policy refinement
  - `text` / `number` / `date`
    - Arrow: grid navigation
    - `Tab`: commit and move
    - `Enter`: commit
    - `Escape`: cancel
  - `textarea`
    - Arrow: editor-local caret movement
    - `Tab`: commit and move
    - `Enter`: newline
    - `Escape`: cancel
  - `select`
    - Arrow: editor-first ownership
    - `Tab`: commit and move
    - `Enter`: confirm / commit
    - `Escape`: native close / cancel path
  - `checkbox`
    - Arrow: grid navigation
    - `Tab`: commit and move
    - `Enter`: current built-in toggle / commit contract
    - `Escape`: cancel
  - popup/custom editor navigation policy remains deferred until popup editor infrastructure exists
  - status
    - complete
    - verified by Storybook manual testing and package interaction/unit tests
- Gate 4.1-d advanced blur and portal policy
  - inline blur commit
  - portal-safe blur ignore
  - modal-owned edit lifecycle
  - native date editor stays manual-visual verification; custom datepicker policy can be automated separately
  - status
    - complete
    - verified by Storybook manual testing and package interaction/unit tests
- Gate 4.2 Clipboard and mutation follow-up

- clipboard paste application into editable cells
  - status
    - complete (MVP)
    - plain-text paste from active cell; `Gate42ClipboardPaste`; interaction/unit tests
- paste-to-selection policy for multi-cell ranges
  - deferred
- dirty-state integration for pasted values
  - complete via `enableDirtyState` + `onCellValueChange`

#### Gate 6.1 Filtering, pagination, and data ownership follow-up

- decision document: `gate-6-1-data-ownership-decisions.md`
- manual/server filtering contract
- manual/server pagination totals
- page-size selector
- delete-row data mutation
- dirty baseline integration with `dataVersion`
- status
  - complete (MVP)
  - `filterMode`, `paginationMode`, `totalRowCount`, `pageSizeOptions`, `deleteRowsBehavior`, and `dataVersion` implemented
  - verified by package interaction tests and `Gate61ManualFilteringPaginationDataOwnership` Storybook scenario

#### Gate 7.1 Virtualization extension follow-up

- auto-scroll while drag range selection crosses beyond the current viewport
- selection overlay for pinned/virtualized layouts
- dynamic row measurement while virtualization is enabled
- column virtualization
- browser screenshot automation for large-row scenarios

#### Gate 8.1 Multi-grid Boundary And Ownership

- same-page multi-grid focus ownership
- parent/child grid keyboard event isolation
- parent/child range selection isolation
- focused-grid clipboard ownership
- context menu ownership boundary
- scoped DOM lookup regression coverage

#### Gate 8.2 Master-detail Row

- status
  - complete (MVP)
  - non-virtualized fixed-height master-detail row implemented
  - controlled/uncontrolled `expandedRows` contract implemented
  - explicit first-cell expand/collapse button implemented
  - detail row DOM markers and parent row relationship marker implemented
  - detail panel mouse/key event boundary implemented
  - virtualization and dynamic height remain deferred
- verified by
  - `pnpm -C frontend/packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C frontend/packages/gen-datagrid test:interaction`
  - `Gate82MasterDetailRow` Storybook manual scenario
#### Gate 8.3 Nested Grid Composition

- status
  - complete (MVP)
  - nested `GenDataGrid` inside `renderDetailPanel` implemented as official composition scenario
  - parent and child active cell independence verified
  - parent and child selected range independence verified
  - child grid keyboard navigation does not move parent grid
  - child grid copy/paste does not affect parent grid
  - child grid editing lifecycle stays scoped to child grid
  - parent ownership returns after clicking a parent data cell
  - `Gate83NestedGridComposition` Storybook scenario added
- out of scope
  - dynamic detail height measurement
  - parent virtualization + expanded detail row integration
  - parent-child relation data loading API
  - tree row model
  - row merge/span
- architecture
  - `../architecture/gate-8-3-nested-grid-composition-architecture.md`
- verified by
  - `pnpm -C frontend/packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C frontend/packages/gen-datagrid test:interaction`
#### Gate 8.4 Dynamic Row Height

- status
  - complete (MVP)
  - dynamic row measurement model for virtualized body rows implemented
  - `getRowHeight` reused as virtualized estimate/base height
  - master-detail rendering while `enableVirtualization` is true implemented
  - expanded detail panel height included in virtual item estimate and measurement
  - virtualization offset recalculation after expand/collapse supported through measured composite items
  - `scrollToCell` and active-cell focus restore keep using row id/index with measured virtualizer scroll
  - range selection remains row-id based around expanded/measured rows
  - `Gate84DynamicRowHeight` Storybook scenario added
- model
  - data row and detail panel are rendered inside one composite virtual item
  - detail row is not inserted into `rowIds` or keyboard navigation order
- out of scope
  - column virtualization
  - tree row model
  - row merge/span
  - grouped header span
  - cross-grid selection
  - detail panel lazy loading API
- architecture
  - `../architecture/gate-8-4-dynamic-row-height-architecture.md`
- verified by
  - `pnpm -C frontend/packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C frontend/packages/gen-datagrid test:interaction`
#### Gate 8.5 Tree Row Model

- status
  - complete (MVP)
  - tree row model implemented
- scope
  - nested data tree row model through `getSubRows`
  - controlled/uncontrolled tree expansion state
  - first visible cell tree indent and expand/collapse toggle
  - mouse expand/collapse policy
  - ArrowLeft/ArrowRight keyboard expand/collapse policy
  - active cell, editing cell, selected range cleanup when children collapse
  - visible flattened row model integration with range selection, clipboard, paste, editing, and virtualization
  - client filtering and pagination policy for tree rows
- recommended API
  - `enableTreeRows`
  - `getSubRows`
  - `treeExpandedRows`
  - `defaultTreeExpandedRows`
  - `onTreeExpandedRowsChange`
  - `getRowCanExpandTree`
  - `treeIndentWidth`
- decisions
  - do not reuse master-detail `expandedRows` for tree expansion
  - use nested data + `getSubRows` for MVP, not flat parentId adapter
  - keep tree + master-detail combination out of Gate 8.5 MVP
  - client pagination works on visible expanded rows
  - collapse cleanup moves active child cell to the collapsing parent row in the same column
- out of scope
  - async/lazy child loading API
  - flat parentId data adapter
  - tree + master-detail combined rendering
  - tree drag/drop reorder
  - `treeToggleColumnId` style API for pinning the tree toggle to a specific column
  - `treeCollapseBehavior` style API for resetting descendant expansion state on parent collapse
  - 	reeToggleColumnId style API for pinning the tree toggle to a specific column
  - 	reeCollapseBehavior style API for resetting descendant expansion state on parent collapse
  - row merge/span integration
  - server-side tree filtering semantics
- architecture
  - `../architecture/gate-8-5-tree-row-model-architecture.md`
- planned verification
  - `pnpm -C frontend/packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C frontend/packages/gen-datagrid test:interaction`
  - `Gate85TreeRows` Storybook manual scenario

#### Gate 8.6 Merge, Span, And Validation UI

- visual row merge
- grouped header span
- validation UI
- incompatible feature warning or disabled-state policy

완료 기준:

- 각 기능이 독립 flag로 동작
- 조합 불가능한 기능은 명시적으로 경고 또는 비활성화

## 12. 테스트 전략

### 단위 테스트 대상

- column template 계산
- selector/root boundary
- active cell 이동
- range bounds 계산
- clipboard matrix 변환
- row merge model
- pinning offset 계산

### 통합 테스트 대상

- keyboard navigation
- edit commit/cancel
- range selection drag
- copy/paste
- column resize/reorder
- filtering
- virtualization scroll
- nested grid event isolation

### 시각 회귀 대상

- pinned column shadow
- active cell outline
- selected range
- editor overlay
- sticky header/footer
- empty state
- nested grid detail panel

## 13. 주요 리스크와 대응

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| table native span 제거 | header/body merge 기능 재구현 필요 | CSS grid span과 visual merge 우선 |
| selector 충돌 | 다중 grid/nested grid 오동작 | gridId와 scoped root selector 필수화 |
| 이벤트 위임 복잡도 | 편집기와 navigation 충돌 | interactive target guard 표준화 |
| virtualization + dynamic row | row height 불일치 | non-virtualized `getRowHeight`는 MVP에서 허용하고, virtualized dynamic measurement/detail panel은 별도 phase로 분리 |
| pinning z-index | header/body/editor 겹침 문제 | z-index token 계층 정의 |
| public type 위치 혼선 | API 안정성 저하 | `types/public.ts` 중심 export |

## 14. 초기 API 초안

```ts
type GenDataGridProps<TData> = {
  data?: TData[];
  defaultData?: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId?: (row: TData, index: number) => string;

  height?: number | string;
  rowHeight?: number;
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;
  headerHeight?: number;

  enableVirtualization?: boolean;
  enableColumnSizing?: boolean;
  enableColumnReorder?: boolean;
  enablePinning?: boolean;
  enableFiltering?: boolean;
  enableRangeSelection?: boolean;
  enableEditing?: boolean;

  activeCell?: { rowId: string; columnId: string } | null;
  onActiveCellChange?: (cell: { rowId: string; columnId: string } | null) => void;

  renderDetailPanel?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => React.ReactNode;
};
```

## 15. 우선순위 결론

가장 먼저 구현할 것은 기능이 아니라 구조이다.

1. public type과 core table adapter를 renderer에서 분리한다.
2. `data-gen-datagrid-root`, `data-gen-datagrid-cell` 기반 DOM contract를 확정한다.
3. div renderer를 최소 기능으로 구현한다.
4. active cell, keyboard navigation, scoped focus를 먼저 안정화한다.
5. selection, editing, pinning, virtualization을 순서대로 붙인다.

이 순서를 지켜야 기존 `gen-grid`의 table 의존과 거대 layout 파일 구조가 새 패키지에 반복되지 않는다.

## Gate 6 Completion Note

The active gate sequence uses `mvp-test-gates.md` as the source of truth. Gate 6 is complete for filtering, footer, pagination, and dirty state. The filter UI remains an MVP string-input popover, but the implementation now keeps the filter boundary in `features/filtering` and reserves a structured filter model for later operators, typed editors, and multi-condition filters. The older phase list in this document still names Phase 6 as pinning/resizing/reorder and Phase 7 as filtering/footer/pagination; that naming is historical. Current next work is Gate 7 Virtualization.
