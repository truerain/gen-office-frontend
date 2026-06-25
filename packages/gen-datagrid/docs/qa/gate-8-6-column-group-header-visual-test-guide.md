<!-- packages/gen-datagrid/docs/qa/gate-8-6-column-group-header-visual-test-guide.md
Manual QA checklist for Gate 8.6-b column group header behavior.
-->

# Gate 8.6-b Column Group Header 수동 테스트 가이드

Gate 8.6-b는 TanStack column group을 header row로 표시하는 기능이다. 이것은 미래의 임의 `Header ColSpan` API가 아니라, nested `ColumnDef.columns` 구조를 header에 반영하는 기능이다.

## Storybook

- Story: `Gate86ColumnGroupHeader`

## 기본 표시

| 점검 항목 | 기대 결과 |
| --- | --- |
| Identity group | Name, Role 위에 하나의 group header로 표시된다. |
| Metrics group | Score 위에 group header로 표시된다. |
| Context group | Location, Note 위에 하나의 group header로 표시된다. |
| leaf header row | Name, Role, Score, Location, Note leaf header가 기존처럼 표시된다. |

## Interaction

| 동작 | 기대 결과 |
| --- | --- |
| leaf header resize | leaf column resize handle이 정상 동작한다. |
| leaf header reorder | leaf column reorder handle이 정상 표시되고 기존 정책대로 동작한다. |
| group header 클릭 | group header 자체가 resize/reorder/filter 조작점을 갖지 않는다. |
| body cell 이동/수정 | active cell, keyboard navigation, edit commit 정책이 기존과 동일하다. |

## 조합 확인

| 조합 | 기대 결과 |
| --- | --- |
| vertical scroll | sticky header가 group row와 leaf row를 함께 유지한다. |
| horizontal scroll | group header span과 leaf header 폭이 맞게 움직인다. |
| column resize 후 | group header 폭이 child leaf column 폭 합계에 맞춰 보인다. |
| columnFitMode grow | viewport가 column 합보다 넓어도 오른쪽 여백 없이 폭이 채워진다. |
| filter enabled scenario | filter UI는 leaf header에만 표시되어야 한다. |

## 실패로 볼 증상

- group header row가 표시되지 않는다.
- group header가 child column 수만큼 span되지 않는다.
- leaf header의 resize/reorder/filter 핸들이 사라진다.
- group header cell에 leaf column용 조작 핸들이 표시된다.
- header row가 겹치거나 sticky 영역에서 깨진다.
