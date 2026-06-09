# GenDataGrid API Structure

## 1. 목적

이 문서는 `GenDataGrid` API를 TanStack Table의 `Core API` / `Feature API` 구분 방식에 가깝게 재분류한다.

`api-comparison-with-gen-grid.md`는 기존 `GenGrid`와의 props 비교 문서다. 이 문서는 비교표가 아니라 `gen-datagrid`의 최종 public API 구조를 정의하는 기준 문서다.

## 2. API 분류 원칙

`GenDataGrid`는 TanStack Table을 내부 table engine으로 사용하지만, public API는 React DataGrid 컴포넌트 API다. 따라서 TanStack과 완전히 같은 분류를 쓰지는 않는다.

권장 분류:

- **Core API**: grid 생성에 반드시 필요한 기본 계약
- **State API**: controlled/uncontrolled state 계약
- **Feature API**: 기능별 옵션과 callback
- **Rendering API**: cell/header/footer/editor 렌더링 커스터마이징
- **Column API**: column meta와 column helper 계약
- **Instance API**: ref handle과 imperative API
- **Extension API**: MVP 이후 확장 기능

## 3. Core API

Core API는 grid가 존재하기 위한 최소 계약이다. 기능 flag나 세부 feature state보다 먼저 정의한다.

### 3.1 Data Core

| API | Type | Required | 설명 |
| --- | --- | --- | --- |
| `data` | `TData[]` | controlled일 때 필수 | 외부에서 제어하는 data |
| `defaultData` | `TData[]` | uncontrolled일 때 필수 | 내부 state로 관리할 초기 data |
| `onDataChange` | `(next: TData[]) => void` | controlled일 때 필수 | data 변경 callback |
| `dataVersion` | `number \| string` | optional | 외부 data reset/baseline 갱신 기준 |
| `columns` | `ColumnDef<TData, unknown>[]` | 필수 | TanStack column 정의 |
| `getRowId` | `(row: TData, index: number) => string` | 필수 | 안정적인 row id 생성 |

설계 원칙:

- `getRowId`는 필수로 둔다.
- index fallback은 제공하지 않는다.
- `data`와 `defaultData`는 동시에 받을 수 없다.

### 3.2 Grid Identity Core

| API | Type | Required | 설명 |
| --- | --- | --- | --- |
| `gridId` | `string` | optional | 외부에서 지정하는 grid id |
| `getGridId` | `() => string` | optional | lazy grid id 생성 hook |

설계 원칙:

- 내부적으로 모든 grid는 고유 `gridId`를 가진다.
- `gridId`는 DOM root, context, clipboard ownership, nested grid boundary에서 사용한다.
- `gridId`와 `getGridId`가 모두 없으면 내부에서 stable id를 생성한다.

### 3.3 Layout Core

| API | Type | Required | 설명 |
| --- | --- | --- | --- |
| `caption` | `React.ReactNode` | optional | grid 설명 또는 caption |
| `className` | `string` | optional | root className |
| `style` | `React.CSSProperties` | optional | root style |
| `height` | `number \| string` | optional | grid height |
| `maxHeight` | `number \| string` | optional | grid max height |
| `headerHeight` | `number` | optional | header row height |
| `rowHeight` | `number` | optional | default row height |
| `getRowHeight` | `(ctx) => number \| undefined` | optional | per-row height resolver for non-virtualized rendering |
| `fitColumns` | `'none' \| 'fill'` | optional | column width fill mode |

설계 원칙:

- `rowHeight`는 기본 row height다.
- `getRowHeight`는 MVP에서 `enableVirtualization !== true`일 때 지원한다.
- `enableVirtualization === true`에서 dynamic row measurement는 Extension API로 분리한다.
- header/body/footer는 같은 column template source를 공유한다.

### 3.4 DOM And Accessibility Core

DOM contract는 prop이 아니지만 Core API 수준의 public behavior다.

| Contract | 설명 |
| --- | --- |
| root `role="grid"` | grid root |
| rowgroup `role="rowgroup"` | header/body/footer group |
| row `role="row"` | row |
| header cell `role="columnheader"` | header cell |
| body cell `role="gridcell"` | body cell |
| `data-gen-datagrid-root="true"` | grid root marker |
| `data-grid-id` | grid instance id |
| `data-gen-datagrid-cell="true"` | all cell marker |
| `data-rowid` | body cell row id |
| `data-colid` | cell column id |

설계 원칙:

