<!-- packages/gen-datagrid/docs/reference/editor-implementation-contract.md
Defines Gate 4.1 as the shared editing policy contract for built-in and future custom editors.
-->

# GenDataGrid Editor 구현 계약

이 문서는 **Gate 4.1 Editing Policy**가 무엇을 고정했는지, 그리고 앞으로 추가되는
built-in, custom, popup, modal editor가 어떤 기준을 따라야 하는지 설명한다.

관련 문서:

- 슬라이스별 설계: [`gate-4-1-editing-policy-architecture.md`](../architecture/gate-4-1-editing-policy-architecture.md)
- public API 상태: [`cell-edit-api.md`](cell-edit-api.md)
- 용어: [`terminology.md`](terminology.md)

## 1. Gate 4와 Gate 4.1의 관계

| 단계 | 목적 | 상태 |
| --- | --- | --- |
| **Gate 4** | editable 판정, editor 렌더링, commit/cancel, Tab 이동, 기본 `editCommitOnBlur` | complete |
| **Gate 4.1** | Gate 4에서 deferred였던 편집 정책을 세부 슬라이스로 완성 | complete (4.1-b/c/d) |

Gate 4.1은 renderer, `useCellEditing`, `GenDataGridEditorContext`,
`onCellValueChange` 흐름을 유지하면서 편집 진입, 이동, 열림, 키보드 소유권,
blur 소유권을 명시적으로 고정한다.

Gate 4.1이 다루지 않는 범위:

- clipboard paste application: Gate 4.2에서 plain-text MVP 완료
- grid 내부 data mutation
- batch paste callback
- paste-to-selection

## 2. Gate 4.1 세부 슬라이스

| 슬라이스 | 주제 | 산출물 | 상태 |
| --- | --- | --- | --- |
| **4.1-b** | edit entry / continuation / open | `editPolicy`, `startTriggers`, `continueTriggers`, `openOnEditStart` | complete |
| **4.1-c** | built-in keyboard ownership | `text`, `number`, `date`, `checkbox`, `textarea`, `select`의 Arrow/Enter/Escape 정책 | complete |
| **4.1-d** | blur / portal / modal lifecycle | portal blur 무시, modal-owned commit/cancel, editor surface 등록 | complete |

`editOnActiveCell`과 `keepEditingOnNavigate`는 reserved public prop으로 남아 있지만,
현재 권장 계약은 `editPolicy`, keyboard ownership, blur ownership을 사용하는 것이다.

## 3. 모든 Editor의 공통 기준

새 editor를 추가할 때는 다음 다섯 축을 먼저 결정한다.

### 3.1 진입

`editPolicy.startTriggers` 또는 Gate 4 기본 진입 경로:

| Trigger | 의미 |
| --- | --- |
| `reclick` | 이미 active인 editable cell 재클릭 |
| `doubleClick` | 더블클릭 |
| `enter` | Enter |
| `f2` | F2 |
| `printableKey` | printable key 입력으로 편집 시작 |

Column `meta.editPolicy`는 grid default보다 우선한다.

### 3.2 이동 중 계속 편집

편집 중 다른 셀로 이동할 때 다음 셀에서 즉시 다시 편집할지 결정한다.

| Trigger | 의미 |
| --- | --- |
| `click` | 다른 셀 클릭 |
| `tab` | Tab / Shift+Tab |
| `arrowKey` | Arrow 이동 |

공통 규칙:

- 이전 셀은 기본적으로 commit 후 이동한다.
- 목적지가 non-editable이면 active cell만 이동한다.
- continuation이 켜져 있고 목적지가 editable이면 새 셀에서 다시 편집한다.
- `openOnEditStart`는 continuation 진입에도 동일하게 적용한다.

### 3.3 열림

`openOnEditStart`는 editor mount 직후 dropdown, picker, popover를 즉시 여는 정책이다.

- grid default와 column override를 모두 지원한다.
- built-in `select`, `date`에는 best-effort로 적용한다.
- production-grade immediate open이 필요한 복잡한 editor는 custom popup editor로 구현한다.

### 3.4 키보드 소유권

편집 중 키 입력을 grid가 가질지 editor가 가질지 명확히 정해야 한다.

