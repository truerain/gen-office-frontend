# GenGrid 구현 로그

## 2026-09-16

### ModalEditor 인라인 width

- .root { width:100%; min-width:0 }를 ModalEditor wrapper에 적용해 flex shrink를 막았다.
- 관련 파일: ModalEditor.tsx, inlineEditorChrome.module.css

### EditableTextareaCell chrome inset 높이

- .chrome height를 --gen-grid-inline-field-height로 두고 root에서 세로 가운데 정렬. expand 버튼은 chrome 기준 absolute.
- 관련 파일: EditableTextareaCell.module.css, EditableTextareaCell.tsx

### EditableTextareaCell chrome/content 분리

- .chrome(rowHeight fill + border + center) / .content(lineClamp)로 역할을 나눴다.
- 관련 파일: EditableTextareaCell.tsx, EditableTextareaCell.module.css

### textareaCell absolute fill

- .td.textareaCell > span을 absolute inset:0으로 두고 EditableTextareaCell max-height를 --gen-grid-row-height로 캡해 행 높이 고정.
- 관련 파일: GenGridBody.module.css, EditableTextareaCell.module.css

### EditableTextareaCell 분리 + rowHeight 고정

- EditableTextareaCell로 lineClamp/expand/Dialog를 옮기고 height/max-height: 100% + overflow clamp로 테이블 행이 커지지 않게 했다. EditableFieldCell은 단줄 chrome만 유지.
- 관련 파일: EditableTextareaCell.tsx, EditableFieldCell.tsx, GenGridBody.module.css

### EditableFieldCell disabled+multiline clamp

- .disabled min-height가 .multiline max-height보다 커지던 문제를 .disabled:not(.multiline) / .disabled.multiline로 나눴다.
- 관련 파일: EditableFieldCell.module.css

### EditableFieldCell expand Dialog Close 위치

- compact header 기준으로 Close(X) top을 0.35rem으로 올려 제목과 맞췄다.
- 관련 파일: EditableFieldCell.module.css

## 2026-09-15

### EditableFieldCell multiline 세로 가운데

- lineClamp로 높이가 줄어든 multiline 필드가 위로 붙던 문제를 .rootMultiline align-items: center로 맞췄다.
- 관련 파일: EditableFieldCell.module.css


### EditableFieldCell lineClamp 높이

- .multiline의 height: 100%를 제거하고 max-height: lineClamp × 1.35em + padding으로 잘린 줄이 보이지 않게 했다.
- 관련 파일: EditableFieldCell.module.css


### EditableFieldCell expand hover 표시

- expand 버튼을 기본 숨김(opacity 0)하고 .rootExpandable:hover / :focus-within에서만 표시한다. padding-right도 동일 조건에서만 적용한다.
- 관련 파일: EditableFieldCell.module.css


### EditableFieldCell expand 버튼 overlay

- expand 버튼을 flex 옆자리가 아니라 root absolute overlay로 배치하고, expandable field에 padding-right: 22px를 줬다.
- 관련 파일: EditableFieldCell.module.css


### overlay Enter → startEditing 재수정

- Dialog textarea Enter가 셀로 버블되어 편집 시작·언마운트되던 문제에 data-gen-grid-editor-overlay closest 가드와 textarea stopPropagation을 추가했다. dist 재빌드 필요.
- 관련 파일: EditableFieldCell.tsx, useCellEditing.ts


### EditableFieldCell Dialog Enter 전파 차단

- expand Dialog textarea에서 Enter가 React 포털 버블로 셀 startEditing을 트리거해 Dialog가 닫히던 문제를 DialogContent onKeyDown stopPropagation으로 수정했다.
- 관련 파일: EditableFieldCell.tsx


### EditableFieldCell multiline expand Dialog

- multiline 표시를 line-clamp ellipsis로 바꾸고, expand 버튼으로 Dialog에서 전체 조회/편집(`writable` + `onCommit`)할 수 있게 했다.
- DataGrid Demo에 Notes(textarea) 컬럼 예시를 추가했다.
- 관련 파일: `EditableFieldCell.tsx`, `EditableFieldCell.module.css`, `apps/demo/.../DataGridPage.tsx`

### EditableFieldCell multiline 지원

