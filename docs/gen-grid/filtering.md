# GenGrid Filtering

관련 문서
- `docs/gen-grid/context-menu-clipboard.md`
- `docs/gen-grid/layout-contract.md`

## 범위
이 문서는 현재 `gen-grid` / `gen-grid-crud`에 실제로 구현되어 있는 필터링 동작을 정리한다.

## 구현된 필터 모델

### 1) 필터 값 구조
`gen-grid`는 연산자 기반 필터 값을 사용한다.

```ts
export type GenGridFilterOperator = '=' | '<>' | '<=' | '<' | '>=' | '>' | 'like';
export type GenGridFilterJoin = 'and' | 'or';

export type GenGridFilterCondition = {
  op: GenGridFilterOperator;
  value: string;
};

export type GenGridFilterValue = {
  join?: GenGridFilterJoin;
  conditions?: [GenGridFilterCondition, GenGridFilterCondition?];
};
```

하위 호환
- 기존 `string` 필터 값은 단일 `like` 조건으로 정규화된다.
- 기존 `{ op, value }` 형태도 단일 조건으로 정규화된다.

구현 파일
- `packages/gen-grid/src/features/filtering/filterModel.ts`

### 2) 필터 평가 로직
`useGenGridTable`에서 `genGridOperatorFilterFn`을 기본 컬럼 필터 함수로 연결한다.

연산자 동작
1. `like`: 대소문자 무시 부분 문자열 포함
2. `=` / `<>`: 문자열 동등 / 비동등
3. `<`, `<=`, `>`, `>=`: 숫자 비교 우선 -> 날짜 비교 -> 문자열 비교

조건 결합
- 활성 조건이 1개면 조건 1만 적용
- 활성 조건이 2개면 `AND`/`OR`로 결합
- 조건 값이 비어 있으면 필터 미적용

구현 파일
- `packages/gen-grid/src/core/table/useGenGridTable.ts`
- `packages/gen-grid/src/features/filtering/filterModel.ts`

## UI 구현

### 1) 헤더 필터 행
필터 행은 `GenGridHeader`에서 아래 조건으로 렌더링된다.
- `enableFiltering`이 true
- `renderFilterCell`이 제공됨

필터 셀 표시 조건
- `header.column.getCanFilter() === true`
- `accessorKey` 또는 `accessorFn`이 있음
- 선택 컬럼(`__select__`)이 아님

구현 파일
- `packages/gen-grid/src/components/layout/GenGridHeader.tsx`

### 2) FilterCellPopover 컴포넌트
`FilterCellPopover`가 필터 UI/상태를 담당한다.
- 필터 셀 트리거 버튼
- 2조건 입력 popover
- `Apply` / `Clear`
- 외부 클릭 닫기
- `Esc` 닫기

트리거 라벨
- 비활성: 아이콘 + `Filter`
- 활성: 적용된 조건 요약 문자열
  - 예: `like kim`, `>= 100 AND < 200`

접근성
- 트리거: `aria-haspopup="dialog"`, `aria-expanded`
- 트리거 `aria-label`
  - 비활성: `Filter`
  - 활성: `Filter: {요약문자열}`

구현 파일
- `packages/gen-grid/src/features/filtering/FilterCellPopover.tsx`
- `packages/gen-grid/src/components/layout/GenGridHeader.module.css`

### 3) Popover 위치 정책
현재 위치 정책은 아래와 같다.
- 기본 앵커: 셀 왼쪽(x) 기준
- 렌더링 모드: `position: fixed`
- 가려짐 처리: 필요한 경우에만 viewport 범위 내로 clamp 보정
  - 가로/세로 모두 viewport padding 기준 보정

즉, 공간이 충분하면 기본 왼쪽 정렬을 유지하고, 잘릴 때만 위치를 보정한다.

구현 파일
- `packages/gen-grid/src/features/filtering/FilterCellPopover.tsx`

## GenGridCrud 연동

ActionBar `filter` 버튼 동작
- `enableFiltering` 토글
- 클릭 시 기존 컬럼 필터 전체 초기화(`setColumnFilters([])`)

`GenGridCrud`는 제어형 필터 상태를 `GenGrid`로 전달한다.
- `columnFilters`
- `onColumnFiltersChange`

구현 파일
- `packages/gen-grid-crud/src/GenGridCrud.tsx`
- `packages/gen-grid-crud/src/components/CrudActionBar.tsx`

## 구현 파일 맵
- 필터 모델 / 정규화 / 평가
  - `packages/gen-grid/src/features/filtering/filterModel.ts`
- 헤더/필터 UI
  - `packages/gen-grid/src/components/layout/GenGridHeader.tsx`
  - `packages/gen-grid/src/features/filtering/FilterCellPopover.tsx`
  - `packages/gen-grid/src/components/layout/GenGridHeader.module.css`
- 테이블 연결
  - `packages/gen-grid/src/core/table/useGenGridTable.ts`
- CRUD 연동
  - `packages/gen-grid-crud/src/GenGridCrud.tsx`
  - `packages/gen-grid-crud/src/components/CrudActionBar.tsx`

## 검증 체크리스트
- [ ] 각 필터 셀에서 popover 열기/닫기가 정상 동작한다
- [ ] 1조건, 2조건(AND/OR) 필터 결과가 기대와 일치한다
- [ ] 트리거 요약 문자열이 적용된 조건을 반영한다
- [ ] 트리거 aria-label이 비활성/활성 상태를 반영한다
- [ ] viewport 경계 근처에서도 popover가 가려지지 않는다
- [ ] ActionBar filter 토글 시 기존 컬럼 필터가 초기화된다
- [ ] 기존 `string` / `{ op, value }` 필터 입력과 호환된다