<!-- packages/gen-datagrid/docs/log/implementation-log.md
Records meaningful GenDataGrid implementation decisions and progress.
-->

## 2026-06-22

### Gate 7.2 Range Auto-scroll Implementation

- useRangeSelection에 viewport edge 기반 vertical range auto-scroll을 구현했습니다.
- DataGridRoot에서 rowIds, columnIds, viewportElement, rowHeight, headerHeight를 range selection hook으로 전달하도록 연결했습니다.
- requestAnimationFrame loop가 drag 중 pointer 위치를 추적하고, viewport 상단/하단 edge에서 scrollTop을 조정한 뒤 rowId/columnId 기반 range focus를 갱신합니다.
- active cell은 auto-scroll tick마다 이동하지 않고, selection state는 기존 onSelectedRangesChange 경로를 유지합니다.
- virtualized grid에서 viewport 하단 edge drag가 scroll과 selection 확장을 수행하는 interaction test를 추가했습니다.
- Gate72RangeAutoScroll Storybook 시나리오를 추가해 pinned column과 virtualized range auto-scroll을 수동 검증할 수 있게 했습니다.
- gate-7-2-architecture.md와 gate-7-architecture.md를 구현 완료 상태로 갱신했습니다.
### Gate 7.2 Range Auto-scroll Architecture Plan

- Gate 7.2 범위를 virtualization 중 range selection drag auto-scroll로 정했습니다.
- Dynamic row measurement와 column virtualization은 Gate 7.2 범위에서 제외하고 별도 후속으로 유지했습니다.
- docs/architecture/gate-7-2-architecture.md를 추가해 edge detection, requestAnimationFrame scroll loop, row id 기반 selection state, virtualization contract, 구현 순서, 테스트 전략을 정리했습니다.
- docs/README.md와 gate-7-architecture.md에서 Gate 7.2 문서로 연결했습니다.

### Gate 6.1 Implementation Status Review

- Reviewed the Gate 6.1 data ownership implementation against `docs/plan/gate-6-1-data-ownership-decisions.md`.
- Confirmed the MVP implementation is complete for `filterMode`, `paginationMode`, `totalRowCount`, `pageSizeOptions`, `deleteRowsBehavior`, and `dataVersion`.
- Confirmed coverage exists for manual filtering, manual pagination, page-size reset behavior, uncontrolled row removal, and `dataVersion` dirty/deleted marker reset.
- Decided not to add a separate Gate 6.1 architecture document because the slice is an ownership-policy extension of Gate 6 rather than a separate runtime architecture.

### Gate 6 Architecture Deferred Cleanup

- Updated `docs/architecture/gate-6-architecture.md` so the Deferred list no longer marks completed Gate 6.1 work as pending.
- Removed completed deferred items for manual/server filtering and pagination totals, page-size selector, delete-row data mutation, and dirty baseline integration with `dataVersion`.
- Kept the remaining deferred items focused on future work: advanced filter operators, cursor/unknown-total server pagination, server aggregate footer summaries, deeper dirty baseline comparison, and batch mutation/undo ownership.

## 2026-06-19

### Gate 6.1 Filter Input Focus Fix

- column filter popover 내부 click/key 이벤트가 grid root keyboard handling으로 전파되지 않도록 차단했습니다.
- row model 변경 후 active-cell focus restore effect가 grid 내부 input/select/button focus를 빼앗지 않도록 interactive focus guard를 추가했습니다.
- header filter 입력 중 focus가 grid cell로 이동하지 않는 interaction test를 보강했습니다.

### Gate 6.1 Manual Filter Storybook 보정

- `Gate61ManualFilteringPaginationDataOwnership` Storybook 시나리오의 server-side filtering 흉내 로직이 `name` 컬럼만 처리하던 문제를 수정했습니다.
- manual mode 예제가 모든 column filter id를 row field 값과 비교하도록 바꿔 `Role`, `Score`, `Location`, `Note` 필터도 확인할 수 있게 했습니다.
- manual column filter가 grid 내부 local filtering을 수행하지 않는 interaction test를 추가했습니다.

### Gate 6.1 Data Ownership MVP 구현

- `filterMode`, `paginationMode`, `totalRowCount`, `pageSizeOptions`, `deleteRowsBehavior`, `dataVersion` public props와 관련 타입 export를 추가했습니다.
- `filterMode: 'manual'`에서는 local filtering을 비활성화하고, `paginationMode: 'manual'`에서는 현재 `data`를 page data로 렌더링하면서 `totalRowCount`로 page count를 계산하도록 TanStack adapter를 연결했습니다.
- `pageSizeOptions` 기반 selector, uncontrolled `defaultData` 전용 `deleteRowsBehavior: 'removeUncontrolled'`, `dataVersion` 변경 시 dirty/deleted marker reset을 구현했습니다.
- `Gate61ManualFilteringPaginationDataOwnership` Storybook 시나리오와 interaction test를 추가했습니다.

### Gate 6.1 Data Ownership Decisions 문서 추가

- `docs/plan/gate-6-1-data-ownership-decisions.md`를 추가해 manual/server filtering, manual/server pagination, page-size selector, delete-row data mutation, `dataVersion` dirty baseline reset의 MVP 정책을 정리했습니다.
- Gate 4.2 paste decisions 문서 형식에 맞춰 recommended MVP, current status, decision table, proposed contract, implementation order, open questions를 분리했습니다.
- `docs/README.md`와 `docs/plan/div-datagrid-development-plan.md`에서 Gate 6.1 decision 문서로 연결했습니다.

### Implementation Log 재정리

- 2026-06-19 작업(Gate 4.2 paste, Gate 4.1 문서/blur 정책 정리)을 `## 2026-06-19` 섹션으로 분리했습니다.
- `## 2026-06-17` 섹션 하단에 잘못 누적되어 있던 Gate 4.1/4.2 항목을 제거하고 날짜별로 재배치했습니다.
- Gate 4.2 완료 상태를 development plan, reference 문서, `mvp-test-gates.md`에 반영했습니다.

### Gate 4.1 / Gate 4.2 Storybook 수동 검증 완료

