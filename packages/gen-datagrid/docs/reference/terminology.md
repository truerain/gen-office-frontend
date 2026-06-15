<!-- packages/gen-datagrid/docs/reference/terminology.md
Defines shared terminology for GenDataGrid development.
-->

# GenDataGrid 용어집

이 문서는 GenDataGrid 설계, 구현, 테스트, Storybook 확인에서 공통으로 사용할 용어를 정의한다. 코드, 문서, 테스트명, 이슈 설명에서는 아래 용어를 일관되게 사용한다.

## 셀 상태 용어

### Active Cell

그리드 안에서 현재 키보드 포커스와 키보드 내비게이션의 기준이 되는 셀.

- 일반적으로 한 그리드에는 Active Cell이 하나만 존재한다.
- Arrow, Home/End, PageUp/PageDown 키는 Active Cell을 이동시킨다.
- Enter와 F2는 Active Cell을 edit mode로 진입시키는 기준으로 사용된다.
- Active Cell이 반드시 range selection에 포함되는 것은 아니다.
- DOM marker: `data-active-cell="true"`.

### Selected Cell

현재 range selection에 포함된 body cell.

- Selected Cell은 0개, 1개, 또는 여러 개일 수 있다.
- Clipboard copy의 대상은 Selected Cell이다.
- Shift selection은 range를 확장하고, Ctrl/Meta selection은 range를 추가한다.
- Selected Cell이라고 해서 자동으로 Editing Cell이 되는 것은 아니다.
- DOM marker: `data-selected-cell="true"`.

### Editing Cell

현재 editor를 렌더링하고 있는 셀.

- 일반적으로 한 그리드에는 Editing Cell이 하나만 존재한다.
- Editing Cell은 commit 또는 cancel 전까지 draft value를 가진다.
- 현재 기본 editor 흐름에서는 Enter가 commit을 수행한다.
- Escape는 value change를 발생시키지 않고 cancel한다.
- 현재 구현에서는 다른 셀을 activate하면 기존 editing을 commit 없이 cancel한다.
- DOM marker: `data-editing-cell="true"`.

### Editable Cell

edit mode로 진입할 수 있는 셀.

- `readOnly` / `readonly`, `isCellEditable`, column meta를 기준으로 판정한다.
- Editable Cell은 현재 edit 중이 아니어도 될 수 있다.
- DOM marker: `data-editable-cell="true"`.

## 선택 용어

### Range Selection

anchor cell과 focus cell 사이의 직사각형 선택 영역.

- 마우스 drag selection과 clipboard copy에 사용된다.
- 내부 표현은 `{ anchor, focus }` 형태다.
- Ctrl/Meta additive selection을 사용하면 여러 range가 존재할 수 있다.

### Anchor Cell

range selection의 고정 시작 셀.

- 마우스 drag는 Anchor Cell에서 시작한다.
- Shift selection은 이전 anchor를 기준으로 range를 확장한다.

### Focus Cell

range selection의 움직이는 끝 셀.

- drag 중 mouse-over에 따라 Focus Cell이 갱신된다.
- 선택 직사각형은 anchor와 focus를 기준으로 계산한다.

### Additive Selection

기존 range를 유지하면서 새 range를 추가하는 선택 방식.

- Ctrl/Meta mouse selection으로 동작한다.
- 기존 selected ranges를 대체하지 않는다.

## 편집 용어

### Edit Mode

셀이 display value 대신 editor를 렌더링하는 상태.

- 현재 진입 방식: double-click, Enter, F2, Active Cell 재클릭.
- 현재 종료 방식: Enter commit, Escape cancel, 다른 셀 activate 시 cancel.
- 보류된 진입/종료 방식: printable-key entry, 고급 blur/portal commit policy, paste application.

### Draft Value

셀이 edit mode인 동안 임시로 보관하는 값.

- `useCellEditing`이 보관한다.
- custom editor에는 `draftValue`로 전달된다.
- `commit` 또는 `applyValue`가 호출될 때만 committed value가 된다.

### Select On Focus

기본 input editor가 focus될 때 현재 입력값 전체를 선택하는 편집 UX 옵션.

- grid prop: `editSelectOnFocus`.
- column meta: `editSelectOnFocus`.
- column meta가 grid prop보다 우선한다.
- 기본값은 `false`다.

### Commit On Blur

기본 editor가 focus를 잃을 때 현재 draft value를 commit하는 편집 UX 옵션.

- grid prop: `editCommitOnBlur`.
- column meta: `editCommitOnBlur`.
- column meta가 grid prop보다 우선한다.
- 기본값은 `false`다.
- 현재 built-in editor와 다른 cell activate 경로에 적용된다.
- custom editor portal, select dropdown, outside click에 대한 고급 정책은 별도 refinement 대상이다.

### Tab Navigation

