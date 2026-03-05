# gen-chart API Draft

## 문서 목적
- `packages/gen-chart`의 초기 Public API 형태를 합의하기 위한 초안이다.
- 목표는 `TanStack Table`처럼 데이터 모델과 렌더링을 분리한 headless 구조다.
- 본 문서는 구현 확정안이 아니라, MVP 범위와 확장 포인트를 먼저 고정하는 데 집중한다.

## 설계 목표
- Headless 우선: 차트 계산(스케일, 도메인, 시리즈 메타)과 UI(SVG/Canvas/HTML)를 분리
- 타입 안정성: 시리즈와 datum 타입을 제네릭으로 유지
- 점진적 도입: 기본 프리미티브(`CartesianChart`, `LineSeries`, `BarSeries`)부터 시작
- 대시보드 친화: 반응형 크기, 좁은 영역에서의 축/범례 처리 전략 제공

## 용어 규칙
- `column chart`는 별도 타입을 만들지 않고 `bar`에 포함한다.
- 즉, Public API의 시리즈 타입은 `bar`를 사용하고, 문서/화면 표현에서만 column 용어를 허용한다.

## 비목표 (MVP)
- 3D 차트, 지도 차트, Sankey 등 특수 시각화
- 서버 사이드 이미지 export
- 고급 애니메이션 편집기

## 패키지 구성안
- `packages/gen-chart`
- 내부 모듈 (초안):
- `core`: 데이터 정규화, scale/domain 계산, tooltip/hit-test 유틸
- `react`: `useGenChart`, `CartesianChart`, series 컴포넌트
- `themes`: 기본 토큰과 프리셋 테마

## 핵심 타입 초안
```ts
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'composed';

export type Accessor<TDatum, TValue> = (datum: TDatum, index: number) => TValue;

export interface ChartSeriesBase<TDatum> {
  id: string;
  label?: string;
  color?: string;
  data: TDatum[];
  x: Accessor<TDatum, string | number | Date>;
  y: Accessor<TDatum, number | null | undefined>;
  hidden?: boolean;
}

export interface LineSeriesDef<TDatum> extends ChartSeriesBase<TDatum> {
  type: 'line';
  curve?: 'linear' | 'monotoneX' | 'step';
  connectNulls?: boolean;
}

export interface BarSeriesDef<TDatum> extends ChartSeriesBase<TDatum> {
  type: 'bar';
  stackId?: string;
  maxBarWidth?: number;
}

export interface AreaSeriesDef<TDatum> extends ChartSeriesBase<TDatum> {
  type: 'area';
  connectNulls?: boolean;
}

export interface ComposedSeriesDef<TDatum> extends ChartSeriesBase<TDatum> {
  type: 'composed';
  renderAs?: 'line' | 'bar';
  maxBarWidth?: number;
}

export interface PieSeriesDef<TDatum> {
  id: string;
  type: 'pie' | 'donut';
  label?: string;
  data: TDatum[];
  category: Accessor<TDatum, string>;
  value: Accessor<TDatum, number | null | undefined>;
  color?: string;
  innerRadius?: number;
  outerRadius?: number;
  hidden?: boolean;
}

export type ChartSeries<TDatum> =
  | LineSeriesDef<TDatum>
  | BarSeriesDef<TDatum>
  | AreaSeriesDef<TDatum>
  | ComposedSeriesDef<TDatum>
  | PieSeriesDef<TDatum>;

export interface ChartAxisOptions {
  show?: boolean;
  tickCount?: number;
  tickFormat?: (value: unknown) => string;
  min?: number | 'auto' | 'dataMin';
  max?: number | 'auto' | 'dataMax';
}

export interface ChartPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ChartTheme {
  background?: string;
  gridColor?: string;
  textColor?: string;
  axisColor?: string;
  fontFamily?: string;
  palette?: string[];
}

export interface ChartMotionOptions {
  enabled?: boolean;
  durationMs?: number;
  easing?: 'linear' | 'easeOut' | 'easeInOut';
  animateOnMount?: boolean;
}

export interface ChartLegendOptions {
  enabled?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  reserveSpace?: boolean;
}

export interface ChartInteractiveOptions {
  tooltip?: boolean;
  legend?: boolean | ChartLegendOptions;
  crosshair?: boolean;
}

export interface GenChartOptions<TDatum> {
  type?: ChartType;
  series: ChartSeries<TDatum>[];
  xAxis?: ChartAxisOptions;
  yAxis?: ChartAxisOptions;
  padding?: ChartPadding;
  theme?: ChartTheme;
  tokens?: DeepPartial<ChartTokens>;
  motion?: ChartMotionOptions;
  interactive?: ChartInteractiveOptions;
}
```