- `Gate41BEditPolicy`, `Gate41CEditNavigation`, `Gate41DBlurPolicy`, `Gate42ClipboardPaste` Storybook 시나리오 수동 검증을 완료했습니다.
- Popover/Modal Lookup editor portal 렌더링, Escape 단계 정책, paste `skipCell` / `cancelPaste` 동작을 확인했습니다.

### Gate 4.2 Clipboard Paste MVP

- public `GenDataGridPasteOptions`, `GenDataGridPasteError` 타입과 `pasteOptions` prop을 추가했습니다.
- `features/range-selection/paste.ts`에서 active cell 기준 paste target 해석, read-only/non-editable/out-of-bounds 오류 수집, skip/cancel 정책, `onCellValueChange` emit을 구현했습니다.
- `DataGridRoot` root-level `onPaste`에서 `clipboardData.getData('text/plain')`을 파싱해 적용합니다.
- active editor(`input`, `select`, `textarea`, `button`, `contenteditable`) 내부 paste는 가로채지 않습니다.
- `parseClipboardGrid` trailing newline empty row 제거, accepted paste rectangle selection 갱신, last pasted cell active 이동을 추가했습니다.
- `enableDirtyState`가 켜진 경우 기존 `handleCellValueChange` 경로로 dirty marker가 누적됩니다.
- `Gate42ClipboardPaste` Storybook, unit/interaction 테스트를 추가했습니다.
- deferred: selection anchor paste, type coercion, row 생성, `text/html` paste, imperative handle paste.
- 검증:
  - `pnpm -C packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C packages/gen-datagrid test`

### Gate 4.2 Paste 정책 문서

- `docs/plan/gate-4-2-paste-decisions.md` decision table을 추가했습니다.
- paste trigger, target resolution, editable filtering, error reporting, failure behavior 정책을 문서화했습니다.
- `docs/README.md`에서 Gate 4.2 paste decisions 문서로 연결했습니다.

### Gate 4.1-d Commit-On-Blur 기본값 수정

- omitted `editCommitOnBlur` 해석을 cancel → commit(`true`)으로 수정했습니다.
- 변경 파일: `src/features/editing/cellRuntime.ts`, `src/renderers/div-grid/DataGridBodyRow.tsx`.
- `editCommitOnBlur={false}` / column `meta.editCommitOnBlur: false` explicit opt-out은 cancel을 유지합니다.
- interaction test와 `gate-4-1-editing-policy-architecture.md`에 정책을 반영했습니다.

### Gate 4.1 문서 상태 정리

- `editor-implementation-contract.md`에 Gate 4.1-d context 필드(`editEntryReason`, `blurOwnership`, editor surface registration) implemented 표기를 반영했습니다.
- `cell-edit-api.md`, `api-structure.md`에 Gate 4.1-b/c/d 및 Gate 4.2 paste runtime status를 추가했습니다.

## 2026-06-18

### Gate 4.1-d Modal Lookup Escape Fix

- `ModalLookupEditor`에 `open` 상태와 셀 앵커 `input`을 추가해 Popover Lookup과 동일한 Escape 단계 정책을 적용했습니다.
- modal에서 옵션 선택 후 셀로 돌아온 뒤 Escape를 누르면 `ctx.cancel()`이 호출되도록 수정했습니다.
- modal이 열린 상태의 Escape/backdrop은 편집을 취소하지 않고 modal만 닫습니다.
- 관련 파일: `src/stories/GenDataGrid.baseline.stories.tsx`

### Gate 4.1-d Modal Storybook Fix

- `ModalLookupEditor`를 body portal + backdrop dialog로 변경해 셀 배경과 겹쳐 보이던 인라인 UI 문제를 수정했습니다.
- 셀에는 현재 값만 표시하고, Apply/Cancel/Escape/backdrop 클릭은 modal surface에서 처리합니다.

### Gate 4.1-d Popover Storybook Fix

- `Gate41DBlurPolicy`의 Popover Lookup editor가 cell `overflow: hidden`에 가려지지 않도록 `createPortal(document.body)` 기반으로 렌더링하도록 수정했습니다.
- 편집 중 셀에 `overflow: visible`과 `z-index`를 적용해 인라인 editor overflow도 완화했습니다.
- 관련 파일: `src/stories/GenDataGrid.baseline.stories.tsx`, `src/index.css`

### Gate 4.1-d Blur And Portal Policy Implementation

- `blurPolicy.ts`, `editingDeactivate.ts`, `editingCellActivation.ts`, `cellRuntime.ts`를 추가해 blur ownership과 editor surface guard를 구현했습니다.
- public `GenDataGridEditBlurOwnership`, `GenDataGridEditEntryReason`, `editPolicy.blurOwnership`, column `meta.editBlurOwnership`를 추가했습니다.
- `GenDataGridEditorContext`에 `editEntryReason`, `blurOwnership`, `registerEditorSurface`, `unregisterEditorSurface`, `getGridRoot`, `getEditorSurfaces`를 추가했습니다.
- built-in editor blur는 `createEditorBlurHandler`로 통합했고, `select`는 기본 `portal` blur ownership을 사용합니다.
- 다른 셀 activate 시 `editCommitOnBlur`와 `continueTriggers.click`, `modal` ownership을 함께 평가하도록 수정했습니다.
- `Gate41DBlurPolicy` Storybook 시나리오와 blur/interaction 테스트를 추가했습니다.
- 검증:
  - `pnpm -C packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C packages/gen-datagrid test`

### Editor Implementation Contract Documentation

- `docs/reference/editor-implementation-contract.md`를 추가해 Gate 4.1을 이후 built-in/custom/popup/modal editor의 공통 구현 계약으로 정리했습니다.
- 정책 축(진입, 연속, 열기, 키보드, blur), `GenDataGridEditorContext` 계약, built-in 참조 구현, 신규 editor 체크리스트, Storybook/테스트 기준, 구현 위치 맵을 문서화했습니다.
- `docs/README.md`, `cell-edit-api.md`, `gate-4-1-editing-policy-architecture.md`, `gate-4-1-editing-policy-notes.md`에서 새 문서로 연결했습니다.

