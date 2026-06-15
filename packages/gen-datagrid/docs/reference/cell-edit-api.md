<!-- packages/gen-datagrid/docs/reference/cell-edit-api.md
Documents the GenDataGrid cell editing API surface and implementation status.
-->

# GenDataGrid Cell Edit API

이 문서는 Cell Edit 관련 public API, column meta, editor context, 현재 구현 상태, 보류 항목을 정리한다. 용어 기준은 `terminology.md`를 따른다.

## 1. Gate 4 기준

Gate 4의 목표는 **cell editing의 최소 완성 UX**를 제공하는 것이다.

- editable 여부를 판정할 수 있어야 한다.
- 기본 editor와 custom editor를 렌더링할 수 있어야 한다.
- 명확한 edit 진입/종료 동작이 있어야 한다.
- commit 결과를 외부로 전달할 수 있어야 한다.
- 아직 확정되지 않은 data mutation, dirty state, paste, 고급 blur/portal 정책은 deferred로 남긴다.

## 2. Grid Props

| API | 상태 | 설명 |
| --- | --- | --- |
| `readOnly?: boolean` | implemented | 전체 grid editing을 비활성화한다. |
| `readonly?: boolean` | implemented | 기존 `GenGrid` 호환 alias. `readOnly`와 같은 의미다. |
| `editSelectOnFocus?: boolean` | implemented | 기본 input editor가 focus될 때 입력값 전체를 select할지 결정한다. 기본값은 `false`. |
| `editCommitOnBlur?: boolean` | implemented | 기본 editor가 blur될 때 commit할지 결정한다. 기본값은 `false`. |
| `isCellEditable?: (ctx) => boolean` | implemented | grid-level editable predicate. column meta보다 먼저 평가한다. |
| `editorFactory?: (ctx) => React.ReactNode` | implemented | column `renderEditor`가 없을 때 사용하는 grid-level fallback editor renderer. |
| `onCellValueChange?: (args) => void` | implemented | commit 시 호출된다. 현재 grid 내부 data mutation은 하지 않는다. |
| `editOnActiveCell?: boolean` | reserved/deferred | cell이 active가 되는 시점에 edit mode로 진입할지 결정하는 정책. 현재 runtime은 구현하지 않고 prop 사용 시 warning을 낸다. |
| `keepEditingOnNavigate?: boolean` | reserved/deferred | navigation 중 edit mode를 유지할지 결정하는 정책. 현재 runtime은 구현하지 않고 prop 사용 시 warning을 낸다. |

## 3. Column Meta

| Meta | 상태 | 설명 |
| --- | --- | --- |
| `editable?: boolean \| ((ctx) => boolean)` | implemented | column/cell 단위 editable 여부. |
| `editType?: 'text' \| 'number' \| 'date' \| 'select' \| 'textarea' \| 'checkbox'` | implemented | built-in editor 종류. 값이 없으면 text input으로 처리한다. |
| `editOptions?: readonly { label; value }[]` | implemented | select editor option. |
| `getEditOptions?: (ctx) => readonly option[]` | implemented | row/cell context 기반 select option resolver. `editOptions`보다 우선한다. |
| `editPlaceholder?: string` | implemented | 기본 input/textarea editor placeholder. |
| `editSelectOnFocus?: boolean` | implemented | 해당 column의 기본 input editor select-on-focus 정책. grid prop보다 우선한다. |
| `editCommitOnBlur?: boolean` | implemented | 해당 column의 기본 editor blur commit 정책. grid prop보다 우선한다. |
| `renderEditor?: (ctx) => React.ReactNode` | implemented | column-level custom editor. `editorFactory`보다 우선한다. |

## 4. Editable 판정 순서

Editable Cell 여부는 다음 순서로 판정한다.

1. `readOnly` / `readonly`가 `true`면 editable이 아니다.
2. `isCellEditable(ctx)`가 있고 `false`를 반환하면 editable이 아니다.
3. `column.meta.editable(ctx)`가 있으면 그 결과를 따른다.
4. `column.meta.editable === false`면 editable이 아니다.
5. `column.meta.editable === true`면 editable이다.
6. column에 editor capability가 있으면 editable이다.
   - `renderEditor`
   - `editType`
   - `editOptions`
   - `getEditOptions`

## 5. Editor 렌더링 우선순위

Edit Mode에 진입하면 editor는 다음 순서로 결정된다.

1. `column.meta.renderEditor(ctx)`
2. `editorFactory(ctx)`
3. built-in default editor

Built-in default editor는 `editType`에 따라 다음 element를 렌더링한다.

| `editType` | Editor |
| --- | --- |
| 없음 또는 `'text'` | `<input type="text">` |
| `'number'` | `<input type="number">` |
| `'date'` | `<input type="date">` |
| `'select'` | `<select>` |
| `'textarea'` | `<textarea>` |
| `'checkbox'` | `<input type="checkbox">` |

