# gen-chart visx 전면 개편 계획서

## 1) 목표
- `packages/gen-chart`를 자체 렌더링 구현에서 `visx` 기반으로 전면 교체한다.
- 기존 API/시그니처와의 호환은 유지하지 않는다(명시적 breaking change).
- `line`, `bar`, `area`, `composed`, `pie`, `donut`를 재구현하고 `treemap`을 신규 추가한다.
- demo 사용처(`ChartDemoPage`, `DashboardDemoPage`)를 신규 API로 전환한다.

## 2) 범위와 비범위
- 범위
- `@gen-office/gen-chart` 내부 아키텍처, 타입, 렌더링 전면 재작성
- `visx` 의존성 도입 및 빌드/타입 안정화
- demo 차트 페이지 전환 및 treemap 샘플 추가
- 비범위
- 구버전 API 호환 레이어 제공
- 캔버스 렌더러 병행 제공
- 서버 사이드 이미지 export

## 3) 설계 원칙
- `visx primitives first`: scale/shape/group/tooltip/legend를 visx 조합으로 구성
- `headless + presentational`: 데이터 정규화/스케일 계산 훅과 렌더 컴포넌트 분리
- `typed contract`: 차트별 입력 타입을 분리해 런타임 분기 최소화
- `composable`: 축/격자/툴팁/범례/시리즈를 슬롯 형태로 조합 가능하게 설계
- `token-aware`: `@gen-office/theme`의 토큰 체계를 우선 사용

## 4) 의존성 계획
- 추가 대상(`dependencies`)
- `@visx/scale`
- `@visx/shape`
- `@visx/group`
- `@visx/axis`
- `@visx/grid`
- `@visx/tooltip`
- `@visx/event`
- `@visx/responsive`
- `@visx/hierarchy` (treemap)
- `@visx/text` (label/tooltip text)
- 선택 대상(필요 시)
- `d3-array`, `d3-hierarchy` (visx 내부 의존으로 충분한지 확인 후 직접 사용 여부 결정)

## 5) 목표 Public API(v2 초안)

```ts
export type GenChartKind =
  | 'line'
  | 'bar'
  | 'area'
  | 'composed'
  | 'pie'
  | 'donut'
  | 'treemap';

export interface GenChartBaseProps {
  width: number;
  height: number;
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  theme?: ChartTheme;
  tokens?: DeepPartial<ChartTokens>;
  tooltip?: boolean | GenChartTooltipOptions;
  legend?: boolean | GenChartLegendOptions;
}
```

```ts
export interface CartesianChartProps<T> extends GenChartBaseProps {
  kind: 'line' | 'bar' | 'area' | 'composed';
  data: T[];
  x: (d: T) => string | number | Date;
  series: Array<{
    id: string;
    type: 'line' | 'bar' | 'area';
    y: (d: T) => number | null | undefined;
    label?: string;
    color?: string;
    stackId?: string;
    curve?: 'linear' | 'monotoneX' | 'step';
  }>;
  xAxis?: GenChartAxisOptions;
  yAxis?: GenChartAxisOptions;
}

export interface PieDonutChartProps<T> extends GenChartBaseProps {
  kind: 'pie' | 'donut';
  data: T[];
  category: (d: T) => string;
  value: (d: T) => number;
  innerRadius?: number;
  outerRadius?: number;
  color?: (d: T, index: number) => string;
}

export interface TreemapNode {
  id: string;
  name: string;
  value?: number;
  children?: TreemapNode[];
}

export interface TreemapChartProps extends GenChartBaseProps {
  kind: 'treemap';
  data: TreemapNode;
  value?: (node: TreemapNode) => number;
  label?: (node: TreemapNode) => string;
  color?: (node: TreemapNode, depth: number, index: number) => string;
  tile?: 'squarify' | 'binary' | 'slice' | 'dice' | 'sliceDice';
  minLabelArea?: number;
}

export type GenChartProps<T> =
  | CartesianChartProps<T>
  | PieDonutChartProps<T>
  | TreemapChartProps;

export function GenChart<T>(props: GenChartProps<T>): JSX.Element;
```

- `ResponsiveChartContainer`는 유지하되, render-prop 기반으로 `GenChart` 사용을 기본 가이드로 변경한다.
- 기존 `CartesianChart + ChartGrid + LineSeries` 조합형 API는 제거한다.

