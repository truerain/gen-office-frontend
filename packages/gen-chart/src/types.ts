import type { ChartTokens, DeepPartial } from "@gen-office/theme";

export type GenChartKind =
  | "line"
  | "bar"
  | "area"
  | "composed"
  | "pie"
  | "donut"
  | "treemap";

export interface ChartTheme {
  background?: string;
  gridColor?: string;
  textColor?: string;
  axisColor?: string;
  fontFamily?: string;
  palette?: string[];
}

export interface ChartPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface GenChartAxisOptions {
  show?: boolean;
  showTicks?: boolean;
  tickCount?: number;
  showAllTicks?: boolean;
  tickFormat?: (value: unknown) => string;
  min?: number | "auto" | "dataMin";
  max?: number | "auto" | "dataMax";
  position?: "default" | "zero" | "top" | "left" | "right";
}

export interface GenChartLegendOptions {
  enabled?: boolean;
  position?: "top" | "bottom";
  align?: "start" | "center" | "end";
}

export interface GenChartGridOptions {
  show?: boolean;
}

export interface GenChartTooltipContext<T = unknown> {
  label: string;
  value: number | null;
  datum: T;
  seriesId?: string;
}

export interface GenChartTooltipOptions<T = unknown> {
  enabled?: boolean;
  labelFormatter?: (ctx: GenChartTooltipContext<T>) => string;
  valueFormatter?: (ctx: GenChartTooltipContext<T>) => string;
}

export interface GenChartMotionOptions {
  enabled?: boolean;
  mode?: "enter" | "reset-on-change" | "none";
  durationMs?: number;
  easing?: "linear" | "easeOut" | "easeInOut";
  changeKey?: string | number;
}

export interface GenChartBaseProps<T = unknown> {
  width: number;
  height: number;
  padding?: ChartPadding;
  theme?: ChartTheme;
  tokens?: DeepPartial<ChartTokens>;
  grid?: boolean | GenChartGridOptions;
  tooltip?: boolean | GenChartTooltipOptions<T>;
  legend?: boolean | GenChartLegendOptions;
  motion?: boolean | GenChartMotionOptions;
}

export interface CartesianSeriesDef<T> {
  id: string;
  type: "line" | "bar" | "area";
  y: (d: T, index: number) => number | null | undefined;
  yAxisId?: string;
  label?: string;
  showValueLabel?: boolean;
  hideZeroValueLabel?: boolean;
  valueLabelFormatter?: (value: number, datum: T, index: number) => string;
  valueLabelOffsetY?: number;
  valueLabelStyle?:
    | {
        color?: string;
        fontSize?: number;
        fontWeight?: number | string;
        opacity?: number;
      }
    | ((
        value: number,
        datum: T,
        index: number,
      ) =>
        | {
            color?: string;
            fontSize?: number;
            fontWeight?: number | string;
            opacity?: number;
          }
        | undefined);
  color?: string | ((value: number, datum: T, index: number) => string);
  strokeColor?: string;
  strokeWidth?: number;
  negativeColor?: string;
  stackId?: string;
  curve?: "linear" | "monotoneX" | "step";
}

export interface CartesianChartProps<T> extends GenChartBaseProps<T> {
  kind: "line" | "bar" | "area" | "composed";
  barOrientation?: "vertical" | "horizontal";
  avoidValueLabelOverlap?: boolean;
  data: T[];
  x: (d: T, index: number) => string | number | Date;
  series: CartesianSeriesDef<T>[];
  xAxis?: GenChartAxisOptions;
  yAxis?: GenChartAxisOptions;
  yAxes?: Record<string, GenChartAxisOptions>;
}

export interface PieDonutChartProps<T> extends GenChartBaseProps<T> {
  kind: "pie" | "donut";
  data: T[];
  category: (d: T, index: number) => string;
  value: (d: T, index: number) => number;
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

export interface TreemapChartProps extends GenChartBaseProps<TreemapNode> {
  kind: "treemap";
  data: TreemapNode;
  value?: (node: TreemapNode) => number;
  label?: (node: TreemapNode) => string;
  color?: (node: TreemapNode, depth: number, index: number) => string;
  tile?: "squarify" | "binary" | "slice" | "dice" | "sliceDice";
  minLabelArea?: number;
  onNodeClick?: (node: TreemapNode) => void;
}

export type GenChartProps<T = unknown> =
  | CartesianChartProps<T>
  | PieDonutChartProps<T>
  | TreemapChartProps;
