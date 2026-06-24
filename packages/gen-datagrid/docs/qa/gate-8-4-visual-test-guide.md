<!-- packages/gen-datagrid/docs/qa/gate-8-4-visual-test-guide.md
Manual QA checklist for Gate 8.4 dynamic row height and virtualized master-detail behavior.
-->

# Gate 8.4 Dynamic Row Height 수동 테스트 가이드

Storybook story: `gen-datagrid/Gates/Baseline > Gate84DynamicRowHeight`

Gate 8.4는 virtualized body에서 row별 높이와 expanded detail panel 높이를 virtualizer 측정에 반영하는 범위다. 핵심은 expanded detail panel이 있어도 scroll offset, active cell focus, range selection이 깨지지 않는지 확인하는 것이다.

## 1. 기본 렌더링

| 점검 항목 | 기대 결과 |
| --- | --- |
| 초기 화면 | row 3 detail panel이 열린 상태로 보인다. |
| row별 높이 | 7번째 간격의 tall row가 일반 row보다 높게 보인다. |
| detail panel | expanded row 아래에 detail panel이 표시된다. |
| virtual scroll | 1000 rows에서 viewport 안의 일부 row만 렌더링된다. |
| layout | expanded detail panel 아래 row들이 겹치지 않는다. |

## 2. Expand / Collapse

| 동작 | 기대 결과 |
| --- | --- |
| `Expand rows 3 and 25` 클릭 | row 3과 row 25가 expanded 상태가 된다. |
| `Collapse all` 클릭 | 모든 detail panel이 닫히고 row offset이 다시 정리된다. |
| row expand/collapse 버튼 클릭 | 해당 row만 열리고 닫힌다. |
| expand/collapse 반복 | 아래 row들이 겹치거나 빈 영역이 생기지 않는다. |

## 3. Scroll / Focus

| 동작 | 기대 결과 |
| --- | --- |
| `Scroll to row 250 note` 클릭 | row 250의 note cell이 viewport 안으로 이동한다. |
| expanded row 위아래 스크롤 | scroll 위치가 급격히 깨지지 않는다. |
| Arrow key navigation | expanded detail row를 건너뛰고 data cell 사이에서만 이동한다. |
| active cell restore | 스크롤 후 active cell focus가 data cell로 복구된다. |

## 4. Range Selection

| 동작 | 기대 결과 |
| --- | --- |
| expanded row 주변 drag selection | detail row가 selection 대상이 되지 않는다. |
| tall row 주변 drag selection | row id 기준 selection이 유지된다. |
| scroll 후 selected row 재진입 | selected cell styling이 복구된다. |

## 5. Nested / Detail Content

| 점검 항목 | 기대 결과 |
| --- | --- |
| detail panel 내부 버튼 | parent range selection을 시작하지 않는다. |
| detail content 표시 | fixed detail panel 안에서 내용이 잘리지 않고 스크롤 가능하다. |
| child grid 조합 | Gate 8.3 ownership 규칙이 유지된다. |

## 6. 실패로 봐야 하는 증상

- expanded detail panel 아래 row가 겹친다.
- collapse 후 큰 빈 영역이 남는다.
- `scrollToCell`이 expanded row 아래쪽 target으로 이동하지 못한다.
- detail row가 active cell navigation 대상이 된다.
- range selection이 detail panel 내부에서 시작된다.
- virtualized scroll 후 selected/active cell marker가 복구되지 않는다.