- 모든 DOM lookup은 root-scoped여야 한다.
- `document.querySelector` 전역 cell lookup은 금지한다.
- nested grid는 별도 root boundary로 취급한다.

## 4. State API

State API는 controlled/uncontrolled 상태 계약이다. TanStack feature state와 DataGrid 고유 state를 분리해 정의한다.

### 4.1 Active Cell State

| API | Type | 설명 |
| --- | --- | --- |
| `activeCell` | `{ rowId: string; columnId: string } \| null` | controlled active cell |
| `onActiveCellChange` | `(next: ActiveCell) => void` | active cell change callback |
| `defaultActiveCell` | `ActiveCell` | uncontrolled initial active cell |

설계 원칙:

- active cell은 gridId scope 안에서만 의미가 있다.
- filtering/pagination/tree collapse 후 없는 row를 참조하면 내부에서 clear하거나 nearest cell로 보정한다.

### 4.2 Column State

| API | Type | 설명 |
| --- | --- | --- |
| `columnOrder` | `string[]` | controlled column order |
| `defaultColumnOrder` | `string[]` | uncontrolled initial column order |
| `onColumnOrderChange` | `(next: string[]) => void` | order callback |
| `columnVisibility` | `VisibilityState` | controlled visibility |
| `defaultColumnVisibility` | `VisibilityState` | uncontrolled initial visibility |
| `onColumnVisibilityChange` | `(next: VisibilityState) => void` | visibility callback |
| `columnSizing` | `Record<string, number>` | controlled column sizing |
| `defaultColumnSizing` | `Record<string, number>` | uncontrolled initial sizing |
| `onColumnSizingChange` | `(next: Record<string, number>) => void` | sizing callback |
| `columnPinning` | `{ left?: string[]; right?: string[] }` | controlled pinning |
| `defaultColumnPinning` | `{ left?: string[]; right?: string[] }` | uncontrolled initial pinning |
| `onColumnPinningChange` | `(next: ColumnPinningState) => void` | pinning callback |

Implementation status: `columnOrder`, `columnVisibility`, and `columnSizing` are wired through the Phase 1 TanStack adapter. Pinning state remains planned for the pinning gate.

설계 원칙:

- column order와 pinning은 서로 정규화한다.
- pinned zone을 넘는 reorder는 차단한다.
- sizing state가 column template의 단일 source다.

### 4.3 Row Selection State

| API | Type | 설명 |
| --- | --- | --- |
| `rowSelection` | `RowSelectionState` | controlled row selection |
| `defaultRowSelection` | `RowSelectionState` | uncontrolled initial row selection |
| `onRowSelectionChange` | `(next: RowSelectionState) => void` | row selection callback |

설계 원칙:

- `checkboxSelection` 명칭 대신 `enableRowSelection`을 사용한다.
- checkbox column은 row selection feature의 UI 구현이다.

### 4.4 Filter State

| API | Type | 설명 |
| --- | --- | --- |
| `columnFilters` | `ColumnFiltersState` | controlled column filters |
| `defaultColumnFilters` | `ColumnFiltersState` | uncontrolled initial column filters |
| `onColumnFiltersChange` | `(next: ColumnFiltersState) => void` | column filters callback |
| `globalFilter` | `unknown` | controlled global filter |
| `defaultGlobalFilter` | `unknown` | uncontrolled initial global filter |
| `onGlobalFilterChange` | `(next: unknown) => void` | global filter callback |

### 4.5 Pagination State

| API | Type | 설명 |
| --- | --- | --- |
| `pagination` | `PaginationState` | controlled pagination |
| `defaultPagination` | `PaginationState` | uncontrolled initial pagination |
| `onPaginationChange` | `(next: PaginationState) => void` | pagination callback |
| `totalRowCount` | `number` | server/manual pagination total count |
| `pageSizeOptions` | `number[]` | page size options |

### 4.6 Dirty State

| API | Type | 설명 |
| --- | --- | --- |
| `onDirtyChange` | `(dirty: boolean) => void` | 전체 dirty callback |
| `onDirtyRowsChange` | `(rowIds: string[]) => void` | dirty row ids callback |
| `dirtyKeys` | `string[]` | dirty 비교 대상 field |
| `isEqualForDirty` | `(a, b, ctx) => boolean` | custom equality |

Dirty state는 TanStack state가 아니라 DataGrid application state다.

## 5. Feature API

