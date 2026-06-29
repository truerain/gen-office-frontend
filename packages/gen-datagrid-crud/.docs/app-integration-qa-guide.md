<!-- packages/gen-datagrid-crud/.docs/app-integration-qa-guide.md
Defines app-level QA checks for GenDataGridCrud integrations.
-->

# GenDataGridCrud App Integration QA Guide

## 대상

이 문서는 `GenDataGridCrud`를 app 화면에 연결한 뒤 확인해야 할 QA 항목을 정리한다.

Gate 12 기준 1차 대상:

- `apps/demo/src/pages/co/actuals/ActualsPage.tsx`

## 공통 확인

- 화면이 렌더링된다.
- ActionBar가 한 줄로 유지된다.
- row count가 화면 데이터 수와 맞는다.
- filter toggle 버튼이 grid filter 표시 상태를 바꾼다.
- Excel 버튼은 `onExport`가 있을 때 활성화된다.
- custom action 버튼이 동작한다.
- readonly 화면에서는 add/delete/save/reset이 보이지 않거나 필요 시 비활성 상태다.

## Grid 확인

- row height가 의도한 값으로 유지된다.
- virtualization 화면에서 스크롤이 끊기지 않는다.
- current row highlight가 클릭/키보드 이동 시 갱신된다.
- pinned column이 있으면 horizontal scroll 시 위치가 유지된다.
- column resize가 동작한다.
- app이 제공한 `dataVersion` 변경 시 dirty/delete marker가 초기화된다.

## CRUD 확인

- edit 화면에서는 active editor 상태에서 Save를 눌러도 최신 값이 저장 payload에 포함된다.
- created row는 Save 전까지 `created` 상태로 표시된다.
- validation 실패 시 `onCommit`이 호출되지 않는다.
- 서버 field error는 cell marker로 표시된다.
- 저장 실패 시 created row와 dirty marker가 유지된다.
- 저장 성공 시 marker와 local created row가 정리된다.

## ActualsPage 확인

- Search 버튼으로 재조회가 동작한다.
- Settings 버튼이 dialog를 연다.
- Refresh 버튼이 refetch를 호출한다.
- Fiscal Month, Organization, Account filter 입력이 기존 동작을 유지한다.
- large row set에서 scroll이 동작한다.

## Known Gaps

ActualsPage 전환에서 다음 기능은 아직 제외했다.

- chart context menu
- row spanning
- custom cell style resolver
- real Excel file export
- GenGridCrud action bar icon style 옵션

위 항목은 Gate 12 이후 API 확장 또는 별도 package integration으로 다룬다.

## Verification Commands

```bash
pnpm --filter @gen-office/gen-datagrid-crud exec tsc --noEmit
pnpm --filter @gen-office/demo exec tsc --noEmit
pnpm check:encoding
```
