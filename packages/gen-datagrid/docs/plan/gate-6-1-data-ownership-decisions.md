<!-- packages/gen-datagrid/docs/plan/gate-6-1-data-ownership-decisions.md
Decision table for Gate 6.1 filtering, pagination, and data ownership policy.
-->

# GenDataGrid Gate 6.1 Data Ownership Decisions

Gate 6.1 follows the Gate 6 filtering, footer, pagination, and dirty-state MVP.
The main goal is to define how GenDataGrid behaves when data is owned by the
consumer or by a server boundary, without breaking the current client-side MVP.

## Recommended MVP

The recommended first slice is conservative:

- Keep client-side filtering and pagination as the default behavior.
- Add explicit mode props for manual/server filtering and pagination.
- In manual mode, GenDataGrid owns UI state only and does not transform rows.
- Expose total row count for manual/server pagination.
- Add a small page-size selector driven by explicit page-size options.
- Keep row deletion consumer-owned by default, but add an opt-in internal data
  mutation path for uncontrolled `defaultData`.
- Use `dataVersion` as the external baseline reset signal for dirty/deleted
  markers.

## Implementation Status

Gate 6.1 MVP is implemented with the recommended policy:

- Client-side column/global filtering through TanStack row models.
- Client-side pagination through TanStack pagination row model.
- Controlled/uncontrolled filter and pagination state props.
- Dirty/deleted visual markers.
- `deleteRows(rowIds)` as an imperative delete request plus deleted-row marker.
- `resetDirtyState`, `commitDirtyState`, and `getDirtyState` imperative handle
  methods.
- `filterMode: 'manual'` preserves filter state callbacks but disables local row
  filtering.
- `paginationMode: 'manual'` renders the current `data` as the current page and
  uses `totalRowCount` for page-count calculation.
- `pageSizeOptions` renders the built-in page-size selector and resets
  `pageIndex` to `0` on change.
- `deleteRowsBehavior: 'removeUncontrolled'` removes rows only from uncontrolled
  `defaultData` ownership.
- `dataVersion` changes clear dirty and deleted markers.
- Storybook includes `Gate61ManualFilteringPaginationDataOwnership` for manual
  filtering, manual pagination, page-size changes, and data-version reset checks.

## Decision Table

| Decision Point | Options | Recommendation | Reason | Deferred / Risk |
| --- | --- | --- | --- | --- |
| Filtering mode API | `filterMode`, `manualFiltering`, reuse `enableColumnFilters` only | Add `filterMode?: 'client' \| 'manual'` | Matches existing API docs and separates UI enablement from row-model ownership | Alias to TanStack-style `manualFiltering` can be considered later |
| Filter UI flags | One `enableFiltering`, separate column/global flags | Keep `enableColumnFilters` and `enableGlobalFilter` | Current implementation already separates column and global UI ownership | `enableFiltering` can remain a future compatibility alias |
| Manual filtering behavior | Apply local filtering then callback, callback only, disable filter UI | Callback/state only; do not locally filter rows | Server-owned data should not be filtered twice | Consumer must refetch or replace `data` after filter changes |
| Filter callback timing | Debounced, immediate, submit-only | Immediate for MVP | Matches current input state behavior and keeps callback contract simple | Debounce and apply/reset buttons can be added as UI options later |
| Filter state in manual mode | Controlled only, uncontrolled allowed, external query object only | Allow controlled and uncontrolled state, same as client mode | Preserves current API and Storybook ergonomics | Real server screens should usually control state |
| Pagination mode API | `paginationMode`, `manualPagination`, `serverPagination` | Add `paginationMode?: 'client' \| 'manual'` | Matches `filterMode` and existing API docs | TanStack naming differs, but public API stays DataGrid-oriented |
| Manual pagination rows | Render current `data`, slice current `data`, require page data only | Render current `data` as the current page | Consumer/server owns page slicing in manual mode | Misuse can show too many rows if app passes full data in manual mode |
| Pagination total | `totalRowCount`, `pageCount`, both | Add `totalRowCount?: number` first | Easy for consumers and derives page count from `pageSize` | Cursor pagination may require a later `pageCount` or `hasNextPage` contract |
| Unknown total | Disable next, allow next, require total | If `totalRowCount` is omitted, fall back to current row count | Preserves current behavior | Unknown-total server pagination needs a separate cursor/has-next policy |
| Page-size selector | Always render, render only with options, custom slot only | Render when `pageSizeOptions` has values | Avoids changing current pagination UI unless requested | Full custom pagination render slot can be added later |
| Page-size options | Hard-coded defaults, prop only, global default | Add `pageSizeOptions?: number[]` with no implicit selector | Keeps UI deterministic and avoids product-specific defaults | Apps may want shared defaults later |
| Page-size change behavior | Keep page index, reset to first page, clamp page index | Reset to first page | Avoids landing on an empty page after larger/smaller page-size changes | Controlled consumers can override by setting pagination directly |
| Delete ownership | Marker only, mutate uncontrolled data, always mutate data | Keep marker + callback; mutate only uncontrolled `defaultData` when enabled | Controlled `data` must remain consumer-owned | Requires explicit API to avoid surprising data removal |
| Delete mutation API | `deleteRows` option, `onRowsDelete` return value, new handle | Add `deleteRowsBehavior?: 'mark' \| 'removeUncontrolled'` | Keeps current behavior as default and makes mutation opt-in | Controlled data deletion still needs consumer callback handling |
| Deleted dirty state | Deleted rows counted as dirty, separate deleted state, no dirty | Keep deleted row ids inside dirty state | Existing visual and handle contract already does this | Undo/restore deleted rows may need richer state later |
| Dirty baseline reset | Manual `resetDirtyState`, `dataVersion`, deep data compare | Add `dataVersion` reset behavior | External data refresh is the cleanest baseline signal | Consumers must update `dataVersion` when server data is accepted |
| Commit dirty behavior | Clear markers only, update baseline, emit data change | Keep clear markers; with `dataVersion`, external accepted data becomes baseline | Avoids internal data ownership expansion | If GenDataGrid later owns uncontrolled data, baseline snapshots may be needed |
| Dirty comparison | `Object.is`, `dirtyKeys`, custom equality | Keep `Object.is` for Gate 6.1; document `dirtyKeys`/custom equality as later | Current dirty path records committed changes, not deep data diffs | Field-level baseline comparison is a separate data model feature |
| Footer rows in manual mode | Use current page data, use total server data, callback-provided summary | Use current rendered data; allow external footer slot for server summaries | Grid cannot infer server aggregate totals | Server aggregate footer needs explicit summary props later |
| Active cell after filtering/page change | Keep, clear, nearest visible cell | Clear or normalize when row disappears | Avoids focus pointing at non-rendered rows | Exact nearest-cell policy should be tested separately |
| Tests | Unit only, interaction only, both | Both unit and interaction tests | Mode behavior and UI controls need separate coverage | Browser-level server latency is out of scope |

