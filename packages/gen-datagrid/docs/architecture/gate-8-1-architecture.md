<!-- packages/gen-datagrid/docs/architecture/gate-8-1-architecture.md
Documents the Gate 8.1 multi-grid boundary and ownership architecture for GenDataGrid.
-->

# GenDataGrid Gate 8.1 Architecture

Gate 8.1은 advanced row model 구현을 바로 시작하기 전에 필요한 multi-grid boundary와 ownership 계약을 고정하는 slice다. 목표는 같은 화면에 여러 GenDataGrid가 있거나, 이후 detail panel 안에 nested grid가 들어가더라도 keyboard, mouse, range selection, clipboard, focus ownership이 서로 섞이지 않게 만드는 것이다.

이 문서는 Gate 8.1의 구현 범위와 제외 범위를 정리한다. Master-detail row, nested grid composition, dynamic row height, tree row model은 후속 Gate 8.2 이후로 분리한다.

## Scope

- 같은 화면에 있는 여러 grid의 focus ownership 정리
- parent/child grid 상황을 전제로 한 root boundary 판정 강화
- keyboard event ownership: focused/current grid만 navigation과 editing shortcut을 처리
- mouse/range ownership: child grid에서 시작한 drag가 parent grid selection을 만들지 않음
- clipboard ownership: copy/paste는 focused grid 기준으로만 처리
- context menu ownership: child grid context menu가 parent grid context menu를 열지 않음
- scoped DOM lookup 회귀 테스트 추가
- Storybook 수동 테스트용 multi-grid boundary scenario 추가

Gate 8.1은 다음을 하지 않는다.

- row detail panel 렌더링 API
- nested GenDataGrid 공식 composition API
- dynamic row height measurement
- tree row flattening model
- grouped header span
- visual row merge
- validation UI
- context menu feature 자체 구현

## Implemented Slice

- `core/dom/gridBoundary.ts` centralizes nearest-root ownership checks.
- `cellDom.ts` filters root-scoped cell and viewport lookup so nested child grid cells are not resolved through the parent root.
- `DataGridRoot` keydown and paste handlers ignore events owned by a nested child grid root.
- Active-cell focus restore and virtual scroll focus restore do not steal focus from a nested child grid.
- `useRangeSelection` uses the same boundary helper for cell coordinate resolution.
- Interaction tests cover nested keyboard, range selection, paste, and copy ownership.
- `Gate81MultiGridBoundary` Storybook scenario renders a child grid inside the parent footer for manual verification.

## Why A Separate Gate Is Needed

이전 plan의 Gate 8.1은 tree row model, master-detail row, nested grid를 함께 묶고 있었다. 하지만 세 기능은 모두 grid boundary가 정확하다는 전제를 가진다. boundary가 불명확하면 child grid keydown이 parent active cell을 움직이거나, child selection drag가 parent range selection으로 해석되거나, parent clipboard handler가 child paste를 소비하는 문제가 생긴다.

따라서 Gate 8.1은 사용자에게 보이는 큰 기능을 추가하기보다, 후속 Gate 8.2와 Gate 8.3이 안전하게 구현될 수 있도록 ownership 규칙을 먼저 확정한다.

## Component Relationship

~~~mermaid
flowchart TD
  ParentRoot[Parent DataGridRoot]
  ChildRoot[Child DataGridRoot]
  RootMarker[data-gen-datagrid-root]
  EventTarget[DOM event target]
  Boundary[grid boundary resolver]
  Keyboard[keyboard/navigation handler]
  Range[useRangeSelection]
  Clipboard[clipboard copy/paste handler]
  Focus[focus ownership]
  ContextMenu[context menu ownership]

  ParentRoot --> RootMarker
  ChildRoot --> RootMarker
  EventTarget --> Boundary
  Boundary --> ParentRoot
  Boundary --> ChildRoot
  Boundary --> Keyboard
  Boundary --> Range
  Boundary --> Clipboard
  Boundary --> Focus
  Boundary --> ContextMenu
~~~

## Ownership Rules

### Root Boundary

- Every grid root keeps `data-gen-datagrid-root="true"`.
- A DOM event belongs to the nearest grid root returned by `target.closest('[data-gen-datagrid-root="true"]')`.
- A parent grid must ignore events whose nearest grid root is a child grid.
- DOM lookup helpers must keep using the current root element, not document-wide selectors.
- Cell coordinate resolution must reject cells whose nearest grid root is not the current root.

### Focus Ownership

