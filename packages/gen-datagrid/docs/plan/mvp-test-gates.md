# GenDataGrid MVP Test Gates

용어 기준: Active Cell, Selected Cell, Editing Cell, Editable Cell, Range Selection 등 공통 용어는 `../reference/terminology.md`를 따른다.

Cell Edit API 기준: editing public props, column meta, editor context, implemented/deferred 상태는 `../reference/cell-edit-api.md`를 따른다.

## 1. 목적

이 문서는 `gen-datagrid`를 div 기반 DataGrid로 개발할 때 단계별 통과 기준을 정의한다.

여기서 gate는 배포 단계가 아니라 내부 품질 검증 단위다. 각 gate를 통과하기 전에는 다음 기능을 붙이지 않는다. 목적은 임시 구현을 누적하지 않고, 최종 구조 위에서 기능을 순서대로 완성하는 것이다.

## 2. 공통 원칙

- 모든 gate는 최종 div 기반 구조 위에서 검증한다.
- table renderer fallback은 만들지 않는다.
- 미지원 기능은 임시 분기가 아니라 명시적 에러, 경고, disabled state로 처리한다.
- `data-gen-datagrid-root`, `data-grid-id`, `data-gen-datagrid-cell` DOM 계약은 Gate 1부터 고정한다.
- 같은 화면에 여러 grid가 있어도 이벤트, focus, selection, clipboard가 섞이면 gate 실패다.
- 자동 테스트가 어려운 시각 요소는 Storybook 또는 demo 시나리오로 수동 확인 항목을 둔다.

## 3. Gate 0. Package Baseline

### 목표

패키지가 독립적으로 빌드 가능한 최소 상태를 만든다.

### 구현 범위

- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/index.ts`
- `src/GenDataGrid.tsx`
- `src/GenDataGrid.types.ts`
- `src/index.css`

### 통과 기준

- `@gen-office/gen-datagrid` 패키지가 workspace에서 인식된다.
- `GenDataGrid` 컴포넌트가 public export 된다.
- CSS export 경로가 정의된다.
- stories/demo 파일은 package runtime entry에 포함되지 않는다.

### 자동 테스트

- `pnpm -C frontend/packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
- `pnpm -C frontend/packages/gen-datagrid build`

### 실패 조건

- public export가 `renderers` 내부 파일에 직접 의존한다.
- stories가 package build artifact에 섞인다.
- `src` 안에 실험용 파일이 runtime entry에서 import된다.

## 4. Gate 1. Div Renderer Contract

Status: complete for Gate 3 entry. The div renderer contract is fixed around root/header/body/cell data attributes, table tags are blocked by baseline tests, and header/body layout uses a shared TanStack visible column model. Non-virtualized `getRowHeight` is implemented. A baseline Storybook page exists for visual checks. Architecture is documented in `../architecture/gate-1-2-architecture.md`.

### 목표

table 태그 없이 기본 grid DOM과 column layout을 렌더링한다.

### 구현 범위

- `core/dom/selectors.ts`
- `core/dom/gridDom.ts`
- `renderers/div-grid/DataGridRoot.tsx`
- `renderers/div-grid/DataGridHeader.tsx`
- `renderers/div-grid/DataGridBody.tsx`
- `renderers/div-grid/DataGridRow.tsx`
- `renderers/div-grid/DataGridCell.tsx`
- `renderers/div-grid/gridTemplate.ts`

### 통과 기준

- rendered DOM에 `table`, `thead`, `tbody`, `tfoot`, `tr`, `td`, `th`, `colgroup`가 없다.
- root는 `role="grid"`와 `data-gen-datagrid-root="true"`를 가진다.
- row는 `role="row"`를 가진다.
- header cell은 `role="columnheader"`를 가진다.
- body cell은 `role="gridcell"`을 가진다.
- 모든 body cell은 `data-rowid`, `data-colid`, `data-gen-datagrid-cell="true"`를 가진다.
- header/body/footer는 같은 `grid-template-columns` source를 사용한다.
- `enableVirtualization !== true` 상태에서 `getRowHeight`가 row별 height를 반영한다.
- horizontal scroll과 vertical scroll이 기본 동작한다.

