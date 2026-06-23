<!-- packages/gen-datagrid/docs/qa/gate-8-3-visual-test-guide.md
Manual QA checklist for Gate 8.3 nested grid composition behavior.
-->

# Gate 8.3 Nested Grid Composition 수동 테스트 가이드

Storybook story: `gen-datagrid/Gates/Baseline > Gate83NestedGridComposition`

Gate 8.3은 parent grid의 detail panel 안에 child `GenDataGrid`를 렌더링하는 공식 composition을 검증한다. 핵심은 parent와 child의 active cell, range selection, keyboard, clipboard, editing ownership이 서로 섞이지 않는지 확인하는 것이다.

## 1. 기본 렌더링

| 점검 항목 | 기대 결과 |
| --- | --- |
| 초기 화면 | parent row 1 detail panel이 열린 상태로 보인다. |
| child grid 위치 | child grid가 row 1 detail panel 안에 보인다. |
| detail height | child grid가 fixed-height detail panel 안에서 안정적으로 표시된다. |
| 확장 대상 | row 1만 expand 가능하고 다른 parent row에는 expand 버튼이 없다. |
| Collapse all | detail panel과 child grid가 함께 사라진다. |
| Expand row 1 | detail panel과 child grid가 다시 보인다. |

## 2. Active Cell / Keyboard Ownership

| 동작 | 기대 결과 |
| --- | --- |
| child cell 클릭 후 Arrow key | child active cell만 이동한다. |
| child keyboard 이동 중 parent 상태 | parent active cell은 의도 없이 바뀌지 않는다. |
| parent cell 클릭 후 Arrow key | parent active cell 이동이 다시 동작한다. |
| parent keyboard 이동 중 child 상태 | child active cell은 마지막 상태를 유지한다. |
| Events 표시 | `child active ...` 또는 `parent active ...`가 실제 조작 대상과 일치한다. |

## 3. Range Selection Ownership

| 동작 | 기대 결과 |
| --- | --- |
| child grid에서 drag range selection | child range만 변경된다. |
| child range selection 중 parent 상태 | parent selected range가 의도 없이 변경되지 않는다. |
| parent grid에서 drag range selection | parent range만 변경된다. |
| Events 표시 | 조작한 grid 기준으로 `child range ...` 또는 `parent range ...`가 표시된다. |

## 4. Editing Ownership

| 동작 | 기대 결과 |
| --- | --- |
| child editable cell 편집 | child data만 변경된다. |
| child edit commit | Events에 `child edit row/column`이 표시된다. |
| child editing 중 parent 상태 | parent edit callback이 호출되지 않는다. |
| parent editable cell 편집 | parent data만 변경된다. |
| parent edit commit | Events에 `parent edit row/column`이 표시된다. |

## 5. Clipboard / Paste Ownership

| 동작 | 기대 결과 |
| --- | --- |
| child cell focus 후 copy | child selected range 기준 텍스트가 copy된다. |
| child editable cell focus 후 paste | child cell만 변경된다. |
| parent cell focus 후 copy | parent selected range 기준 텍스트가 copy된다. |
| parent editable cell focus 후 paste | parent cell만 변경된다. |
| cross-grid side effect | child copy/paste가 parent data나 selection을 변경하지 않는다. |

## 6. Deferred 범위 확인

| 항목 | Gate 8.3 정책 |
| --- | --- |
| detail panel auto height | 지원하지 않는다. |
| parent virtualization + master-detail | 지원하지 않는다. |
| parent-child relation data loading API | 지원하지 않는다. |
| tree row model | Gate 8.5 대상이다. |
| row merge/span | Gate 8.6 대상이다. |

## 7. 실패로 봐야 하는 증상

- child grid Arrow key가 parent active cell을 이동시킨다.
- child range drag가 parent selected range를 변경한다.
- child copy/paste가 parent clipboard/paste handler로 처리된다.
- child edit commit이 parent `onCellValueChange`로 들어간다.
- parent data cell을 클릭해도 keyboard ownership이 parent로 돌아오지 않는다.
- detail panel collapse/expand 후 child grid가 깨진 layout으로 남는다.