## Headless 모델 API 초안
```ts
export interface GenChartModel<TDatum> {
  options: GenChartOptions<TDatum>;
  visibleSeries: ChartSeries<TDatum>[];
  xDomain: [unknown, unknown];
  yDomain: [number, number];
  toggleSeries: (seriesId: string) => void;
  setSeriesVisibility: (seriesId: string, visible: boolean) => void;
  getNearestDatum: (xPx: number, yPx: number) => {
    seriesId: string;
    datum: TDatum;
    x: number;
    y: number;
  } | null;
}

export function createGenChartModel<TDatum>(
  options: GenChartOptions<TDatum>
): GenChartModel<TDatum>;
```

## React API 초안
```ts
export interface UseGenChartOptions<TDatum> extends GenChartOptions<TDatum> {
  width: number;
  height: number;
}

export function useGenChart<TDatum>(
  options: UseGenChartOptions<TDatum>
): GenChartModel<TDatum> & {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
};

export interface ResponsiveChartContainerProps {
  children: (size: { width: number; height: number; ready: boolean }) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  minWidth?: number;
  minHeight?: number;
  aspectRatio?: number;
  fallbackWidth?: number;
  fallbackHeight?: number;
}

export function ResponsiveChartContainer(
  props: ResponsiveChartContainerProps
): JSX.Element;
```

```tsx
export interface CartesianChartProps<TDatum> extends UseGenChartOptions<TDatum> {
  children?: React.ReactNode;
}

export function CartesianChart<TDatum>(
  props: CartesianChartProps<TDatum>
): JSX.Element;

export function ChartGrid(): JSX.Element;
export function ChartXAxis(): JSX.Element;
export function ChartYAxis(): JSX.Element;
export function ChartTooltip(): JSX.Element;
export function ChartLegend(): JSX.Element;

export function LineSeries<TDatum>(props: { seriesId: string }): JSX.Element;
export function BarSeries<TDatum>(props: { seriesId: string }): JSX.Element;
export function AreaSeries<TDatum>(props: { seriesId: string }): JSX.Element;
export function ComposedSeries<TDatum>(props: { seriesId: string }): JSX.Element;
export function PieSeries<TDatum>(props: { seriesId: string }): JSX.Element;
export function DonutSeries<TDatum>(props: { seriesId: string }): JSX.Element;
```

## 사용 예시 (MVP)
```tsx
type SalesPoint = { date: string; revenue: number; cost: number };

const data: SalesPoint[] = [
  { date: '2026-01', revenue: 120, cost: 80 },
  { date: '2026-02', revenue: 150, cost: 90 },
];

<CartesianChart<SalesPoint>
  width={720}
  height={320}
  series={[
    {
      id: 'revenue',
      type: 'line',
      label: 'Revenue',
      data,
      x: (d) => d.date,
      y: (d) => d.revenue,
    },
    {
      id: 'cost',
      type: 'bar',
      label: 'Cost',
      data,
      x: (d) => d.date,
      y: (d) => d.cost,
    },
  ]}
  interactive={{ tooltip: true, legend: true }}
>
  <ChartGrid />
  <ChartXAxis />
  <ChartYAxis />
  <BarSeries seriesId="cost" />
  <LineSeries seriesId="revenue" />
  <ChartTooltip />
  <ChartLegend />
</CartesianChart>;
```

```tsx
type ChannelPoint = { channel: string; value: number };

const channelData: ChannelPoint[] = [
  { channel: 'Web', value: 58 },
  { channel: 'Mobile', value: 31 },
  { channel: 'Store', value: 11 },
];

<CartesianChart<ChannelPoint>
  width={360}
  height={360}
  type="donut"
  series={[
    {
      id: 'channel-share',
      type: 'donut',
      data: channelData,
      category: (d) => d.channel,
      value: (d) => d.value,
      innerRadius: 72,
      outerRadius: 120,
    },
  ]}
  interactive={{ tooltip: true, legend: true }}
>
  <DonutSeries seriesId="channel-share" />
  <ChartTooltip />
  <ChartLegend />
</CartesianChart>;
```

