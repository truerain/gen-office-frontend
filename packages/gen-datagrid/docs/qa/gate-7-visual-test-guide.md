<!-- packages/gen-datagrid/docs/qa/gate-7-visual-test-guide.md
Documents visual verification steps for GenDataGrid Gate 7.
-->

# Gate 7 화면 테스트 가이드

## 목적

Gate 7은 fixed-height row virtualization이 active cell, pinned column, range selection과 함께 깨지지 않는지 확인한다. 자동 테스트는 virtual row rendering과 상태 복구를 검증하고, 화면 테스트는 실제 브라우저의 scroll, sticky, focus, selection 복원을 확인한다.

## 기준 화면

Storybook에서 다음 스토리를 사용한다.

- `gen-datagrid/Gates/Baseline/Gate7Virtualization`

기준 조건:

- row 수: 10,000
- 기본 active cell: row `5000`, column `name`
- 기본 selected range: row `5000`의 `name`부터 `score`까지
- left pinned column: `name`
- right pinned column: `note`
- virtualization은 body row에만 적용된다.
- row height는 36px fixed height다.

## 확인 항목

1. 초기 렌더링
   - 첫 화면에서 header는 즉시 보이고 body row 전체가 한 번에 렌더링되지 않는다.
   - active cell이 row `5000` 근처로 복구되어 보인다.
   - row `5000`의 selected range 배경이 `name`부터 `score`까지 유지된다.
   - pinned `name`과 `note` column이 active cell 복구 후에도 고정 위치를 유지한다.

2. Vertical scroll
   - 빠르게 위아래로 스크롤해도 body row가 끊기거나 겹치지 않는다.
   - scroll offset과 row index 감각이 어긋나지 않는다.
   - 빈 큰 공백이 길게 남거나 같은 row가 중복 렌더링되지 않는다.

3. Keyboard navigation
   - active cell에서 ArrowDown, ArrowUp, PageDown, PageUp으로 이동하면 가상화된 행도 자연스럽게 따라 스크롤된다.
   - `End`로 끝 행 근처까지 이동할 수 있다.
   - viewport 밖에 있던 active row가 다시 화면 안으로 들어올 때 outline과 tab stop이 복구된다.
   - top 근처의 row를 클릭하거나 키보드로 이동했을 때, row가 sticky header 아래에 일부 가려진 상태로 남지 않는다.

4. Pinned + virtualization
   - vertical scroll 중 left pinned `name`과 right pinned `note`가 흔들리지 않는다.
   - pinned shadow edge가 virtual row 위에서 자연스럽게 유지된다.
   - pinned cell 배경, active outline, selected range가 서로 잘리지 않는다.

5. Selection 복원
   - selected row를 화면 밖으로 스크롤한 뒤 다시 돌아오면 동일한 셀 범위에 selected 배경이 복구된다.
   - active cell이 선택 범위 안에 있을 때 outline이 selection 배경 위에서 유지된다.

## 실패 기준

- active cell이 virtualized out 된 뒤 다시 보일 때 focus 또는 outline이 사라진다.
- scroll offset이 실제 row index 감각과 일관되지 않다.
- pinned column이 vertical scroll 중 흔들리거나 body cell과 z-index 충돌을 일으킨다.
- selected range가 화면 밖으로 나갔다가 돌아오면 일부 셀에서 복구되지 않는다.
- 빠른 스크롤 중 빈 공백, row 중복, row 점프가 눈에 띄게 발생한다.

## 자동화 후보

- Playwright로 row `5000` 초기 복구 상태와 끝 행 근처 keyboard navigation 상태를 캡처한다.
- `data-virtualized-body`, `data-virtualized-row`, `data-pinned-cell`, `data-selected-cell`, `data-active-cell` 조합을 locator로 확인한다.
- scroll 후 재진입한 row의 selected/active 상태 복구를 e2e로 승격한다.