### 자동 테스트

- DOM role query 테스트
- 금지 태그 미사용 테스트
- `grid-template-columns` snapshot 테스트
- visible column count와 rendered cell count 일치 테스트

### 수동/시각 테스트

- 10 rows x 10 columns 렌더링
- 긴 텍스트 ellipsis
- empty state 표시
- column width 변경 시 header/body 정렬
- row별 height가 다른 경우 cell 높이가 row 높이를 따른다.

### 실패 조건

- 셀 조회가 `document.querySelector`로 전역 검색된다.
- row/cell DOM contract가 feature 구현마다 다르게 사용된다.
- column width source가 header/body에 따로 존재한다.

## 5. Gate 2. Scoped Focus And Keyboard Navigation

Status: complete for Gate 3 entry. Active cell state, roving `tabIndex`, root-scoped DOM helpers, and keyboard navigation handlers are implemented. Baseline tests cover controlled active cell rendering and root-scoped lookup rules. Vitest/jsdom interaction tests cover arrow key movement, multiple grid isolation, and interactive descendant keydown bypass. Browser-level visual/real viewport automation remains deferred until Playwright or Storybook test runner is introduced.

### 목표

grid instance 범위 안에서 active cell과 keyboard navigation을 안정화한다.

### 구현 범위

- `features/active-cell/useActiveCellNavigation.ts`
- `core/dom/cellDom.ts`
- `core/state/activeCell.ts`
- roving `tabIndex`

### 통과 기준

- active cell 하나만 `tabIndex={0}`이다.
- inactive cell은 `tabIndex={-1}`이다.
- ArrowUp/Down/Left/Right 이동이 가능하다.
- Home/End 이동이 가능하다.
- PageUp/PageDown 이동이 가능하다.
- active cell이 viewport 밖으로 이동하면 scroll into view가 동작한다.
- 같은 화면의 두 grid가 서로 다른 active cell을 유지한다.
- nested grid 내부 keydown이 부모 grid active cell을 변경하지 않는다.

### 자동 테스트

- keyboard event navigation 테스트
- `data-grid-id` scoped focus 테스트
- multiple grid isolation 테스트
- scroll into view 계산 단위 테스트

### 수동/시각 테스트

- 키보드로 끝 행/끝 열까지 이동
- pinned column이 없는 상태에서 horizontal scroll 보정
- grid 밖으로 focus 이동 후 재진입

### 실패 조건

- active cell focus가 다른 grid cell로 이동한다.
- selector가 `rowid/colid`만으로 cell을 찾는다.
- nested grid keydown이 부모 grid에 버블되어 부모 active cell이 바뀐다.

## 6. Gate 3. Selection And Clipboard

Status: complete for Gate 4 entry. Range selection is implemented with root-level mouse delegation, controlled/uncontrolled selected ranges, selected cell DOM markers, interactive descendant guard, Shift extension, Ctrl/Meta additive selection, selection clear, imperative `clearSelection()`, imperative `copySelection(options)`, and Vitest/jsdom interaction coverage. Clipboard copy is implemented for `Ctrl/Cmd+C`, with `Shift+Ctrl/Cmd+C` including headers. Plain-text paste application is implemented in Gate 4.2 through root-level `paste` events and `pasteOptions`. Paste-to-selection and type coercion remain deferred.

### 목표

range selection과 clipboard 동작을 root-level event delegation 위에서 구현한다.

### 구현 범위

- `features/range-selection/useRangeSelection.ts`
- `features/range-selection/clipboard.ts`
- `features/range-selection/useClipboardActions.ts`
- selected range style 또는 overlay

### 통과 기준

