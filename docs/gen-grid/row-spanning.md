# GenGrid Body Row Spanning (Row Merge) Proposal

## 1) 목적

- 바디 영역에서 **연속된 동일 값**을 하나의 셀처럼 보이게 병합한다.
- 사용자는 `MUI DataGrid`처럼 "값 기준 병합"을 직관적으로 사용하고,
- 개발자는 `ag-Grid`처럼 "컬럼별 제어"를 할 수 있게 한다.

참고:
- AG Grid Row Spanning: https://www.ag-grid.com/javascript-data-grid/row-spanning/
- MUI Data Grid Row Spanning: https://mui.com/x/react-data-grid/row-spanning/
- MUI GridColDef API (`rowSpanValueGetter`): https://mui.com/x/api/data-grid/grid-col-def/

---

## 2) 제안 API

### 2.1 Grid 전역 옵션

`GenGrid` 전체에서 row merge 기능 사용 여부를 제어한다.

```ts
type CommonGridOptions<TData> = {
  // ...
  rowSpanning?: boolean; // default: false
};
```

### 2.2 Column 메타 옵션

병합 대상 컬럼, 병합 기준값, 비교 규칙을 컬럼 단위로 제어한다.

```ts
type GenGridColumnMeta = {
  // ...
  rowSpan?: boolean | ((args: { row: unknown; rowId: string; columnId: string }) => boolean);
  rowSpanValueGetter?: (args: {
    row: unknown;
    rowId: string;
    columnId: string;
    value: unknown;
  }) => unknown;
  rowSpanComparator?: (
    a: unknown,
    b: unknown,
    args: { columnId: string }
  ) => boolean;
};
```

권장 기본 동작:
- `rowSpanning !== true`면 병합 비활성.
- `meta.rowSpan`이 `true`이거나 함수 결과가 `true`일 때만 해당 컬럼 병합 활성.
- `rowSpanValueGetter` 미지정 시 `cell.getValue()` 기준.
- `rowSpanComparator` 미지정 시 `Object.is(a, b)` 기준.

---

## 3) 사용 예시

```ts
const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: 'customerName',
    header: '고객',
    meta: {
      rowSpan: true,
      rowSpanValueGetter: ({ value }) => String(value ?? '').trim(),
    },
  },
  {
    accessorKey: 'orderDate',
    header: '주문일',
    meta: {
      rowSpan: ({ row }) => (row as OrderRow).status !== 'cancelled',
    },
  },
];

<GenGrid<OrderRow>
  rowSpanning
  columns={columns}
  // ...
/>;
```

---

## 4) 구현 설계

### 4.1 Row Span Model 계산

렌더 대상 rows(정렬/필터/페이지 적용 후) 기준으로 컬럼별 연속 구간(run)을 1-pass 계산한다.

모델 결과:
- `anchorMap`: `(rowId, columnId) -> spanCount`
- `coveredSet`: `(rowId, columnId)` (앵커 아래 가려질 셀)

핵심 로직:
1. 컬럼이 병합 대상인지 판별 (`rowSpanning`, `meta.rowSpan`)
2. 각 row에서 비교 기준값 추출 (`rowSpanValueGetter` 또는 `cellValue`)
3. 이전 row 값과 comparator로 비교
4. 값이 같으면 현재 셀을 covered로 표시, 앵커 span 증가
5. 값이 다르면 새 앵커 시작

### 4.2 Body 렌더 반영 (Visual-only)

- `covered` 셀도 렌더는 유지한다. (DOM 구조는 동일)
- `covered` 셀은 텍스트를 숨기고, 경계선만 시각적으로 제거해 병합처럼 보이게 한다.
- 실제 `<td rowSpan>`은 사용하지 않는다.

적용 위치:
- `packages/gen-grid/src/components/layout/GenGridBody.tsx`
- `packages/gen-grid/src/components/layout/GenGridVirtualBody.tsx`
- `packages/gen-grid/src/components/layout/GenGridCell.tsx`

참고:
- 현재 릴리즈에서는 row merge가 `enableVirtualization !== true`일 때만 활성화된다.
- `GenGridVirtualBody.tsx` 반영 코드는 향후 virtualization 지원 확장 대비 목적이다.

타입 보강:
- `cellProps`는 `React.TdHTMLAttributes<HTMLTableCellElement>`를 사용한다.

---

## 5) 단계별 도입 권장

### Phase 1 (우선)

- 비가상 스크롤(`GenGridBody`) 대상 지원
- 일반 row 기준 지원 (group row/tree row 제외 또는 제한)
- 키보드 내비게이션에서 covered 셀 진입 시 anchor 셀로 리다이렉트

### Phase 2

- 가상 스크롤(`GenGridVirtualBody`) 지원
- 가상 구간 경계에서 `rowSpan` 계산/렌더 정합성 검증

### Phase 3

- tree/grouping과 공존 정책 확정
- 편집 UX(Enter/Tab, 포커스 이동) 고도화

---

## 6) 제약 및 주의사항

- 병합은 **현재 렌더 순서** 기준이다.
- Row merge 사용 시 정렬은 지원하지 않는다. (정렬 UI/동작 비활성 권장)
- 필터가 1개 이상 적용되면 row merge는 임시 해제한다. (필터 해제 시 다시 활성화)
- merge 대상 컬럼이 pinned일 때도 동일 규칙으로 동작해야 한다.
- visual-only 방식이므로 covered 셀 DOM은 유지되며, 포커스/편집은 일반 셀과 동일하게 동작한다.
- virtualization에서는 화면 밖 run과 연결되는 경우를 고려해야 한다.

---

## 7) 테스트 관점

- 값 연속 구간에 대해 rowSpan 계산이 정확한지
- null/undefined/빈문자/숫자 문자열 비교 규칙이 의도와 맞는지
- sorting/filter/pagination 변경 시 계산이 즉시 갱신되는지
- active cell/keyboard/editing이 covered 셀에서 깨지지 않는지
- pinning/row number/selection 컬럼과 충돌이 없는지
