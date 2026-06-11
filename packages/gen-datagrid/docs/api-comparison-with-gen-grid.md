# GenDataGrid API 정의 초안: GenGrid 비교표

## 1. 목적

이 문서는 기존 `@gen-office/gen-grid` API를 기준으로 `@gen-office/gen-datagrid`에서 구현해야 할 public API를 정의한다.

`gen-datagrid`는 div 기반 renderer를 전제로 하므로, 기존 API를 그대로 복사하지 않는다. 유지할 API, 이름을 바꿀 API, 의미를 바꿀 API, MVP에서 제외할 API를 구분한다.

상태 기준:

- **유지**: 기존 `gen-grid`와 같은 이름/의미로 제공
- **변경**: 이름 또는 동작 계약을 조정
- **신규**: div/nested grid 구조 때문에 새로 필요
- **MVP 제외**: 최종 구조에는 반영하지만 MVP public API로는 열지 않음
- **제거 후보**: 새 패키지에서는 제공하지 않는 방향

## 2. 기본 데이터 API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `data` | `data` | 유지 | MVP | controlled data. `onDataChange`와 함께 사용한다. |
| `defaultData` | `defaultData` | 유지 | MVP | uncontrolled 초기 data. 내부 state로 관리한다. |
| `onDataChange` | `onDataChange` | 유지 | MVP | data 변경 콜백. editing, delete, load 등에서 호출된다. |
| `dataVersion` | `dataVersion` | 유지 | MVP | 외부 data reset/baseline 갱신 트리거. dirty state와 연동한다. |
| `columns` | `columns` | 유지 | MVP | TanStack `ColumnDef` 기반 column 정의. meta 타입은 `GenDataGridColumnMeta`로 변경한다. |
| `getRowId` | `getRowId` | 변경 | MVP | 기존은 필수. GenDataGrid도 안정성을 위해 MVP에서는 필수 유지 권장. signature는 `(row, index) => string` 허용을 검토한다. |

권장 타입:

```ts
type GenDataGridDataProps<TData> =
  | {
      data: TData[];
      onDataChange: (next: TData[]) => void;
      defaultData?: never;
      dataVersion?: number | string;
    }
  | {
      defaultData: TData[];
      data?: never;
      onDataChange?: (next: TData[]) => void;
      dataVersion?: number | string;
    };
```

## 3. 레이아웃 API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `caption` | `caption` | 유지 | MVP | 접근성/설명용 caption. div renderer에서는 visible caption 또는 `aria-label` 정책 필요. |
| `height` | `height` | 유지 | MVP | root height. |
| `maxHeight` | `maxHeight` | 유지 | MVP | root max height. |
| `headerHeight` | `headerHeight` | 유지 | MVP | header row height. virtual body에서도 반드시 동일 source 사용. |
| `rowHeight` | `rowHeight` | 유지 | MVP | default row height. |
| 없음 | `getRowHeight` | 신규 | MVP | per-row height resolver. MVP에서는 `enableVirtualization !== true`일 때 지원하고, virtualized dynamic measurement는 Extension으로 분리한다. |
| `fitColumns` | `fitColumns` | 유지 | MVP | `'none' \| 'fill'`. CSS grid template 계산에 반영한다. |
| 없음 | `className` | 신규 | MVP | root className. 기존 GenGrid에는 명시적 root className이 없다. |
| 없음 | `style` | 신규 | MVP | root inline style. |
| `enableStickyHeader` | `enableStickyHeader` | 유지 | MVP | div header sticky 처리. 기본값은 true 권장. |
| `overscan` | `overscan` | 유지 | MVP | virtualization overscan. |