### Gate 4.1-c Built-in Editor Navigation Policy Implementation

- `builtinEditorKeyboard.ts`를 추가해 built-in editor별 Arrow/Tab/Enter/Escape 소유권을 Gate 4.1-c 문서 기준으로 고정했습니다.
- `textarea`와 `select`는 Arrow 키를 grid navigation으로 넘기지 않고 editor-local/native 동작을 유지합니다.
- `text` / `number` / `date` / `checkbox`는 Arrow 키 grid navigation, Tab 이동, Enter commit, Escape cancel 정책을 유지합니다.
- `textarea`는 Enter commit을 막아 newline 입력을 허용합니다.
- `renderEditor.tsx`의 중복 `onKeyDown` 분기를 공통 핸들러로 정리했습니다.
- `Gate41CEditNavigation` Storybook 시나리오와 interaction/unit 테스트를 추가했습니다.
- 검증:
  - `pnpm -C packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C packages/gen-datagrid test`

## 2026-06-17

### Gate 4.1 Editing Policy Planning

- Added `docs/architecture/gate-4-1-editing-policy-architecture.md` to define the Gate 4.1 scope around printable-key edit entry, edit-entry opening policy, keep-editing navigation, and blur/portal ownership.
- Refined `docs/plan/div-datagrid-development-plan.md` so Gate 4.1 is split into printable-key entry, opening policy, navigation policy, and blur/portal policy sub-slices.
- Added `docs/reference/gate-4-1-editing-policy-notes.md` to capture built-in editor expectations and the automated/manual test split before implementation starts.

### Gate 4.1-b Editing Policy Decisions

- Recorded the agreed Gate 4.1-b API shape as `editPolicy` with `startTriggers`, `continueTriggers`, and `openOnEditStart`.
- Fixed the initial default trigger set:
  - start: `reclick`, `doubleClick`, `enter`, `f2`, `printableKey`
  - continue: `click: false`, `tab: true`, `arrowKey: false`
- Fixed continuation behavior so the previous cell defaults to `commit`, the destination non-editable cell becomes active-only, and `openOnEditStart` applies equally to continuation entry.
- Kept `openOnEditStart` as a boolean for this slice, with grid default and column override support, and deferred trigger-specific open rules.
- Added the agreed Gate 4.1-b implementation order to the architecture and plan documents; runtime implementation is intentionally deferred to the next session.

### Gate 4.1-b Editing Policy Implementation

- Added public `editPolicy` types and TanStack column-meta support for `startTriggers`, `continueTriggers`, and `openOnEditStart`.
- Added merged runtime edit-policy resolution with column override precedence over grid defaults.
- Wired `reclick`, `doubleClick`, `Enter`, `F2`, and printable-key edit entry through `startTriggers`.
- Wired editing continuation across `click`, `Tab`, and Arrow-key movement through `continueTriggers`.
- Kept continuation movement committing the previous cell first, preventing re-entry into non-editable destination cells, collapsing selection to the destination cell, and restoring destination editor focus when editing continues.
- Propagated `openOnEditStart` through the shared editor context and added built-in native `select` / `date` open attempts.
- Fixed follow-up regressions around continuation focus, selection collapse during edit-navigation, textarea select-on-focus parity, and non-editable continuation targets.
- Added Storybook coverage through `Gate41BEditPolicy` and completed manual verification of the Gate 4.1-b checklist.
- Verified:
  - `pnpm -C frontend/packages/gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C frontend/packages/gen-datagrid test`

### Gate 4.1-c Navigation Policy Reframing

- Narrowed Gate 4.1-c from a broad "keep editing on navigate" placeholder into a concrete built-in editor keyboard policy slice.
- Fixed the intended built-in policy split:
  - `text` / `number` / `date`: Arrow grid navigation, `Tab` move, `Enter` commit, `Escape` cancel
  - `textarea`: Arrow editor-local, `Tab` move, `Enter` newline, `Escape` cancel
  - `select`: Arrow editor-first, `Tab` move, `Enter` confirm/commit, `Escape` native close/cancel
  - `checkbox`: Arrow grid navigation, `Tab` move, `Enter` current built-in toggle/commit, `Escape` cancel
- Kept popup/custom editor navigation ownership deferred until popup editor infrastructure actually exists, instead of pretending Gate 4.1-c can finalize that contract now.

### Gate 3.1 Keyboard Selection And Scroll Handle

- Added `docs/architecture/gate-3-1-keyboard-selection-architecture.md` to lock the Gate 3.1 scope around keyboard range extension and imperative cell scrolling.
- Added `Shift` keyboard range extension so Arrow/Home/End/PageUp/PageDown can move `activeCell` while preserving the current range anchor.
- Kept plain keyboard navigation collapsing selection back to the destination cell so mouse and keyboard selection ownership stay aligned.
- Added `GenDataGridHandle.scrollToCell(coord)` and bridged virtualized rows through the existing row-visibility path before retrying root-scoped cell scrolling.
- Added Storybook coverage for keyboard range selection plus `scrollToCell()` jumps in a large virtualized grid.
- Added interaction coverage for `Shift + Arrow` range extension and imperative `scrollToCell()` behavior.
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes after the Gate 3.1 slice.

### Gate 7 Scroll-seeking Placeholder Follow-up

- Added a Phase 8 follow-up note to `docs/plan/div-datagrid-development-plan.md` for large-jump scrollbar handling.
- Updated `DataGridVirtualBody.tsx` so large scroll jumps can temporarily render lightweight placeholder rows while the virtualizer is still scrolling.
- Added public `scrollSeeking` API support so consumers can disable or tune the placeholder fallback with row, viewport, and reset-delay thresholds.
- Kept the active row and editing row on the full `DataGridBodyRow` path so focus restore, keyboard movement, and edit state remain stable during scroll settling.
- Kept placeholder rows aligned with the existing virtualization contract by preserving row height, `gridTemplateColumns`, absolute row positioning, and pinned sticky offsets.
- Limited the fallback to large scroll deltas so normal mouse-wheel and short scroll interactions keep rendering full rows.
- Updated the Gate 7 Storybook scenario so scroll-seeking can be compared in default/off/aggressive modes during manual testing.
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes after the follow-up.

