# GenGrid Body Row Spanning (Row Merge) Proposal

## 용어 정리: Row Grouping vs Row Spanning

- `row grouping`
  - 데이터를 특정 컬럼 값으로 묶어 트리/그룹 구조로 보여주는 기능
  - 그룹 헤더, 펼침/접힘, 집계(sum/count)와 함께 사용하는 데이터 구조/탐색 UX 중심 기능
- `row spanning`
  - 같은 값을 가진 인접 행의 셀을 세로로 병합해서 보이게 하는 기능
  - 셀 표현(레이아웃) 중심 기능

정리:
- grouping은 "행을 그룹으로 조직"하는 기능
- spanning은 "셀을 세로 병합 표현"하는 기능
- 이름이 비슷하지만 서로 대체 관계가 아니라 독립 기능이다

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
  rowSpanningMode?: 'real' | 'visual'; // default: 'real'
};
```

모드 정책:
- 기본값은 `real`이며, 실제 `<td rowSpan>`를 사용한다.
- `visual`은 실제 `<td rowSpan>`를 사용하지 않고, covered 셀의 border/콘텐츠 처리로 병합처럼 보이게 한다.

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

### 4.2 Body 렌더 반영 (Mode별)

#### real (default)
- anchor 셀에 실제 `rowSpan` 값을 부여한다.
- covered 셀은 DOM 렌더에서 제외한다.
- 결과적으로 실제 테이블 rowspan 동작을 따른다.

#### visual (option)
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
- `real` 모드에서는 covered 셀이 DOM에 없으므로 active cell/키보드 이동 시 anchor 기준 정합성 검토가 필요하다.
- `visual` 모드에서는 covered 셀 DOM이 유지되므로 포커스/편집이 일반 셀과 유사하게 동작한다.
- virtualization에서는 화면 밖 run과 연결되는 경우를 고려해야 한다.

---

## 7) 테스트 관점

- 값 연속 구간에 대해 rowSpan 계산이 정확한지
- null/undefined/빈문자/숫자 문자열 비교 규칙이 의도와 맞는지
- sorting/filter/pagination 변경 시 계산이 즉시 갱신되는지
- active cell/keyboard/editing이 covered 셀에서 깨지지 않는지
- pinning/row number/selection 컬럼과 충돌이 없는지