- mouse drag로 range selection이 가능하다.
- Shift selection이 가능하다.
- Ctrl/Meta additive selection이 가능하다.
- `Ctrl/Cmd + C` copy가 가능하다.
- header 포함 copy가 가능하다.
- plain-text paste application (Gate 4.2 MVP)
- editor 내부 paste bypass
- paste-to-selection, type coercion, row creation은 deferred
- editor 내부 input/select/contenteditable 클릭은 range selection을 시작하지 않는다.
- multiple grid 상황에서 focused grid만 clipboard action을 처리한다.

### 자동 테스트

- range bounds 계산 테스트
- copy matrix 변환 테스트
- paste text parsing helper 테스트
- focused grid clipboard ownership 테스트

### 수동/시각 테스트

- drag selection 표시
- pinned column 포함 selection
- 빈 셀 포함 copy
- plain-text paste apply (`Gate42ClipboardPaste`)
- non-editable skip / `cancelPaste` error reporting

### 실패 조건

- 부모 grid가 nested grid selection을 시작한다.
- clipboard가 active/focused grid가 아닌 grid data를 읽는다.
- editor 입력 중 copy가 grid action으로 가로채진다.

## 7. Gate 4. Editing

Status: complete for Gate 5 entry. Gate 4 defines the public editing API, TanStack column meta surface, editable cell predicate model, internal cell editing state, shared `GenDataGridEditorContext`, default editor rendering, custom `renderEditor`/`editorFactory` rendering, `editSelectOnFocus`, `editCommitOnBlur`, Enter/F2/double-click/active-cell-reclick edit entry, Escape cancel, Enter/blur commit, and Tab/Shift+Tab navigation through `onCellValueChange`. Gate 4.1 editing policy and Gate 4.2 plain-text paste are implemented. Editable cells render `data-editable-cell="true"` and active editors render `data-editing-cell="true"`. `editOnActiveCell` and `keepEditingOnNavigate` remain reserved public props with runtime warnings. Grid-internal data mutation remains deferred.

### 목표

셀 편집 진입, commit, cancel, navigation 연동을 안정화한다.

### 구현 범위

- `features/editing/useCellEditing.ts`
- default text/number/date/select/checkbox editor
- `editorFactory`
- column `renderEditor`
- edit state와 active cell state 연동

### 통과 기준

- Enter로 편집 진입 가능
- F2로 편집 진입 가능
- double click으로 편집 진입 가능
- printable key 입력으로 편집 시작 가능
- Escape cancel 가능
- blur commit 가능
- Enter commit 가능
- Tab/Shift+Tab으로 다음/이전 editable cell 이동 가능
- custom editor가 commit/cancel/apply API를 사용할 수 있다.
- Tab/Shift+Tab이 현재 edit value를 commit하고 다음/이전 editable cell을 active로 이동한다.
- 다른 grid 클릭 시 현재 grid editor가 정책에 맞게 종료된다.

### 자동 테스트

- edit state transition 테스트
- commit/cancel 테스트
- tab navigation editable cell list 테스트
- custom editor callback 테스트
- outside click scoped root 테스트

### 수동/시각 테스트

- inline editor focus ring
- editor overflow/dropdown
- date/select/checkbox editor
- reserved editing policy props warning

### 실패 조건

- editor blur가 다른 grid cell click과 충돌한다.
- editor 내부 키 입력을 grid navigation이 소비한다.
- cancel 후 dirty state가 잘못 남는다.
- active cell과 edit cell이 서로 다른 grid instance를 참조한다.

## 8. Gate 5. Column Pinning, Sizing, Reorder

Status: complete for Gate 6 entry. Gate 5 wires `columnPinning`, `defaultColumnPinning`, and `onColumnPinningChange` through the TanStack adapter, adds shared sticky pinning style calculation, renders pinned header/body DOM markers, exposes resize handles, and supports same-zone header drag reorder. Pinning-zone reorder normalization blocks cross-zone moves. Pinned header/body/editor z-index layers are separated, selected pinned cells keep their selection background, and `Gate5PinningSizingReorder` provides the Storybook visual-check scenario. Manual browser verification guidance is documented in `../qa/gate-5-visual-test-guide.md`.