## 6. Editor Context

`renderEditor`와 `editorFactory`는 동일한 `GenDataGridEditorContext`를 받는다. Column-level editor가 grid-level fallback editor보다 좁은 기능을 받지 않도록 context surface는 대칭으로 유지한다.

| Field | 설명 |
| --- | --- |
| `row` | 원본 row data. |
| `rowId` | row id. |
| `rowIndex` | 현재 row index. |
| `columnId` | column id. |
| `value` | edit 시작 시점의 원래 cell value. |
| `draftValue` | 현재 편집 중인 임시 값. |
| `setDraftValue(nextValue)` | draft value를 갱신한다. |
| `commit(nextValue?)` | edit mode를 commit으로 종료한다. |
| `cancel()` | edit mode를 cancel로 종료한다. |
| `applyValue(nextValue)` | draft를 설정한 뒤 즉시 commit한다. |
| `editType` | `renderEditor`와 `editorFactory`에 전달되는 resolved edit type. |
| `editOptions` | `renderEditor`와 `editorFactory`에 전달되는 select options. |
| `placeholder` | `renderEditor`와 `editorFactory`에 전달되는 placeholder. |
| `selectOnFocus` | `renderEditor`와 `editorFactory`에 전달되는 select-on-focus 정책. |
| `commitOnBlur` | `renderEditor`와 `editorFactory`에 전달되는 blur commit 정책. |
| `tabNavigate(direction)` | `renderEditor`와 `editorFactory`에 전달되는 Tab/Shift+Tab editable-cell navigation callback. |

## 7. Commit Event

`onCellValueChange(args)`는 commit 시 호출된다.

| Field | 설명 |
| --- | --- |
| `row` | 원본 row data. |
| `rowId` | row id. |
| `rowIndex` | row index. |
| `columnId` | column id. |
| `previousValue` | edit 시작 시점의 값. |
| `value` | commit된 값. |

현재 Gate 4에서는 GenDataGrid가 `data`를 직접 변경하지 않는다. 화면에 변경 값을 반영하려면 parent가 `onCellValueChange`에서 `data`를 갱신해야 한다.

## 8. Edit 진입 방식

현재 구현된 edit 진입 방식은 다음과 같다.

- editable cell double-click
- Active Cell에서 Enter
- Active Cell에서 F2
- editable Active Cell 재클릭

## 8.1 Tab Navigation

현재 구현된 Tab navigation 정책은 다음과 같다.

- 비편집 상태:
  - Tab: 다음 cell로 Active Cell 이동
  - Shift+Tab: 이전 cell로 Active Cell 이동
  - grid 내부 끝에 도달하면 no-op
- 편집 상태:
  - Tab: 현재 값을 commit한 뒤 다음 editable cell로 이동
  - Shift+Tab: 현재 값을 commit한 뒤 이전 editable cell로 이동
  - editable cell 목록의 끝에 도달하면 현재 값을 commit하고 이동하지 않는다.

## 9. Edit 종료 방식

현재 구현된 edit 종료 방식은 다음과 같다.

- Enter: commit
- Tab/Shift+Tab: commit 후 editable cell 이동
- blur: `editCommitOnBlur`가 `true`일 때 commit
- 다른 cell activate: `editCommitOnBlur`가 `true`이면 commit 후 이동, `false`이면 cancel 후 이동
- Escape: cancel
- custom editor에서 `commit`, `cancel`, `applyValue` 호출

## 10. 보류 API와 정책

다음 항목은 public surface 또는 계획에는 존재하지만 runtime 정책이 확정되지 않아 deferred로 남긴다. `editOnActiveCell`과 `keepEditingOnNavigate`는 reserved public props로 유지하되, 사용 시 runtime warning을 낸다.

| 항목 | 보류 이유 |
| --- | --- |
| `editOnActiveCell` | active cell 변경, range selection, mouse activation과의 조합 정책이 필요하다. |
| `keepEditingOnNavigate` | navigation 중 commit/cancel/keep 정책과 dirty state 연동이 필요하다. |
| Printable-key edit entry | initial draft replacement, IME, existing value selection 정책이 필요하다. |
| 고급 Blur commit 정책 | select dropdown, custom editor portal, outside click, grid-in-grid boundary에 대한 추가 정책이 필요하다. 기본 editor의 `editCommitOnBlur`는 구현되어 있다. |
| Paste application | data mutation, validation, dirty state, range expansion 정책이 필요하다. |
| Dirty state integration | baseline data, commit accept/revert API가 필요하다. |

## 11. 구현 상태 요약

- Gate 4에서 구현 가능한 기본 Cell Edit API는 구현되어 있다.
- 복합 입력 정책, data mutation, dirty state, paste는 후속 gate 또는 editing refinement에서 다룬다.
- deferred API는 reserved/deferred 상태와 runtime warning을 명시해 public API 오해를 줄인다.