## Dashboard 연동 가이드 (초안)
- 카드형 레이아웃에서 `width/height`는 부모가 소유한다.
- `ResponsiveChartContainer`를 제공하여 `ResizeObserver`를 캡슐화한다.
- 좁은 폭에서의 정책:
- X축 tick 자동 간소화
- 범례 overflow는 wrap이 아니라 horizontal scroll 우선

## Legend Layout 정책
- 기본값: `interactive.legend: true`일 때 `position: 'top'`, `align: 'start'`, `reserveSpace: true`
- `reserveSpace: true`면 plot 영역과 legend 영역을 분리해 겹침을 방지한다.
- `position` 지원값: `top | bottom | left | right`

## 에러/경고 정책 초안
- 필수 값 누락 (`series.length === 0`, `width <= 0`, `height <= 0`)은 개발 모드 경고 출력
- `y` accessor가 전부 null인 시리즈는 렌더 제외하고 legend에 비활성 상태로 표기
- 동일 `series.id` 중복 시 첫 항목만 사용하고 경고

## Motion 정책 초안
- 기본값: `enabled: true`, `durationMs: 240`, `easing: 'easeOut'`, `animateOnMount: true`
- `prefers-reduced-motion: reduce` 환경에서는 `enabled: false`로 강제
- 데이터 포인트가 많을 때(예: 단일 시리즈 2000개 초과) 기본적으로 모션 비활성화
- 첫 버전에서는 `line`, `bar`, `pie`, `donut`의 enter/update만 지원하고 exit는 비지원

## Dev Warning Standard
- prefix: 모든 개발 경고는 `[gen-chart]` prefix를 사용한다.
- mode: `development`에서만 출력하고 `production`에서는 출력하지 않는다.
- format: `[gen-chart][WARN_CODE] message`

### Warning Codes
- `GC001_EMPTY_SERIES`
- 조건: `series.length === 0`
- 대응: 최소 1개 이상의 시리즈를 전달한다.

- `GC002_INVALID_WIDTH`
- 조건: `width <= 0`
- 대응: 부모 레이아웃 크기 계산 이후 유효한 width를 전달한다.

- `GC003_INVALID_HEIGHT`
- 조건: `height <= 0`
- 대응: 부모 레이아웃 크기 계산 이후 유효한 height를 전달한다.

- `GC004_DUPLICATE_SERIES_ID`
- 조건: 동일한 `series.id`가 2개 이상 존재
- 대응: `series.id`를 유니크하게 유지한다.
- 동작: 첫 번째 시리즈만 사용하고 나머지는 무시한다.

- `GC005_NO_FINITE_Y`
- 조건: cartesian 시리즈의 `y` 값이 모두 `null | undefined | NaN`
- 대응: 최소 1개 이상의 유효한 수치 `y` 값을 전달한다.
- 동작: 해당 시리즈는 렌더 대상에서 제외될 수 있다.

## 버전 0 범위 제안
1. 차트 타입: `line`, `bar`, `area`, `pie`, `donut`, `composed(line+bar)`
2. 축: 단일 X/Y axis
3. 인터랙션: tooltip, legend toggle
4. 테마: 라이트 기본 1종 + 토큰 override
5. 렌더러: SVG 우선

## 오픈 이슈
1. 시간축(Date) 기본 포맷 정책을 `Intl.DateTimeFormat` 기반으로 고정할지
2. 대용량(10k+) 데이터 downsampling 기본 탑재 여부
3. 추후 `CanvasRenderer`를 동일 API로 병행 지원할지

## Current Implementation Notes
- Implemented:
- package scaffold (`@gen-office/gen-chart`), `types`, `model`, `useGenChart`, `CartesianChart`
- `ResponsiveChartContainer` (ResizeObserver-based responsive sizing wrapper)
- primitives: `ChartGrid`, `ChartXAxis`, `ChartYAxis`, `ChartTooltip`, `ChartLegend`
- series: `LineSeries`, `BarSeries`, `AreaSeries`, `ComposedSeries`, `PieSeries`, `DonutSeries`
- `composed` uses `renderAs: 'line' | 'bar'` to render line/bar in a unified series type.
- Not implemented yet:
- motion runtime behavior (only option type is defined)
