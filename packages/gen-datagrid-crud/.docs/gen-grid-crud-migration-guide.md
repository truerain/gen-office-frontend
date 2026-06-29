<!-- packages/gen-datagrid-crud/.docs/gen-grid-crud-migration-guide.md
Documents migration guidance from GenGridCrud to GenDataGridCrud.
-->

# GenGridCrud To GenDataGridCrud Migration Guide

## 기본 판단

`GenDataGridCrud`는 `GenGridCrud`의 drop-in replacement가 아니다. `GenDataGrid`가 가진 edit/dirty/delete/selection state를 활용하는 얇은 workflow shell이다.

권장 전환 순서:

1. readonly 조회 화면
2. 단순 edit/save 화면
3. created row와 validation이 필요한 CRUD 화면
4. Excel, chart, row spanning 같은 확장 기능 화면

## Import

Before:

```tsx
import { GenGridCrud } from '@gen-office/gen-grid-crud';
```

After:

```tsx
import { GenDataGridCrud } from '@gen-office/gen-datagrid-crud';
```

app entry에는 CSS를 추가한다.

```tsx
import '@gen-office/gen-datagrid-crud/index.css';
```

## Prop Mapping

| GenGridCrud | GenDataGridCrud | 비고 |
| --- | --- | --- |
| `data` | `data` | controlled data 기준 |
| `columns` | `columns` | TanStack `ColumnDef` 사용 |
| `getRowId` | `getRowId` | 동일 |
| `readonly` | `readonly` | 동일 |
| `onCommit` | `onCommit` | payload는 `changeSet` 기준 |
| `actionBar.includeBuiltIns` | `actionBar.includeBuiltIns` | built-in key는 일부만 동일 |
| `actionBar.customActions` | `actionBar.customActions` | `style`, `defaultStyle` 없음 |
| `excelExport` | `onExport` | 실제 file 생성은 app/후속 workflow |
| `gridProps.dataVersion` | `dataVersion` 또는 `gridProps.dataVersion` | wrapper top-level 사용 권장 |
| `gridProps.checkboxSelection` | `gridProps.enableRowSelection` | 이름 변경 |
| `gridProps.enableActiveRowHighlight` | `gridProps.enableCurrentRowHighlight` | 이름 변경 |

## 지원하지 않는 GenGridCrud 전용 항목

현재 Gate 12 기준으로 바로 대응하지 않는다.

- `excelExport` real frontend/backend export
- `actionBar.position`
- `actionBar.widthMode`
- `actionBar.defaultStyle`
- custom action `style`
- `rowSpanning`
- `getCellStyle`
- chart context menu integration

이 기능이 필요한 화면은 전환 전에 `GenDataGrid` 또는 `GenDataGridCrud`의 public API 확장 여부를 먼저 결정한다.

## Save Contract

`GenDataGridCrud`의 save payload는 `changeSet` 중심이다.

```ts
onCommit={async ({ changeSet, state, data }) => {
  // changeSet.created
  // changeSet.updated
  // changeSet.deleted
  return { ok: true };
}}
```

저장 성공 시 wrapper는 marker를 정리하지만 controlled `data`를 직접 교체하지 않는다. app이 refetch하거나 `data`를 갱신해야 한다.

## Export Contract

`onExport`는 file 생성이 아니라 source 전달 shell이다.

```ts
onExport={({ data, sourceData, createdRows, lastChangeSet, state }) => {
  // app 또는 후속 Excel workflow에서 처리
}}
```

`onExport`가 없으면 Excel 버튼은 비활성화된다.

## ActualsPage 적용 결과

`apps/demo/src/pages/co/actuals/ActualsPage.tsx`는 readonly 조회 화면으로 전환했다. chart context menu, row spanning, real Excel export는 대응 API가 없어 후속 범위로 남겼다.