## 4. 기능 Flag API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `readonly` | `readonly` | 유지 | MVP | editing 차단. HTML reserved 느낌을 줄이려면 `readOnly` alias 검토 가능. |
| `enableVirtualization` | `enableVirtualization` | 유지 | MVP | row virtualization. fixed row height 기준. |
| `enableFiltering` | `enableFiltering` | 유지 | MVP | column filter. |
| 없음 | `enableGlobalFilter` | 신규 | MVP | 기존 내부에는 global filter 처리 흔적이 있으나 public option은 명확하지 않다. 명시 API 권장. |
| `enablePinning` | `enablePinning` | 유지 | MVP | sticky column pinning. |
| `enableColumnSizing` | `enableColumnSizing` | 유지 | MVP | column resize. |
| `enableColumnReorder` | `enableColumnReorder` | 유지 | MVP | header drag reorder. |
| `checkboxSelection` | `checkboxSelection` | 변경 | MVP | `enableRowSelection`과 `rowSelectionMode`로 이름 정리 검토. |
| `checkboxSelectionMode` | `rowSelectionMode` | 변경 | MVP | `'all' \| 'createdOnly'`. checkbox뿐 아니라 row selection 정책 의미로 확장. |
| `enableRowNumber` | `enableRowNumber` | 유지 | MVP | row number system column. |
| `enableRowStatus` | `enableRowStatus` | 유지 | MVP | created/updated/deleted 표시 column. |
| `enableActiveRowHighlight` | `enableActiveRowHighlight` | 유지 | MVP | active row highlight. |
| `enableRangeSelection` | `enableRangeSelection` | 유지 | MVP | drag range selection. |
| `enableGrouping` | `enableGrouping` | MVP 제외 | Extension | TanStack grouping은 tree/detail과 조합 정책 정리 후 공개. |
| `rowSpanning` | `rowMerge` | 변경 | Extension | div에서는 native rowSpan이 없으므로 `rowMerge` 또는 `visualRowMerge` 명칭 권장. |
| `rowSpanningMode` | `rowMergeMode` | 변경 | Extension | MVP에서는 `visual`만 허용. `real`은 제거 또는 명시적 미지원. |
| `enableFooterRow` | `enableFooterRow` | 유지 | MVP | column footer row. |
| `enableStickyFooterRow` | `enableStickyFooterRow` | 유지 | MVP | scroll 내부 sticky footer row. |
| `enableFooter` | `enableFooter` | 유지 | MVP | grid 외부 footer 영역. |
| `enablePagination` | `enablePagination` | 유지 | MVP | pagination UI/state. |

Implementation status: `enableRangeSelection`, `selectedRanges`, `defaultSelectedRanges`, and `onSelectedRangesChange` are implemented for range selection. `enableClipboard` and `clipboardOptions.includeHeader` are implemented as new copy options. Paste application remains planned until data mutation/editing policy is introduced.

