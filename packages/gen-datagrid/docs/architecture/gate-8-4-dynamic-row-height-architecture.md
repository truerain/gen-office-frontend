<!-- packages/gen-datagrid/docs/architecture/gate-8-4-dynamic-row-height-architecture.md
Documents the Gate 8.4 dynamic row height and virtualized detail-row architecture for GenDataGrid.
-->

# GenDataGrid Gate 8.4 Dynamic Row Height Architecture

Gate 8.4는 fixed-height row virtualization에서 벗어나, 실제 DOM 높이를 측정해 virtualizer offset을 재계산하는 slice다. Gate 8.2에서 master-detail row는 non-virtualized path에만 구현했고, Gate 8.3에서 detail panel 안 nested grid composition을 검증했다. Gate 8.4는 이 두 기능을 virtualization과 연결하기 위한 기반을 만든다.

핵심 목표는 다음 두 가지다.

1. `enableVirtualization === true` 상태에서도 row 높이가 실제 렌더링 높이에 맞춰 갱신된다.
2. expanded detail panel이 있을 때 virtualizer의 total size, offset, focus restore, scroll-to-cell 동작이 깨지지 않는다.

## 구현 전 요약

| 항목 | 권장안 |
| --- | --- |
| 핵심 모델 | parent data row와 detail panel을 하나의 composite virtual item으로 측정 |
| public API | 새 대형 API 추가 없이 기존 `getRowHeight`, `detailPanelHeight`, `renderDetailPanel`를 우선 재사용 |
| dynamic 측정 | virtual row wrapper의 실제 높이를 `measureElement` / ResizeObserver 기반으로 반영 |
| master-detail + virtualization | Gate 8.4에서 지원 대상으로 승격 및 구현 완료 |
| detail panel height | 기존 fixed `detailPanelHeight` 유지, auto height는 measured result로 반영 가능하게 설계 |
| navigation | active cell은 data row/cell 기준 유지, detail panel은 navigation 대상 아님 |
| excluded | column virtualization, tree, row merge/span, cross-grid selection |


## Implemented Slice

- `DataGridVirtualBody`를 measured composite virtual item 구조로 변경했다.
- virtual item 하나가 data row와 optional detail row를 함께 포함한다.
- `getRowHeight`를 virtualized mode에서도 base row height estimate로 사용한다.
- `enableVirtualization` 상태에서도 master-detail row rendering을 허용했다.
- expanded detail panel height는 virtual item estimate와 measurement fallback에 반영된다.
- TanStack virtualizer 측정 element에 `data-index`를 제공하고, jsdom처럼 측정 높이가 0인 환경에서는 estimate size로 fallback한다.
- `DataGridRoot`가 virtualized path에도 master-detail props와 `getRowHeight`를 전달한다.
- `Gate84DynamicRowHeight` Storybook scenario를 추가했다.
- interaction test에서 virtualized master-detail rendering과 virtualized `getRowHeight` 적용을 검증한다.
## Scope

Gate 8.4에서 구현할 항목:

- virtualized body에서 dynamic row measurement 지원
- `getRowHeight`를 virtualized row의 estimate/base height로 재사용
- virtualized path에서도 master-detail rendering 허용
- expanded parent row의 virtual item 높이에 detail panel 높이 포함
- detail panel이 child grid나 가변 content를 포함해도 측정 결과가 virtualizer offset에 반영되도록 구조 마련
- `scrollToCell`, active-cell focus restore, keyboard navigation이 measured offset 기준으로 동작하는지 검증
- range selection auto-scroll이 measured row height 상황에서도 row id 기준으로 유지되는지 검증
- Storybook 수동 테스트 scenario 추가
- interaction tests 추가

Gate 8.4에서 제외할 항목:

- column virtualization
- tree flattening model
- row merge/span
- grouped header span
- cross-grid range selection
- detail panel lazy loading API
- parent-child relational data model
- browser screenshot automation

## Key Decision: Composite Virtual Item

### 선택지

| 선택지 | 설명 | 장점 | 단점 | 판단 |
| --- | --- | --- | --- | --- |
| 별도 virtual item | data row와 detail row를 virtualizer item 목록에 따로 넣음 | detail row가 실제 row처럼 분리됨 | row index/row id/navigation/selection mapping이 복잡해짐 | 비권장 |
| composite virtual item | parent data row와 detail panel을 하나의 virtual item 안에 렌더링 | row id model 유지, detail row가 data row로 섞이지 않음 | item wrapper 높이 측정 필요 | 권장 |

권장안은 composite virtual item이다.

이유:

- 현재 navigation, selection, editing, clipboard는 모두 data row id 기준이다.
- detail row는 data row가 아니므로 `rowIds`에 들어가면 안 된다.
- virtualizer count를 `rows.length`로 유지하면 기존 row model과 keyboard contract가 유지된다.
- expanded row 높이만 커지는 구조로 보면 `scrollToCell(rowId)`와 active-cell focus restore가 단순해진다.

## Public API Policy

Gate 8.4 MVP는 새 public API를 최소화한다.

재사용할 기존 API:

```ts
type GenDataGridProps<TData> = {
  enableVirtualization?: boolean;
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;

  enableMasterDetail?: boolean;
  expandedRows?: GenDataGridExpandedRowState;
  defaultExpandedRows?: GenDataGridExpandedRowState;
  onExpandedRowsChange?: (next: GenDataGridExpandedRowState) => void;
  getRowCanExpand?: (ctx: GenDataGridRowContext<TData>) => boolean;
  renderDetailPanel?: (ctx: GenDataGridDetailPanelContext<TData>) => React.ReactNode;
  detailPanelHeight?: number;
};
```

정책:

- `getRowHeight`는 virtualized mode에서 initial estimate 또는 base row height로 사용한다.
- 실제 렌더링 높이는 DOM measurement가 우선한다.
- `detailPanelHeight`는 initial estimate로 사용한다.
- detail panel 실제 높이가 다르면 measured height가 virtualizer에 반영된다.
- 별도 `enableDynamicRowHeight` prop은 Gate 8.4 MVP에서는 추가하지 않는다. Dynamic measurement는 virtualization 내부 구현으로 둔다.

향후 필요 시 검토할 API:

- `estimateRowHeight`
- `estimateDetailPanelHeight`
- `disableDynamicMeasurement`
- `onRowMeasured`

## Rendering Contract

Virtualized body는 data row당 하나의 positioned wrapper를 렌더링한다.

```html
<div data-virtualized-body=true style=height: