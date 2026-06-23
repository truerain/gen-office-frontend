<!-- packages/gen-datagrid/docs/qa/gate-8-2-visual-test-guide.md
Manual QA checklist for Gate 8.2 master-detail row behavior.
-->

# Gate 8.2 Master-detail Row 수동 테스트 가이드

Storybook story: `gen-datagrid/Gates/Baseline > Gate82MasterDetailRow`

Gate 8.2는 non-virtualized body path에서 fixed-height detail panel을 row 아래에 렌더링하는 범위다. 이 문서는 Storybook에서 수동으로 확인해야 할 항목을 정리한다.

## 1. 기본 렌더링

| 점검 항목 | 기대 결과 |
| --- | --- |
| 초기 화면 | row 1의 detail panel이 열린 상태로 보인다. |
| detail 위치 | detail panel은 owner row 바로 아래에 렌더링된다. |
| detail 높이 | detail panel 높이가 일정하게 유지된다. |
| 전체 scroll | detail panel이 viewport scroll 흐름을 깨지 않는다. |
| 확장 불가 row | row 4에는 expand/collapse 버튼이 없다. |

## 2. Expand / Collapse 동작

| 동작 | 기대 결과 |
| --- | --- |
| row의 `+` 버튼 클릭 | 해당 row의 detail panel이 열린다. |
| row의 `-` 버튼 클릭 | 해당 row의 detail panel이 닫힌다. |
| `Expand rows 1 and 3` 버튼 클릭 | row 1과 row 3 detail panel이 열린다. |
| `Collapse all` 버튼 클릭 | 모든 detail panel이 닫힌다. |
| detail panel의 `Collapse detail` 클릭 | 해당 row의 detail panel만 닫힌다. |
| 상단 `Expanded rows` 표시 | 현재 열린 row id 목록과 일치한다. |

## 3. Grid Cell 상호작용

| 점검 항목 | 기대 결과 |
| --- | --- |
| expand/collapse 버튼 클릭 | cell edit mode로 진입하지 않는다. |
| data cell 클릭 | 기존처럼 active cell이 이동한다. |
| Arrow key 이동 | detail row를 대상으로 삼지 않고 data cell 사이에서만 이동한다. |
| range selection | detail panel이 열려 있어도 data cell range selection이 기존처럼 동작한다. |
| cell 편집 | detail panel 상태와 무관하게 Enter/blur commit이 기존처럼 동작한다. |

## 4. Detail Panel 내부 상호작용

| 점검 항목 | 기대 결과 |
| --- | --- |
| `Update note` 버튼 클릭 | 해당 row의 note 값이 갱신된다. |
| detail panel 내부 버튼 클릭 | parent grid range selection이 시작되지 않는다. |
| detail panel 내부 focus | Arrow/Enter 같은 key가 parent grid navigation으로 잘못 전달되지 않는다. |
| detail panel 내부 click | parent active cell이나 selection이 의도 없이 변경되지 않는다. |

## 5. Deferred 범위 확인

| 항목 | Gate 8.2 정책 |
| --- | --- |
| virtualization + master-detail | 지원하지 않는다. |
| nested `GenDataGrid` 공식 composition | Gate 8.3 대상이다. |
| dynamic detail height | Gate 8.4 이후 대상이다. |
| tree row model | 별도 gate 대상이다. |
| row merge/span | Gate 8.6 대상이다. |

## 6. 실패로 봐야 하는 증상

- detail panel이 owner row와 떨어진 위치에 나타난다.
- detail panel이 data cell처럼 active cell navigation 대상이 된다.
- detail panel 내부 버튼 클릭으로 parent range selection이 시작된다.
- expand/collapse 버튼 클릭이 cell editing으로 처리된다.
- row 4처럼 확장 불가로 설정된 row에 expand/collapse 버튼이 보인다.
- `expandedRows` 표시와 실제 열린 detail panel 상태가 다르다.