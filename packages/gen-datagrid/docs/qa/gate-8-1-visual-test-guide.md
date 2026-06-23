<!-- packages/gen-datagrid/docs/qa/gate-8-1-visual-test-guide.md
Documents manual Storybook checks for Gate 8.1 multi-grid boundary ownership.
-->

# Gate 8.1 Multi-grid Boundary 수동 테스트 가이드

## Storybook 시나리오

- Story: 'gen-datagrid/Gates/Baseline/Gate81MultiGridBoundary'
- 목적: parent grid 안에 child grid가 nested root로 들어간 상태에서 keyboard, selection, copy/paste, editing ownership이 서로 섞이지 않는지 확인한다.

## 초기 상태

- Parent grid가 상단에 렌더링되고, parent footer 영역 안에 'Nested child grid'가 보인다.
- 상단 'Latest boundary events' 영역은 최근 parent/child 이벤트를 표시한다.
- Parent grid 기본 active cell은 row '1' / column 'name'이다.
- Child grid 기본 active cell은 row 'child-1' / column 'name'이다.

## 수동 테스트 포인트

| 항목 | 절차 | 기대 결과 | 실패 조건 |
|---|---|---|---|
| Parent click/focus ownership | Child cell을 클릭한 뒤 Parent cell을 클릭한다. | 최신 로그에 'parent click row/column' 또는 'parent focus row/column'이 표시된다. | Parent를 클릭했는데 최신 로그가 계속 child 이벤트로만 남는다. |
| Child click/focus ownership | Parent cell을 클릭한 뒤 Child cell을 클릭한다. | 최신 로그에 'child click row/column' 또는 'child focus row/column'이 표시된다. | Child를 클릭했는데 parent click/focus 이벤트가 찍힌다. |
| Parent keyboard ownership | Parent cell을 클릭하고 'ArrowRight'를 누른다. | 최신 로그에 'parent key ArrowRight row/column'이 먼저 보이고, 이동이 발생하면 'parent active ...'가 이어진다. | Child key/active 이벤트가 찍히거나 로그가 갱신되지 않는다. |
| Child keyboard ownership | Child cell을 클릭하고 'ArrowRight'를 누른다. | 최신 로그에 'child key ArrowRight row/column'이 먼저 보이고, 이동이 발생하면 'child active ...'가 이어진다. | Parent key/active 이벤트가 찍히거나 로그가 갱신되지 않는다. |
| Parent range ownership | Parent grid에서 drag로 range를 선택한다. | Parent range만 표시되고 event log에 'parent range ...'가 찍힌다. | Child range가 같이 바뀐다. |
| Child range ownership | Child grid에서 drag로 range를 선택한다. | Child range만 표시되고 event log에 'child range ...'가 찍힌다. | Parent range가 새로 생기거나 parent range 이벤트가 찍힌다. |
| Parent paste ownership | Parent editable cell을 선택하고 텍스트를 paste한다. | Parent cell 값만 바뀌고 'parent edit ...'가 찍힌다. | Child cell 값이 바뀌거나 child edit 이벤트가 찍힌다. |
| Child paste ownership | Child editable cell을 선택하고 텍스트를 paste한다. | Child cell 값만 바뀌고 'child edit ...'가 찍힌다. | Parent cell 값이 바뀌거나 parent edit 이벤트가 찍힌다. |
| Parent editing focus | Parent cell을 더블클릭해 editor를 열고 값을 수정한다. | Parent editor만 열리고 commit/cancel이 parent에만 반영된다. | Child grid focus가 이동하거나 child edit 이벤트가 찍힌다. |
| Child editing focus | Child cell을 더블클릭해 editor를 열고 값을 수정한다. | Child editor만 열리고 parent active/focus가 빼앗기지 않는다. | Parent active cell이 이동하거나 parent edit 이벤트가 찍힌다. |
| Copy ownership | Parent와 child 각각 range를 만든 뒤 child cell에 focus하고 'Ctrl+C'를 누른다. | clipboard에는 child selection 값만 들어간다. | Parent selection 값이 복사된다. |
| Focus return | Child 조작 후 parent cell을 클릭하고 arrow key를 누른다. | Parent click/focus 로그가 먼저 찍히고, 이후 'parent key ...'와 parent active 이동이 보인다. | Parent가 keydown을 무시하거나 child가 계속 반응한다. |
## 참고

- Gate 8.1은 master-detail API를 구현한 gate가 아니다. 이 Storybook은 parent footer 안에 child grid를 넣어 nested root boundary를 강제로 검증하는 수동 테스트 화면이다.
- Dynamic row height, official nested grid composition, tree row model은 Gate 8.2 이후 범위다.
- 수동 테스트 중 parent/child 이벤트가 동시에 찍히면 boundary ownership 실패로 본다.