### 목표

div grid layout에서 column sizing, sticky pinning, reorder를 안정화한다.

### 구현 범위

- `features/pinning/pinningState.ts`
- column size state
- resize handle
- reorder drag handle
- shared pinning style utility

### 통과 기준

- column resize 시 header/body/footer 폭이 동기화된다.
- left pinned column이 horizontal scroll 중 고정된다.
- right pinned column이 horizontal scroll 중 고정된다.
- pinned column shadow가 표시된다.
- active cell outline이 pinned z-index에 가려지지 않는다.
- editor overlay가 pinned cell보다 위에 표시된다.
- reorder는 같은 pinning zone 안에서만 허용된다.
- system column은 reorder 제한 규칙을 따른다.

### 자동 테스트

- grid template 재계산 테스트
- pinned offset 계산 테스트
- reorder normalization 테스트
- pinning zone validation 테스트

### 수동/시각 테스트

- left/right 동시 pinning
- resize 중 scroll
- reorder drag indicator
- pinned + selected range
- pinned + active editor

### 실패 조건

- header/body column boundary가 어긋난다.
- pinned column이 scroll 중 흔들린다.
- reorder 후 pinning state가 column order와 불일치한다.

## 9. Gate 6. Filtering, Footer, Pagination, Dirty State

Status: complete for Gate 7 entry. Gate 6 wires column/global filter state, pagination state, footer rows, external footer rendering, dirty cell/row markers, filter clear handle methods, and dirty-state imperative handle methods. Header filter popovers and the global filter input are intentionally minimal MVP controls. The filter boundary lives in `features/filtering`, with `filterModel.ts` reserving structured values for later operators, typed editors, and multi-condition filters. Manual/server filtering, page-size selection, row deletion mutation, and dataVersion baseline integration remain deferred.

### 목표

MVP 사용에 필요한 데이터 조작 기능을 붙인다.

### 구현 범위

- column filter
- global filter
- filter popover
- footer row
- pagination
- dirty state
- imperative handle

### 통과 기준

- column filter가 row model에 반영된다.
- global filter가 row model에 반영된다.
- filter popover가 header cell 기준으로 열린다.
- footer row가 header/body와 column width를 공유한다.
- pagination state가 controlled/uncontrolled 양쪽에서 동작한다.
- cell update 시 dirty state가 반영된다.
- reset/commit/delete row imperative API가 동작한다.

### 자동 테스트

- filter model 테스트
- controlled/uncontrolled pagination 테스트
- dirty state baseline 테스트
- imperative handle 테스트

### 수동/시각 테스트

- filter popover 위치
- sticky footer row
- dirty cell/row 표시
- pagination control

### 실패 조건

- filtering 후 active cell이 없는 row를 참조한다.
- footer width가 body와 어긋난다.
- dirty baseline reset이 dataVersion과 불일치한다.

## 10. Gate 7. Virtualization

Status: complete for Gate 8 entry. Row virtualization, active-cell scroll restoration, pinned-column virtualization combination, range-selection stability, scroll-seeking placeholder rendering, range auto-scroll, and virtualized dynamic row measurement are implemented. Column virtualization remains deferred.

### 목표

대량 row에서 row virtualization을 안정화한다.

### 구현 범위

- `renderers/div-grid/DataGridVirtualBody.tsx`
- `@tanstack/react-virtual`
- active cell scroll 보정
- fixed row height

### 통과 기준

- 대량 row에서 visible range만 렌더링된다.
- Arrow/Page navigation 중 virtual row로 scroll 이동한다.
- active cell이 virtualized out 되었다가 다시 들어와도 focus가 복구된다.
- pinned columns와 virtualization이 함께 동작한다.
- range selection이 virtualized row boundary에서 깨지지 않는다.
- fixed row height 기준으로 scroll offset이 일관된다.

### 자동 테스트

- virtual item range 테스트
- scroll target 계산 테스트
- active cell restore 테스트
- pinned + virtual layout 계산 테스트