## 5. Controlled State API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `activeCell` | `activeCell` | 유지 | MVP | active cell controlled state. |
| `onActiveCellChange` | `onActiveCellChange` | 유지 | MVP | active cell change callback. multiple/nested grid에서는 gridId scoped 처리. |
| 없음 | `defaultActiveCell` | 신규 | MVP | uncontrolled initial active cell. |
| `rowSelection` | `rowSelection` | 유지 | MVP | TanStack row selection state. |
| `onRowSelectionChange` | `onRowSelectionChange` | 유지 | MVP | row selection change callback. |
| `columnOrder` | `columnOrder` | 유지 | MVP | controlled column order. |
| `onColumnOrderChange` | `onColumnOrderChange` | 유지 | MVP | column order change callback. |
| `defaultColumnOrder` | `defaultColumnOrder` | 유지 | MVP | uncontrolled initial column order. |
| `columnVisibility` | `columnVisibility` | 유지 | MVP | controlled visibility. |
| `onColumnVisibilityChange` | `onColumnVisibilityChange` | 유지 | MVP | visibility change callback. |
| 없음 | `columnSizing` | 신규 | MVP | 기존 GenGrid에 내부 지원은 있으나 public prop이 명확하지 않다. controlled sizing API 권장. |
| 없음 | `onColumnSizingChange` | 신규 | MVP | column sizing controlled callback. |
| 없음 | `defaultColumnSizing` | 신규 | MVP | uncontrolled initial sizing. |
| 없음 | `columnPinning` | 신규 | MVP | 기존은 meta/default/internal 중심. controlled pinning public API 권장. |
| 없음 | `onColumnPinningChange` | 신규 | MVP | pinning controlled callback. |
| 없음 | `defaultColumnPinning` | 신규 | MVP | uncontrolled initial pinning. |
| `grouping` | `grouping` | MVP 제외 | Extension | grouping public API는 후속. |
| `onGroupingChange` | `onGroupingChange` | MVP 제외 | Extension | 후속. |
| `expanded` | `expanded` | 변경 | Extension | grouping/tree/detail expansion을 분리해야 한다. |
| `onExpandedChange` | `onExpandedChange` | 변경 | Extension | `treeExpandedRowIds`, `detailExpandedRowIds` 등으로 분리 검토. |
| `pagination` | `pagination` | 유지 | MVP | controlled pagination. |
| `onPaginationChange` | `onPaginationChange` | 유지 | MVP | pagination change callback. |
| `totalRowCount` | `totalRowCount` | 유지 | MVP | manual/server pagination count. |
| `pageSizeOptions` | `pageSizeOptions` | 유지 | MVP | pagination page size options. |

Implementation status: `columnOrder`, `columnVisibility`, and `columnSizing` are implemented through the Phase 1 TanStack adapter. `columnPinning` remains planned for the pinning gate.

## 6. Filtering API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `enableFiltering` | `enableFiltering` | 유지 | MVP | column filtering UI 활성화. |
| 없음 | `columnFilters` | 신규 | MVP | controlled column filter state. 기존 hook에는 있으나 public props에 없다. |
| 없음 | `onColumnFiltersChange` | 신규 | MVP | column filter change callback. |
| 없음 | `defaultColumnFilters` | 신규 | MVP | uncontrolled initial filters. |
| 없음 | `globalFilter` | 신규 | MVP | controlled global filter. |
| 없음 | `onGlobalFilterChange` | 신규 | MVP | global filter callback. |
| 없음 | `defaultGlobalFilter` | 신규 | MVP | uncontrolled initial global filter. |

## 7. Editing API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `editOnActiveCell` | `editOnActiveCell` | 유지 | MVP | active cell 진입 시 편집 시작. |
| `keepEditingOnNavigate` | `keepEditingOnNavigate` | 유지 | MVP | navigation 중 edit mode 유지. |
| `editorFactory` | `editorFactory` | 유지 | MVP | global editor factory. |
| `onCellValueChange` | `onCellValueChange` | 유지 | MVP | commit된 cell value callback. |
| `readonly` | `readonly` / `readOnly` | 변경 | MVP | `readonly` 유지 + `readOnly` alias 제공 검토. |
| 없음 | `isCellEditable` | 신규 | MVP | column meta 외 grid-level editable predicate. |

Implementation status: editing public prop and column meta types are defined. `readOnly`, `readonly`, `editSelectOnFocus`, `editCommitOnBlur`, `isCellEditable`, and column meta editability are wired into the editable cell predicate model and built-in editor flow. Runtime editing now supports default/custom editor rendering, Enter/F2/double-click/active-cell-reclick edit entry, Escape cancel, Enter/blur commit, and Tab/Shift+Tab navigation through `onCellValueChange`. Data mutation, dirty-state integration, advanced blur/portal policy, and paste application remain deferred. See `docs/cell-edit-api.md` for implemented/deferred Cell Edit API status.

권장 editor context:

```ts
type GenDataGridEditorContext<TData> = {
  value: unknown;
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  meta?: GenDataGridColumnMeta<TData>;
  editType?: GenDataGridColumnMeta<TData>['editType'];
  onChange: (nextValue: unknown) => void;
  onCommit: () => void;
  onCancel: () => void;
  onTab?: (dir: 1 | -1) => void;
  commitValue: (nextValue: unknown) => void;
  applyValue: (nextValue: unknown) => void;
};
```

## 8. Rendering Customization API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `getRowClassName` | `getRowClassName` | 유지 | MVP | row className hook. |
| `getRowStyle` | `getRowStyle` | 유지 | MVP | row style hook. |
| `getCellClassName` | `getCellClassName` | 유지 | MVP | cell className hook. |
| `getCellStyle` | `getCellStyle` | 유지 | MVP | cell style hook. |
| `getCellTooltip` | `getCellTooltip` | 유지 | MVP | cell tooltip hook. |
| `footer` | `footer` | 유지 | MVP | 외부 footer content. |
| `renderFooter` | `renderFooter` | 변경 | MVP | 기존은 `Table<TData>`를 인자로 받는다. GenDataGrid는 public context 타입 제공 권장. |
| `noRowsMessage` | `noRowsMessage` | 유지 | MVP | empty message. |
| `renderNoRowsMessage` | `renderNoRowsMessage` | 변경 | MVP | `Table<TData>` 직접 노출 대신 `GenDataGridRenderContext<TData>` 권장. |
| 없음 | `renderDetailPanel` | 신규 | Extension | master-detail/grid-in-grid 기반 API. |

권장 변경:

```ts
type GenDataGridRenderContext<TData> = {
  table: Table<TData>;
  rowCount: number;
  visibleRowCount: number;
  gridId: string;
};
```

## 9. Dirty State API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `onDirtyChange` | `onDirtyChange` | 유지 | MVP | 전체 dirty 여부 callback. |
| `onDirtyRowsChange` | `onDirtyRowsChange` | 유지 | MVP | dirty row id list callback. |
| `dirtyKeys` | `dirtyKeys` | 유지 | MVP | dirty comparison 대상 key. |
| 없음 | `isEqualForDirty` | 신규 | MVP | 값 비교 정책을 외부에서 주입할 수 있게 한다. 기존 내부 hook에는 유사 개념이 있다. |

## 10. Row Status / Row Selection API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `enableRowStatus` | `enableRowStatus` | 유지 | MVP | status column 활성화. |
| `rowStatusResolver` | `rowStatusResolver` | 유지 | MVP | row id 기준 status 반환. |
| `checkboxSelection` | `enableRowSelection` | 변경 | MVP | checkbox selection보다 row selection 의미가 넓다. |
| `checkboxSelectionMode` | `rowSelectionMode` | 변경 | MVP | `'all' \| 'createdOnly'`. |
| `rowSelection` | `rowSelection` | 유지 | MVP | controlled state. |
| `onRowSelectionChange` | `onRowSelectionChange` | 유지 | MVP | controlled callback. |

## 11. Context Menu API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `contextMenu.customActions` | `contextMenu.customActions` | 유지 | MVP | custom context menu action. |
| context ctx `table` | context ctx `table` | 유지 | MVP | TanStack table 접근 허용 여부는 유지 가능. |
| context ctx `selectedRanges` | `selectedRanges` | 유지 | MVP | selected ranges. |
| context ctx `boundsList` | `boundsList` | 유지 | MVP | range bounds. |
| context ctx `cells` | `cells` | 유지 | MVP | selected cell list. |
| context ctx `matrixList` | `matrixList` | 유지 | MVP | selected matrix list. |
| 없음 | `gridId` | 신규 | MVP | multiple/nested grid 구분. |
| 없음 | `rootElement` | 신규 | MVP | scoped action이 필요한 경우 제공. |

권장 context:

```ts
type GenDataGridContextMenuActionContext<TData> = {
  gridId: string;
  rootElement: HTMLElement | null;
  table: Table<TData>;
  selectedRanges: SelectedRanges;
  boundsList: RangeBounds[];
  cells: GenDataGridContextMenuCell<TData>[];
  matrixList: unknown[][][];
};
```