Feature API는 각 기능의 enable flag, option, event callback을 묶는다.

### 5.1 Editing Feature

| API | Type | 우선순위 | 설명 |
| --- | --- | --- | --- |
| `readOnly` | `boolean` | MVP | editing 차단 |
| `readonly` | `boolean` | MVP | 기존 GenGrid 호환 alias |
| `editOnActiveCell` | `boolean` | MVP | active cell 진입 시 edit 시작 |
| `keepEditingOnNavigate` | `boolean` | MVP | 이동 중 edit mode 유지 |
| `editorFactory` | `GenDataGridEditorFactory<TData>` | MVP | global editor factory |
| `isCellEditable` | `(ctx) => boolean` | MVP | grid-level editable predicate |
| `onCellValueChange` | `(args) => void` | MVP | committed value callback |

### 5.2 Range Selection And Clipboard Feature

| API | Type | 우선순위 | 설명 |
| --- | --- | --- | --- |
| `enableRangeSelection` | `boolean` | MVP | cell range selection |
| `selectedRanges` | `SelectedRanges` | MVP | controlled selected ranges |
| `defaultSelectedRanges` | `SelectedRanges` | MVP | uncontrolled initial selected ranges |
| `onSelectedRangesChange` | `(next) => void` | MVP | selected ranges callback |
| `enableClipboard` | `boolean` | MVP | copy/paste 활성화 |
| `clipboardOptions` | object | MVP | include header, value formatter 정책 |

Implementation status: `enableRangeSelection`, `selectedRanges`, `defaultSelectedRanges`, `onSelectedRangesChange`, `enableClipboard`, and `clipboardOptions.includeHeader` are implemented for range selection and copy. Paste application and clipboard value formatter policy remain planned.

설계 원칙:

- clipboard ownership은 focused grid 기준이다.
- nested grid selection은 부모 grid selection과 독립이다.

### 5.3 Filtering Feature

| API | Type | 우선순위 | 설명 |
| --- | --- | --- | --- |
| `enableFiltering` | `boolean` | MVP | column filtering |
| `enableGlobalFilter` | `boolean` | MVP | global filtering |
| `filterMode` | `'client' \| 'manual'` | MVP | client/server filtering 구분 |

### 5.4 Pagination Feature

| API | Type | 우선순위 | 설명 |
| --- | --- | --- | --- |
| `enablePagination` | `boolean` | MVP | pagination UI |
| `paginationMode` | `'client' \| 'manual'` | MVP | client/server pagination 구분 |

### 5.5 Column Feature

| API | Type | 우선순위 | 설명 |
| --- | --- | --- | --- |
| `enableColumnSizing` | `boolean` | MVP | resize |
| `enableColumnReorder` | `boolean` | MVP | reorder |
| `enablePinning` | `boolean` | MVP | column pinning |
| `enableColumnVisibility` | `boolean` | MVP | column visibility |

### 5.6 Row Feature

| API | Type | 우선순위 | 설명 |
| --- | --- | --- | --- |
| `enableRowSelection` | `boolean` | MVP | row selection |
| `rowSelectionMode` | `'all' \| 'createdOnly'` | MVP | row selection policy |
| `enableRowNumber` | `boolean` | MVP | row number column |
| `enableRowStatus` | `boolean` | MVP | row status column |
| `rowStatusResolver` | `(rowId) => RowStatus` | MVP | row status resolver |
| `enableActiveRowHighlight` | `boolean` | MVP | active row highlight |

### 5.7 Footer Feature

| API | Type | 우선순위 | 설명 |
| --- | --- | --- | --- |
| `enableFooterRow` | `boolean` | MVP | column footer row |
| `enableStickyFooterRow` | `boolean` | MVP | sticky footer row |
| `enableFooter` | `boolean` | MVP | external footer area |

### 5.8 Virtualization Feature

| API | Type | 우선순위 | 설명 |
| --- | --- | --- | --- |
| `enableVirtualization` | `boolean` | MVP | row virtualization |
| `overscan` | `number` | MVP | virtualizer overscan |
| `virtualizationMode` | `'fixed' \| 'dynamic'` | Extension | virtualized rendering의 dynamic measurement는 후속 지원 |

## 6. Rendering API

Rendering API는 DataGrid의 UI 커스터마이징 surface다.

### 6.1 Row And Cell Styling