| editType | Arrow | Tab | Enter | Escape |
| --- | --- | --- | --- | --- |
| `text`, `number`, `date` | grid 이동 | commit + 이동 | commit | cancel |
| `textarea` | editor-local caret | commit + 이동 | newline | cancel |
| `select` | editor-first | commit + 이동 | confirm/commit | native close/cancel |
| `checkbox` | grid 이동 | commit + 이동 | toggle/commit | cancel |

관련 구현:

- `src/features/editing/builtinEditorKeyboard.ts`
- `src/features/editing/renderEditor.tsx`

`continueTriggers.arrowKey: true`여도 `textarea`와 `select`는 Arrow를 무조건 grid로 넘기지 않는다.
keyboard ownership이 continuation보다 우선한다.

### 3.5 종료와 Blur

| 종류 | 소유권 | 상태 |
| --- | --- | --- |
| **inline blur commit** | built-in input/textarea + `editCommitOnBlur` | Gate 4 implemented |
| **다른 셀 activate** | default commit, `editCommitOnBlur={false}`면 cancel | Gate 4.1-d policy correction |
| **portal-safe blur ignore** | select dropdown, popover editor portal | Gate 4.1-d implemented |
| **modal-owned lifecycle** | modal editor가 commit/cancel 소유 | Gate 4.1-d implemented |

Editor context 관련 필드:

- `editEntryReason`
- `blurOwnership`
- `registerEditorSurface` / `unregisterEditorSurface`
- `getGridRoot` / `getEditorSurfaces`

## 4. Editor 렌더링 계약

### 4.1 렌더링 우선순위

1. `column.meta.renderEditor(ctx)`
2. `editorFactory(ctx)`
3. built-in default editor (`renderEditor.tsx`)

### 4.2 Editor Context

Custom editor는 grid 바깥에서 독자적으로 편집을 끝내지 말고,
`GenDataGridEditorContext` API로 협력해야 한다.

| Field | 용도 | 상태 |
| --- | --- | --- |
| `row`, `rowId`, `rowIndex`, `columnId`, `value` | 편집 대상 정보 | implemented |
| `draftValue`, `setDraftValue` | 편집 중 값 | implemented |
| `commit`, `cancel`, `applyValue` | 편집 종료 | implemented |
| `editType`, `editOptions`, `placeholder` | built-in metadata | implemented |
| `selectOnFocus`, `commitOnBlur` | focus/blur 정책 | implemented |
| `tabNavigate`, `arrowNavigate` | grid orchestration callback | implemented |
| `openOnEditStart` | mount 후 open 시도 | implemented |
| `editEntryReason` | 진입 이유 | implemented |
| `blurOwnership` | resolved inline/portal/modal blur ownership | implemented |
| `registerEditorSurface` / `unregisterEditorSurface` | portal/modal surface registration | implemented |
| `getGridRoot` / `getEditorSurfaces` | blur boundary lookup helper | implemented |

### 4.3 Built-in Editor는 참조 구현이다

| editType | 참고 정책 분류 | 향후 editor 예 |
| --- | --- | --- |
| `text`, `number` | inline + grid Arrow | 일반 입력, 숫자 |
| `date` | inline + grid Arrow + `openOnEditStart` | custom datepicker |
| `textarea` | editor-local Arrow/Enter | multiline, code snippet |
| `select` | editor-first Arrow + open + portal blur issue | combobox, lookup |
| `checkbox` | inline toggle + grid Arrow | Y/N switch |

새 editor를 만들 때는 built-in 중 어떤 정책 분류와 가장 가까운지 먼저 정한다.

## 5. 새 Editor 구현 체크리스트

### 진입 / 이동

- [ ] 어떤 `startTriggers`에 반응하는가?
- [ ] Tab/Arrow/click 이동 시 `continueTriggers`를 따르는가?
- [ ] mount 후 `openOnEditStart`가 필요한가?

### 키보드

- [ ] Arrow는 grid, editor-local, editor-first 중 어디 소유인가?
- [ ] Enter는 commit, newline, confirm 중 무엇인가?
- [ ] Escape는 cancel만 하는가, native close 경로가 있는가?

### 종료 / Blur