## 6) 내부 구조 개편안
- `src/core/`
- `normalize.ts`: 입력 데이터 정규화, 시리즈 가시성/검증
- `scales.ts`: x/y/color scale 계산(visx scale 래핑)
- `interaction.ts`: nearest point, hover state, tooltip model
- `src/renderers/`
- `CartesianRenderer.tsx`
- `PieDonutRenderer.tsx`
- `TreemapRenderer.tsx`
- `src/hooks/`
- `useChartModel.ts`
- `useChartTooltip.ts`
- `src/components/`
- `GenChart.tsx`
- `ResponsiveChartContainer.tsx`
- `ChartLegend.tsx`
- `src/types/`
- `chart.ts`, `treemap.ts`, `tokens.ts`

## 7) Treemap 구현 기준
- 계층 데이터 입력(`TreemapNode`)을 루트 단일 노드로 받는다.
- 내부에서 `@visx/hierarchy` Treemap로 layout 계산.
- leaf 우선 렌더링 + depth 기반 색상.
- 라벨은 `minLabelArea` 이하 셀에서 생략.
- tooltip 기본값: `name`, `value`, `depth`, `path`.
- 상호작용: hover 하이라이트, optional click callback(`onNodeClick`).

## 8) demo 전환 계획
- 전환 대상
- `apps/demo/src/pages/demo/chart/ChartDemoPage.tsx`
- `apps/demo/src/pages/demo/dashboard/DashboardDemoPage.tsx`
- 작업 항목
- 기존 조합형 시그니처 제거 후 `GenChart` 단일 엔트리 사용
- `ChartDemoPage`에 `Treemap` 카드 신규 추가
- `DashboardDemoPage`의 2개 차트를 `line`, `bar` 신규 시그니처로 교체
- UI/레이아웃은 기존 스타일 클래스 최대한 재사용

## 9) 단계별 실행 일정(제안)
- Phase 0. 설계 고정 (0.5일)
- v2 타입/시그니처 확정, breaking scope 확정
- Phase 1. 의존성/골격 구축 (0.5일)
- visx 패키지 추가, 폴더 재구성, 빌드 통과
- Phase 2. 차트 코어 구현 (2일)
- cartesian/pie/donut renderer + tooltip/legend + token 연동
- Phase 3. treemap 구현 (1일)
- hierarchy layout + label/tooltip + interaction
- Phase 4. demo 전환 (1일)
- chart/dashboard 페이지 마이그레이션 + treemap 샘플
- Phase 5. 검증/문서화 (1일)
- 타입체크, 린트, 시각 회귀 점검, README/API 문서 갱신

## 10) 검증 계획
- 정적 검증
- `pnpm --filter @gen-office/gen-chart exec tsc --noEmit`
- `pnpm --filter @gen-office/demo exec tsc --noEmit`
- 품질 검증
- chart/demo page 수동 시각 검증(축, 범례, tooltip, 반응형)
- 대용량 샘플(1k+ points)에서 렌더 성능/interaction 확인
- 회귀 체크
- 기존 demo chart 기능 parity 확인(라인/바/에어리어/파이/도넛)
- treemap 신규 시나리오(단일 depth, 다중 depth, 빈 children)

## 11) 리스크와 대응
- 리스크: `visx` 조합 복잡도 증가
- 대응: renderer별 책임 분리, 공통 모델 훅 단일화
- 리스크: 대량 데이터에서 tooltip hit-test 비용 증가
- 대응: `useMemo` + 좌표 캐시, 필요 시 sampling 옵션 추가
- 리스크: demo 마이그레이션 중 타입 에러 누적
- 대응: `GenChart` 우선 도입 후 페이지별 순차 전환

## 12) 완료 기준(DoD)
- `gen-chart`가 visx 기반으로 동작하고 구 구현 코드 경로가 제거된다.
- 신규 `GenChart` 시그니처로 demo 차트 페이지가 모두 동작한다.
- treemap이 demo에서 렌더/tooltip/label 동작을 충족한다.
- package 및 demo 타입체크 통과.
- 개편 API 문서가 `docs/gen-chart`에 반영된다.