### Gate 7 Virtualization 시작

- Added `docs/architecture/gate-7-architecture.md` before implementation to lock the Gate 7 slice around body-only virtualization, fixed row height, active-cell restore, pinning, and range-selection restoration.
- Added public `enableVirtualization` support to `GenDataGridProps` and wired `DataGridRoot` to switch between `DataGridBody` and the new `DataGridVirtualBody`.
- Added `renderers/div-grid/DataGridVirtualBody.tsx` with `@tanstack/react-virtual` and kept virtualization scoped to body rows while header, footer row, pagination, and footer bar remain outside the virtualizer.
- Extracted `DataGridBodyRow` so standard and virtual body rendering share the same body-cell DOM contract, editing flow, dirty markers, selection styling, and pinning behavior.
- Active-cell focus restore now bridges through virtualization by scrolling to the target row index before retrying root-scoped cell focus.
- Added interaction coverage for reduced virtual row rendering, active-cell restore, pinned markers on rendered virtual rows, and selection restoration for rows that re-enter the virtual window.
- Added baseline coverage for the virtualized body DOM markers and a `Gate7Virtualization` Storybook scenario with 10,000 rows plus pinned columns.
- Added `docs/qa/gate-7-visual-test-guide.md` so the remaining browser-only Gate 7 checks have an explicit manual checklist.
- Updated API and architecture docs so Gate 7 reflects the current fixed-height virtualization constraints instead of unimplemented public options.

## 2026-06-16

### Gate 6 Filtering Boundary Refactor

- Moved the MVP column filter trigger/popover rendering out of `DataGridHeader` into `features/filtering/DataGridColumnFilter`.
- Added `features/filtering/filterModel.ts` to keep the current string-input filter contract and reserve structured filter values for future operators, typed editors, and multi-condition filters.
- Updated Gate 6 architecture and implementation plan docs so advanced filtering is treated as a later extension of the filtering boundary, not a future rewrite of header layout.

### Gate 6 Filter Clear Handle API

- Added `clearColumnFilters()`, `clearGlobalFilter()`, and `clearFilters()` to `GenDataGridHandle`.
- Wired the handle methods through TanStack table filter setters so controlled and uncontrolled filter state use the same update path.
- Added a Gate 6 Storybook button that calls `clearColumnFilters()` for visual verification.
- Added interaction coverage for uncontrolled column filter clear and combined column/global filter clear.
- Updated Gate 6 architecture and API reference docs with the new handle methods.

### Gate 6 Column Filter Popover Visibility Fix

- Fixed the column filter popover being clipped under body cells by allowing header cell overflow and raising the open filter header cell above neighboring cells.
- Raised the whole header rowgroup while a column filter is open so sticky footer rows cannot cover the popover after filtering changes the visible row count.
- Added a `data-filter-open="true"` marker to the header cell that owns the open filter popover.
- Added outside-click dismissal for the open column filter popover.
- Extended interaction coverage to verify that clicking a column filter trigger opens the popover and marks the owning header cell.

### Gate 6 Dirty Reset State Sync Fix

- Fixed `resetDirtyState()` so external `onDirtyStateChange` receives the same cleared dirty/deleted state that the grid body markers render.
- Added interaction coverage for clearing deleted row state after `deleteRows()`.
- Updated the Gate 6 Storybook delete button label to match the row id used by the action.

### Gate 5 Pinned Active Cell Scroll Correction

- Fixed active-cell focus so unpinned cells are not left partially covered by left/right pinned columns after keyboard navigation or mouse activation.
- `focusCellInRoot` now focuses with `preventScroll`, keeps the native nearest scroll behavior, then adjusts the grid viewport `scrollLeft` against pinned header bounds.
- Added Vitest/jsdom coverage for the case where a `role` body cell is partly hidden under a left pinned `name` column.
- Updated Gate 5 architecture and visual QA docs with the pinned-overlay focus regression condition.

### Gate 6 Architecture 문서 포맷 정리

- `docs/architecture/gate-6-architecture.md`의 앞부분을 기존 gate 문서와 같은 형식으로 정리했습니다.
- 제목 아래에 Gate 6 요약 문장을 추가하고 `Implemented Slice`를 `Component Relationship` 앞에 배치했습니다.
- 구현된 API, 렌더러, viewport scroll 구조, dirty/delete marker, Storybook 시나리오, 테스트 커버리지를 한눈에 볼 수 있게 정리했습니다.

### Gate 6 Storybook 스크롤 구조 보정

- `.gen-datagrid` root의 직접 스크롤을 제거하고 `.gen-datagrid__viewport`를 table 전용 scroll container로 추가했습니다.
- header/body/footer row는 viewport 안에서 함께 가로/세로 스크롤되고, pagination과 `DataGridFooterBar`는 viewport 밖에 고정되도록 구조를 분리했습니다.
- Gate 6 Storybook 데이터 수를 늘려 세로 스크롤과 sticky footer row를 실제로 확인할 수 있게 조정했습니다.
- `data-gen-datagrid-viewport="true"` DOM marker와 architecture 문서 설명을 추가했습니다.

### Footer 컴포넌트 명칭 정리

- column-aligned footer row 컴포넌트를 `DataGridFooterRow`로 정리했습니다.
- grid-level footer 영역을 `DataGridFooterBar` 컴포넌트로 분리했습니다.
- DOM marker는 `data-gen-datagrid-footer-row="true"`와 `data-gen-datagrid-footer-bar="true"`로 구분했습니다.
- architecture, plan, baseline test를 새 명칭에 맞춰 갱신했습니다.

### Gate 6 Storybook 시나리오 추가

- `src/stories/GenDataGrid.baseline.stories.tsx`에 `Gate6FilteringFooterPaginationDirtyState` 스토리를 추가했습니다.
- column/global filter, footer row, sticky footer row, pagination, dirty marker, deleted row marker, external footer summary를 한 화면에서 확인할 수 있게 구성했습니다.
- 확인 명령:
  - `pnpm -C frontend\packages\gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C frontend\packages\gen-datagrid test`
  - `pnpm -C frontend\apps\storybook-all build`

