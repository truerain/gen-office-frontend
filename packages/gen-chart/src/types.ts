import type { ChartTokens, DeepPartial } from '@gen-office/theme';

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
  strokeDasharray?: string;
}

export interface BarSeriesDef<TDatum> extends ChartSeriesBase<TDatum> {
  type: 'bar';
  stackId?: string;
  maxBarWidth?: number;
  layout?: 'grouped' | 'overlay';
  opacity?: number;
}

export interface AreaSeriesDef<TDatum> extends ChartSeriesBase<TDatum> {
  type: 'area';
  connectNulls?: boolean;
}

export interface ComposedSeriesDef<TDatum> extends ChartSeriesBase<TDatum> {
  type: 'composed';
  renderAs?: 'line' | 'bar';
  maxBarWidth?: number;
  layout?: 'grouped' | 'overlay';
  opacity?: number;
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

export type ChartLegendPosition = 'top' | 'bottom' | 'left' | 'right';
export type ChartLegendAlign = 'start' | 'center' | 'end';

export interface ChartLegendOptions {
  enabled?: boolean;
  position?: ChartLegendPosition;
  align?: ChartLegendAlign;
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

export interface GenChartNearestDatum<TDatum> {
  seriesId: string;
  datum: TDatum;
  x: number;
  y: number;
}

export interface GenChartModel<TDatum> {
  options: GenChartOptions<TDatum>;
  visibleSeries: ChartSeries<TDatum>[];
  xDomain: [unknown, unknown];
  yDomain: [number, number];
  toggleSeries: (seriesId: string) => void;
  setSeriesVisibility: (seriesId: string, visible: boolean) => void;
  getNearestDatum: (xPx: number, yPx: number) => GenChartNearestDatum<TDatum> | null;
}

export interface UseGenChartOptions<TDatum> extends GenChartOptions<TDatum> {
  width: number;
  height: number;
}

export type ChartXKind = 'category' | 'number' | 'date';

export interface ChartXMeta {
  kind: ChartXKind;
  categories: string[];
  categoryIndexByKey: Record<string, number>;
  minValue: number;
  maxValue: number;
}

export interface UseGenChartResult<TDatum> extends GenChartModel<TDatum> {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  padding: Required<ChartPadding>;
  xMeta: ChartXMeta;
  xToPx: (value: string | number | Date) => number;
  yToPx: (value: number) => number;
  tokens: ChartTokens;
  legend: {
    enabled: boolean;
    position: ChartLegendPosition;
    align: ChartLegendAlign;
    reserveSpace: boolean;
    bandSize: number;
  };
}