### 수동/시각 테스트

- 10,000 rows 스크롤
- keyboard로 끝 행까지 이동
- pinned left/right + vertical scroll
- selection 후 스크롤

### 실패 조건

- virtual row focus가 사라진다.
- scroll offset이 row index와 불일치한다.
- pinned column z-index가 virtual row와 충돌한다.

## 11. Gate 8. MVP Acceptance

Current status: partial. The core grid, scoped DOM contract, active cell, keyboard navigation, range selection, clipboard, editing, column sizing, pinning, column reorder, filtering, footer, pagination, dirty state, imperative handle, row number, row selection, row status, row virtualization, master-detail, nested grid composition, dynamic row height, tree rows, body column span, and grouped header rendering have implementation coverage. Validation UI marker and visual row merge are still open Gate 8.6 extension slices.

Latest completed implementation slice: Gate 8.7-a Current Row Highlight. Architecture: `../architecture/gate-8-7-a-current-row-highlight-architecture.md`.

### 목표

`gen-grid` 대체 후보로 평가 가능한 MVP를 완성한다.

### 필수 기능

- div renderer
- scoped DOM contract
- active cell
- keyboard navigation
- range selection
- clipboard
- editing
- column sizing
- pinning
- column reorder
- filtering
- footer
- pagination
- dirty state
- imperative handle
- row number
- row selection
- row status
- row virtualization

### Gate 8.7 system column 통과 기준

- `enableRowNumber`가 visible row order 기준 row number system column을 표시한다.
- `enableRowSelection`이 row-id 기반 controlled/uncontrolled row selection state로 동작한다.
- `rowSelectionMode="createdOnly"`가 created row만 선택 가능하게 제한한다.
- `enableRowStatus`가 `rowStatusResolver` 또는 dirty/deleted fallback 기준 status marker를 표시한다.
- system column은 header/body/footer grid template과 정렬된다.
- system column은 기본적으로 왼쪽에 고정되고 reorder 대상에서 제외된다.
- `clearSelection()`이 range selection과 row selection을 함께 초기화한다.
- system column은 body col span, editing, tree/master-detail toggle 위치와 충돌하지 않는다.

### Gate 8.7-a current row 통과 기준

- `currentRow`는 checkbox `rowSelection`과 별도 개념으로 동작한다.
- MVP public API는 `enableCurrentRowHighlight`와 `onCurrentRowChange(rowId)`로 시작한다.
- MVP source of truth는 `activeCell?.rowId`이며, current row와 active cell row는 항상 동일하게 유지한다.
- data cell 클릭과 keyboard navigation은 current row를 갱신한다.
- system column 클릭은 active cell을 바꾸지 않으므로 current row도 바꾸지 않는다.
- current row body row에는 `data-current-row="true"` marker가 붙는다.
- `enableCurrentRowHighlight`가 켜진 경우 current row 전체가 시각적으로 구분된다.
- Storybook은 상하 2-grid Master/Detail 예제로 current master row가 detail grid data를 바꾸는 시나리오를 포함한다.
- Interaction test는 click, keyboard movement, system column click no-op, callback 호출을 검증한다.

### 통과 기준

- 주요 `gen-grid` demo/story 시나리오를 `gen-datagrid`로 재현한다.
- 같은 화면에서 두 개 이상의 grid가 독립 동작한다.
- nested grid boundary smoke test가 통과한다.
- table 태그가 렌더링되지 않는다.
- public API가 renderer 내부 타입을 export하지 않는다.
- build/typecheck/lint/test가 통과한다.
- MVP 미지원 기능은 명시적 에러 또는 문서화된 disabled state를 가진다.

### 자동 테스트

- package typecheck
- package build
- unit tests
- interaction tests
- DOM contract tests
- public export tests

### 수동/시각 테스트

- 기본 grid
- editable grid
- pinned grid
- virtualized grid
- filtering grid
- dirty state grid
- multiple grid page
- nested grid boundary page