### Gate 6 Filtering, Footer, Pagination, Dirty State 구현

- `src/core/table/useDataGridTable.ts`에 column filter, global filter, pagination controlled/uncontrolled state를 연결했습니다.
- `src/renderers/div-grid/DataGridFooterRow.tsx`를 추가하고 footer row가 header/body와 같은 `grid-template-columns` source를 사용하도록 구성했습니다.
- `DataGridHeader`에 column filter trigger와 input popover를 추가했고, `DataGridRoot`에 global filter input, pagination controls, `DataGridFooterBar`를 연결했습니다.
- `onCellValueChange` 흐름에서 dirty cell/row marker를 관리하고 `resetDirtyState`, `commitDirtyState`, `deleteRows`, `getDirtyState` imperative API를 추가했습니다.
- `test/baseline.mjs`와 `test/interaction.test.tsx`에 Gate 6 footer/filter/pagination/dirty state 검증을 추가했습니다.
- 확인 명령:
  - `pnpm -C frontend\packages\gen-datagrid exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C frontend\packages\gen-datagrid run test:interaction`
  - `pnpm -C frontend\packages\gen-datagrid run test:baseline`


## 2026-06-15

용어 기준: 구현 로그와 QA 보정 기록의 공통 용어는 `../reference/terminology.md`를 따른다.

### 문서 로그 경로 정합성 확인

- 충돌 해결 후 `gen-datagrid` 문서 구조가 `docs/log`, `docs/reference`, `docs/plan`, `docs/architecture`로 유지되는 것을 확인했습니다.
- `AGENTS.md`의 GenDataGrid 문서 규칙을 현재 문서 구조에 맞춰 정리했습니다.
- 이전 경로인 `packages/gen-datagrid/docs/implementation-log.md`는 다시 생성하지 않기로 했습니다.

## 2026-06-08

### Documentation Baseline

- Added `../plan/div-datagrid-development-plan.md` to define the div-based DataGrid development direction.
- Added `../plan/mvp-test-gates.md` to define gate-based implementation and testing criteria.
- Added `../reference/api-comparison-with-gen-grid.md` to compare existing GenGrid API with proposed GenDataGrid API.
- Added `../reference/api-structure.md` to regroup GenDataGrid API into Core, State, Feature, Rendering, Column, Instance, and Extension API categories.

### Package Baseline

- Added baseline package source files:
  - `src/index.ts`
  - `src/index.css`
  - `src/GenDataGrid.tsx`
  - `src/GenDataGrid.types.ts`
- Added a minimal `GenDataGrid` component that renders only the root div contract:
  - `role="grid"`
  - `data-gen-datagrid-root="true"`
- Kept the baseline component intentionally feature-free until Core API and Gate 1 renderer contract are implemented.

### Test Baseline

- Added `test/baseline.mjs` using Node's built-in `node:test` runner.
- Added package scripts:
  - `test`
  - `test:baseline`
- Baseline tests currently verify:
  - `GenDataGrid` is exported.
  - root div includes the baseline grid DOM contract.
  - table tags are not rendered.
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes.

### Agent Rules

- Added source file header comment rules to `frontend/AGENTS.md`.
- Added GenDataGrid documentation update rules to `frontend/AGENTS.md`.

### Gate 1 Minimal Renderer

- Added baseline div-grid renderer files under `src/renderers/div-grid`.
- Added `DataGridRoot`, `DataGridHeader`, `DataGridBody`, and `DataGridCell`.
- Added `gridTemplate.ts` to keep header/body row `grid-template-columns` from one source.
- Added `cellValue.ts` for simple baseline value resolution from `accessorKey` and `accessorFn`.
- Updated `GenDataGrid` to render header and body rowgroups without table tags.
- Added minimal CSS classes for root, rows, header cells, and body cells.
- Expanded baseline tests to verify:
  - header/body `rowgroup` contract
  - `columnheader` and `gridcell` roles
  - scoped cell data attributes
  - shared grid template output
  - no table tags
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes with 5 tests.

### Gate 2 Minimal Active Cell

- Added baseline active cell API:
  - `gridId`
  - `getGridId`
  - `activeCell`
  - `defaultActiveCell`
  - `onActiveCellChange`
- Added root-scoped DOM helper files under `src/core/dom`.
- Added `features/active-cell/navigation.ts` for keyboard navigation calculation.
- Updated `DataGridRoot` to manage controlled/uncontrolled active cell state.
- Added roving `tabIndex` behavior so only the active body cell receives `tabIndex={0}`.
- Added keyboard navigation handling for Arrow keys, Home, End, PageUp, and PageDown.
- Added active cell focus using root-scoped cell lookup.
- Expanded baseline tests to verify:
  - one active cell marker
  - one roving tab stop
  - controlled active cell rendering
  - root-scoped DOM lookup source rule
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes with 8 tests.
- Known limitation: keyboard behavior is currently covered through build and SSR/source tests only. Browser interaction testing should be added when a DOM interaction runner is introduced.

### Row Height Policy Update

- Updated docs to allow per-row height through `getRowHeight` in MVP when `enableVirtualization !== true`.
- Kept virtualized dynamic row measurement as an Extension API concern.
- Updated API and gate docs to distinguish:
  - non-virtualized per-row height resolver
  - virtualized dynamic height measurement

### Non-Virtualized Row Height Implementation

- Added `getRowHeight` to `GenDataGridProps`.
- Applied per-row height in `DataGridBody` through `--gen-datagrid-current-row-height`.
- Updated cell CSS to prefer row-specific height and fall back to `rowHeight`.
- Added a baseline SSR test for per-row height rendering.
- Verified `pnpm -C frontend/packages/gen-datagrid test` passes with 9 tests.

### Storybook Baseline Page

- Added `src/stories/GenDataGrid.baseline.stories.tsx`.
- The story visually covers:
  - div header/body rendering
  - column width layout
  - per-row height through `getRowHeight`
  - default active cell outline
  - keyboard navigation after focusing/clicking a cell