- A grid is keyboard-owner only when the active browser focus is inside its own root and not inside a nested child root.
- Focus restore should not steal focus from an interactive element inside another grid.
- Parent and child active-cell state remain independent.
- Imperative focus helpers operate only inside the handle owner root.

### Keyboard Ownership

- Root-level keydown handling must verify that the event target belongs to the current root.
- Child grid Arrow, Enter, F2, Tab, Escape, copy shortcut, and edit shortcut must not move or edit the parent grid.
- Parent grid keyboard handling may resume only after focus returns to the parent root.
- Interactive descendants keep their existing stop/ignore behavior.

### Range Selection Ownership

- Range drag can start only from a body cell whose nearest grid root is the current root.
- Window-level mousemove/mouseup cleanup may run, but selection updates must stay scoped to the drag owner root.
- Child grid drag must not create, replace, or extend parent selected ranges.
- Controlled `selectedRanges` callbacks are called only for the grid that owns the interaction.

### Clipboard Ownership

- Copy and paste handlers run only for the grid whose root owns the focused event target.
- If focus is inside a child grid, the parent grid must not read or apply clipboard data.
- Editor/interactive descendant paste remains owned by that input/editor and is not intercepted by the grid root.
- Clipboard serialization and paste application keep using rowId/columnId state from the owner grid only.

### Context Menu Ownership

- Gate 8.1 does not implement a context menu feature.
- It defines the boundary rule for future context menus: the nearest grid root owns the contextmenu event.
- A child grid contextmenu must not open a parent grid menu.

## Implementation Surface

Gate 8.1 uses internal helpers rather than new public API.

- Added a small boundary helper under `src/core/dom/gridBoundary.ts`.
- Helper shape:
  - `getOwningGridRoot(target: EventTarget | null): HTMLElement | null`
  - `isEventOwnedByRoot(root: HTMLElement | null, target: EventTarget | null): boolean`
  - `isFocusOwnedByRoot(root: HTMLElement | null, activeElement?: Element | null): boolean`
- Reuse this helper from:
  - `DataGridRoot` keyboard handler
  - `DataGridRoot` paste handler
  - focus restore effect
  - range selection coordinate resolution
  - future context menu entry points

Public API changes are not required for Gate 8.1. Existing `gridId` remains useful for DOM identity and test targeting, but ownership should be based on DOM root containment and nearest-root resolution rather than string id comparison.

## Implementation Order Used

1. Created shared boundary helper and migrated root-scoped DOM checks to it.
2. Guarded `DataGridRoot` keydown handling so nested child events are ignored by the parent root.
3. Guarded `DataGridRoot` paste/copy ownership using the same focused-root rule.
4. Guarded focus restore so a parent grid does not steal focus from a child grid or interactive descendant.
5. Kept range selection start and drag updates scoped to the owner root.
6. Added interaction tests for same-page two-grid and parent/child-grid ownership.
7. Added Storybook scenario for manual boundary checks.
8. Updated docs/log after implementation.

## Test Plan

Automated interaction tests should cover:

- two sibling grids keep active cell movement independent
- child grid keydown does not change parent active cell
- child grid range drag does not call parent `onSelectedRangesChange`
- focused child grid copy/paste does not call parent clipboard/paste side effects
- parent grid copy/paste still works after focus returns to parent
- parent focus restore does not steal focus from a child editor
- DOM lookup helpers ignore cells that belong to another grid root

Storybook manual test should include:

- parent grid and child grid visible on one page
- keyboard navigation in each grid
- range selection in each grid
- copy/paste ownership check with visible callbacks or log panel
- editing in child grid while parent grid remains stable

## Completion Criteria

- Parent and child grid keyboard ownership is isolated.
- Parent and child range selection ownership is isolated.
- Clipboard ownership follows the focused grid.
- Scoped DOM lookup cannot resolve child cells from the parent root.
- Existing single-grid keyboard, editing, range selection, paste, and virtualization tests still pass.
- Gate 8.1 Storybook scenario supports manual verification of same-page and nested boundary behavior.

## Deferred To Later Gates

| Later gate | Deferred work |
|---|---|
| Gate 8.2 | master-detail row API and fixed-height detail panel |
| Gate 8.3 | official nested GenDataGrid composition inside detail panel |
| Gate 8.4 | dynamic row height and virtualization offset recalculation |
| Gate 8.5 | tree row model and expand/collapse flattening |
| Gate 8.6 | merge, grouped header span, validation UI |
