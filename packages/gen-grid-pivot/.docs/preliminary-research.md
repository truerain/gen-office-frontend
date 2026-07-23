<!-- packages/gen-grid-pivot/.docs/preliminary-research.md
GenGrid Pivot 패키지 확장을 위한 사전 조사와 범위 판단을 정리합니다.
-->

# GenGrid Pivot 사전 조사

## 목적

고객 요청에 따라 GenGrid 기반 Pivot 기능을 검토한다. 상업용 Pivot Grid의 전체 기능을 복제하는 것은 구현 범위, 유지보수, 검증 비용이 크므로, 기업용 백오피스의 제한된 업무 화면에서 실사용 가능한 Pivot 기능을 우선 정의한다.

이 문서는 `gen-datagrid`가 아니라 `gen-grid`를 기반으로 한 별도 확장 패키지인 `@gen-office/gen-grid-pivot` 방향을 전제로 한다.

## 참조 제품 기준

### AG Grid Pivot

AG Grid의 Pivot은 기존 데이터 그리드에 `rowGroup`, `pivot column`, `value aggregation`을 조합하는 확장 기능에 가깝다.

- `pivotMode`를 켜고, 하나 이상의 row group과 aggregation 컬럼을 구성한다.
- pivot 값 조합에 따라 Pivot Result Column을 생성한다.
- Pivot Totals, Row Totals, Grand Total을 별도 옵션으로 다룬다.
- Server-Side Row Model에서는 실제 pivot 처리를 서버가 수행하고, 클라이언트는 pivot 요청 정보와 결과 컬럼을 주고받는다.
- 생성 컬럼 수가 급격히 증가할 수 있으므로 `pivotMaxGeneratedColumns` 같은 제한 장치를 둔다.
- Tree Data와 Pivot은 함께 지원하지 않는 등 명확한 제약을 둔다.

참조:

- https://www.ag-grid.com/javascript-data-grid/pivoting/
- https://www.ag-grid.com/javascript-data-grid/pivoting-result-columns/
- https://www.ag-grid.com/javascript-data-grid/pivoting-totals/
- https://www.ag-grid.com/javascript-data-grid/server-side-model-pivoting/

### Flexmonster Pivot

Flexmonster는 Pivot 기능이 제품의 중심인 BI/Reporting 컴포넌트에 가깝다.

- Field List에서 rows, columns, measures, report filters를 구성한다.
- compact, classic, flat layout을 지원한다.
- 필터, 정렬, expand/collapse, drill-through, subtotals, grand totals를 제공한다.
- calculated values, number formatting, conditional formatting을 제공한다.
- toolbar 기반 export, report save/open/share, print 기능까지 포함한다.
- built-in pivot charts와 외부 chart library 연동을 제공한다.
- JSON, CSV, DB, MongoDB, Elasticsearch, SSAS, custom data source API 등 다양한 데이터 소스 연결을 제품 범위로 포함한다.

참조:

- https://www.flexmonster.com/doc/
- https://www.flexmonster.com/user-interface/
- https://www.flexmonster.com/technical-specifications/
- https://www.flexmonster.com/doc/flexmonster-pivot-charts/
- https://www.flexmonster.com/doc/calculated-values/

## 비교 판단

| 항목 | AG Grid Pivot | Flexmonster Pivot | GenGrid Pivot 판단 |
| --- | --- | --- | --- |
| 제품 성격 | Grid 확장 기능 | BI/Reporting 컴포넌트 | Grid 확장 패키지로 제한 |
| 구성 모델 | row group, pivot, value | rows, columns, measures, filters | AG Grid식 모델 우선 |
| UI 범위 | Side Bar, Pivot Panel | Field List, Toolbar, Context Menu | 제한된 Pivot Panel |
| 데이터 처리 | 클라이언트 또는 서버 사이드 | 다양한 데이터 소스 직접 연결 | 클라이언트 우선, 서버 계약은 별도 |
| 차트 | Integrated Chart 연동 | 내장 Pivot Chart | `gen-chart` 연동 후보 |
| 보고서 기능 | Grid State 저장/복원 | report save/open/share/export | 상태 저장까지만 우선 |
| 구현 난이도 | 중간 이상 | 높음 | MVP 범위 제한 필요 |

객관적으로 `gen-grid`의 책임은 일반 업무 그리드이며, Flexmonster 수준의 BI 제품 범위를 포함하면 패키지 경계가 불명확해진다. 따라서 `gen-grid-pivot`은 AG Grid처럼 그리드 기반 Pivot 확장으로 정의하는 것이 적절하다.

## 패키지 방향

`gen-grid` 본체에 Pivot 기능을 직접 포함하기보다 `packages/gen-grid-pivot` 별도 패키지로 분리한다.

권장 의존 방향:

```text
@gen-office/gen-grid-pivot -> @gen-office/gen-grid
```

`@gen-office/gen-grid`가 `@gen-office/gen-grid-pivot`에 의존하지 않도록 한다. 이렇게 해야 기존 GenGrid 사용자가 Pivot 관련 번들 크기, API 복잡도, 테스트 범위를 강제로 부담하지 않는다.

## 책임 경계

### `gen-grid`

- 기본 그리드 렌더링
- column/row model
- sorting, filtering, selection, layout
- 기존 TanStack Table 기반 동작
- 확장 패키지가 사용할 수 있는 최소 adapter 또는 입력 표면

