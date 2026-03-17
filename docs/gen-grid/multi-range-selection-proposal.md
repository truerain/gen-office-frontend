# GenGrid Multi Range Selection Proposal (Multi-Only)

## 1. Background
- Current `GenGrid` range selection is effectively single-range.
- `gen-grid-chart` usage needs non-contiguous and cumulative selections.
- We will move to a **multi-only** selection model and ignore backward compatibility.

## 2. Goal
- Use one selection model: `selectedRanges: SelectedRange[]`
- Support cumulative range selection directly
- Expose multi-range context to `gen-grid-chart`
- Allow `categoryColumnId` to be used even when it is outside the selected range

## 3. Non-Goals
- No Excel-complete behavior in phase 1 (advanced handle/undo/keyboard parity)
- No advanced multi-range clipboard format in phase 1

## 4. Core Model

### 4.1 Types
```ts
type RangeCellCoord = {
  rowId: string;
  columnId: string;
};

type SelectedRange = {
  anchor: RangeCellCoord;
  focus: RangeCellCoord;
};

type SelectedRanges = SelectedRange[];
```

### 4.2 Grid Props
```ts
type GenGridProps<TData> = {
  enableRangeSelection?: boolean;
  // no mode flag; always multi model
};
```

## 5. Interaction Rules
- Normal drag: reset to one new range
- `Ctrl/Cmd + drag`: append range (cumulative)
- `Shift + click`: extend from active cell into a new/updated range (final policy to confirm)
- `Esc`: clear all ranges

## 6. Context Menu Contract
```ts
type GenGridContextMenuActionContext<TData> = {
  table: Table<TData>;
  selectedRanges: SelectedRange[];
  boundsList: RangeBounds[];
  cells: GenGridContextMenuCell<TData>[];
  matrixList: unknown[][][]; // matrix per range
};
```

Notes:
- `boundsList[i]` and `matrixList[i]` refer to the same selected range index.
- For actions that require one range, consumer chooses policy (e.g., last range only).

## 7. gen-grid-chart Policy
- `useRangeChartContextMenu` should consume `boundsList`/`matrixList`.
- Phase 1 constraint:
  - Support only multi-ranges sharing the same row window.
  - Reject unsupported patterns with explicit error messages.

### 7.1 Category Column Outside Selection
- `categoryColumnId` is valid even if not in `bounds.columnIds`.
- Category labels are resolved by row window (`rowMin..rowMax`) from current row model.
- Error only when:
  - column does not exist, or
  - value resolution is not possible for chart labels.

### 7.2 Priority
1. If `categoryColumnId` is provided, use it.
2. Otherwise use range-local `categoryColumnIndex` (default behavior).

## 8. Implementation Plan
1. Replace internal range state with `selectedRanges` only
2. Update range-selection hook for cumulative behavior
3. Update cell highlight logic to check membership in any selected range
4. Extend context menu context to multi-range payload (`boundsList`, `matrixList`)
5. Update `gen-grid-chart` model builder to consume multi-range inputs
6. Validate on demo pages with pinned/virtualized grids

## 9. Risks and Mitigation
- Risk: clipboard behavior ambiguity in multi-range
  - Mitigation: define explicit phase-1 policy (last range only)
- Risk: chart conversion ambiguity for irregular multi-ranges
  - Mitigation: strict phase-1 acceptance rule + clear error text
- Risk: performance cost of range-hit checks
  - Mitigation: precompute bounds and memoize lookup
- Risk: misunderstanding of outside-category row mapping
  - Mitigation: document row-model-based mapping rule explicitly

## 10. Test Checklist
- Cumulative add with `Ctrl/Cmd + drag`
- Normal drag resets previous ranges
- `Esc` clears all ranges
- Pinned + virtualization range correctness
- Context menu receives `selectedRanges`, `boundsList`, `matrixList`
- Chart works for supported multi-range cases
- Proper errors for unsupported multi-range patterns
- `categoryColumnId` outside selected range is applied to category axis
- Missing/invalid `categoryColumnId` shows explicit errors

## 11. Review Decisions
1. Column ordering basis in chart: selection order vs visual order
2. Exact phase-1 acceptance condition for multi-range chart transform
3. Multi-range clipboard policy: last-range-only vs block-with-message
4. `Shift + click` behavior under multi-only model
5. Collision policy when `categoryColumnId` equals a numeric series column
