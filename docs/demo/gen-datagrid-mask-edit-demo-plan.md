<!-- docs/demo/gen-datagrid-mask-edit-demo-plan.md
Plans the demo app page for verifying GenDataGrid built-in mask edit type integration.
-->

# GenDataGrid Mask Edit Demo Plan

## 목적

`GenDataGrid`의 built-in `editType: 'mask'` 구현 후 demo app에서 실제 입력, commit, 저장값 차이를 확인할 수 있는 화면을 제공한다.

패키지 구현 계획은 `packages/gen-datagrid/docs/plan/masked-edit-type-plan.md`를 기준으로 한다. 이 문서는 demo app 연계 범위만 다룬다.

## 화면 위치

권장 위치:

```text
apps/demo/src/pages/demo/datagrid-edit-types/
  DatagridEditTypesDemoPage.tsx
  DatagridEditTypesDemoPage.module.css
  index.ts
```

메뉴 이름 후보:

- `DataGrid Edit Types`
- `GenDataGrid Edit Types`
- 한국어 메뉴가 필요한 경우 `데이터그리드 편집 유형`

기존 demo 메뉴 등록 방식에 맞춰 `apps/demo/src/app/menu/menuData.ts`와 dynamic registry를 연결한다.

## 화면 구성

첫 화면은 설명용 landing page가 아니라 바로 편집 가능한 grid로 구성한다.

권장 컬럼:

| 컬럼 | editType | 목적 |
| --- | --- | --- |
| Name | `text` | 기본 텍스트 입력 |
| Quantity | `number` | 숫자 입력 |
| Due Date | `date` | 날짜 입력 |
| Status | `select` | option 기반 입력 |
| Memo | `textarea` | multiline 입력 |
| Active | `checkbox` | boolean 입력 |
| Phone | `mask` | `000-0000-0000`, formatted 저장 |
| Business No. | `mask` | `000-00-00000`, unmasked 저장 |
| Zip Code | `mask` | `00000`, formatted 저장 |

화면 하단 또는 우측에는 현재 rows JSON preview를 둔다. 이 preview는 `Phone`과 `Business No.`의 저장값 차이를 확인하기 위한 필수 확인 영역이다.

## 사용자 확인 시나리오

1. `Phone` cell 편집
   - `01012345678` 입력
   - cell 표시와 저장값이 `010-1234-5678`인지 확인
2. `Business No.` cell 편집
   - `1234567890` 입력
   - cell 표시는 `123-45-67890`, JSON 저장값은 `1234567890`인지 확인
3. `Zip Code` cell 편집
   - 숫자 외 문자가 무시되는지 확인
4. Tab 이동
   - mask editor에서 Tab 입력 시 commit 후 다음 editable cell로 이동하는지 확인
5. Enter/Escape
   - Enter commit, Escape cancel 동작이 다른 text editor와 같은지 확인

## 구현 순서

1. `GenDataGrid` 패키지에서 `editType: 'mask'` 구현과 테스트를 먼저 완료한다.
2. demo page scaffold를 추가한다.
3. demo data와 columns를 page 내부에 고정 fixture로 둔다.
4. `onCellValueChange`에서 local rows state를 갱신한다.
5. JSON preview로 현재 rows 값을 출력한다.
6. demo menu와 dynamic registry를 연결한다.
7. demo TypeScript check를 실행한다.

## 검증 명령

```bash
pnpm --filter @gen-office/gen-datagrid exec tsc --noEmit
pnpm --filter @gen-office/gen-datagrid test:interaction
pnpm --filter @gen-office/demo exec tsc --noEmit
pnpm check:encoding
```

## 완료 기준

- demo 메뉴에서 화면에 접근할 수 있다.
- 모든 built-in edit type이 한 화면에서 비교된다.
- mask editor가 formatted 저장과 unmasked 저장을 모두 보여준다.
- `GenDataGrid` 구현 계획 문서와 demo 계획 문서가 서로 링크된다.
- 관련 작업 로그가 한국어로 남는다.
