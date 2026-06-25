<!-- packages/gen-datagrid/docs/architecture/gate-8-5-tree-row-model-architecture.md
Documents the Gate 8.5 tree row model architecture and implementation plan for GenDataGrid.
-->

# GenDataGrid Gate 8.5 Tree Row Model Architecture

Gate 8.5는 master-detail 계열 기능과 분리된 tree row model slice다. Gate 8.2-8.4는 data row 아래에 detail panel을 붙이는 흐름을 다뤘고, Gate 8.5는 data row 자체가 parent/child 계층을 가지는 흐름을 다룬다.

이번 gate의 핵심은 nested data를 visible flattened row list로 안정적으로 변환하고, expand/collapse 이후 active cell, range selection, clipboard, editing, virtualization이 기존 row-id contract를 그대로 사용하도록 만드는 것이다.

## 구현 전 점검

| 항목 | 현재 상태 | Gate 8.5 판단 |
| --- | --- | --- |
| row id 기반 navigation | `rowIds` 배열을 기준으로 active cell 이동 | visible flattened row id 배열로 유지 |
| range selection | `rowIds`와 `columnIds`로 bounds 계산 | collapsed child row는 rowIds에서 제거되어 selection 대상 아님 |
| clipboard/paste | 현재 table rows 기준 matrix 생성/적용 | visible flattened rows 기준 유지 |
| editing | row id/column id 기준 edit lifecycle | collapsed child editing은 cleanup 필요 |
| virtualization | `rows` 배열과 `rowIds`를 같은 순서로 사용 | visible flattened rows만 virtualizer에 전달 |
| master-detail | 별도 `expandedRows` state와 detail panel 렌더링 | tree expansion state와 분리 필요 |
| filtering/pagination | TanStack row model 사용 | tree 조합 정책을 명시해야 함 |

## 목표

- nested data를 tree row로 렌더링한다.
- parent row expand/collapse를 mouse와 keyboard로 제어한다.
- tree indentation과 toggle affordance를 첫 번째 visible cell에 렌더링한다.
- collapsed child row는 active cell, range selection, clipboard, editing, paste 대상에서 제외한다.
- collapse 시 active/editing cell이 숨겨진 child row를 가리키면 parent row로 정리한다.
- virtualized body에서도 visible flattened row list만 렌더링한다.
- filtering/pagination과 tree 조합 정책을 MVP 수준으로 고정한다.

## 제외 범위

- async/lazy child loading API
- flat parentId data를 tree로 조립하는 내장 adapter
- tree + master-detail 동시 조합
- tree + row merge/span 조합
- tree drag/drop reorder
- `treeToggleColumnId` 같은 특정 컬럼 tree toggle 고정 API
- `treeCollapseBehavior` 같은 parent collapse 시 descendant expansion state reset 정책 옵션
- 	reeToggleColumnId 같은 특정 컬럼 tree toggle 고정 API
- 	reeCollapseBehavior 같은 parent collapse 시 descendant expansion state reset 정책 옵션
- grouped header span
- server-side/manual tree filtering semantics
- aria treegrid 전체 스펙 완성

## 권장 Public API

Gate 8.5는 master-detail의 `expandedRows`를 재사용하지 않는다. 두 expansion은 의미가 다르다.

```ts
export type GenDataGridTreeExpandedState = Record<string, boolean>;

export type GenDataGridTreeRowContext<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
  depth: number;
  parentRowId?: string;
};

type GenDataGridProps<TData> = {
  enableTreeRows?: boolean;
  getSubRows?: (row: TData, index: number) => readonly TData[] | undefined;
  treeExpandedRows?: GenDataGridTreeExpandedState;
  defaultTreeExpandedRows?: GenDataGridTreeExpandedState;
  onTreeExpandedRowsChange?: (next: GenDataGridTreeExpandedState) => void;
  getRowCanExpandTree?: (ctx: GenDataGridTreeRowContext<TData>) => boolean;
  treeIndentWidth?: number;
};
```

### API 원칙

