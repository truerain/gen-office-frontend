<!-- packages/gen-datagrid-crud/.docs/gate-11-crud-mutation-plan.md
Defines the Gate 11 plan for completing GenDataGridCrud mutation workflows.
-->

# Gate 11. CRUD Mutation Completion Plan

## 목표

Gate 11은 Gate 10 thin shell 위에 실제 CRUD mutation workflow를 얹는 단계다. 단, `GenDataGrid`가 이미 소유한 edit/dirty/delete 상태를 복제하지 않고, CRUD 패키지가 필요한 orchestration만 얇게 추가한다.

## 범위

Gate 11에 포함한다.

- created row local store
- add row workflow
- created row save payload 병합
- created row reset/delete 처리
- commit validation orchestration
- field error state와 `getCellValidation` 연결
- commit result 고도화
- export action의 최소 data source 고정

Gate 11에서 제외한다.

- 실제 app migration
- `GenGridCrud` compatibility adapter
- 서버 API client 통합
- 고급 Excel 서식 export

## Slice 11.1 Created Row Store

Status: complete.

구현 내용:

- `GenDataGridCrudProps.createRow`를 추가했다.
- `GenDataGridCrudProps.createdRowPosition`을 추가했다.
- controller가 `createdRows`를 local state로 보관하고 `gridData`를 `data`와 합성한다.
- created row는 row status `created`로 표시한다.
- Save 시 `GenDataGrid`의 updated patch 중 created row에 해당하는 patch를 `changeSet.created`에 흡수하고 `changeSet.updated`에서는 제거한다.
- Reset은 local created rows와 grid dirty marker를 함께 정리한다.
- Delete는 created row를 grid deleted marker로 보내지 않고 local store에서 제거한다.

## Slice 11.2 Commit Validation

Status: complete.

구현 내용:

- `validateCommit(args)` public hook을 추가했다.
- `DataGridCrudValidationResult`와 `DataGridCrudFieldErrors` public type을 추가했다.
- validation 결과가 `false`, `{ valid: false }`, `{ fieldErrors }`, `{ error }`이면 `onCommit` 호출을 차단한다.
- validation 실패 시 `fieldErrors`와 `validationError`를 `DataGridCrudUiState`에 보관한다.
- validation 실패 시 `onValidationError`를 호출한다.
- Save 성공 또는 Reset 시 validation state를 정리한다.

현재 의도:

- `validateCommit`은 commit 전 업무 검증 단계다.
- `onCommitError`는 commit 호출 이후 서버/저장 실패를 다룬다.
- cell marker 연결은 Slice 11.3에서 처리한다.

## Slice 11.3 Field Error Marker

Status: complete.

구현 내용:

- CRUD field error state를 `gridProps.getCellValidation`과 병합한다.
- app이 제공한 기존 `getCellValidation`을 덮어쓰지 않고 compose한다.
- field error key 규칙은 `${rowId}.${columnId}`로 고정한다.
- field error가 있으면 `severity: 'error'`와 message를 반환한다.
- 같은 cell에 field error가 없으면 app이 제공한 기존 validation 결과를 반환한다.
- Save 성공 또는 Reset 시 field errors를 정리한다.

## Slice 11.4 Commit Result Advanced Handling

Status: complete.

구현 내용:

- `{ ok: false, fieldErrors }` 결과를 field error state에 반영한다.
- `{ ok: false, error }` 결과를 `validationError`에 보관한다.
- commit 실패 시 `onCommitError`를 호출한다.
- commit 실패 시 `acceptChanges()`를 호출하지 않는다.
- commit 실패 시 created rows와 dirty marker를 유지한다.
- commit 성공 시에만 `acceptChanges()`, created row clear, field error clear를 수행한다.

cleanup timing:

- validation 실패: `onCommit`을 호출하지 않고 created rows와 dirty marker를 유지한다.
- commit 실패: 서버 field errors를 marker로 표시하고 created rows와 dirty marker를 유지한다.
- commit 성공: marker와 local created rows를 정리한다.

`nextData`는 app-controlled data contract에 맡긴다. `onCommitSuccess({ nextData })`로 전달하지만, wrapper가 `data`를 직접 교체하지는 않는다.

## Slice 11.5 Export Source Shell

Status: complete.

구현 내용:

- `GenDataGridCrudProps.onExport`를 추가했다.
- `DataGridCrudExportArgs<TData>` public type을 추가했다.
- Excel action은 `onExport`가 있을 때만 활성화한다.
- export action은 다음 source를 전달한다.
  - `data`: 현재 grid view data. created rows가 포함된다.
  - `sourceData`: app이 넘긴 원본 controlled data.
  - `createdRows`: 아직 저장되지 않은 local created rows.
  - `lastChangeSet`: 마지막 save 시점 change set.
  - `state`: 현재 CRUD UI state.
- 실제 file 생성은 Gate 12 또는 별도 Excel package로 넘긴다.

## Verification

권장 명령:

```bash
pnpm --filter @gen-office/gen-datagrid-crud exec tsc --noEmit
pnpm --filter @gen-office/gen-datagrid-crud test
pnpm --filter @gen-office/gen-datagrid-crud build
pnpm check:encoding
```