## 12. Tree / Detail / Nested Grid API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `tree` | `tree` | 변경 | Extension | 기존 flat parent-child tree 옵션은 유지하되 expansion state 이름을 명확히 한다. |
| `tree.enabled` | `tree.enabled` | 유지 | Extension | tree 활성화. |
| `tree.idKey` | `tree.idKey` | 유지 | Extension | row id field. |
| `tree.parentIdKey` | `tree.parentIdKey` | 유지 | Extension | parent id field. |
| `tree.treeColumnId` | `tree.treeColumnId` | 유지 | Extension | tree toggle column. |
| `tree.rootParentValue` | `tree.rootParentValue` | 유지 | Extension | root discriminator. |
| `tree.indentPx` | `tree.indentPx` | 유지 | Extension | indent size. |
| `tree.defaultExpanded` | `tree.defaultExpanded` | 유지 | Extension | initial expanded. |
| `tree.expandedRowIds` | `tree.expandedRowIds` | 유지 | Extension | controlled tree expansion. |
| `tree.onExpandedRowIdsChange` | `tree.onExpandedRowIdsChange` | 유지 | Extension | controlled callback. |
| `tree.showOrphanWarning` | `tree.showOrphanWarning` | 유지 | Extension | orphan warning. |
| `tree.onOrphanRowsChange` | `tree.onOrphanRowsChange` | 유지 | Extension | orphan callback. |
| 없음 | `renderDetailPanel` | 신규 | Extension | master-detail row. |
| 없음 | `detailExpandedRowIds` | 신규 | Extension | controlled detail expansion. |
| 없음 | `onDetailExpandedRowIdsChange` | 신규 | Extension | detail expansion callback. |
| 없음 | `gridId` | 신규 | MVP | explicit grid instance id. |
| 없음 | `getGridId` | 신규 | MVP | nested grid 대비 grid id override. |

## 13. Row Merge / Span API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `rowSpanning` | `rowMerge` | 변경 | Extension | div 기반에서는 명칭을 row merge로 바꾸는 것이 정확하다. |
| `rowSpanningMode` | `rowMergeMode` | 변경 | Extension | MVP 후 `visual`만 지원. `real`은 미지원 또는 제거 후보. |
| column meta `rowSpan` | column meta `rowMerge` | 변경 | Extension | boolean/predicate. |
| column meta `rowSpanValueGetter` | `rowMergeValueGetter` | 변경 | Extension | merge 비교 값. |
| column meta `rowSpanComparator` | `rowMergeComparator` | 변경 | Extension | merge comparator. |
| column meta `bodyColSpan` | `bodyColSpan` | 유지 | Extension | CSS grid `grid-column: span n`. pinned zone 경계 제한 필요. |
| column meta `headerSpan` | `headerSpan` | 유지 | Extension | CSS grid header span. |
| column meta `groupVisibilityToggle` | `groupVisibilityToggle` | 유지 | Extension | grouped header visibility toggle. |

## 14. Table Meta / Internal Context API

| GenGrid API | GenDataGrid API | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `tableMeta` | `tableMeta` | 유지 | MVP | TanStack table meta pass-through. |
| `GenGridProvider` public export | `GenDataGridProvider` | 제거 후보 | MVP | Provider를 public export할 필요가 있는지 재검토. 외부 composition 요구가 있으면 유지. |
| `useGenGridContext` public export | `useGenDataGridContext` | 제거 후보 | MVP | internal hook이면 export하지 않는 것을 권장. |
| 없음 | `gridId` | 신규 | MVP | 내부 context에서 필수. public prop으로는 optional. |
| 없음 | `rootRef` context | 신규 | MVP | scoped DOM lookup에 필수. |

## 15. Imperative Handle API