- Verified the common Storybook build with `pnpm -C frontend/apps/storybook-all build`.


## 2026-06-09 New Agent session

### Phase 1 Core Table Adapter

- Added `src/core/table/useDataGridTable.ts` as the TanStack Table adapter for the div renderer.
- Moved row and visible column source data from raw `data/defaultData` arrays to TanStack row/header/column models.
- Added public controlled/uncontrolled state props for `columnOrder`, `columnVisibility`, and `columnSizing`.
- Updated the div header/body renderers to consume TanStack header groups, rows, visible cells, and column sizes.
- Kept the existing `data-gen-datagrid-root`, `data-grid-id`, `data-gen-datagrid-cell`, `data-rowid`, and `data-colid` DOM contract unchanged.
- Added baseline SSR coverage for TanStack column order, visibility, and sizing state.

### Gate 2 Interaction Test Baseline

- Added Vitest, jsdom, and Testing Library dependencies for DOM interaction tests.
- Added `test/interaction.test.tsx` to cover:
  - Arrow key active cell movement
  - multiple grid keyboard isolation
  - interactive descendant keydown bypass for grid navigation
- Added `test:interaction` and included it in the package `test` script.
- Verified `pnpm -C frontend/packages/gen-datagrid run test:interaction` passes with 3 tests.

### Architecture Diagram

- Added `../architecture/gate-1-2-architecture.md` with Mermaid diagrams for:
  - component relationships
  - render data flow
  - active cell interaction flow
- Documented current Phase 1/Gate 2 boundaries, implemented state surface, and deferred features.

### Gate 1 And Gate 2 Completion

- Marked Gate 1 and Gate 2 as complete for Gate 3 entry in `../plan/mvp-test-gates.md`.
- Completion basis:
  - baseline build and SSR/source tests cover the div DOM contract, table tag exclusion, active cell markers, roving tab stop, root-scoped lookup, per-row height, and TanStack column state.
  - Vitest/jsdom interaction tests cover arrow key movement, multiple grid isolation, and interactive descendant keydown bypass.
  - `../architecture/gate-1-2-architecture.md` documents the current component relationship, render data flow, and active cell interaction flow.
- Browser-level visual/real viewport automation remains deferred until Playwright or Storybook test runner is introduced.

### Gate 3 Range Selection Slice

- Added `features/range-selection/rangeSelection.ts` for range coordinate and containment helpers.
- Added `features/range-selection/useRangeSelection.ts` for root-level mouse range selection.
- Wired `DataGridRoot` to handle `onMouseDown` and `onMouseOver` through range selection delegation.
- Updated `DataGridBody` and `DataGridCell` to render `data-selected-cell="true"` for cells inside the current range.
- Added selected cell baseline styling in `src/index.css`.
- Added Vitest/jsdom interaction coverage for:
  - drag range selection
  - interactive descendant guard for range selection
- Added `../architecture/gate-3-architecture.md` for the current Gate 3 range selection architecture.

### Gate 3 Clipboard Copy Slice

- Added range bounds normalization to `features/range-selection/rangeSelection.ts`.
- Added `features/range-selection/clipboard.ts` for clipboard matrix building, text serialization, value stringification, and paste text parsing helpers.
- Added `features/range-selection/useClipboardActions.ts` for focused grid copy actions.
- Added public props:
  - `enableRangeSelection`
  - `enableClipboard`
  - `clipboardOptions.includeHeader`
- Wired `Ctrl/Cmd+C` to copy the current selected range and `Shift+Ctrl/Cmd+C` to include headers.
- Added Vitest coverage for:
  - range bounds normalization
  - clipboard escaping and serialization
  - clipboard text parsing
  - selected range copy
  - header-included copy
  - focused grid copy ownership
- Added `Gate3RangeSelection` Storybook story for manual range selection checks.
- Deferred paste application until data mutation and editing policies are introduced.

### Gate 3 Shift And Additive Selection

- Expanded internal range selection state from a single range to `GenDataGridRangeSelections`.
- Added Shift selection behavior to extend the last range from its anchor.
- Added Ctrl/Meta selection behavior to append a separate range.
- Updated selected cell calculation to mark cells included by any internal range.
- Added Vitest/jsdom interaction coverage for:
  - Shift range extension
  - Ctrl additive range selection

### Gate 3 Controlled Selection API

- Added public range selection props:
  - `selectedRanges`
  - `defaultSelectedRanges`
  - `onSelectedRangesChange`
- Exported `GenDataGridCellCoord`, `GenDataGridRangeSelection`, and `GenDataGridRangeSelections` from the package entrypoint.
- Updated `useRangeSelection` to support controlled and uncontrolled selection state.
- Added Vitest/jsdom coverage for:
  - default selected ranges rendering
  - controlled selected ranges rendering
  - controlled change callbacks without internal mutation

### Gate 3 Clear And Imperative Handle

- Added `GenDataGridHandle` with:
  - `rootElement`
  - `clearSelection()`
  - `copySelection(options)`
- Changed `GenDataGrid` forwarded ref from `HTMLDivElement` to `GenDataGridHandle`.
- Added selection clear behavior for:
  - `Escape`
  - root empty area click
  - imperative `clearSelection()`
- Added Vitest/jsdom coverage for:
  - Escape clear
  - root empty area clear
  - imperative `copySelection()`
  - imperative `clearSelection()`
  - controlled clear callback without internal mutation
- Marked Gate 3 complete for Gate 4 entry with paste application explicitly deferred.

### Gate 4 Editing API Baseline

- Added public editing types:
  - `GenDataGridEditType`
  - `GenDataGridEditOption`
  - `GenDataGridEditableContext`
  - `GenDataGridEditorContext`
  - `GenDataGridEditorFactory`
  - `GenDataGridCellValueChange`
- Added editing props:
  - `readOnly`
  - `readonly`
  - `editOnActiveCell`
  - `keepEditingOnNavigate`
  - `editorFactory`
  - `isCellEditable`
  - `onCellValueChange`
