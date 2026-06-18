<!-- packages/gen-datagrid/docs/reference/editor-implementation-contract.md
Defines Gate 4.1 as the shared editing policy contract for built-in and future custom editors.
-->

# GenDataGrid Editor 구현 계약

이 문서는 **Gate 4.1 Editing Policy**가 무엇을 정리했는지, 그리고 앞으로 추가하는 **built-in / custom / popup / modal editor**가 어떤 기준을 따라야 하는지 설명한다.

Gate 4.1은 “편집 기능 하나를 더 붙이는 작업”이 아니라, 편집 진입·이동·종료를 **명시적이고 테스트 가능한 계약**으로 고정하는 작업이다. 이후 combobox, datepicker, modal lookup, rich text 같은 editor도 이 계약 위에서 구현한다.

관련 문서:

- 슬라이스별 설계: [`gate-4-1-editing-policy-architecture.md`](../architecture/gate-4-1-editing-policy-architecture.md)
- public API 상태: [`cell-edit-api.md`](cell-edit-api.md)
- 용어: [`terminology.md`](terminology.md)

## 1. Gate 4와 Gate 4.1의 관계

| 단계 | 목적 | 상태 |
| --- | --- | --- |
| **Gate 4** | cell editing 최소 UX — editable 판정, editor 렌더링, commit/cancel, Tab 이동, 기본 `editCommitOnBlur` | complete |
| **Gate 4.1** | Gate 4에서 deferred였던 **편집 정책**을 서브 슬라이스로 완성 | complete (4.1-b/c/d) |

Gate 4.1은 Gate 4 runtime 위에 올라간다. renderer, `useCellEditing`, `GenDataGridEditorContext`, `onCellValueChange` 흐름은 유지하고, **정책만 분리·명시**한다.

Gate 4.1이 다루지 않는 것:

- clipboard paste application → **Gate 4.2**
- data mutation / dirty-state 본격 연동 → Gate 4.2 이후

## 2. Gate 4.1 서브 슬라이스

Gate 4.1은 한 번에 구현하지 않고, 아래 순서로 나눈다.

| 슬라이스 | 주제 | 핵심 산출 | 상태 |
| --- | --- | --- | --- |
| **4.1-b** | edit entry / continuation / open | public `editPolicy`, `startTriggers`, `continueTriggers`, `openOnEditStart` | complete |
| **4.1-c** | built-in keyboard ownership | `text`/`number`/`date`/`checkbox` vs `textarea`/`select` Arrow·Enter·Escape 정책 | complete |
| **4.1-d** | blur / portal / modal lifecycle | portal blur 무시, modal-owned commit/cancel, editor context blur 힌트 | complete |

`editOnActiveCell`, `keepEditingOnNavigate`는 reserved public prop으로 남아 있으나, Gate 4.1-b/c/d의 구체 정책(`editPolicy`, keyboard ownership, blur ownership)으로 대체·분해된다.

## 3. 정책 축 — 모든 editor의 공통 기준

새 editor를 설계할 때는 아래 다섯 축에 답해야 한다.

### 3.1 진입 (Entry) — Gate 4.1-b

`editPolicy.startTriggers` 또는 Gate 4 기본 진입 경로:

| trigger | 의미 |
| --- | --- |
| `reclick` | 이미 active인 editable cell 재클릭 |
| `doubleClick` | 더블클릭 |
| `enter` | Enter |
| `f2` | F2 |
| `printableKey` | 인쇄 가능 키로 편집 시작 |

- grid default + column `meta.editPolicy` override
- column override가 grid default보다 우선

### 3.2 연속 (Continuation) — Gate 4.1-b

편집 중 다른 셀로 이동할 때 다음 셀을 **즉시 다시 편집**할지:

| trigger | 의미 |
| --- | --- |
| `click` | 다른 셀 클릭 |
| `tab` | Tab / Shift+Tab |
| `arrowKey` | Arrow 이동 |

공통 규칙:

- 이전 셀은 기본적으로 **commit** 후 이동
- 목적지가 non-editable이면 **active만** 이동
- continuation이 켜져 있으면 목적지 editable cell에서 다시 편집 진입
- `openOnEditStart`는 continuation 진입에도 동일하게 적용

### 3.3 열기 (Open) — Gate 4.1-b

`openOnEditStart`:

- mount 시 dropdown / picker / popover를 즉시 열지
- grid default + column override
- built-in `select`, `date`에 best-effort 적용
- production-grade immediate-open은 custom popup editor가 필요할 수 있음

### 3.4 키보드 소유권 (Keyboard) — Gate 4.1-c

편집 중 키 입력을 **grid**가 가져갈지 **editor**가 가져갈지:

| editType | Arrow | Tab | Enter | Escape |
| --- | --- | --- | --- | --- |
| `text`, `number`, `date` | grid 이동 | commit + 이동 | commit | cancel |
| `textarea` | editor-local caret | commit + 이동 | newline | cancel |
| `select` | editor-first (native option) | commit + 이동 | confirm/commit | native close/cancel |
| `checkbox` | grid 이동 | commit + 이동 | toggle/commit | cancel |

구현 기준 코드:

- `src/features/editing/builtinEditorKeyboard.ts`
- `src/features/editing/renderEditor.tsx`

**중요:** `continueTriggers.arrowKey: true`여도 `textarea`/`select`는 Arrow를 grid로 넘기지 않는다. keyboard ownership이 continuation보다 우선한다.

popup/custom editor의 keyboard policy는 popup 인프라와 함께 Gate 4.1-d 또는 후속 슬라이스에서 같은 분류로 확장한다.

### 3.5 종료 / blur 소유권 (Blur) — Gate 4 / 4.1-d

| 종류 | 소유자 | 현재 상태 |
| --- | --- | --- |
| **inline blur commit** | built-in input/textarea + `editCommitOnBlur` | Gate 4 implemented |
| **다른 셀 activate** | `editCommitOnBlur` true → commit, false → cancel | Gate 4 implemented |
| **portal-safe blur ignore** | select dropdown, popover editor portal | Gate 4.1-d implemented |
| **modal-owned lifecycle** | modal editor가 commit/cancel 소유 | Gate 4.1-d implemented |

구현된 editor context 필드:

- `editEntryReason`
- `blurOwnership`
- `registerEditorSurface` / `unregisterEditorSurface`
- `getGridRoot` / `getEditorSurfaces`

## 4. Editor 렌더링 계약

### 4.1 렌더링 우선순위

1. `column.meta.renderEditor(ctx)`
2. `editorFactory(ctx)`
3. built-in default editor (`renderEditor.tsx`)

### 4.2 Editor Context (`GenDataGridEditorContext`)

custom editor는 grid 밖에서 독자적으로 편집을 끝내지 않고, context API로 협력한다.

| Field | 용도 | 상태 |
| --- | --- | --- |
| `row`, `rowId`, `rowIndex`, `columnId`, `value` | 편집 대상 식별 | implemented |
| `draftValue`, `setDraftValue` | 편집 중 값 | implemented |
| `commit`, `cancel`, `applyValue` | 편집 종료 | implemented |
| `editType`, `editOptions`, `placeholder` | built-in 메타 | implemented |
| `selectOnFocus`, `commitOnBlur` | focus/blur 정책 | implemented |
| `tabNavigate`, `arrowNavigate` | grid orchestration 콜백 | implemented |
| `openOnEditStart` | mount 시 open 시도 | implemented (4.1-b) |
| `editEntryReason` | 진입 이유 | planned (4.1-d) |
| blur ownership hint | portal/modal blur 무시 | planned (4.1-d) |

### 4.3 Built-in editor = 참조 구현

| editType | 참고할 정책 분류 | 이후 editor 예 |
| --- | --- | --- |
| `text`, `number` | inline + grid Arrow | 일반 입력, 숫자 |
| `date` | inline + grid Arrow + `openOnEditStart` | custom datepicker |
| `textarea` | editor-local Arrow/Enter | multiline, code snippet |
| `select` | editor-first Arrow + open + portal blur 이슈 | combobox, lookup |
| `checkbox` | inline toggle + grid Arrow | Y/N switch |

새 editor를 만들 때 “이 editor는 built-in 중 무엇과 같은 정책 분류인가?”를 먼저 정한다.

## 5. 새 Editor 구현 체크리스트

combobox, datepicker, modal search popup 등 **어떤 editor든** 아래 질문에 답할 수 있어야 한다.

### 진입 / 연속