| GenGrid Handle | GenDataGrid Handle | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `getData()` | `getData()` | 유지 | MVP | 현재 data 반환. |
| `revertAll()` | `revertAll()` | 유지 | MVP | baseline으로 되돌림. |
| `acceptChanges()` | `acceptChanges()` | 유지 | MVP | 현재 data를 baseline으로 확정. |
| `load(nextData)` | `load(nextData)` | 유지 | MVP | data/baseline 교체. |
| `hardReset()` | `hardReset()` | 유지 | MVP | mount defaultData로 reset. |
| `isDirty()` | `isDirty()` | 유지 | MVP | dirty 여부. |
| `getDirtyRowIds()` | `getDirtyRowIds()` | 유지 | MVP | dirty row id list. |
| 없음 | `focusCell(coord)` | 신규 | MVP | scoped focus utility 기반. |
| 없음 | `scrollToCell(coord)` | 신규 | MVP | virtualization 포함 scroll 보정. |
| 없음 | `clearSelection()` | 신규 | MVP | range/row selection clear. |
| 없음 | `copySelection(options?)` | 신규 | MVP | clipboard action imperative. |

Implementation status: `rootElement`, `clearSelection()`, and `copySelection(options?)` are implemented. `scrollToCell(coord)` remains planned.

권장 handle:

```ts
type GenDataGridHandle<TData> = {
  getData: () => TData[];
  revertAll: () => void;
  acceptChanges: () => void;
  load: (nextData: TData[]) => void;
  hardReset: () => void;
  isDirty: () => boolean;
  getDirtyRowIds: () => string[];
  focusCell: (coord: { rowId: string; columnId: string }) => void;
  scrollToCell: (coord: { rowId: string; columnId: string }) => void;
  clearSelection: () => void;
  copySelection: (options?: { includeHeader?: boolean }) => Promise<void>;
};
```

## 16. Column Meta API

| GenGrid Column Meta | GenDataGrid Column Meta | 상태 | 우선순위 | 설명 |
| --- | --- | --- | --- | --- |
| `semanticType` | `semanticType` | 유지 | MVP | amount/percent semantic display. |
| `amountOptions` | `amountOptions` | 유지 | MVP | amount display options. |
| `percentOptions` | `percentOptions` | 유지 | MVP | percent display options. |
| `displayScale` | `displayScale` | 유지 | MVP | display scale. |
| `editable` | `editable` | 유지 | MVP | editable predicate. |
| `align` | `align` | 유지 | MVP | body cell align. |
| `headerAlign` | `headerAlign` | 유지 | MVP | header align. |
| `mono` | `mono` | 유지 | MVP | tabular/mono display. |
| `cellClassName` | `cellClassName` | 유지 | MVP | meta-level cell className. |
| `color` | `color` | 유지 | MVP | text color. |
| `backgroundColor` | `backgroundColor` | 유지 | MVP | background color. |
| `format` | `format` | 유지 | MVP | built-in formatter. |
| `formatLocale` | `formatLocale` | 유지 | MVP | locale. |
| `numberFormat` | `numberFormat` | 유지 | MVP | Intl number format options. |
| `dateFormat` | `dateFormat` | 유지 | MVP | Intl date format options. |
| `currency` | `currency` | 유지 | MVP | currency code. |
| `trueLabel` / `falseLabel` | `trueLabel` / `falseLabel` | 유지 | MVP | boolean formatter labels. |
| `emptyLabel` | `emptyLabel` | 유지 | MVP | null/empty label. |
| `renderCell` | `renderCell` | 유지 | MVP | custom cell renderer. |
| `tooltip` | `tooltip` | 유지 | MVP | static tooltip. |
| `getCellTooltip` | `getCellTooltip` | 유지 | MVP | dynamic tooltip. |
| `renderEditor` | `renderEditor` | 유지 | MVP | custom editor. |
| `exportValue` | `exportValue` | 유지 | MVP | clipboard/export value. |
| `editType` | `editType` | 유지 | MVP | built-in editor type. |
| `editOptions` | `editOptions` | 유지 | MVP | select options. |
| `getEditOptions` | `getEditOptions` | 유지 | MVP | row-based select options. |
| `editPlaceholder` | `editPlaceholder` | 유지 | MVP | editor placeholder. |
| `validation` | `validation` | 유지 | Extension | validation UI는 후속. type은 먼저 유지 가능. |
| `rowSpan*` | `rowMerge*` | 변경 | Extension | row span 명칭 변경 권장. |
| `bodyColSpan` | `bodyColSpan` | 유지 | Extension | CSS grid span으로 구현. |
| `headerSpan` | `headerSpan` | 유지 | Extension | CSS grid span으로 구현. |
| `groupVisibilityToggle` | `groupVisibilityToggle` | 유지 | Extension | header group visibility. |
| 없음 | `pinned` | 신규 | MVP | meta 기반 initial pinning을 명시 지원할 경우 사용. 기존 pinningState에는 이미 유사 처리 존재. |
| 없음 | `width` / `minWidth` / `maxWidth` | 신규 | MVP | column sizing 기본값을 meta 또는 columnDef size와 어떻게 통합할지 명확화 필요. TanStack `size` 우선 권장. |

