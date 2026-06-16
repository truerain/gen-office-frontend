<!-- packages/gen-datagrid/docs/qa/gate-5-visual-test-guide.md
Documents visual verification steps for GenDataGrid Gate 5.
-->

# Gate 5 화면 테스트 가이드

## 목적

Gate 5는 column pinning, sizing, reorder가 div grid 레이아웃에서 함께 깨지지 않는지 확인한다. 자동 테스트는 DOM 계약과 상태 전이를 검증하고, 화면 테스트는 실제 브라우저의 scroll, sticky, drag, resize, z-index 겹침을 확인한다.

## 기준 화면

Storybook에서 다음 스토리를 사용한다.

- `gen-datagrid/Gates/Baseline/Gate5PinningSizingReorder`

기준 조건:

- 왼쪽 pinned column: `name`
- 오른쪽 pinned column: `note`
- 가운데 column: `role`, `score`, `location`
- 기본 selected range: `name`부터 `score`까지
- `name`, `score`, `note`는 편집 가능한 cell을 포함한다.
- viewport 폭은 전체 column 폭보다 좁아 horizontal scroll이 발생한다.

## 확인 항목

1. 초기 렌더링
   - header와 body column 경계가 어긋나지 않는다.
   - 왼쪽 pinned `name` column이 왼쪽에 고정된다.
   - 오른쪽 pinned `note` column이 오른쪽에 고정된다.
   - selected range 배경이 pinned cell에서도 보인다.
   - active cell outline이 pinned cell 위에서 잘리지 않는다.

2. Horizontal scroll
   - When only `name` is left pinned, horizontally scroll until `role` is partly covered by the pinned area, then move/click focus into `role`. The grid must adjust horizontal scroll until the active `role` cell is fully visible outside the pinned overlay.
   - 가운데 column만 좌우로 움직인다.
   - left/right pinned column은 흔들리거나 겹치지 않는다.
   - left pinned column이 2개 이상일 때 표시 순서와 shadow edge가 `columnPinning.left` 순서를 따른다.
   - pinned edge shadow가 scroll 중에도 자연스럽게 유지된다.

3. Column resize
   - header resize handle을 drag하면 header와 body 폭이 같이 바뀐다.
   - pinned column의 resize handle을 drag하면 해당 pinned column만 resize된다.
   - resize handle drag 중 header 자체가 이동하거나 reorder drag ghost가 뜨지 않는다.
   - resized column 주변의 pinned offset이 어긋나지 않는다.
   - resize 중 text, active outline, selected range가 비정상적으로 겹치지 않는다.

4. Column reorder
   - reorder handle 버튼을 drag/drop하면 같은 pinning zone 안의 column 순서가 바뀐다.
   - left pinned column끼리 reorder하면 pinned 영역 안의 표시 순서가 바뀐다.
   - resize handle과 column 경계 영역에서는 reorder drag가 시작되지 않는다.
   - header label/text 영역에서는 reorder drag가 시작되지 않는다.
   - left pinned column을 unpinned column 위로 drop하거나 right pinned column으로 drop해도 순서가 바뀌지 않는다.
   - reorder 후 header/body column 순서가 일치한다.

5. Editing 조합
   - pinned cell을 두 번 클릭하면 editor가 cell 안에서 보인다.
   - editor border가 pinned cell, active outline, header보다 낮거나 높게 잘못 겹치지 않는다.
   - edit commit 후 pinned 위치와 column width가 유지된다.

## 실패 기준

- An active unpinned cell remains partially covered by a left/right pinned column after keyboard navigation or mouse activation.
- pinned column이 scroll 중 움직인다.
- header와 body column boundary가 1px 이상 지속적으로 어긋난다.
- pinned column 표시 순서와 resize target이 서로 다른 column을 가리킨다.
- selected/active/editing 상태가 pinned cell에서 보이지 않는다.
- resize handle을 잡았는데 column reorder drag가 시작된다.
- header content가 아닌 column 경계 영역에서 reorder drag가 시작된다.
- reorder handle 버튼이 아닌 header label/text 영역에서 reorder drag가 시작된다.
- cross-zone reorder가 허용된다.
- resize 후 pinned offset이 이전 column width를 기준으로 남는다.

## 자동화 후보

- Playwright screenshot으로 initial, horizontal scroll, resized, editing 상태를 캡처한다.
- `data-pinned-cell`, `data-pinned-edge`, `data-selected-cell`, `data-editing-cell` 조합을 locator로 확인한다.
- drag/drop은 브라우저별 편차가 있어 우선 수동 기준을 유지하고, 안정화 후 e2e로 승격한다.