- `multiline` prop으로 textarea 셀에서 필드를 셀 높이에 맞게 채우고 `pre-wrap` + top 정렬로 표시한다.
- textarea td의 display span에 `height: 100%`를 주어 fill이 동작하게 했다.
- 관련 파일: `EditableFieldCell.tsx`, `EditableFieldCell.module.css`, `GenGridBody.module.css`

### EditableFieldCell / 인라인 에디터 높이를 rowHeight에 연동

- `--gen-grid-inline-field-height: calc(var(--gen-grid-row-height) - 14px)`를 GenGrid root에 두고 표시·편집 chrome이 이를 쓰도록 했다.
- 관련 파일: `GenGridLayout.module.css`, `EditableFieldCell.module.css`, `inlineEditorChrome.module.css`, `GenGridCell.tsx`, `inlineEditorMetrics.ts`

### EditableFieldCell 배경을 transparent로 변경

- Active/hover/selected 셀 배경이 보이도록 고정 흰색(`--grid-cell-bg`) 대신 `transparent`를 사용한다.
- 관련 파일: `src/features/display/EditableFieldCell.module.css`

## 2026-09-14

### 인라인 편집기 높이를 EditableFieldCell(22px)에 맞춤

- 기본 에디터(`GenGridCell`)와 `ModalEditor`의 in-cell input 높이를 22px로 제한해 row height(예: 36px)를 넘치지 않게 했다.
- `editorWrap`에 `max-height: 100%`, `overflow: hidden`을 추가했다.
- 관련 파일: `src/components/layout/GenGridCell.tsx`, `GenGridBody.module.css`, `src/features/editing/ModalEditor.tsx`, `inlineEditorChrome.module.css`, `inlineEditorMetrics.ts`

### EditableFieldCell opt-in 표시 래퍼 추가

- 편집 가능 셀을 내부 border로 구분할 수 있는 `EditableFieldCell`을 추가했다. 컬럼 `meta.renderCell`에서만 opt-in 사용한다.
- `disabled`면 chrome 없이 일반 텍스트로 렌더한다. DataGrid Demo의 title/assignee/updatedAt에 적용했다.
- 관련 파일: `src/features/display/EditableFieldCell.tsx`, `EditableFieldCell.module.css`, `src/index.ts`, `apps/demo/src/pages/demo/datagrid/DataGridPage.tsx`

### ModalEditor Partial 커밋 시 columnId 속성 표시

- `mapSelectedItemToValue`가 row Partial(object)을 반환해도 draft/표시는 `mapped[columnId]`만 사용하고, `commitValue`에는 Partial 전체를 넘긴다.
- Tab 확정 시에도 마지막 mapped Partial을 `commitValue`로 보내 형제 필드가 빠지지 않게 했다.
- `resolveCurrentSelection`도 object value면 columnId 속성으로 code를 추출한다.
- 관련 파일: `src/features/editing/ModalEditor.tsx`, `apps/demo/src/pages/demo/datagrid/DataGridPage.tsx`

### 편집 셀 editorWrap 왼쪽 border 가림 수정

- `.editorWrap`에 셀과 동일한 가로 패딩(`padding: 0 var(--grid-cell-padding-x)`)을 넣어 ModalInput 등 에디터 왼쪽 border가 이전 셀 `border-right`에 가려지지 않게 했다.
- 관련 파일: `src/components/layout/GenGridBody.module.css`

### ModalEditor 현재 셀 값 표시 fallback

- `items` 매칭이 없어도 `editor.value`(또는 `getDisplayLabel`)로 입력칸에 현재 값을 보이도록 했다. PopupInput과 같은 fallback이다.
- lookup 용도에 맞게 `readOnly` 기본값을 `true`로 바꿔, 첫 렌더부터 `selectedItem.label`이 바로 보이게 했다.
- 관련 파일: `src/features/editing/ModalEditor.tsx`, `apps/demo/src/pages/demo/datagrid/DataGridPage.tsx`

### 단줄 셀 편집 세로 정렬을 middle로 기본화

- contenteditable 단줄 에디터에 `display:flex` + `align-items:center`를 적용해 표시 모드의 `vertical-align:middle`과 맞췄다.
- `display:flex` 때문에 `text-align`이 무시되므로 `meta.align`을 `justify-content`로 매핑했다.
- textarea(multiline)는 기존처럼 top/stretch를 유지한다.
- 관련 파일: `src/components/layout/GenGridCell.tsx`, `GenGridBody.module.css`

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