### 실패 조건

- 사용자가 일반 업무 grid로 쓰기에 필수적인 기능이 빠져 있다.
- 기능 조합이 문서화 없이 조용히 깨진다.
- 기존 gen-grid보다 DOM/event/focus 구조가 더 복잡해진다.

## 12. Extension Gates

MVP 이후 확장 기능은 별도 gate로 관리한다.

### Extension A. Visual Row Merge

통과 기준:

- 모든 cell DOM은 유지한다.
- covered cell content와 border가 병합처럼 보인다.
- keyboard navigation은 실제 cell 단위로 유지된다.
- filtering/sorting/pagination 변경 시 merge model이 재계산된다.
- virtualization 조합은 별도 테스트를 통과하기 전까지 disabled다.

### Extension B. Grouped Header Span

Status: partially implemented. TanStack nested `ColumnDef.columns` are rendered as grouped header rows in Gate 8.6-b. Arbitrary header span API, group header reorder/resize/filter affordances, pinned group header splitting, and group visibility controls remain deferred.

통과 기준:

- CSS grid `grid-column: span n`으로 구현한다.
- pinned zone을 넘는 span은 금지한다.
- resize/reorder 후 span이 깨지지 않는다.
- column visibility 변경 시 span이 재계산된다.

### Extension C. Tree

통과 기준:

- expand/collapse가 keyboard와 mouse 모두에서 동작한다.
- tree indentation이 column width와 충돌하지 않는다.
- active cell이 collapsed child row를 참조하지 않는다.
- filtering과 tree 조합 정책이 명확하다.

### Extension D. Master Detail And Grid In Grid

통과 기준:

- detail panel open/close가 row height 재측정을 트리거한다.
- nested grid 이벤트가 부모 grid로 새지 않는다.
- parent selection과 child selection이 독립이다.
- clipboard ownership은 focused grid 기준이다.
- nested grid 안의 context menu가 부모 context menu를 열지 않는다.

### Extension E. Dynamic Row Height

통과 기준:

- MVP의 non-virtualized `getRowHeight` 동작을 유지한다.
- virtualizer measure가 row resize와 detail panel 변경을 반영한다.
- active cell scroll into view가 dynamic height를 기준으로 동작한다.
- row height 변경 중 selection overlay가 어긋나지 않는다.

## 13. Gate 운영 규칙

- gate 통과 전 다음 gate 기능을 main implementation에 merge하지 않는다.
- 미완성 기능은 public prop으로 열지 않는다.
- 조합 미지원은 runtime warning보다 compile/API 차원의 제한을 우선한다.
- gate 실패 버그는 새 기능보다 먼저 수정한다.
- gate마다 최소 하나의 demo/story를 둔다.
- gate마다 자동 테스트와 수동 확인 항목을 문서에 갱신한다.
- gate마다 architecture 문서를 작성하거나 갱신한다. 파일명은 `gate-{n}-architecture.md` 또는 여러 gate를 함께 다루는 경우 `gate-{start}-{end}-architecture.md` 형식을 사용한다.
- architecture 문서에는 component relationship, render/data flow, interaction/event flow, 구현된 state/API surface, deferred feature를 포함한다.

## 14. 추천 테스트 도구

- 단위 테스트: Vitest
- React interaction 테스트: Testing Library
- 브라우저 interaction/e2e: Playwright
- Storybook interaction: Storybook test runner
- 시각 회귀: Playwright screenshot 또는 Chromatic 계열 도구
- 접근성 기본 검사: axe

## 15. 결론

`gen-datagrid`는 최종 구현이 완료되어야 실사용 가치가 있다. 따라서 gate는 release milestone이 아니라 구조 검증 장치다.

가장 중요한 gate는 Gate 1과 Gate 2다. DOM contract와 scoped focus가 흔들리면 selection, editing, virtualization, grid in grid는 모두 다시 작성해야 한다. 초기 구현 속도보다 이 두 gate의 엄격한 통과 기준을 우선한다.