- Added `src/core/table/tanstack-table.ts` to extend TanStack `ColumnMeta` with editing meta:
  - `editable`
  - `editType`
  - `editOptions`
  - `getEditOptions`
  - `editPlaceholder`
  - `renderEditor`
- Imported the TanStack metadata augmentation from the package entrypoint.
- Runtime editing behavior is intentionally not implemented in this slice.

### Gate 4 Editable Cell Predicate

- Added `features/editing/editableCell.ts` to resolve whether a cell can enter editing mode.
- Added editable predicate precedence:
  - `readOnly` / `readonly`
  - grid-level `isCellEditable(ctx)`
  - column meta `editable`
  - column editor capability
- Wired `DataGridBody` to calculate editable state from TanStack row/cell models.
- Added `data-editable-cell="true"` to editable body cells.
- Added Vitest/jsdom coverage for:
  - column meta editable markers
  - `readOnly` disabling editable markers
  - grid-level editable predicate precedence
  - `renderEditor` columns treated as editable by default
- Added `../architecture/gate-4-architecture.md` for the current Gate 4 editing predicate architecture.

### Gate 4 Editing Runtime Baseline

- Added `features/editing/useCellEditing.ts` to manage the active editing cell and draft value.
- Wired edit entry from:
  - active editable cell `Enter`
  - active editable cell `F2`
  - editable cell double-click
- Added runtime editor rendering precedence:
  - column meta `renderEditor`
  - grid-level `editorFactory`
  - built-in default editor
- Added built-in editor surfaces for:
  - text
  - number
  - date
  - select
  - textarea
  - checkbox
- Added edit lifecycle behavior:
  - `data-editing-cell="true"` marker for the active editor cell
  - Escape cancel without emitting changes
  - activating another cell cancels the current editor without emitting changes
  - mouse interaction inside editor controls does not reactivate the parent cell
  - Enter commit through `onCellValueChange`
  - `applyValue(nextValue)` for custom editors
- Kept row data mutation out of this slice. The parent must apply `onCellValueChange` to `data` if the committed value should be reflected in rendered rows.
- Deferred advanced blur/portal policy, printable-key edit entry, `editOnActiveCell`, `keepEditingOnNavigate`, and paste application.
- Added Vitest/jsdom coverage for:
  - double-click edit entry
  - keyboard edit entry
  - Escape cancel
  - other-cell activation cancel
  - select editor mouse down passthrough
  - Enter commit callback
  - custom editor `applyValue`

## 2026-06-11
- 다음은 Storybook 테스트 후 수정사항 임

### Gate 4 Active Cell Reclick Edit Entry

- Added an edit entry path for clicking an already active editable cell.
- Kept first click on an inactive cell as activation-only behavior.
- Preserved existing double-click, Enter, and F2 edit entry paths.
- Kept interactive descendants excluded from cell activation and edit entry.
- Added Vitest/jsdom coverage for:
  - inactive editable cell first click activates without editing
  - second click on the same active editable cell enters edit mode

### Gate 4 Cell Edit API Surface

- Added `../reference/cell-edit-api.md` to define Cell Edit public props, column meta, editor context, commit event, implemented behavior, and deferred policies.
- Added grid-level `editSelectOnFocus`.
- Added grid-level `editCommitOnBlur`.
- Added column meta `editSelectOnFocus`.
- Added column meta `editCommitOnBlur`.
- Added `selectOnFocus` to `editorFactory` context.
- Added `commitOnBlur` to `editorFactory` context.
- Added `tabNavigate(direction)` to `editorFactory` context.
- Unified `renderEditor` and `editorFactory` so both receive the same `GenDataGridEditorContext`, including resolved editor metadata, `selectOnFocus`, `commitOnBlur`, and `tabNavigate(direction)`.
- Wired `editSelectOnFocus` to the built-in input editor focus behavior.
- Wired `editCommitOnBlur` to built-in editor blur behavior and other-cell activation.
- Wired Tab/Shift+Tab to active-cell navigation outside edit mode.
- Wired Tab/Shift+Tab inside built-in editors to commit and move to the next or previous editable cell.
- Kept column meta precedence over the grid-level defaults.
- Documented deferred edit policies:
  - `editOnActiveCell`
  - `keepEditingOnNavigate`
  - printable-key edit entry
  - advanced blur/portal policy
  - paste application
  - dirty state integration
- Added Vitest/jsdom coverage for:
  - grid-level select-on-focus behavior
  - column-level select-on-focus override
  - grid-level commit-on-blur behavior
  - commit before other-cell activation when commit-on-blur is enabled
  - Tab/Shift+Tab active-cell navigation
  - Tab/Shift+Tab edit commit and editable-cell navigation

### Gate 4 Storybook Number Editor Sample

- Added a `Score` number column to the Gate 4 editing Storybook scenario.
- Wired the column with `meta.editType: 'number'`.
- Converted committed `score` values back to `number` in the Storybook example state update.

### Range Selection Native Text Selection Guard

- Prevented browser-native text selection when body cell range selection starts.
- Added `user-select: none` to grid body cells and restored `user-select: text` for active editors.
- Added Vitest/jsdom coverage that cell range selection cancels the native mouse default while root empty-area mouse behavior remains uncancelled.

### Range Selection Scrollbar Guard

- Kept selected ranges when the grid root scrollbar is clicked or dragged.
- Preserved the existing empty root-area click behavior that clears selection.
- Added Vitest/jsdom coverage for root scrollbar mouse down versus root empty-area mouse down.

### Gate 4 Editing Runtime Refactor

- Split editor context construction from `DataGridBody` into `features/editing/editorContext.ts`.
- Split editor rendering precedence and built-in editor controls into `features/editing/renderEditor.tsx`.
- Split editable-cell Tab target calculation into `features/editing/editNavigation.ts`.
- Kept edit commit/cancel side effects and active-cell orchestration in `DataGridBody` so future dirty state and keep-editing navigation policies can be attached without changing row/body ownership.

### Gate 4 Completion