Tab 또는 Shift+Tab으로 cell을 이동하는 keyboard navigation.

- 비편집 상태에서는 다음/이전 cell로 Active Cell을 이동한다.
- edit mode에서는 현재 값을 commit하고 다음/이전 Editable Cell로 이동한다.
- 현재 구현은 grid 내부 이동만 처리하고, 끝에 도달하면 no-op으로 처리한다.

### Commit

edit mode를 종료하면서 편집 값을 외부로 알리는 동작.

- 현재 runtime은 `onCellValueChange`를 호출한다.
- 현재 Gate 4 slice에서는 GenDataGrid가 row data를 직접 mutate하지 않는다.
- commit된 값이 화면에 반영되려면 parent가 `onCellValueChange`를 받아 `data`를 갱신해야 한다.

### Cancel

value change를 발생시키지 않고 edit mode를 종료하는 동작.

- Escape는 cancel이다.
- 현재 구현에서 다른 셀 activate도 cancel이다.
- Cancel은 dirty state를 만들면 안 된다.

### Editor Factory

grid-level fallback editor renderer.

- public prop: `editorFactory`.
- column이 `meta.renderEditor`를 제공하지 않을 때 사용된다.
- column-level `renderEditor`보다 우선순위가 낮다.

### Column Render Editor

column-level custom editor renderer.

- column meta field: `renderEditor`.
- grid-level `editorFactory`보다 우선순위가 높다.
- `draftValue`, `setDraftValue`, `commit`, `cancel`, `applyValue`가 포함된 editor context를 받는다.

## 그리드 경계 용어

### Grid Root

하나의 GenDataGrid instance를 대표하는 DOM root.

- DOM marker: `data-gen-datagrid-root="true"`.
- instance identity: `data-grid-id`.
- DOM lookup, focus, selection, clipboard ownership은 반드시 Grid Root 범위 안에 머물러야 한다.

### Root-Scoped Lookup

특정 Grid Root 안으로 제한된 DOM query 또는 event resolution.

- 한 화면에 여러 grid가 있을 때 필수다.
- nested grid 안전성에도 필수다.
- grid interaction에서 global `document.querySelector`로 cell을 찾는 방식은 허용하지 않는다.

### Interactive Descendant

cell 내부에 있으면서 자체 브라우저 interaction을 가져야 하는 interactive element.

- 예: `input`, `select`, `textarea`, `button`, `[contenteditable="true"]`.
- grid navigation, range selection, cell activation은 Interactive Descendant의 이벤트를 가로채면 안 된다.

## Clipboard 용어

### Copy Selection

현재 selected range를 clipboard로 복사하는 동작.

- Ctrl/Cmd+C로 동작한다.
- 현재 구현에서는 Shift+Ctrl/Cmd+C가 header를 포함한다.
- Active Cell이 아니라 Selected Cell을 기준으로 동작한다.

### Paste Application

clipboard matrix data를 grid cell에 적용하는 동작.

- parsing helper는 존재한다.
- runtime mutation은 editing/data mutation policy가 확정될 때까지 보류한다.

## Column State 용어

### Column Order

현재 column 표시 순서 상태.

- public state: `columnOrder`, `defaultColumnOrder`, `onColumnOrderChange`.
- TanStack Table state를 기반으로 한다.

### Column Visibility

현재 column 표시/숨김 상태.

- public state: `columnVisibility`, `defaultColumnVisibility`, `onColumnVisibilityChange`.
- TanStack Table state를 기반으로 한다.

### Column Sizing

현재 column width 상태.

- public state: `columnSizing`, `defaultColumnSizing`, `onColumnSizingChange`.
- TanStack Table state를 기반으로 한다.

## 보류 또는 예정 용어

### Dirty State

committed grid data가 baseline과 다른지 추적하는 상태.

- 이후 gate에서 구현한다.
- 현재 Gate 4 commit은 `onCellValueChange`만 호출한다.

### Blur Commit

editor focus가 빠져나갈 때 commit하는 동작.

- 현재 보류 상태다.
- grid-in-grid, select dropdown, outside click에 대한 명확한 정책이 먼저 필요하다.

### Printable-Key Edit Entry

cell이 active 상태일 때 출력 가능한 문자를 입력하면 edit mode로 진입하는 동작.

- 현재 보류 상태다.
- 일반적으로 입력한 문자가 initial draft가 되며 기존 cell value를 대체하는 동작이 기대된다.

### Keep Editing On Navigate

다른 셀로 이동할 때 edit mode를 유지할지 결정하는 정책.

- public prop은 존재한다: `keepEditingOnNavigate`.
- runtime 동작은 아직 보류 상태다.

### Edit On Active Cell

cell이 active가 되는 시점에 edit mode로 진입할지 결정하는 정책.

- public prop은 존재한다: `editOnActiveCell`.
- runtime 동작은 아직 보류 상태다.