- `enableTreeRows`가 꺼져 있으면 기존 flat grid 동작을 유지한다.
- `getSubRows`가 없으면 tree 기능은 활성화하지 않는다.
- `treeExpandedRows`는 controlled state, `defaultTreeExpandedRows`는 uncontrolled initial state다.
- `expandedRows`는 master-detail 전용으로 유지한다.
- `treeIndentWidth` 기본값은 `16`을 권장한다.

## Data Flow

```text
input data
  -> TanStack core row model with getSubRows
  -> filtered row model
  -> tree expanded row model
  -> pagination row model
  -> visible tableRows
  -> rowIds / active / selection / clipboard / virtualization
```

권장 구현은 TanStack의 `getSubRows`, `getExpandedRowModel`, controlled expanded state를 사용한다. 별도 custom flattening을 먼저 만들면 filtering, pagination, row object, cell context가 TanStack row model과 어긋날 위험이 크다.

## Render Model

첫 번째 visible cell에 tree affordance를 추가한다.

```text
DataGridBodyRow
  DataGridCell(first visible column)
    tree spacer depth * indentWidth
    tree toggle when row can expand
    cell content
```

DOM marker 초안:

```html
<button data-gen-datagrid-tree-toggle="true" aria-expanded="true|false" />
<span data-gen-datagrid-tree-indent="true" style="width: depth * indentWidth" />
```

렌더링 규칙:

- toggle은 first visible cell에만 표시한다.
- child row는 `data-tree-depth`와 `data-parent-rowid` marker를 가진다.
- leaf row는 toggle 대신 같은 폭의 spacer를 유지해 text alignment가 흔들리지 않게 한다.
- pinned column이 켜져 있어도 first visible cell이 left/center/right 어느 zone에 있든 동일 contract를 유지한다.

## Interaction Flow

### Mouse

- tree toggle `mousedown`은 focus steal과 range drag 시작을 막는다.
- tree toggle `click`은 해당 row expansion만 변경하고 parent cell activation은 일으키지 않는다.
- 일반 cell 클릭은 기존 active cell 이동 규칙을 유지한다.

### Keyboard

권장 MVP 정책:

| 입력 | 동작 |
| --- | --- |
| `ArrowRight` on expandable collapsed row | expand |
| `ArrowRight` on expanded row | 기존 navigation 유지 또는 no-op 중 결정 필요 |
| `ArrowLeft` on expanded row | collapse |
| `ArrowLeft` on collapsed child row | parent row 첫 cell로 이동 |
| `Enter` / `F2` | 기존 editing entry 우선 |
| `Space` | Gate 8.5 MVP에서는 tree toggle 단축키로 쓰지 않음 |

Arrow key를 tree expand/collapse에 사용할 때는 editing 중 input/textarea/select가 소유한 key event를 가로채면 안 된다.

## Collapse Cleanup

collapse 대상 row의 descendant가 현재 visible state에서 사라지면 다음 상태를 정리한다.

- active cell이 descendant를 가리키면 collapsing parent row의 같은 column으로 이동한다.
- editing cell이 descendant를 가리키면 기존 blur/deactivation 정책을 재사용해 종료한다.
- selected range가 descendant를 포함하면 collapsing parent row 기준으로 축소한다.
- dirty state는 data row id 기준이므로 collapse와 무관하게 유지한다.

## Filtering And Pagination Policy

Gate 8.5 MVP 권장안:

| 항목 | 권장 정책 | 이유 |
| --- | --- | --- |
| client filtering | descendant match가 있으면 ancestor도 표시 | 검색 결과가 숨겨진 child 때문에 사라지는 혼란 방지 |
| filtered parent expansion | 기존 tree expansion state 유지 | filter 변경이 expansion state를 임의 변경하지 않음 |
| manual filtering | consumer가 이미 tree 결과를 정리한 것으로 간주 | 서버/외부 데이터 정책을 grid가 추측하지 않음 |
| client pagination | expanded visible rows 기준으로 pagination | 현재 rowIds/tableRows contract와 가장 단순하게 맞음 |
| manual pagination | 현재 page data 안에서만 tree 처리 | page 밖 child/parent 관계는 consumer 책임 |

client pagination을 parent 단위로 유지하는 정책은 별도 paginator model이 필요하므로 Gate 8.5 MVP에서는 제외한다.

