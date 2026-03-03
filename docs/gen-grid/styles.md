# GenGrid / GenGridCrud 스타일 가이드

## 목적
- `@gen-office/gen-grid`, `@gen-office/gen-grid-crud`의 현재 스타일 구조를 정리한다.
- 커스터마이징 가능한 지점과 제한사항을 명확히 한다.

## 1) 스타일 구조 개요
- `gen-grid`는 CSS Module + CSS 변수(토큰) 기반이다.
- `gen-grid-crud`는 레이아웃/액션바 중심의 얇은 CSS Module을 사용하고, 버튼 등 컴포넌트 스타일은 `@gen-office/ui`를 따른다.

### 관련 파일
- `packages/gen-grid/src/components/base/GenGridLayout.module.css`
- `packages/gen-grid/src/components/base/GenGridControls.module.css`
- `packages/gen-grid/src/components/layout/GenGridHeader.module.css`
- `packages/gen-grid/src/components/layout/GenGridBody.module.css`
- `packages/gen-grid/src/components/layout/GenGridFooter.module.css`
- `packages/gen-grid/src/components/layout/GenGridPinning.module.css`
- `packages/gen-grid/src/components/pagination/GenGridPagination.module.css`
- `packages/gen-grid-crud/src/GenGridCrud.module.css`
- `packages/gen-grid-crud/src/components/CrudActionBar.module.css`
- 토큰 정의: `packages/theme/src/styles/tokens/components/grid.css`

## 2) 토큰(변수) 기반 스타일
주요 변수는 아래 prefix를 따른다.
- 컨테이너/헤더/셀/핀/스크롤: `--grid-*`
- 컴포넌트 크기(런타임 주입): `--gen-grid-header-height`, `--gen-grid-row-height`

대표 변수:
- 배경/보더: `--grid-bg`, `--grid-border`, `--grid-cell-bg`, `--grid-cell-border`
- 헤더: `--grid-header-bg`, `--grid-header-text`, `--grid-header-border`
- 셀 상태: `--grid-cell-bg-hover`, `--grid-cell-bg-selected`
- 핀 고정: `--grid-cell-bg-pinned`, `--grid-header-bg-pinned`
- 레이어: `--grid-z-header`, `--grid-z-pinned`, `--grid-z-cell-overlay`

권장 커스터마이징:
- 테마 파일에서 변수 override
- 페이지 단위 scope에 CSS 변수 재정의

## 3) GenGrid 스타일 동작
### 컨테이너/레이아웃
- `GenGridLayout.module.css`
- `tableScroll`가 보더/라운드/스크롤바 스타일 책임
- `data-has-footer`일 때 하단 보더/라운드 처리 분기

### 헤더
- `GenGridHeader.module.css`
- sticky header: `data-sticky-header` + `headerRow0/1/2` 오프셋
- 정렬 상태: `sortable`, `sorted`, `sortIcon`
- 필터 행: `columnFilter`, `filterInput`

### 바디
- `GenGridBody.module.css`
- 상태 우선순위:
  1. `:hover`
  2. `activeRow`
  3. `is-selected`
  4. `data-active-cell="true"`(셀 활성)
- 행/셀 관련 class/attribute:
  - row class: `tr`, `activeRow`, `rowDirty`, `groupRow`
  - cell attribute: `data-active-cell`, `data-editing-cell`, `data-pinned`
- 정렬 class: `alignLeft|alignCenter|alignRight`
- tree/group row 전용 스타일 포함

### 푸터 행
- `GenGridFooter.module.css`
- `data-sticky-footer-row`일 때 sticky footer row 지원

### 핀/리사이즈
- `GenGridPinning.module.css`
- pinned 셀 배경/그림자, header/footer pinned 스타일 분리
- 컬럼 리사이저: `resizer`, `resizerActive`

### 페이지네이션
- `GenGridPagination.module.css`
- 버튼/셀렉트/라벨 기본 스타일 정의

## 4) GenGridCrud 스타일 동작
### 루트
- `GenGridCrud.module.css`
- wrapper flex/layout만 담당

### 액션바
- `CrudActionBar.module.css`
- 좌/우 액션 영역, title, total row 텍스트 레이아웃 정의
- 버튼의 실제 색/variant는 `@gen-office/ui` Button variant에 의해 결정

스타일 관련 옵션:
- `actionBar.position`: `top | bottom | both`
- `actionBar.defaultStyle`: `text | icon`

## 5) API로 가능한 스타일 제어
### GenGrid props
- `headerHeight`, `rowHeight`: 높이 제어
- `enableStickyHeader`, `enableStickyFooterRow`
- `enablePinning`, `enableColumnSizing`
- `enableActiveRowHighlight`

### Column meta
- `meta.align`: 셀 텍스트 정렬
- `meta.mono`: 숫자형 모노스페이스 표시
- `meta.format`: number/currency/date/datetime/boolean 표시 포맷