중요 원칙:

- `GenDataGridColumnMeta`는 `renderers` 내부가 아니라 `columns/columnMeta.ts` 또는 `types/public.ts`에서 export한다.
- column meta는 public API이므로 DOM renderer 구현 세부사항을 포함하지 않는다.

## 17. 권장 MVP Public Props 초안

```ts
type GenDataGridProps<TData> =
  GenDataGridDataProps<TData> & {
    columns: ColumnDef<TData, unknown>[];
    getRowId: (row: TData, index: number) => string;

    caption?: string;
    className?: string;
    style?: React.CSSProperties;
    readonly?: boolean;
    readOnly?: boolean;

    height?: number | string;
    maxHeight?: number | string;
    headerHeight?: number;
    rowHeight?: number;
    getRowHeight?: (args: {
      row: TData;
      rowId: string;
      rowIndex: number;
    }) => number | undefined;
    fitColumns?: 'none' | 'fill';

    enableStickyHeader?: boolean;
    enableVirtualization?: boolean;
    overscan?: number;
    enableFiltering?: boolean;
    enableGlobalFilter?: boolean;
    enablePinning?: boolean;
    enableColumnSizing?: boolean;
    enableColumnReorder?: boolean;
    enableRowSelection?: boolean;
    rowSelectionMode?: 'all' | 'createdOnly';
    enableRowNumber?: boolean;
    enableRowStatus?: boolean;
    enableActiveRowHighlight?: boolean;
    enableRangeSelection?: boolean;
    enableFooterRow?: boolean;
    enableStickyFooterRow?: boolean;
    enableFooter?: boolean;
    enablePagination?: boolean;

    activeCell?: ActiveCell;
    defaultActiveCell?: ActiveCell;
    onActiveCellChange?: (next: ActiveCell) => void;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (next: RowSelectionState) => void;
    columnOrder?: string[];
    defaultColumnOrder?: string[];
    onColumnOrderChange?: (next: string[]) => void;
    columnVisibility?: VisibilityState;
    onColumnVisibilityChange?: (next: VisibilityState) => void;
    columnSizing?: Record<string, number>;
    defaultColumnSizing?: Record<string, number>;
    onColumnSizingChange?: (next: Record<string, number>) => void;
    columnPinning?: { left?: string[]; right?: string[] };
    defaultColumnPinning?: { left?: string[]; right?: string[] };
    onColumnPinningChange?: (next: { left?: string[]; right?: string[] }) => void;
    columnFilters?: unknown[];
    defaultColumnFilters?: unknown[];
    onColumnFiltersChange?: (next: unknown[]) => void;
    globalFilter?: unknown;
    defaultGlobalFilter?: unknown;
    onGlobalFilterChange?: (next: unknown) => void;
    pagination?: PaginationState;
    onPaginationChange?: (next: PaginationState) => void;
    totalRowCount?: number;
    pageSizeOptions?: number[];

    editOnActiveCell?: boolean;
    keepEditingOnNavigate?: boolean;
    editorFactory?: GenDataGridEditorFactory<TData>;
    isCellEditable?: (args: {
      row: TData;
      rowId: string;
      rowIndex: number;
      columnId: string;
    }) => boolean;
    onCellValueChange?: (args: {
      rowId: string;
      columnId: string;
      value: unknown;
    }) => void;

    rowStatusResolver?: (rowId: string) => 'clean' | 'created' | 'updated' | 'deleted';
    onDirtyChange?: (dirty: boolean) => void;
    onDirtyRowsChange?: (rowIds: string[]) => void;
    dirtyKeys?: string[];
    isEqualForDirty?: (a: unknown, b: unknown, args: {
      rowId: string;
      columnId: string;
    }) => boolean;

    getRowClassName?: (args: { row: TData; rowId: string; rowIndex: number }) => string | undefined;
    getRowStyle?: (args: { row: TData; rowId: string; rowIndex: number }) => React.CSSProperties | undefined;
    getCellClassName?: (args: {
      row: TData;
      rowId: string;
      rowIndex: number;
      columnId: string;
      value: unknown;
    }) => string | undefined;
    getCellStyle?: (args: {
      row: TData;
      rowId: string;
      rowIndex: number;
      visibleRows: TData[];
      columnId: string;
      value: unknown;
    }) => React.CSSProperties | undefined;
    getCellTooltip?: (args: {
      row: TData;
      rowId: string;
      rowIndex: number;
      columnId: string;
      value: unknown;
    }) => string | undefined;

    footer?: React.ReactNode;
    renderFooter?: (ctx: GenDataGridRenderContext<TData>) => React.ReactNode;
    noRowsMessage?: React.ReactNode;
    renderNoRowsMessage?: (ctx: GenDataGridRenderContext<TData>) => React.ReactNode;

    contextMenu?: GenDataGridContextMenuOptions<TData>;
    tableMeta?: Record<string, unknown>;
    gridId?: string;
    getGridId?: () => string;
  };
```

