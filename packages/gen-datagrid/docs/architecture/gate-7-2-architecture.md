<!-- packages/gen-datagrid/docs/architecture/gate-7-2-architecture.md
Documents the Gate 7.2 virtualization range auto-scroll architecture for GenDataGrid.
-->

# GenDataGrid Gate 7.2 Architecture

Gate 7.2는 Gate 7 row virtualization 위에서 range selection drag auto-scroll을 추가하는 후속 slice다. 사용자가 마우스로 range를 드래그하다가 viewport 위나 아래 경계를 넘어가면 grid가 자동으로 스크롤하고, selection focus가 새로 보이는 row까지 확장되어야 한다.

이 문서는 구현된 범위와 남은 후속 범위를 정리한다. Dynamic row measurement와 column virtualization은 Gate 7.2 범위에 포함하지 않는다.

## Scope

- range selection drag 중 viewport 상단/하단 edge 감지
- edge 근처 pointer 위치에 따른 자동 vertical scroll
- virtualization 상태에서 새로 mount되는 row까지 selection focus 확장
- non-virtual body에서도 같은 auto-scroll 정책 재사용 가능하게 설계
- active cell, editing cell, paste selection, keyboard range selection 계약 유지
- pinned column sticky offset과 virtual row absolute positioning 유지

Gate 7.2는 다음을 하지 않는다.

- dynamic row height measurement
- column virtualization
- horizontal auto-scroll
- selection fill handle
- Excel-style drag fill
- browser screenshot automation

## Why A Separate Gate Is Needed

Gate 7.1의 scroll-seeking은 큰 스크롤 점프 중 렌더링 비용을 낮추는 성능 fallback이다. 반면 Gate 7.2는 pointer drag, range selection state, viewport scrolling, virtual row mounting이 동시에 연결된다. 실패하면 selection이 끊기거나 focus/scroll이 흔들릴 수 있으므로 별도 gate로 다루는 것이 맞다.

## Component Relationship

~~~mermaid
flowchart TD
  Root[DataGridRoot]
  Viewport[.gen-datagrid__viewport]
  Range[useRangeSelection]
  AutoScroll[range auto-scroll controller]
  Body[DataGridBody]
  VirtualBody[DataGridVirtualBody]
  Virtualizer[TanStack virtualizer]
  HitTest[row and column coordinate resolver]
  Selection[range selection state]

  Root --> Viewport
  Root --> Range
  Range --> AutoScroll
  AutoScroll --> Viewport
  AutoScroll --> HitTest
  Root --> Body
  Root --> VirtualBody
  VirtualBody --> Virtualizer
  HitTest --> Selection
  Range --> Selection
~~~

## Runtime Flow

1. Drag starts from an existing body cell through useRangeSelection.
2. The hook records the drag anchor, drag mode, and latest pointer position.
3. While dragging, a requestAnimationFrame loop checks the pointer position against the viewport edge zones.
4. If the pointer is above or below the edge zone, the viewport scrollTop changes by a velocity derived from edge distance.
5. After scroll, the controller resolves the row under the pointer or the nearest row in the scroll direction.
6. The selection focus updates to that row and the current column target.
7. Under virtualization, DataGridVirtualBody mounts the new visible rows and range styling is restored from row id and column id state.
8. On mouseup, the auto-scroll loop stops and the final range remains selected.

## State Contract

- Selection state remains rowId and columnId based.
- Auto-scroll must not store DOM row references as selection state.
- Drag anchor remains stable for the whole drag operation.
- Drag focus may update from mounted DOM cells or from row index calculation when the target row is not yet mounted.
- Controlled selectedRanges must receive the same range shape as normal drag selection.

## Auto-scroll Policy

Initial MVP policy:

| Policy | Implemented value | Reason |
|---|---|---|
| Vertical edge size | about 32px | predictable mouse target zone |
| Scroll loop | requestAnimationFrame | avoids timer drift and syncs with rendering |
| Min speed | small row-step movement | keeps selection controllable |
| Max speed | capped by viewport height fraction | avoids jumpy drag selection |
| Horizontal auto-scroll | deferred | pinned columns and horizontal overflow need separate policy |
| Public API | none for MVP | behavior should feel native when range selection is enabled |

If tuning becomes necessary later, a public option such as rangeAutoScroll can be considered after the internal behavior is stable.

## Virtualization Contract

- Auto-scroll uses the viewport scrollTop, not per-row DOM scrolling.
- DataGridVirtualBody keeps owning row virtualization and virtual row offsets.
- The auto-scroll controller may ask the virtual body to scroll to a row index only when direct scrollTop adjustment is insufficient.
- Range styling must work even when intermediate rows are not mounted.
- Scroll-seeking placeholders must not replace the active drag target row if it is needed for selection feedback.
- aria-rowcount continues to represent the full row model length.

## Interaction With Existing Features

| Feature | Gate 7.2 rule |
|---|---|
| Keyboard range selection | unchanged; Shift plus Arrow stays separate from pointer auto-scroll |
| Active cell | drag selection should not move active cell on every auto-scroll tick |
| Editing | interactive editor targets still block range drag start |
| Paste | paste result selection continues to use setSingleRange and is unrelated to drag auto-scroll |
| Pinned columns | sticky offset model remains in pinningStyles |
| Pagination/filtering | auto-scroll only targets the current row model |
| Manual pagination | auto-scroll cannot cross server page boundaries |

## Implemented Slice

- useRangeSelection owns the edge detection, velocity calculation, and requestAnimationFrame lifecycle for vertical range auto-scroll.
- DataGridRoot passes row ids, column ids, row height, header height, and viewport element into useRangeSelection.
- Drag state records the latest pointer position and latest focus coordinate.
- When the pointer enters the top or bottom edge zone, the viewport scrollTop is adjusted and a scroll event is dispatched.
- The next focus row is resolved from the current row model, viewport scrollTop, rowHeight, and headerHeight.
- Selection state remains rowId/columnId based, so virtualized rows restore selection styling when they re-enter the mounted window.
- The implementation has no new public API. Auto-scroll follows enableRangeSelection.
- Interaction coverage verifies the virtualized bottom-edge drag path.

## Implementation Notes

- The initial implementation keeps the logic inside useRangeSelection instead of introducing a separate helper module. Extracting a helper remains reasonable if horizontal auto-scroll or more tuning options are added.
- Auto-scroll currently targets vertical body scrolling only.
- The active cell is not moved on each auto-scroll tick.
- The final selected range is emitted through the same onSelectedRangesChange path as normal drag selection.

## Test Strategy

Automated interaction coverage includes the virtualized bottom-edge drag path. Additional coverage should include:

- drag selection near the bottom edge scrolls the viewport down
- drag selection near the top edge scrolls the viewport up
- selected range extends to rows that were not mounted at drag start
- mouseup stops the animation-frame loop
- controlled selectedRanges receives the final auto-scrolled range
- virtualization path renders fewer rows than the full model while selection still spans row ids outside the mounted window
- disabled range selection does not start auto-scroll

Manual Storybook coverage should include:

- slow edge drag
- fast edge drag
- pinned columns plus edge drag
- large row count virtual grid
- Gate72RangeAutoScroll Storybook scenario
- scroll-seeking on and off comparison

## Deferred After Gate 7.2

- horizontal auto-scroll during range drag
- dynamic row measurement while virtualization is enabled
- column virtualization
- fill handle and drag-fill behavior
- browser screenshot automation for large-row scenarios
