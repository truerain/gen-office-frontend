<!-- packages/gen-datagrid/docs/plan/masked-edit-type-plan.md
Plans the GenDataGrid built-in mask edit type and its demo integration contract.
-->

# GenDataGrid Masked Edit Type Plan

## 목적

`GenDataGrid`에 built-in `editType: 'mask'`를 추가해 전화번호, 사업자번호, 우편번호처럼 고정 입력 형식이 필요한 업무 필드를 grid 내부 편집 흐름에서 일관되게 처리한다.

이 계획은 `@gen-office/ui`의 `MaskedInput` 구현을 `GenDataGrid` editing contract에 연결하는 범위를 정의한다. 실제 앱 화면 검증 계획은 root 문서 `docs/demo/gen-datagrid-mask-edit-demo-plan.md`에서 관리한다.

## 현재 기준

- `packages/ui/src/composed/MaskedInput`은 경량 mask 엔진과 `onValueChange` API를 제공한다.
- `@gen-office/gen-datagrid`는 이미 `@gen-office/ui`에 의존하므로 패키지 의존 방향은 유효하다.
- `GenDataGrid`의 built-in editor 우선순위는 column `meta.renderEditor`, grid `editorFactory`, built-in default editor 순서다.
- 현재 built-in `editType`은 `text`, `number`, `date`, `select`, `textarea`, `checkbox`다.

## 범위

### Public API

`GenDataGridEditType`에 `mask`를 추가한다.

```ts
export type GenDataGridEditType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'mask';
```

`GenDataGridColumnMeta`와 `GenDataGridEditorContext`에 mask 전용 필드를 추가한다.

```ts
editMask?: string;
editMaskUnmask?: boolean;
editMaskDefinitions?: Record<string, RegExp>;
```

필드 의미:

- `editMask`: `MaskedInput`에 전달할 고정 mask 패턴. 예: `000-0000-0000`
- `editMaskUnmask`: commit 대상 값을 unmasked 값으로 저장할지 결정한다. 기본값은 `false`로 표시값을 저장한다.
- `editMaskDefinitions`: 기본 토큰 외 project-specific 토큰 확장이 필요한 경우 사용한다.

### Built-in Editor

`features/editing/renderEditor.tsx`에서 `ctx.editType === 'mask'` 분기를 추가한다.

정책:

- `ctx.editMask`가 있으면 `MaskedInput`을 렌더링한다.
- `ctx.editMask`가 없으면 개발 경고를 출력하고 text editor로 fallback한다.
- `onValueChange`에서 `editMaskUnmask`에 따라 `ctx.setDraftValue(next.unmaskedValue)` 또는 `ctx.setDraftValue(next.value)`를 호출한다.
- `commit(nextValue?)` 경로는 기존 `draftValue` commit contract를 유지한다.

예상 사용 예:

```ts
{
  accessorKey: 'phone',
  header: 'Phone',
  meta: {
    editable: true,
    editType: 'mask',
    editMask: '000-0000-0000',
    editPlaceholder: '010-1234-5678',
  },
}
```

unmasked 저장 예:

```ts
{
  accessorKey: 'businessNo',
  header: 'Business No.',
  meta: {
    editable: true,
    editType: 'mask',
    editMask: '000-00-00000',
    editMaskUnmask: true,
  },
}
```

## Editing Contract

`mask`는 text 계열 inline editor로 분류한다.

| 항목 | 정책 |
| --- | --- |
| blur ownership | `inline` |
| Arrow | grid navigation 위임 |
| Tab / Shift+Tab | commit 후 다음/이전 editable cell 이동 |
| Enter | commit |
| Escape | cancel |
| openOnEditStart | 별도 popup 없음. input focus만 필요 |

`MaskedInput` 자체 caret 좌우 이동보다 grid navigation 일관성을 우선한다. 이후 mask editor 내부 caret 이동이 더 중요해지면 `editPolicy` 또는 editor keyboard ownership 확장을 별도 slice로 검토한다.

## 구현 순서

1. `GenDataGridEditType`에 `mask` 추가
2. `GenDataGridColumnMeta`에 `editMask`, `editMaskUnmask`, `editMaskDefinitions` 추가
3. `GenDataGridEditorContext`와 `createEditorContext`에 mask 필드 추가
4. `DataGridBodyRow`에서 column meta의 mask 필드를 editor context로 전달
5. `renderEditor.tsx`에 `MaskedInput` built-in 분기 추가
6. keyboard helper test에 `mask` 정책 추가
7. interaction test에 mask 입력과 commit 저장값 검증 추가
8. Storybook baseline에 mask editor 시나리오 추가
9. reference 문서와 implementation log 갱신
10. root demo 계획에 따라 demo page를 연결

## 테스트 계획

자동 테스트:

- `builtinEditorKeyboard.test.ts`
  - `mask`가 Arrow를 grid navigation에 위임하는지 검증
  - `mask`가 Enter commit 대상인지 검증
- `interaction.test.tsx`
  - `editType: 'mask'` 입력 시 표시값에 mask가 적용되는지 검증
  - `editMaskUnmask: false` commit 값이 표시값인지 검증
  - `editMaskUnmask: true` commit 값이 unmasked 값인지 검증
  - Tab commit 후 다음 editable cell로 이동하는지 검증

수동 확인:

- Storybook `gen-datagrid / Gates / Baseline`에 mask editor scenario 추가
- demo app의 `GenDataGrid Edit Types` 화면에서 text, number, date, select, textarea, checkbox, mask editor를 한 화면에서 비교

검증 명령:

```bash
pnpm --filter @gen-office/gen-datagrid exec tsc --noEmit
pnpm --filter @gen-office/gen-datagrid test:interaction
pnpm --filter @gen-office/gen-datagrid build
pnpm --filter @gen-office/demo exec tsc --noEmit
pnpm check:encoding
```

## 문서 갱신 범위

구현 시 다음 문서를 함께 갱신한다.

- `packages/gen-datagrid/docs/reference/cell-edit-api.md`
- `packages/gen-datagrid/docs/reference/editor-implementation-contract.md`
- `packages/gen-datagrid/docs/reference/api-structure.md`
- `packages/gen-datagrid/docs/reference/api-comparison-with-gen-grid.md`
- `packages/gen-datagrid/docs/log/implementation-log.md`

## 완료 기준

- `editType: 'mask'`가 public type과 TanStack column meta augmentation에 반영된다.
- built-in editor로 `MaskedInput`이 렌더링된다.
- formatted 저장과 unmasked 저장이 모두 테스트된다.
- keyboard/blur 정책이 기존 editing contract와 충돌하지 않는다.
- demo에서 사용자가 mask 입력, commit, 저장값 차이를 확인할 수 있다.
- 문서와 로그가 구현 상태를 설명한다.

## 보류 항목

- dynamic mask
- locale 기반 전화번호 mask
- 날짜 mask와 실제 date validation 결합
- paste-to-selection에서 mask별 value parsing
- mask editor 내부 Arrow caret 이동 정책