| API | Type | 설명 |
| --- | --- | --- |
| `getRowClassName` | `(ctx) => string \| undefined` | row className |
| `getRowStyle` | `(ctx) => CSSProperties \| undefined` | row inline style |
| `getCellClassName` | `(ctx) => string \| undefined` | cell className |
| `getCellStyle` | `(ctx) => CSSProperties \| undefined` | cell inline style |
| `getCellTooltip` | `(ctx) => string \| undefined` | cell tooltip |

### 6.2 Render Slots

| API | Type | 설명 |
| --- | --- | --- |
| `footer` | `React.ReactNode` | static external footer |
| `renderFooter` | `(ctx) => React.ReactNode` | external footer render |
| `noRowsMessage` | `React.ReactNode` | static empty state |
| `renderNoRowsMessage` | `(ctx) => React.ReactNode` | empty state render |
| `renderToolbar` | `(ctx) => React.ReactNode` | optional toolbar slot |

권장 render context:

```ts
type GenDataGridRenderContext<TData> = {
  gridId: string;
  table: Table<TData>;
  rowCount: number;
  visibleRowCount: number;
  rootElement: HTMLElement | null;
};
```

### 6.3 Editor Rendering

| API | Type | 설명 |
| --- | --- | --- |
| `editorFactory` | `(ctx) => React.ReactNode` | global editor renderer |
| column meta `renderEditor` | `(ctx) => React.ReactNode` | column-level editor |
| column meta `renderCell` | `(ctx) => React.ReactNode` | column-level cell render |

## 7. Column API

Column API는 TanStack `ColumnDef.meta`를 확장하는 public API다. 이 타입은 renderer 내부에서 export하지 않는다.

권장 위치:

```txt
src/columns/columnMeta.ts
src/columns/columnHelpers.ts
src/columns/semanticDisplay.ts
src/columns/cellFormat.ts
```

### 7.1 Display Meta

| Meta | 설명 | 우선순위 |
| --- | --- | --- |
| `semanticType` | amount/percent semantic display | MVP |
| `amountOptions` | amount display option | MVP |
| `percentOptions` | percent display option | MVP |
| `displayScale` | display scale | MVP |
| `format` | built-in formatter | MVP |
| `formatLocale` | formatter locale | MVP |
| `numberFormat` | number format option | MVP |
| `dateFormat` | date format option | MVP |
| `currency` | currency code | MVP |
| `trueLabel` / `falseLabel` | boolean labels | MVP |
| `emptyLabel` | empty value label | MVP |
| `mono` | mono/tabular numeric display | MVP |
| `align` | body align | MVP |
| `headerAlign` | header align | MVP |

### 7.2 Editing Meta

| Meta | 설명 | 우선순위 |
| --- | --- | --- |
| `editable` | editable boolean/predicate | MVP |
| `editType` | built-in editor type | MVP |
| `editOptions` | select options | MVP |
| `getEditOptions` | row-based select options | MVP |
| `editPlaceholder` | editor placeholder | MVP |
| `renderEditor` | custom editor | MVP |

### 7.3 Styling Meta

| Meta | 설명 | 우선순위 |
| --- | --- | --- |
| `cellClassName` | className or resolver | MVP |
| `color` | text color or resolver | MVP |
| `backgroundColor` | background color or resolver | MVP |
| `tooltip` | static tooltip | MVP |
| `getCellTooltip` | dynamic tooltip | MVP |

### 7.4 Export Meta

| Meta | 설명 | 우선순위 |
| --- | --- | --- |
| `exportValue` | clipboard/export value resolver | MVP |

### 7.5 Layout Meta

| Meta | 설명 | 우선순위 |
| --- | --- | --- |
| `pinned` | initial pinning hint | MVP |
| `bodyColSpan` | body CSS grid column span | Extension |
| `headerSpan` | header CSS grid column span | Extension |
| `groupVisibilityToggle` | grouped header visibility toggle | Extension |
| `rowMerge` | visual row merge enable/predicate | Extension |
| `rowMergeValueGetter` | row merge compare value | Extension |
| `rowMergeComparator` | row merge comparator | Extension |

## 8. Instance API

Instance API는 `ref` handle로 제공한다.