## Master-detail Compatibility

Gate 8.5 MVP에서는 `enableTreeRows`와 `enableMasterDetail` 동시 사용을 지원하지 않는 것이 권장안이다.

이유:

- 두 기능 모두 first cell toggle affordance를 요구한다.
- `expandedRows`와 `treeExpandedRows`가 동시에 존재하면 collapse cleanup과 virtual item height 계산이 복잡해진다.
- tree child row와 detail row는 navigation/selection 대상 여부가 다르다.

구현 시 둘 다 켜진 경우 development warning을 출력하고 master-detail을 비활성화하거나 tree 기능을 우선 적용하는 정책 중 하나를 선택해야 한다. 권장안은 development warning + master-detail 비활성화다.

## 구현 결과

- GenDataGrid.types.ts에 tree row public API와 context type을 추가했다.
- eatures/tree/treeState.ts에 expansion state normalize/update helper와 descendant row id helper를 추가했다.
- useDataGridTable에서 TanStack getSubRows, getExpandedRowModel, controlled expanded state를 연결했다.
- DataGridBodyRow가 first visible cell에 tree indent/toggle/spacer를 렌더링한다.
- DataGridRoot가 mouse toggle, ArrowLeft/ArrowRight keyboard policy, collapse cleanup을 처리한다.
- DataGridBody와 DataGridVirtualBody 모두 visible flattened tree rows를 렌더링한다.
- Gate85TreeRows Storybook scenario와 interaction tests로 주요 contract를 고정했다.
- collectTreeExpandedRows, collapseTreeExpandedRowsFromDepth helper로 전체/레벨별 tree expansion state 계산 예제를 제공한다.

## 구현 계획

1. Public type 추가
2. tree expansion state helper 추가
3. TanStack table integration
4. row metadata 전달
5. first visible cell tree indent/toggle 렌더링
6. ArrowLeft/ArrowRight keyboard policy 구현
7. collapse cleanup 구현
8. helper/interaction tests 추가
9. `Gate85TreeRows` Storybook 수동 테스트 scenario 추가
10. QA guide, README, plan, implementation log 갱신

## 필요한 의사결정사항

| 결정 | 선택지 | 권장안 | 영향 |
| --- | --- | --- | --- |
| expansion state 이름 | `expandedRows` 재사용 / `treeExpandedRows` 추가 | `treeExpandedRows` 추가 | master-detail과 충돌 방지 |
| child data 입력 | nested `getSubRows` / flat parentId adapter | nested `getSubRows` | TanStack row model과 가장 잘 맞음 |
| tree + master-detail | 동시 지원 / Gate 8.5 제외 | Gate 8.5 제외 | 구현 범위와 toggle 충돌 감소 |
| filtering | parent match only / leaf match bubbles up | leaf match bubbles up | 검색 결과 UX가 자연스러움 |
| pagination | visible expanded rows 기준 / parent row 기준 | visible expanded rows 기준 | 현재 rowIds contract 유지 |
| collapse active cleanup | parent로 이동 / first visible cell / null | parent same column | collapse 위치와 맥락 유지 |
| collapse selection cleanup | 제거 / visible bounds로 clamp / parent로 축소 | parent로 축소 | 숨겨진 child selection 노출 방지 |
| keyboard Space | toggle로 사용 / 사용하지 않음 | 사용하지 않음 | editing/selection 충돌 회피 |
| indent width | 16 / 20 / theme token | 16 기본 | compact grid에 적합 |

## Acceptance Criteria

- tree parent row가 mouse toggle로 expand/collapse된다.
- ArrowLeft/ArrowRight tree keyboard policy가 editing input과 충돌하지 않는다.
- collapsed child row는 active cell, range selection, clipboard, paste 대상이 아니다.
- child row가 active/editing/selected 상태일 때 parent collapse 후 상태가 visible row 기준으로 정리된다.
- filtering과 pagination 조합 정책이 테스트와 문서에 고정된다.
- virtualized body에서 expanded/collapsed tree rows의 scroll offset이 깨지지 않는다.
- `enableTreeRows` 없이 기존 flat grid 테스트가 모두 유지된다.