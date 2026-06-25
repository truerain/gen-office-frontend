<!-- packages/gen-datagrid/docs/qa/gate-8-5-visual-test-guide.md
Manual QA checklist for Gate 8.5 tree row model behavior.
-->

# Gate 8.5 Tree Row Model 수동 테스트 가이드

Gate 8.5는 nested data를 tree row로 렌더링하고, expand/collapse 후 active cell, selection, editing, virtualization이 visible row 기준으로 유지되는지 확인하는 범위다.

## Storybook

- Story: `Gate85TreeRows`

## 기본 표시

| 점검 | 기대 결과 |
| --- | --- |
| 초기 화면 | row 1, row 2가 expanded 상태로 표시된다. |
| child row 위치 | child row가 parent 바로 아래에 표시된다. |
| indentation | child row의 첫 cell content가 parent보다 오른쪽으로 들여쓰기된다. |
| toggle | parent row 첫 cell에 tree expand/collapse toggle이 표시된다. |
| leaf row | child leaf row는 toggle 대신 같은 폭의 spacer를 유지한다. |

## Mouse Interaction

| 동작 | 기대 결과 |
| --- | --- |
| parent tree toggle 클릭 | 해당 parent row만 expand/collapse된다. |
| toggle mousedown 후 drag | range selection이 시작되지 않는다. |
| child cell 클릭 | child row의 cell이 active cell이 된다. |
| child active 상태에서 parent collapse | active cell이 parent 같은 column으로 이동한다. |

## Keyboard

| 동작 | 기대 결과 |
| --- | --- |
| collapsed parent에서 `ArrowRight` | parent가 expanded 된다. |
| expanded parent에서 `ArrowLeft` | parent가 collapsed 된다. |
| collapsed child에서 `ArrowLeft` | parent row 같은 column으로 이동한다. |
| editing input 안의 Arrow key | editor가 key event를 소유하고 tree navigation이 실행되지 않는다. |
| `Space` | tree toggle 단축키로 동작하지 않는다. |

## Editing

| 동작 | 기대 결과 |
| --- | --- |
| parent/child editable cell 수정 후 blur | 값이 commit되어 화면에 유지된다. |
| child editing 중 parent collapse | 숨겨진 child editor가 종료되고 parent grid 상태가 깨지지 않는다. |
| collapse 후 다시 expand | 기존 data와 dirty state가 유지된다. |

## Virtualization

| 동작 | 기대 결과 |
| --- | --- |
| expanded 상태에서 scroll | child rows가 parent 아래에 유지되고 겹치지 않는다. |
| collapse 후 scroll offset | row가 튀거나 빈 공간이 남지 않는다. |
| active cell focus restore | visible tree row 기준으로 복구된다. |

## Filtering/Pagination Policy 확인

Gate 8.5 MVP 정책:

- client filtering은 descendant match가 있으면 ancestor도 표시하는 방향이다.
- client pagination은 expanded visible rows 기준으로 동작한다.
- manual filtering/pagination은 consumer가 전달한 현재 data/page 안에서만 tree를 처리한다.

## 실패로 볼 증상

- collapsed child row가 active cell, range selection, clipboard, paste 대상에 남아 있다.
- parent collapse 후 focus가 사라지거나 숨겨진 child cell을 계속 가리킨다.
- tree toggle 클릭이 cell editing이나 range drag를 시작한다.
- virtualized scroll 중 child row가 잘못된 parent 아래에 표시된다.
- child editing commit 값이 collapse/expand 후 사라진다.