## Proposed MVP Contract

```ts
type GenDataGridFilterMode = 'client' | 'manual';
type GenDataGridPaginationMode = 'client' | 'manual';
type GenDataGridDeleteRowsBehavior = 'mark' | 'removeUncontrolled';

type GenDataGridProps<TData> = {
  filterMode?: GenDataGridFilterMode;
  paginationMode?: GenDataGridPaginationMode;
  totalRowCount?: number;
  pageSizeOptions?: readonly number[];
  deleteRowsBehavior?: GenDataGridDeleteRowsBehavior;
  dataVersion?: string | number;
};
```

Default behavior should match the current MVP:

- `filterMode: 'client'`
- `paginationMode: 'client'`
- `deleteRowsBehavior: 'mark'`
- no page-size selector unless `pageSizeOptions` is provided
- no dirty baseline reset unless `dataVersion` changes

## Implementation Order

1. Add public types and props for `filterMode`, `paginationMode`,
   `totalRowCount`, `pageSizeOptions`, `deleteRowsBehavior`, and `dataVersion`.
2. Wire `filterMode` to the TanStack adapter so manual mode disables local row
   filtering while preserving filter state callbacks.
3. Wire `paginationMode` and `totalRowCount` to the TanStack adapter so manual
   mode renders the current `data` page and calculates page controls from the
   external total.
4. Add page-size selector rendering when `pageSizeOptions` is provided.
5. Reset page index to `0` when the page size changes through the built-in
   selector.
6. Implement `deleteRowsBehavior: 'removeUncontrolled'` for `defaultData`
   ownership while preserving the current marker-only default.
7. Clear dirty/deleted markers when `dataVersion` changes.
8. Add unit tests for mode wiring and page-count calculation.
9. Add interaction tests for manual filtering callbacks, manual pagination
   controls, page-size changes, delete behavior, and `dataVersion` dirty reset.
10. Add a Storybook scenario for manual/server-style filtering and pagination.

## Open Questions For Product Decision

| Question | Recommended Answer |
| --- | --- |
| Should manual filtering use `filterMode` or `manualFiltering`? | `filterMode` for public API consistency |
| Should manual pagination use `paginationMode` or `manualPagination`? | `paginationMode` for symmetry with filtering |
| Should `totalRowCount` be required in manual pagination? | No; fall back to current row count when omitted |
| Should page-size selector render by default? | No; render only when `pageSizeOptions` is provided |
| Should changing page size reset page index? | Yes, reset to first page |
| Should `deleteRows()` remove rows automatically? | No by default; keep marker + callback |
| Should uncontrolled grids support internal delete mutation? | Yes, behind `deleteRowsBehavior: 'removeUncontrolled'` |
| Should controlled `data` ever be mutated internally? | No |
| Should `dataVersion` clear dirty and deleted markers? | Yes |
| Should Gate 6.1 add deep baseline comparison? | No, keep it deferred |