### `gen-grid-pivot`

- Pivot 설정 모델
- row axis, column axis, value measure 모델
- aggregation engine
- Pivot Result Column 생성
- totals, subtotals, grand total
- 집계 셀에서 원본 row를 찾기 위한 drill-through mapping
- 제한된 Pivot Panel
- Pivot state 저장/복원 모델

## 1차 MVP 범위

| 기능 | 포함 여부 | 비고 |
| --- | --- | --- |
| 행 그룹 축 | 포함 | 부서, 고객사, 상품군, 담당자 등 |
| 열 피벗 축 | 포함 | 월, 분기, 상태, 지역 등 |
| 값/집계 | 포함 | `sum`, `count`, `avg`, `min`, `max` |
| Pivot 결과 컬럼 생성 | 포함 | column axis 값 조합 기반 |
| 행 합계 | 포함 | row total |
| 열 합계 | 포함 | column total |
| 전체 합계 | 포함 | grand total |
| 정렬 | 포함 | 그룹 라벨 정렬, 값 기준 정렬 |
| 필터 반영 | 포함 | 원본 데이터 필터 후 집계 |
| 상태 저장/복원 | 포함 | 업무 화면 preset 저장용 |
| Drill-through | 1차 또는 P1 | 집계 셀 클릭 시 원본 row 목록 |
| 제한된 Pivot Panel | P1 | 허용 필드만 노출 |
| 서버 사이드 Pivot 계약 | P1 | 대용량 데이터 대응 |
| 숫자 포맷 | P1 | 통화, 수량, 비율, 소수점 |

## 제외 또는 후순위 범위

| 기능 | 판단 근거 |
| --- | --- |
| Excel 수준의 자유 Field List | UI, 상태, 검증 범위가 커진다. |
| 임의 계산식 편집기 | 파서, 타입 검증, 오류 처리, 보안 고려가 필요하다. |
| OLAP, SSAS, MDX 계층 지원 | Flexmonster와 같은 BI 제품 영역에 가깝다. |
| DB, Elasticsearch 등 데이터 소스 직접 연결 | Grid 패키지 책임이 아니다. |
| 보고서 파일 저장, 공유, 전체 Toolbar | Reporting 제품 기능에 가깝다. |
| 내장 Pivot Chart 전체 | `gen-chart` 또는 별도 연동 패키지 후보로 분리한다. |
| 무제한 Pivot 결과 컬럼 | 성능과 사용성 문제가 크므로 제한이 필요하다. |
| compact/classic/flat 전체 layout | Flexmonster식 layout 복제는 초기 범위에 부적합하다. |

## 업무 영역별 적용 예

| 업무 영역 | 행 축 예시 | 열 축 예시 | 값 예시 |
| --- | --- | --- | --- |
| 매출/영업 | 영업조직, 담당자, 고객사, 상품군 | 월, 분기, 지역, 채널 | 매출액, 수량, 마진 |
| 구매/재고 | 창고, 품목군, 공급사 | 월, 재고상태, 입고구분 | 입고량, 출고량, 재고금액 |
| 회계/정산 | 계정과목, 부서, 비용센터 | 월, 법인, 프로젝트 | 금액, 건수, 예산 대비 차이 |
| 인사/운영 | 부서, 직급, 근무지 | 월, 고용형태, 상태 | 인원수, 근무시간, 비용 |
| 고객지원 | 상담유형, 담당팀, 고객등급 | 월, 채널, 처리상태 | 티켓 수, 평균 처리시간, SLA 위반 수 |

## API 초안

초기 API는 사용자가 모든 필드를 자유 구성하는 방식보다, 화면 개발자가 허용 가능한 pivot 필드와 집계 지표를 선언하는 방식이 적합하다.

```ts
type GenGridPivotConfig<TData> = {
  enabled: boolean;
  rows: Array<keyof TData>;
  columns: Array<keyof TData>;
  values: Array<{
    field: keyof TData;
    agg: 'sum' | 'count' | 'avg' | 'min' | 'max';
    label?: string;
  }>;
  totals?: {
    row?: boolean;
    column?: boolean;
    grand?: boolean;
  };
  limits?: {
    maxPivotColumns?: number;
  };
};
```

## 구현상 주요 제약

- Pivot 결과 컬럼 수는 축 값의 조합으로 증가하므로 상한이 필요하다.
- 집계 값과 원본 row 사이의 mapping을 유지해야 drill-through가 가능하다.
- 클라이언트 사이드 pivot은 데이터 크기에 따라 한계가 있으므로 서버 사이드 계약을 별도 단계로 설계해야 한다.
- `gen-grid`의 기존 sorting/filtering/column sizing과 충돌하지 않도록 변환 계층을 분리해야 한다.
- Pivot UI는 전체 BI Field List가 아니라 업무 화면에서 허용한 필드만 보여야 한다.

## 결론

`@gen-office/gen-grid-pivot` 별도 패키지 확장 방향이 적절하다. 목표는 Flexmonster식 BI 제품이 아니라 AG Grid식 업무 그리드 확장형 Pivot이다.

1차 범위는 제한된 row axis, column axis, value aggregation, totals, state 저장/복원, 결과 컬럼 생성으로 잡는다. Drill-through와 Pivot Panel은 P1로 두되, 고객 업무 화면에서 실제 필요성이 확인되면 MVP에 포함할 수 있다.