- [ ] blur owner는 inline, portal, modal 중 무엇인가?
- [ ] portal로 focus가 이동할 때 grid blur handler가 편집을 끝내지 않는가?
- [ ] `commitOnBlur`, 다른 셀 클릭, outside click이 같은 규칙을 따르는가?
- [ ] `commit`, `cancel`, `applyValue`를 언제 호출하는가?

### Grid 경계

- [ ] nested grid / multiple grid 화면에서 focused grid만 편집을 종료하는가?
- [ ] editor 내부 클릭이 range selection을 시작하지 않는가?

### 검증

- [ ] interaction test로 정책 전달 경로를 자동 검증했는가?
- [ ] Storybook 시나리오로 browser-only 동작을 수동 확인했는가?

## 6. 검증 기준과 Storybook

Gate 4.1은 gate마다 자동 테스트와 Storybook 수동 확인을 함께 요구한다.

| 슬라이스 | Storybook | 자동 테스트 |
| --- | --- | --- |
| 4.1-b | `Gate41BEditPolicy` | `editPolicy` continuation interaction tests |
| 4.1-c | `Gate41CEditNavigation` | `builtinEditorKeyboard.test.ts`, interaction tests |
| 4.1-d | `Gate41DBlurPolicy` | portal blur ignore, modal lifecycle |

Storybook 경로: `gen-datagrid / Gates / Baseline`

새 editor 추가 시:

1. 기존 gate story에 회귀가 없는지 확인한다.
2. editor 전용 story 또는 column scenario를 추가한다.
3. jsdom으로 가능한 interaction test를 추가한다.
4. native picker / portal DOM은 수동 checklist로 남긴다.

## 7. 구현 위치

```text
src/features/editing/
  editPolicy.ts              # 4.1-b merged policy resolution
  builtinEditorKeyboard.ts   # 4.1-c built-in key ownership
  blurPolicy.ts              # 4.1-d blur ownership and editor surface guards
  editingCellActivation.ts   # other-cell activation commit/cancel handling
  editingDeactivate.ts       # shared deactivate commit/cancel policy
  renderEditor.tsx           # built-in reference editors
  editorContext.ts           # shared context builder
  useCellEditing.ts          # editing state
  editNavigation.ts          # editable-cell target resolution

src/renderers/div-grid/
  DataGridRoot.tsx           # entry orchestration, root keydown
  DataGridBody.tsx           # click continuation and other-cell activation
  DataGridVirtualBody.tsx    # virtualized click continuation parity
  DataGridBodyRow.tsx        # per-cell editor context, tab/arrow navigate

src/stories/
  GenDataGrid.baseline.stories.tsx
```

## 8. 권장 구현 순서

1. 정책 분류: built-in 참조 타입과 keyboard/blur 분류 결정
2. `renderEditor` 구현: `GenDataGridEditorContext`만 사용
3. 4.1-b 정책 연동: `editPolicy`, `openOnEditStart` 확인
4. 4.1-c keyboard: `arrowNavigate`, `tabNavigate` 사용 여부 결정
5. 4.1-d blur: portal/modal이면 blur ownership 선언 및 editor surface 등록
6. test/Storybook: gate 패턴에 맞춰 추가

Popup/modal editor infrastructure is not a separate grid renderer in Gate 4.1, but the
shared policy surface is implemented. Custom popup/modal editors should use
`blurOwnership`, `registerEditorSurface`, `unregisterEditorSurface`, `getGridRoot`, and
`getEditorSurfaces` from `GenDataGridEditorContext`.

## 9. 진행 상태 요약

| 항목 | 상태 |
| --- | --- |
| Gate 4 기본 editing API | complete |
| Gate 4.1-b `editPolicy` | complete |
| Gate 4.1-c built-in keyboard | complete |
| Gate 4.1-d blur / portal / modal | complete |
| Gate 4.2 paste (plain-text MVP) | complete |
| Gate 4.2 paste-to-selection / type coercion | deferred |
| `editOnActiveCell` / `keepEditingOnNavigate` | reserved, warning only |

Gate 4.1 이후 GenDataGrid에 붙는 모든 editor는 같은 policy surface 위에서
일관되게 동작해야 한다. Built-in editor는 그 계약의 참조 구현이고, custom editor는
그 계약을 구현하는 소비자다.
