<!-- packages/gen-datagrid/docs/architecture/gate-8-6-merge-span-validation-architecture.md
GenDataGrid Gate 8.6 merge/span/validation architecture and implementation notes.
-->

# GenDataGrid Gate 8.6 Merge, Span, Validation Architecture

Gate 8.6은 span, merge, validation이 묶여 있는 구간이다. 각 기능은 데이터 모델, 렌더링 모델, 상호작용 규칙이 다르므로 작은 slice로 나누어 진행한다.

| Slice | 이름 | 상태 | 우선순위 |
| --- | --- | --- | --- |
| 8.6-a | Body Column Span | 구현 완료 | 1 |
| 8.6-b | Column Group Header | 구현 완료 | 2 |
| 8.6-c | Validation State/UI Marker | implemented | 3 |
| 8.6-d | Visual Row Merge | architecture/contract complete | 4 |

## 용어 정리

| 용어 | 의미 | 비고 |
| --- | --- | --- |
| Body Column Span | body cell 하나가 오른쪽 visible column 여러 개를 덮어 보이는 기능 | `ColumnMeta.bodyColSpan` |
| Column Group Header | TanStack column group을 여러 header row로 보여주는 기능 | 8.6-b 범위 |
| Header ColSpan | 임의 header cell이 leaf column과 별개로 span 정책을 갖는 기능 | 미래 기능, 8.6-b와 분리 |
| Visual Row Merge | 같은 값이 반복되는 row cell을 병합된 것처럼 보이게 하는 기능 | native `rowSpan` 아님 |
| Validation UI | 외부에서 전달한 validation 상태를 cell에 표시하는 기능 | grid 내장 validator 아님 |

## 현재 판단

- div grid는 native table `rowSpan`/`colSpan`을 직접 사용할 수 없다.
- body span은 CSS grid `grid-column: span n`으로 표현한다.
- Column Group Header는 TanStack header group 모델을 그대로 사용한다.
- Header ColSpan은 Column Group Header와 다른 기능으로 본다. 이름이 섞이면 API가 애매해지므로 deferred 항목으로 분리한다.
- pinned zone을 가로지르는 span은 sticky offset과 충돌하므로 MVP에서는 허용하지 않는다.
- validation은 grid가 값을 검증하는 기능이 아니라 consumer가 전달한 상태를 표시하는 기능으로 시작한다.

## 8.6-a Body Column Span 구현 결과

- `GenDataGridBodyColSpanContext`를 public type으로 추가했다.
- TanStack `ColumnMeta.bodyColSpan`을 추가했다.
- `DataGridBodyRow`에서 visible ordered cells 기준으로 span을 계산한다.
- span 시작 cell은 `data-body-colspan`과 `grid-column: span n`을 가진다.
- span에 덮이는 후속 body cell은 렌더링하지 않는다.
- pinned zone을 넘어가는 span은 span 1로 fallback한다.
- `Gate86BodyColSpan` Storybook과 interaction test를 추가했다.

## 8.6-b Column Group Header 구현 결과

- `DataGridHeader`가 TanStack `headerGroups`의 non-leaf row를 별도 group header row로 렌더링한다.
- group header cell은 `header.colSpan`을 사용해 CSS grid에서 `grid-column: span n`으로 표시된다.
- group header cell에는 `data-header-group-cell`, `data-header-depth`, `data-header-colspan` marker를 부여한다.
- 마지막 leaf header row는 기존 leaf column 기반 렌더링 경로를 유지한다.
- leaf header의 column reorder, resize, filter affordance는 기존처럼 leaf header cell에만 붙는다.
- validation marker? consumer-provided state is rendered as body cell DOM markers and is not applied to system columns.
- group header cell 자체에는 reorder/resize/filter affordance를 붙이지 않는다.
- `Gate86ColumnGroupHeader` Storybook과 interaction test를 추가했다.

## 8.6-b 범위

포함한다.

- nested `ColumnDef.columns` 기반 group header 표시
- group header row와 leaf header row의 다중 row 렌더링
- group header span DOM marker
- leaf header 기능 유지 확인

포함하지 않는다.

- 임의 Header ColSpan API
- group header drag/reorder
- group header resize handle
- group header filter UI
- pinned zone을 가로지르는 group header sticky 분할
- column visibility/reorder 후 group header 정책 확장 테스트

## 8.6-c Validation State/UI Marker Implementation

- `GenDataGridProps.getCellValidation(ctx)` was added as a display-only validation state resolver.
- The grid does not validate values, block editing commits, or reject paste operations in this slice.
- The resolver receives `{ row, rowId, rowIndex, columnId, value }` for user data columns only.
- System columns are excluded from validation resolution and do not receive validation markers.
- Body cells with validation receive `data-validation-state="error"` or `data-validation-state="warning"`.
- Error cells also receive `aria-invalid="true"`.
- `validation.message` is exposed as the cell `title` attribute for the MVP tooltip contract.
- `Gate86ValidationState` Storybook and interaction tests cover error, warning, and system-column exclusion behavior.

## 8.6-b 보강: Column Fit Mode

- `columnFitMode` public prop을 추가했다.
- 기본값은 `none`이며 기존처럼 column size 합계를 그대로 사용한다.
- `grow`는 visible column size 합이 viewport보다 작을 때 남는 폭을 비율대로 배분한다.
- `grow`는 viewport 폭을 측정한 뒤 모든 header/body/footer row가 같은 px grid template을 공유하도록 계산한다.
- viewport가 column 합보다 좁으면 base size 아래로 줄이지 않고 기존 px width와 horizontal scroll을 유지한다. column 합이 viewport보다 클 때도 강제로 축소하는 `grow-and-shrink` 계열 정책은 minSize, resize, pinned offset 정책이 필요하므로 deferred로 둔다.

## 남은 Deferred 항목

| 항목 | 이유 |
| --- | --- |
| Header ColSpan API | Column Group Header와 의미가 다르며 별도 API 설계가 필요하다. |
| grow-and-shrink column fit | column 합이 viewport보다 큰 경우까지 축소하려면 minSize와 pinned offset 정책이 필요하다. |
| pinned group header 분할 | left/center/right sticky zone을 넘는 group header는 offset 계산이 복잡하다. |
| group header reorder UX | group 전체 이동, leaf 이동, 혼합 이동 정책을 먼저 정해야 한다. |
| visual row merge implementation | See `gate-8-6-d-visual-row-merge-architecture.md`; implementation is split into metadata, rendering, virtual continuation, sticky label, and QA slices. |

## Acceptance Criteria

- body col span은 covered body cell을 렌더링하지 않고 span 시작 cell만 표시한다.
- body col span은 pinned zone을 넘지 않는다.
- nested column group을 전달하면 header row가 2줄 이상으로 렌더링된다.
- group header cell은 child leaf column 수만큼 grid span을 가진다.
- leaf header의 resize/reorder/filter 동작은 기존과 동일하게 유지된다.
- Gate 8.6 관련 Storybook과 interaction test가 추가되어 수동/자동 검증이 가능하다.
