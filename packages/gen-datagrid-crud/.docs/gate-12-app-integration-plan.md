<!-- packages/gen-datagrid-crud/.docs/gate-12-app-integration-plan.md
Defines the Gate 12 app integration and migration plan for GenDataGridCrud.
-->

# Gate 12. App Integration / Migration Plan

## 목표

Gate 12는 `GenDataGridCrud`를 실제 app 화면에 적용하고, 기존 `GenGridCrud`와의 차이를 migration 기준으로 문서화하는 단계다.

## Scope

Gate 12에 포함한다.

- demo app 화면 1개 이상 `GenDataGridCrud`로 전환
- `GenGridCrud` migration guide 작성
- app-level QA guide 작성
- 전환 중 발견한 기능 gap 문서화

Gate 12에서 제외한다.

- 모든 demo/admin 화면 일괄 전환
- `GenGridCrud` 제거
- chart context menu 재구현
- real Excel file 생성 구현

## Slice 12.1 ActualsPage Readonly Integration

Status: complete.

전환 화면:

- `apps/demo/src/pages/co/actuals/ActualsPage.tsx`

전환 내용:

- `GenGridCrud`를 `GenDataGridCrud`로 교체했다.
- readonly 조회 화면으로 유지했다.
- 기존 filter/export/custom action shell을 `GenDataGridCrud.actionBar` 구조로 옮겼다.
- `dataVersion`, virtualization, row height, pinning, column sizing, current row highlight를 `GenDataGrid` 기준 prop으로 연결했다.
- Excel 버튼은 `onExport` shell로 연결했다.

의도적으로 제외한 기존 기능:

- `RangeChartDialog` / `useRangeChartContextMenu`
- `rowSpanning`
- `getCellStyle`
- `checkboxSelection`
- `excelExport` real frontend export
- `actionBar.position`, `widthMode`, `defaultStyle`, custom action `style`

위 항목은 `GenDataGridCrud` 또는 `GenDataGrid`에 대응 API가 생긴 뒤 후속 전환 대상으로 본다.

## Slice 12.2 Migration Guide

Status: complete.

문서:

- `gen-grid-crud-migration-guide.md`

## Slice 12.3 App QA Guide

Status: complete.

문서:

- `app-integration-qa-guide.md`

## Verification

완료 기준:

- `@gen-office/gen-datagrid-crud` 타입 검사 통과
- `@gen-office/demo` 타입 검사 통과
- 인코딩 검사 통과

권장 명령:

```bash
pnpm --filter @gen-office/gen-datagrid-crud exec tsc --noEmit
pnpm --filter @gen-office/demo exec tsc --noEmit
pnpm check:encoding
```