- [ ] 어떤 `startTriggers`에 반응하는가?
- [ ] Tab/Arrow/click 이동 시 `continueTriggers`를 따르는가?
- [ ] mount 시 `openOnEditStart`가 필요한가?

### 키보드

- [ ] Arrow는 grid, editor-local, editor-first 중 어디 소유인가?
- [ ] Enter는 commit, newline, confirm 중 무엇인가?
- [ ] Escape는 cancel만 하는가, native close 경로가 있는가?

### 종료 / blur

- [ ] blur owner는 inline, portal, modal 중 무엇인가?
- [ ] portal로 focus가 이동할 때 grid blur handler가 편집을 끝내지 않는가?
- [ ] `commitOnBlur` / 다른 셀 클릭 / outside click이 같은 규칙을 따르는가?
- [ ] `commit`, `cancel`, `applyValue`를 언제 호출하는가?

### grid 경계

- [ ] nested grid / multiple grid 화면에서 focused grid만 편집을 종료하는가?
- [ ] editor 내부 클릭이 range selection을 시작하지 않는가?

### 검증

- [ ] interaction test로 정책 핵심 경로를 자동 검증했는가?
- [ ] Storybook 시나리오로 browser-only 동작을 수동 확인했는가?

## 6. 검증 기준과 Storybook

Gate 4.1은 gate마다 **자동 테스트 + Storybook 수동 확인**을 쌍으로 둔다.

| 슬라이스 | Storybook | 자동 테스트 |
| --- | --- | --- |
| 4.1-b | `Gate41BEditPolicy` | `editPolicy` continuation interaction tests |
| 4.1-c | `Gate41CEditNavigation` | `builtinEditorKeyboard.test.ts`, interaction tests |
| 4.1-d | `Gate41DBlurPolicy` | portal blur ignore, modal lifecycle |

Storybook 경로: `gen-datagrid / Gates / Baseline`

이후 editor 추가 시에도:

1. 기존 gate 스토리에서 회귀가 없는지 확인
2. editor 전용 스토리 또는 column 시나리오 추가
3. jsdom으로 가능한 interaction test 추가
4. native picker / portal DOM은 수동 checklist로 남김

## 7. 구현 위치 맵

```text
src/features/editing/
  editPolicy.ts              # 4.1-b merged policy resolution
  builtinEditorKeyboard.ts   # 4.1-c built-in key ownership
  renderEditor.tsx           # built-in reference editors
  editorContext.ts           # shared context builder
  useCellEditing.ts          # editing state
  editNavigation.ts          # editable-cell target resolution
  (blurPolicy.ts)            # 4.1-d 예정

src/renderers/div-grid/
  DataGridRoot.tsx           # entry orchestration, root keydown
  DataGridBodyRow.tsx        # per-cell editor context, tab/arrow navigate

src/stories/
  GenDataGrid.baseline.stories.tsx
```

## 8. 권장 구현 순서 (custom editor)

1. **정책 분류** — built-in 참조 타입과 keyboard/blur 분류 결정
2. **`renderEditor` 구현** — `GenDataGridEditorContext`만 사용
3. **4.1-b 정책 연동** — `editPolicy`, `openOnEditStart` 확인
4. **4.1-c keyboard** — grid callback(`arrowNavigate`, `tabNavigate`) 소비 여부 결정
5. **4.1-d blur** — portal/modal이면 blur ownership 선언 (4.1-d 완료 후)
6. **테스트·Storybook** — gate 패턴에 맞춰 추가

popup/modal editor 인프라가 아직 없으면, keyboard·blur 정책만 문서화하고 구현은 4.1-d 이후로 미룬다. 정책 분류를 먼저 문서에 남기는 것만으로도 이후 작업 기준이 된다.

## 9. 진행 상태 요약

| 항목 | 상태 |
| --- | --- |
| Gate 4 기본 editing API | complete |
| Gate 4.1-b `editPolicy` | complete |
| Gate 4.1-c built-in keyboard | complete |
| Gate 4.1-d blur / portal / modal | complete |
| Gate 4.2 paste | planned |
| `editOnActiveCell` / `keepEditingOnNavigate` | reserved, warning only |

Gate 4.1이 완료되면, GenDataGrid에 붙는 모든 editor는 **같은 policy surface** 위에서 일관되게 동작해야 한다. built-in editor는 그 계약의 참조 구현이고, custom editor는 그 계약을 구현하는 소비자다.