## 6) 현재 제한사항
- 대용량 화면에서 복잡한 조건 함수를 사용하면 렌더 비용이 증가할 수 있다.
- 상태 스타일(`active/editing/selected/dirty/hover`)과 조건부 스타일 간 우선순위를 팀 규칙으로 고정해야 한다.
- 가능한 한 `className` 반환을 우선하고, `style` 객체 생성은 최소화한다.

## 7) 커스터마이징 예시
```css
/* 페이지 스코프에서 그리드 톤 조정 */
.adminPage {
  --grid-header-bg: #f3f4f6;
  --grid-cell-bg-selected: #e8f2ff;
  --grid-border: #d1d5db;
}

/* dirty row를 더 강조 */
.adminPage :global(.rowDirty td) {
  background: #fff7e6;
  border-bottom-color: #f0c36d;
}
```

## 8) 권장 운영
- 색/보더/타이포는 토큰(`--grid-*`) 우선
- 화면별 특수효과는 페이지 스코프 CSS override로 제한
- 행 단위 조건 스타일이 반복되면 `GenGridProps`에 `getRowClassName` 확장을 검토

## 9) 조건부 Row/Cell 스타일링 방안
요구사항:
- Row별/Cell별로 `color`, `background-color`, `border`를 조건에 따라 변경
- 전제: 대용량 화면(초대량 row)에는 적용하지 않는다.

### 현재 코드 기준 가능한 방법
1. `meta.renderCell`로 셀 내부 스타일링
- 셀 내용 wrapper(`span/div`)에 조건부 class/style 적용
- 적용 범위: 텍스트 색상, 내부 배경, 내부 border
- 한계: `td` 자체 배경/보더를 완전히 대체하긴 어려움

2. 기존 상태 class 활용
- row: `activeRow`, `rowDirty`, `groupRow`
- cell attr: `data-active-cell`, `data-editing-cell`, `data-pinned`
- 적용 범위: 공통 상태 스타일
- 한계: 도메인 데이터 조건(예: 금액 < 0, 상태코드=E) 직접 매핑 어려움

3. 페이지 스코프 CSS override
- `.pageScope :global(...)`로 스타일 덮어쓰기
- 적용 범위: 화면 단위 룰
- 한계: 조건이 복잡해지면 유지보수 어려움

### 정식 API (구현됨)
`GenGridProps`에서 아래 훅으로 row/cell 조건 스타일을 직접 주입한다.

```ts
getRowClassName?: (args: { row: TData; rowId: string; rowIndex: number }) => string | undefined;
getRowStyle?: (args: { row: TData; rowId: string; rowIndex: number }) => React.CSSProperties | undefined;
getCellClassName?: (args: {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  value: unknown;
}) => string | undefined;
getCellStyle?: (args: {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  value: unknown;
}) => React.CSSProperties | undefined;
```

적용 위치:
- row: `GenGridBody.tsx`, `GenGridVirtualBody.tsx`의 `<tr>`
- cell: `GenGridCell.tsx`의 `<td>`

효과:
- 조건부 `color/bg/border`를 데이터 기반으로 직접 제어
- Virtual body/일반 body 모두 동일 규칙 적용 가능

### 스타일 우선순위 권장안
충돌 방지를 위해 아래 순서를 권장한다.

1. `Cell Active` (가장 우선)
- 기준: `data-active-cell="true"`
- 이유: 키보드/편집 포커스 가시성 보장

2. `Editing`
- 기준: `data-editing-cell="true"`
- 이유: 편집 중 상태 강조 유지

3. `Custom Cell Style` (`getCellStyle`/`getCellClassName`)
- 이유: 업무 규칙(음수 강조, 오류 셀 등) 반영

4. `Row Active`
- 기준: `activeRow`
- 이유: 현재 행 강조

5. `Row Selected`
- 기준: `is-selected`
- 이유: 선택 상태 표시

6. `Row Dirty`
- 기준: `rowDirty`
- 이유: 변경 상태 표시

7. `Row Hover`
- 기준: `:hover`
- 이유: 마우스 상호작용 피드백

8. `Base`
- 기본 테마 토큰 스타일

권장 규칙:
- `outline`은 Active/Editing 전용으로 유지
- `background`는 Row 상태보다 Cell 상태가 우선
- `border`는 Cell 조건 스타일이 필요할 때만 부분 적용(예: `borderBottom`)

### 예시 (확장안 기준)
```ts
getRowClassName: ({ row }) => (row.useYn === 'N' ? 'row-disabled' : undefined),
getCellStyle: ({ columnId, value }) => {
  if (columnId === 'amount' && typeof value === 'number' && value < 0) {
    return {
      color: '#b42318',
      backgroundColor: '#fef3f2',
      borderBottom: '1px solid #fecdca',
    };
  }
  return undefined;
},
```

```css
.row-disabled td {
  background: #f9fafb;
  color: #98a2b3;
}
```