- Kept `editOnActiveCell` and `keepEditingOnNavigate` as reserved public props and added runtime warnings when they are enabled.
- Documented paste application, data mutation, dirty-state integration, printable-key edit entry, and advanced blur/portal policy as deferred beyond Gate 4.
- Marked Gate 4 complete for Gate 5 entry in `../plan/mvp-test-gates.md`.
- Completion basis:
  - baseline build and SSR/source tests cover the public export, div DOM contract, row height, root-scoped lookup, and TanStack column state.
  - Vitest/jsdom interaction tests cover editable markers, edit entry, commit/cancel, blur commit, Tab/Shift+Tab navigation, custom editor context, reserved prop warnings, range selection guards, clipboard copy, and multiple-grid ownership.
  - `../architecture/gate-4-architecture.md` documents the current editing component relationship, runtime flow, implemented API surface, and deferred features.

### Gate 5 Pinning State Baseline

- Added public `columnPinning`, `defaultColumnPinning`, and `onColumnPinningChange` props.
- Added public `enablePinning`, `enableColumnSizing`, and `enableColumnReorder` feature flags.
- Wired column pinning through `useDataGridTable` controlled/uncontrolled state.
- Added `features/pinning/pinningStyles.ts` for shared sticky offset styles and pinned-edge DOM marker calculation.
- Updated header and body cells to render pinned markers and sticky offsets.
- Added `../architecture/gate-5-architecture.md` for the initial Gate 5 structure.
- Added baseline SSR coverage for pinned column markers and sticky offsets.

### Gate 5 Resize And Reorder Baseline

- Enabled TanStack column resizing with `columnResizeMode: 'onChange'`.
- Added header resize handle DOM using `header.getResizeHandler()`.
- Added `features/reorder/columnReorder.ts` to normalize same-zone column reorder and block cross-zone reorder.
- Added header drag/drop reorder wiring through `table.setColumnOrder()`.
- Added baseline SSR coverage for resize/reorder affordances.
- Added Vitest coverage for same-zone reorder and cross-zone blocking.

### Gate 5 Completion And Visual Test Guide

- Gate 5 완료 기준을 `../plan/mvp-test-gates.md`에 반영했다.
- pinned header/body/editor의 z-index 계층을 분리해 sticky header, pinned cell, inline editor가 같은 z-index를 공유하지 않도록 조정했다.
- selected pinned cell이 pinned white background에 의해 선택 배경을 잃지 않도록 CSS를 보정했다.
- Storybook에 `Gate5PinningSizingReorder` 시나리오를 추가해 left/right pinning, horizontal scroll, selected range, editable cell, controlled reorder 조합을 확인할 수 있게 했다.
- `../qa/gate-5-visual-test-guide.md`를 추가해 Gate 5 화면 테스트 기준, 실패 조건, 자동화 후보를 문서화했다.
- `../README.md`와 `../architecture/gate-5-architecture.md`에서 Gate 5 완료 상태와 화면 테스트 가이드 링크를 갱신했다.

### Gate 5 Resize Drag Guard

- resize handle에서 시작한 drag가 header reorder drag로 해석되지 않도록 `DataGridHeader`에서 resize handle `dragstart`, `mousedown`, `touchstart` 전파를 차단했다.
- header `onDragStart`에서도 resize handle을 drag source로 감지하면 reorder 시작을 취소하도록 보강했다.
- resize handle drag가 `onColumnOrderChange`를 호출하지 않는 Vitest/jsdom 회귀 테스트를 추가했다.
- `../qa/gate-5-visual-test-guide.md`에 resize 중 header reorder drag ghost가 뜨면 실패라는 화면 테스트 기준을 추가했다.
### Gate 5 Reorder Handle Separation

- header cell 전체의 `draggable` 속성을 제거하고 header content 영역만 `data-column-reorder-handle="true"` drag source로 분리했다.
- resize handle은 draggable ancestor 밖의 sibling으로 남겨 column 경계 drag가 native reorder drag로 승격되지 않도록 했다.
- reorder interaction test를 header cell drag에서 reorder handle drag 기준으로 갱신했다.
- resize handle과 column 경계에서 reorder가 시작되면 실패하도록 Gate 5 화면 테스트 가이드를 보강했다.

### Gate 5 Reorder Handle Button

- header text 영역 대신 명시적인 reorder handle 버튼을 추가했다.
- reorder handle 버튼에 `data-column-reorder-handle="true"`와 `draggable`을 부여하고, header label/text는 drag source에서 제외했다.
- resize handle, header label/text, reorder handle 버튼의 역할을 Gate 5 화면 테스트 가이드와 architecture 문서에 반영했다.

### Gate 5 Pinned Order And Resize Target Fix

- pinned column의 실제 표시 순서는 `columnOrder`가 아니라 `columnPinning.left/right` 배열이 결정하므로 pinned zone reorder 시 matching pinning 배열도 함께 재정렬하도록 수정했다.
- header, body, navigation column ids, `grid-template-columns`가 같은 left/center/right ordered visible column model을 사용하도록 정렬 기준을 통일했다.
- body는 TanStack `row.getLeftVisibleCells()`, `row.getCenterVisibleCells()`, `row.getRightVisibleCells()` 순서로 cell을 렌더링하도록 수정했다.
- Storybook Gate 5 시나리오의 `columnPinning`을 state로 관리해 pinned column끼리 reorder해도 화면에 반영되도록 했다.
- pinned column order와 grid template order가 일치하는 SSR 회귀 테스트와 uncontrolled pinned reorder interaction 테스트를 추가했다.

### Gate 7.2 Range Auto-scroll Mouseup Guard

- 그리드 외부에서 mouseup이 발생한 뒤 range auto-scroll RAF가 선택 범위를 다시 갱신하지 않도록 drag 상태 ref를 추가했다.
- event.buttons === 0 mousemove와 window mouseup에서 auto-scroll pointer/focus 상태를 정리하도록 보강했다.
- viewport의 가로 범위 밖 pointer는 vertical edge auto-scroll을 트리거하지 않도록 제한했다.
- 중간 row에서 drag를 시작한 뒤 그리드 외부 mouseup 후에도 anchor row가 유지되는 interaction 회귀 테스트를 추가했다.