| API | 설명 | 우선순위 |
| --- | --- | --- |
| `getData()` | 현재 data 반환 | MVP |
| `revertAll()` | baseline으로 되돌림 | MVP |
| `acceptChanges()` | 현재 data를 baseline으로 확정 | MVP |
| `load(nextData)` | data/baseline 교체 | MVP |
| `hardReset()` | mount defaultData로 reset | MVP |
| `isDirty()` | dirty 여부 | MVP |
| `getDirtyRowIds()` | dirty row id 목록 | MVP |
| `focusCell(coord)` | scoped focus | MVP |
| `scrollToCell(coord)` | scoped scroll | MVP |
| `clearSelection()` | selection clear | MVP |
| `copySelection(options)` | selection copy | MVP |

Implementation status: `rootElement`, `clearSelection()`, and `copySelection(options)` are implemented. `scrollToCell(coord)` remains planned.

설계 원칙:

- instance API는 현재 grid root에만 작동한다.
- nested grid parent handle이 child grid를 조작하지 않는다.

## 9. Extension API

Extension API는 MVP public surface와 분리한다. 타입 위치는 미리 잡되, prop 공개는 extension gate 이후로 미룬다.

### 9.1 Tree

| API | 설명 |
| --- | --- |
| `tree.enabled` | tree mode 활성화 |
| `tree.idKey` | row id field |
| `tree.parentIdKey` | parent id field |
| `tree.treeColumnId` | toggle column |
| `tree.rootParentValue` | root discriminator |
| `tree.indentPx` | indent size |
| `tree.defaultExpanded` | initial expanded |
| `tree.expandedRowIds` | controlled expanded state |
| `tree.onExpandedRowIdsChange` | expanded callback |
| `tree.showOrphanWarning` | orphan warning |
| `tree.onOrphanRowsChange` | orphan callback |

### 9.2 Master Detail

| API | 설명 |
| --- | --- |
| `renderDetailPanel` | row detail renderer |
| `detailExpandedRowIds` | controlled detail expansion |
| `defaultDetailExpandedRowIds` | uncontrolled detail expansion |
| `onDetailExpandedRowIdsChange` | detail expansion callback |

### 9.3 Nested Grid

Nested grid는 별도 prop보다 Core DOM contract와 `gridId`로 처리한다.

| API | 설명 |
| --- | --- |
| `gridId` | external id |
| `getGridId` | external id factory |
| context `parentGridId` | internal relationship |

### 9.4 Row Merge

| API | 설명 |
| --- | --- |
| `rowMerge` | visual row merge 활성화 |
| `rowMergeMode` | MVP 이후에도 기본은 `visual` |
| column meta `rowMerge` | column-level merge enable |
| column meta `rowMergeValueGetter` | compare value |
| column meta `rowMergeComparator` | comparator |

### 9.5 Dynamic Row Height

| API | 설명 |
| --- | --- |
| `virtualizationMode: 'dynamic'` | virtualized dynamic measurement |
| `estimateRowHeight` | virtualized row height estimate |
| `getRowHeight` | MVP에서는 non-virtualized row height resolver로 사용하고, virtualized dynamic mode에서는 estimate/measurement와 함께 재사용 |

## 10. API 문서 구조 권장안

최종 docs는 다음 구조로 나눈다.

```txt
docs/
  api/
    core-api.md
    state-api.md
    feature-api.md
    rendering-api.md
    column-api.md
    instance-api.md
    extension-api.md
  api-comparison-with-gen-grid.md
  api-structure.md
  div-datagrid-development-plan.md
  mvp-test-gates.md
```

초기에는 `api-structure.md` 하나로 시작하고, 구현이 진행되면 위 문서로 분리한다.

## 11. GenGrid 비교 문서와의 관계

`api-comparison-with-gen-grid.md`는 migration 관점 문서다.

- 기존 GenGrid prop이 GenDataGrid에서 유지되는지
- 이름이 바뀌는지
- MVP에 포함되는지
- extension으로 밀리는지

`api-structure.md`는 설계 관점 문서다.

- API가 어떤 책임 그룹에 속하는지
- 어떤 타입 파일에 위치해야 하는지
- 어떤 API가 Core이고 어떤 API가 Feature인지
- 구현 전 어떤 public surface를 먼저 고정해야 하는지

두 문서는 서로 보완 관계다.

## 12. 구현 전 확정 순서

1. Core API 확정
2. State API naming 확정
3. MVP Feature API 확정
4. Column Meta API 확정
5. Rendering callback context 확정
6. Instance API 확정
7. Extension API는 타입 방향만 확정하고 public prop 공개는 보류

이 순서가 지켜져야 구현 중 props와 내부 구조가 계속 변경되는 문제를 줄일 수 있다.