## 18. API 결정 필요 항목

| 항목 | 선택지 | 권장 |
| --- | --- | --- |
| `getRowId` 필수 여부 | 필수 / optional fallback index | 필수 |
| `readonly` 이름 | `readonly` 유지 / `readOnly` 변경 / 둘 다 | 둘 다 지원, 내부는 `readOnly` 정규화 |
| row selection 이름 | `checkboxSelection` 유지 / `enableRowSelection` 변경 | `enableRowSelection` |
| row spanning 이름 | `rowSpanning` 유지 / `rowMerge` 변경 | `rowMerge` |
| provider public export | 유지 / 제거 | MVP에서는 제거 후보, 필요 시 후속 공개 |
| render callback 인자 | TanStack `Table` 직접 / wrapper context | wrapper context 권장 |
| column meta 위치 | renderer utils / public types | public types 또는 columns |
| nested grid id | 내부 자동 생성 / external override | 자동 생성 + `getGridId` optional |

## 19. 구현 전 확정해야 할 MVP API

개발 시작 전에 최소한 다음은 확정한다.

- `GenDataGridProps<TData>`
- `GenDataGridColumnMeta<TData>`
- `GenDataGridHandle<TData>`
- `GenDataGridEditorContext<TData>`
- `GenDataGridContextMenuActionContext<TData>`
- controlled/uncontrolled state naming
- row selection naming
- row merge naming
- render callback context shape
- provider/context public export 여부

이 API가 정해져야 디렉터리 구조와 내부 hook 책임이 흔들리지 않는다.
