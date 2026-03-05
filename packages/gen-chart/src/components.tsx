import { useChartContext } from './ChartContext';
import { getSeriesDisplayName, isPieSeries } from './model';
import { ChartSeries } from './types';

function pickSeriesColor(palette: string[], index: number, fallback?: string) {
  if (fallback) return fallback;
  if (palette.length === 0) return '#2563eb';
  return palette[index % palette.length];
}

function useCartesianFrame<TDatum>() {
  const { chart } = useChartContext<TDatum>();
  const { padding, innerWidth, innerHeight } = chart;
  return {
    chart,
    left: padding.left,
    top: padding.top,
    right: padding.left + innerWidth,
    bottom: padding.top + innerHeight,
  };
}

function buildYTickValues(
  minY: number,
  maxY: number,
  intervals: number
) {
  const count = Math.max(2, intervals);
  const step = (maxY - minY) / count;
  const values = Array.from({ length: count + 1 }, (_, index) => maxY - step * index);
  return values.map((value) => Number(value.toFixed(8)));
}

export function ChartGrid() {
  const { chart, left, right } = useCartesianFrame<unknown>();
  const lines = Math.max(2, chart.options.yAxis?.tickCount ?? 5);
  const [minY, maxY] = chart.yDomain;
  const tickValues = buildYTickValues(minY, maxY, lines);
  const stroke = chart.tokens.color.grid;

  return (
    <g>
      {tickValues.map((value, index) => {
        const y = chart.yToPx(value);
        return (
          <line
            key={index}
            x1={left}
            y1={y}
            x2={right}
            y2={y}
            stroke={stroke}
            strokeWidth={chart.tokens.border.gridWidth}
          />
        );
      })}
    </g>
  );
}

export function ChartXAxis() {
  const { chart, left, right, bottom } = useCartesianFrame<unknown>();
  const axisColor = chart.tokens.color.axis;
  const textColor = chart.tokens.color.textMuted;
  const fontFamily = chart.tokens.typography.fontFamily;
  const baseTickCount = Math.max(2, chart.options.xAxis?.tickCount ?? 5);
  const tickCount = Math.max(2, baseTickCount * 2);

  let ticks: Array<string | number | Date> = [];
  if (chart.xMeta.kind === 'category') {
    const source = chart.xMeta.categories;
    if (chart.options.xAxis?.showAllTicks) {
      ticks = [...source];
    } else {
      const step = Math.max(1, Math.ceil(source.length / tickCount));
      const sampled = source.filter((_, idx) => idx % step === 0);
      const last = source[source.length - 1];
      ticks = last && sampled[sampled.length - 1] !== last ? [...sampled, last] : sampled;
    }
  } else {
    const min = chart.xMeta.minValue;
    const max = chart.xMeta.maxValue;
    const step = (max - min) / (tickCount - 1 || 1);
    ticks = Array.from({ length: tickCount }, (_, i) => {
      const value = min + i * step;
      return chart.xMeta.kind === 'date' ? new Date(value) : value;
    });
  }

  const format = chart.options.xAxis?.tickFormat ?? ((value: unknown) => String(value));

  return (
    <g>
      <line x1={left} y1={bottom} x2={right} y2={bottom} stroke={axisColor} strokeWidth={chart.tokens.border.axisWidth} />
      {ticks.map((tick, index) => {
        const x = chart.xToPx(tick);
        return (
          <g key={index}>
            <line x1={x} y1={bottom} x2={x} y2={bottom + chart.tokens.spacing.axisTickGap} stroke={axisColor} />
            <text
              x={x}
              y={bottom + chart.tokens.spacing.axisTickGap + 12}
              textAnchor="middle"
              fill={textColor}
              fontFamily={fontFamily}
              fontSize={chart.tokens.typography.axisTickFontSize}
            >
              {format(tick)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function ChartYAxis() {
  const { chart, left, top, bottom } = useCartesianFrame<unknown>();
  const axisColor = chart.tokens.color.axis;
  const textColor = chart.tokens.color.textMuted;
  const fontFamily = chart.tokens.typography.fontFamily;
  const ticks = Math.max(2, chart.options.yAxis?.tickCount ?? 5);
  const [minY, maxY] = chart.yDomain;
  const format = chart.options.yAxis?.tickFormat ?? ((value: unknown) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return new Intl.NumberFormat('ko-KR').format(value);
    }
    return String(value);
  });
  const tickValues = buildYTickValues(minY, maxY, ticks);

  return (
    <g>
      <line x1={left} y1={top} x2={left} y2={bottom} stroke={axisColor} strokeWidth={chart.tokens.border.axisWidth} />
      {tickValues.map((value) => {
        const y = chart.yToPx(value);
        return (
          <g key={value}>
            <line x1={left - chart.tokens.spacing.axisTickGap} y1={y} x2={left} y2={y} stroke={axisColor} />
            <text
              x={left - chart.tokens.spacing.axisTickGap - 4}
              y={y + 3}
              textAnchor="end"
              fill={textColor}
              fontFamily={fontFamily}
              fontSize={chart.tokens.typography.axisTickFontSize}
            >
              {format(value)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function getCartesianSeriesById<TDatum>(seriesId: string, series: ChartSeries<TDatum>[]) {
  const target = series.find((item) => item.id === seriesId);
  if (!target) return null;
  if (target.type === 'pie' || target.type === 'donut') return null;
  return target;
}

function shouldRenderValueLabel<TDatum>(
  series: { showValueLabel?: boolean; valueLabelPredicate?: (value: number, datum: TDatum, index: number) => boolean },
  value: number,
  datum: TDatum,
  index: number
) {
  if (series.showValueLabel !== true) return false;
  if (!series.valueLabelPredicate) return true;
  return series.valueLabelPredicate(value, datum, index);
}

function formatValueLabel<TDatum>(
  series: { valueLabelFormatter?: (value: number, datum: TDatum, index: number) => string },
  value: number,
  datum: TDatum,
  index: number
) {
  const formatter = series.valueLabelFormatter ?? ((v: number) => new Intl.NumberFormat('ko-KR').format(v));
  return formatter(value, datum, index);
}

interface PlotPoint {
  x: number;
  y: number;
}

function splitPointSegments(points: Array<PlotPoint | null>, connectNulls: boolean) {
  if (connectNulls) {
    const merged = points.filter((point): point is PlotPoint => point !== null);
    return merged.length >= 2 ? [merged] : [];
  }

  const segments: PlotPoint[][] = [];
  let current: PlotPoint[] = [];
  for (const point of points) {
    if (point === null) {
      if (current.length >= 2) segments.push(current);
      current = [];
      continue;
    }
    current.push(point);
  }
  if (current.length >= 2) segments.push(current);
  return segments;
}

function buildLinearPath(points: PlotPoint[]) {
  if (points.length === 0) return '';
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function buildStepPath(points: PlotPoint[]) {
  if (points.length === 0) return '';
  const commands = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length; i += 1) {
    const curr = points[i];
    commands.push(`H ${curr.x}`, `V ${curr.y}`);
  }
  return commands.join(' ');
}

function buildMonotoneXPath(points: PlotPoint[]) {
  if (points.length === 0) return '';
  if (points.length < 3) return buildLinearPath(points);

  const n = points.length;
  const d = new Array<number>(n - 1);
  const m = new Array<number>(n);

  for (let i = 0; i < n - 1; i += 1) {
    const dx = points[i + 1].x - points[i].x;
    if (dx <= 0) return buildLinearPath(points);
    d[i] = (points[i + 1].y - points[i].y) / dx;
  }

  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    m[i] = (d[i - 1] + d[i]) / 2;
  }

  for (let i = 0; i < n - 1; i += 1) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      const t = 3 / h;
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }

  const path = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = p1.x - p0.x;
    path.push(
      `C ${p0.x + dx / 3} ${p0.y + (m[i] * dx) / 3} ${p1.x - dx / 3} ${p1.y - (m[i + 1] * dx) / 3} ${p1.x} ${p1.y}`
    );
  }
  return path.join(' ');
}

function buildCurvePath(points: PlotPoint[], curve: 'linear' | 'monotoneX' | 'step') {
  if (curve === 'step') return buildStepPath(points);
  if (curve === 'monotoneX') return buildMonotoneXPath(points);
  return buildLinearPath(points);
}

export function LineSeries<TDatum>({ seriesId }: { seriesId: string }) {
  const { chart } = useChartContext<TDatum>();
  const series = getCartesianSeriesById(seriesId, chart.visibleSeries);
  if (!series) return null;
  if (series.type === 'composed' && (series.renderAs ?? 'line') !== 'line') return null;
  if (series.type !== 'line' && series.type !== 'composed') return null;

  const colorIndex = chart.visibleSeries.findIndex((item) => item.id === series.id);
  const stroke = pickSeriesColor(chart.tokens.color.seriesPalette, colorIndex, series.color);
  const strokeDasharray = series.type === 'line' ? series.strokeDasharray : undefined;
  const pointStream: Array<PlotPoint | null> = [];
  const labels: Array<{ x: number; y: number; text: string }> = [];
  const fontFamily = chart.tokens.typography.fontFamily;

  for (let i = 0; i < series.data.length; i += 1) {
    const datum = series.data[i];
    const yValue = series.y(datum, i);
    if (typeof yValue !== 'number' || !Number.isFinite(yValue)) {
      pointStream.push(null);
      continue;
    }
    const x = chart.xToPx(series.x(datum, i));
    const y = chart.yToPx(yValue);
    pointStream.push({ x, y });
    if (shouldRenderValueLabel(series, yValue, datum, i)) {
      labels.push({
        x,
        y: y - 4,
        text: formatValueLabel(series, yValue, datum, i),
      });
    }
  }

  const connectNulls = series.type === 'line' ? (series.connectNulls ?? false) : false;
  const segments = splitPointSegments(pointStream, connectNulls);
  if (segments.length === 0) return null;
  const curve = series.type === 'line' ? (series.curve ?? 'linear') : 'linear';

  return (
    <g>
      {segments.map((segment, index) => (
        <path
          key={index}
          d={buildCurvePath(segment, curve)}
          fill="none"
          stroke={stroke}
          strokeWidth={chart.tokens.border.seriesStrokeWidth}
          strokeDasharray={strokeDasharray}
        />
      ))}
      {labels.map((label, index) => (
        <text
          key={index}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          fill={series.valueLabelColor ?? chart.tokens.color.textPrimary}
          fontFamily={fontFamily}
          fontSize={chart.tokens.typography.axisTickFontSize}
        >
          {label.text}
        </text>
      ))}
    </g>
  );
}

export function AreaSeries<TDatum>({ seriesId }: { seriesId: string }) {
  const { chart } = useChartContext<TDatum>();
  const series = getCartesianSeriesById(seriesId, chart.visibleSeries);
  if (!series || series.type !== 'area') return null;

  const colorIndex = chart.visibleSeries.findIndex((item) => item.id === series.id);
  const fill = pickSeriesColor(chart.tokens.color.seriesPalette, colorIndex, series.color);
  const pointStream: Array<PlotPoint | null> = [];
  const labels: Array<{ x: number; y: number; text: string }> = [];
  const fontFamily = chart.tokens.typography.fontFamily;

  for (let i = 0; i < series.data.length; i += 1) {
    const datum = series.data[i];
    const yValue = series.y(datum, i);
    if (typeof yValue !== 'number' || !Number.isFinite(yValue)) {
      pointStream.push(null);
      continue;
    }
    const x = chart.xToPx(series.x(datum, i));
    const y = chart.yToPx(yValue);
    pointStream.push({ x, y });
    if (shouldRenderValueLabel(series, yValue, datum, i)) {
      labels.push({
        x,
        y: y - 4,
        text: formatValueLabel(series, yValue, datum, i),
      });
    }
  }

  const connectNulls = series.connectNulls ?? false;
  const segments = splitPointSegments(pointStream, connectNulls);
  if (segments.length === 0) return null;
  const baselineY = chart.yToPx(Math.max(0, chart.yDomain[0]));

  return (
    <g>
      {segments.map((segment, index) => {
        const areaPath = [
          `M ${segment[0].x} ${baselineY}`,
          ...segment.map((point) => `L ${point.x} ${point.y}`),
          `L ${segment[segment.length - 1].x} ${baselineY}`,
          'Z',
        ].join(' ');
        return (
          <g key={index}>
            <path d={areaPath} fill={fill} opacity={0.24} />
            <path d={buildLinearPath(segment)} fill="none" stroke={fill} strokeWidth={chart.tokens.border.seriesStrokeWidth} />
          </g>
        );
      })}
      {labels.map((label, index) => (
        <text
          key={index}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          fill={series.valueLabelColor ?? chart.tokens.color.textPrimary}
          fontFamily={fontFamily}
          fontSize={chart.tokens.typography.axisTickFontSize}
        >
          {label.text}
        </text>
      ))}
    </g>
  );
}

export function BarSeries<TDatum>({ seriesId }: { seriesId: string }) {
  const { chart } = useChartContext<TDatum>();
  const series = getCartesianSeriesById(seriesId, chart.visibleSeries);
  if (!series) return null;
  if (series.type === 'composed' && (series.renderAs ?? 'line') !== 'bar') return null;
  if (series.type !== 'bar' && series.type !== 'composed') return null;

  const isOverlay = series.layout === 'overlay';

  const visibleBars = chart.visibleSeries.filter(
    (item): item is typeof series =>
      (item.type === 'bar' || (item.type === 'composed' && (item.renderAs ?? 'line') === 'bar')) &&
      item.layout !== 'overlay'
  );
  const barSeriesIndex = isOverlay ? 0 : Math.max(0, visibleBars.findIndex((item) => item.id === series.id));
  const barSeriesCount = isOverlay ? 1 : Math.max(1, visibleBars.length);
  const groupWidth = chart.xMeta.kind === 'category'
    ? chart.innerWidth / Math.max(1, chart.xMeta.categories.length)
    : 24;
  const maxBarWidth = 'maxBarWidth' in series ? series.maxBarWidth : undefined;
  const itemWidth = Math.min(maxBarWidth ?? 32, Math.max(2, (groupWidth * 0.8) / barSeriesCount));

  const colorIndex = chart.visibleSeries.findIndex((item) => item.id === series.id);
  const fill = pickSeriesColor(chart.tokens.color.seriesPalette, colorIndex, series.color);
  const fontFamily = chart.tokens.typography.fontFamily;

  return (
    <g>
      {series.data.map((datum, index) => {
        const yValue = series.y(datum, index);
        if (typeof yValue !== 'number' || !Number.isFinite(yValue)) return null;
        const xCenter = chart.xToPx(series.x(datum, index));
        const xStart = isOverlay
          ? xCenter - itemWidth / 2
          : xCenter - (itemWidth * barSeriesCount) / 2 + itemWidth * barSeriesIndex;
        const y = chart.yToPx(yValue);
        const baseY = chart.yToPx(Math.max(0, chart.yDomain[0]));
        const height = Math.max(1, Math.abs(baseY - y));
        const rectY = Math.min(baseY, y);
        const opacity = typeof series.opacity === 'number' ? series.opacity : 0.9;
        const showValueLabel = shouldRenderValueLabel(series, yValue, datum, index);
        const valueText = formatValueLabel(series, yValue, datum, index);
        const labelPosition = series.valueLabelPosition ?? 'top';
        const labelColor = series.valueLabelColor ?? chart.tokens.color.textPrimary;
        const labelY = (() => {
          if (labelPosition === 'inside') {
            return yValue >= 0 ? rectY + 12 : rectY + height - 4;
          }
          return yValue >= 0 ? rectY - 4 : rectY + height + 12;
        })();

        return (
          <g key={index}>
            <rect x={xStart} y={rectY} width={itemWidth} height={height} fill={fill} opacity={opacity} />
            {showValueLabel ? (
              <text
                x={xCenter}
                y={labelY}
                textAnchor="middle"
                fill={labelColor}
                fontFamily={fontFamily}
                fontSize={chart.tokens.typography.axisTickFontSize}
              >
                {valueText}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export function ComposedSeries<TDatum>({ seriesId }: { seriesId: string }) {
  const { chart } = useChartContext<TDatum>();
  const series = chart.visibleSeries.find((item) => item.id === seriesId);
  if (!series || series.type !== 'composed') return null;
  if ((series.renderAs ?? 'line') === 'bar') {
    return <BarSeries<TDatum> seriesId={seriesId} />;
  }
  return <LineSeries<TDatum> seriesId={seriesId} />;
}

function arcPath(cx: number, cy: number, innerR: number, outerR: number, start: number, end: number) {
  const large = end - start > Math.PI ? 1 : 0;
  const sx = cx + outerR * Math.cos(start);
  const sy = cy + outerR * Math.sin(start);
  const ex = cx + outerR * Math.cos(end);
  const ey = cy + outerR * Math.sin(end);
  const isx = cx + innerR * Math.cos(end);
  const isy = cy + innerR * Math.sin(end);
  const iex = cx + innerR * Math.cos(start);
  const iey = cy + innerR * Math.sin(start);

  if (innerR <= 0) {
    return `M ${cx} ${cy} L ${sx} ${sy} A ${outerR} ${outerR} 0 ${large} 1 ${ex} ${ey} Z`;
  }

  return [
    `M ${sx} ${sy}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${ex} ${ey}`,
    `L ${isx} ${isy}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${iex} ${iey}`,
    'Z',
  ].join(' ');
}

function PieLikeSeries<TDatum>({ seriesId, forceDonut }: { seriesId: string; forceDonut: boolean }) {
  const { chart } = useChartContext<TDatum>();
  const target = chart.visibleSeries.find((item) => item.id === seriesId);
  if (!target || !isPieSeries(target)) return null;

  const sum = target.data.reduce((acc, datum, index) => {
    const value = target.value(datum, index);
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return acc;
    return acc + value;
  }, 0);

  if (sum <= 0) return null;

  const cx = chart.padding.left + chart.innerWidth / 2;
  const cy = chart.padding.top + chart.innerHeight / 2;
  const fontFamily = chart.tokens.typography.fontFamily;
  const defaultOuter = Math.max(8, Math.min(chart.innerWidth, chart.innerHeight) / 2 - 4);
  const outerR = target.outerRadius ?? defaultOuter;
  const innerR = forceDonut || target.type === 'donut' ? target.innerRadius ?? Math.round(outerR * 0.6) : 0;

  let current = -Math.PI / 2;
  const colorOffset = chart.visibleSeries.findIndex((item) => item.id === target.id);

  return (
    <g>
      {target.data.map((datum, index) => {
        const value = target.value(datum, index);
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
        const angle = (value / sum) * Math.PI * 2;
        const start = current;
        const end = current + angle;
        current = end;

        const color = pickSeriesColor(chart.tokens.color.seriesPalette, colorOffset + index, target.color);
        const path = arcPath(cx, cy, innerR, outerR, start, end);
        const showValueLabel = shouldRenderValueLabel(target, value, datum, index);
        const valueText = formatValueLabel(target, value, datum, index);
        const labelColor = target.valueLabelColor ?? chart.tokens.color.textPrimary;
        const labelRadius = target.valueLabelPosition === 'top'
          ? outerR + 14
          : innerR > 0
            ? (innerR + outerR) / 2
            : outerR * 0.62;
        const mid = (start + end) / 2;
        const labelX = cx + labelRadius * Math.cos(mid);
        const labelY = cy + labelRadius * Math.sin(mid);

        return (
          <g key={index}>
            <path d={path} fill={color} stroke="#fff" strokeWidth={chart.tokens.border.gridWidth} />
            {showValueLabel ? (
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={labelColor}
                fontFamily={fontFamily}
                fontSize={chart.tokens.typography.axisTickFontSize}
              >
                {valueText}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

export function PieSeries<TDatum>({ seriesId }: { seriesId: string }) {
  return <PieLikeSeries<TDatum> seriesId={seriesId} forceDonut={false} />;
}

export function DonutSeries<TDatum>({ seriesId }: { seriesId: string }) {
  return <PieLikeSeries<TDatum> seriesId={seriesId} forceDonut />;
}

export function ChartTooltip() {
  const { chart, hover } = useChartContext<unknown>();
  const tooltipOption = chart.options.interactive?.tooltip;
  const tooltipEnabled = (() => {
    if (tooltipOption === false) return false;
    if (tooltipOption === undefined || tooltipOption === true) return true;
    return tooltipOption.enabled !== false;
  })();
  if (!tooltipEnabled || hover === null) return null;

  const textColor = chart.tokens.color.tooltipText;
  const series = chart.seriesMeta.uniqueSeries.find((item) => item.id === hover.point.seriesId);
  const extracted = (() => {
    if (!series) return null;
    const index = series.data.findIndex((item) => item === hover.point.datum);
    const safeIndex = index >= 0 ? index : 0;
    if (isPieSeries(series)) {
      return {
        value: series.value(hover.point.datum, safeIndex),
        x: series.category(hover.point.datum, safeIndex),
      };
    }
    return {
      value: series.y(hover.point.datum, safeIndex),
      x: series.x(hover.point.datum, safeIndex),
    };
  })();
  const rawValue = extracted?.value;
  const numericValue = rawValue == null || !Number.isFinite(Number(rawValue)) ? null : Number(rawValue);
  const formatCtx = {
    seriesId: hover.point.seriesId,
    seriesLabel: series?.label,
    seriesType: series?.type ?? 'line',
    datum: hover.point.datum,
    x: extracted?.x,
    value: numericValue,
  };

  const titleText = (() => {
    if (tooltipOption && typeof tooltipOption === 'object' && tooltipOption.titleFormatter) {
      return tooltipOption.titleFormatter(formatCtx);
    }
    return series?.label ?? hover.point.seriesId;
  })();

  const valueText = (() => {
    if (tooltipOption && typeof tooltipOption === 'object' && tooltipOption.valueFormatter) {
      return tooltipOption.valueFormatter(formatCtx);
    }
    if (numericValue == null) return '-';
    return new Intl.NumberFormat('ko-KR').format(numericValue);
  })();

  const tooltipFontSize = chart.tokens.typography.tooltipFontSize;
  const tooltipFontFamily = chart.tokens.typography.fontFamily;
  const resolvedTooltipFontFamily = (() => {
    if (typeof document === 'undefined') return tooltipFontFamily;
    if (!tooltipFontFamily.includes('var(')) return tooltipFontFamily;
    return getComputedStyle(document.documentElement).fontFamily || 'system-ui, -apple-system, Segoe UI, sans-serif';
  })();
  const estimateTextWidth = (text: string) => {
    if (typeof document === 'undefined') return text.length * tooltipFontSize * 0.62;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return text.length * tooltipFontSize * 0.62;
    ctx.font = `${tooltipFontSize}px ${resolvedTooltipFontFamily}`;
    return ctx.measureText(text).width;
  };

  const textMaxWidth = Math.max(estimateTextWidth(titleText), estimateTextWidth(valueText));
  const rawWidth = textMaxWidth + chart.tokens.spacing.tooltipPaddingX * 2;
  const width = Math.min(280, Math.max(80, Math.ceil(rawWidth)));
  const lineGap = chart.tokens.typography.tooltipFontSize + 4;
  const height = chart.tokens.spacing.tooltipPaddingY * 2 + lineGap * 2 - 2;
  const gutter = 10;
  const pointGap = 6;
  const canvasMargin = 4;

  let tooltipX = hover.point.x + gutter;
  let tooltipY = hover.point.y - (height + pointGap);

  if (tooltipX + width > chart.width - canvasMargin) {
    tooltipX = hover.point.x - width - gutter;
  }
  if (tooltipX < canvasMargin) {
    tooltipX = canvasMargin;
  }

  if (tooltipY < canvasMargin) {
    tooltipY = hover.point.y + pointGap;
  }
  if (tooltipY + height > chart.height - canvasMargin) {
    tooltipY = Math.max(canvasMargin, chart.height - height - canvasMargin);
  }

  return (
    <g>
      <circle cx={hover.point.x} cy={hover.point.y} r={4} fill={chart.tokens.color.textPrimary} />
      <rect
        x={tooltipX}
        y={tooltipY}
        width={width}
        height={height}
        rx={chart.tokens.border.tooltipRadius}
        fill={chart.tokens.color.tooltipBg}
        stroke={chart.tokens.color.tooltipBorder}
        strokeWidth={chart.tokens.border.tooltipBorderWidth}
      />
      <text
        x={tooltipX + width / 2}
        y={tooltipY + chart.tokens.spacing.tooltipPaddingY + chart.tokens.typography.tooltipFontSize - 1}
        textAnchor="middle"
        fontFamily={tooltipFontFamily}
        fontSize={chart.tokens.typography.tooltipFontSize}
        fill={textColor}
      >
        {titleText}
      </text>
      <text
        x={tooltipX + width / 2}
        y={tooltipY + chart.tokens.spacing.tooltipPaddingY + chart.tokens.typography.tooltipFontSize - 1 + lineGap}
        textAnchor="middle"
        fontFamily={tooltipFontFamily}
        fontSize={chart.tokens.typography.tooltipFontSize}
        fill={textColor}
      >
        {valueText}
      </text>
    </g>
  );
}

export function ChartCrosshair() {
  const { chart, hover } = useChartContext<unknown>();
  if (!chart.options.interactive?.crosshair || hover === null) return null;

  const left = chart.padding.left;
  const top = chart.padding.top;
  const right = chart.padding.left + chart.innerWidth;
  const bottom = chart.padding.top + chart.innerHeight;

  return (
    <g pointerEvents="none">
      <line
        x1={hover.point.x}
        y1={top}
        x2={hover.point.x}
        y2={bottom}
        stroke={chart.tokens.color.crosshair}
        strokeDasharray="3 3"
        strokeWidth={1}
      />
      <line
        x1={left}
        y1={hover.point.y}
        x2={right}
        y2={hover.point.y}
        stroke={chart.tokens.color.crosshair}
        strokeDasharray="3 3"
        strokeWidth={1}
      />
    </g>
  );
}

export function ChartLegend() {
  const { chart } = useChartContext<unknown>();
  if (!chart.legend.enabled) return null;

  const legendSeries = chart.seriesMeta.uniqueSeries;
  const marker = chart.tokens.spacing.legendMarkerSize;
  const itemGap = chart.tokens.spacing.legendItemGap;
  const symbolWidth = marker + 6;
  const itemWidth = symbolWidth + itemGap + 70;
  const fontFamily = chart.tokens.typography.fontFamily;
  const totalWidth = legendSeries.length * itemWidth;

  let startX = chart.padding.left;
  if (chart.legend.align === 'center') {
    startX = chart.padding.left + Math.max(0, (chart.innerWidth - totalWidth) / 2);
  } else if (chart.legend.align === 'end') {
    startX = chart.padding.left + Math.max(0, chart.innerWidth - totalWidth);
  }

  const xAxisVisible = chart.options.xAxis?.show !== false;
  const xAxisLabelBand = xAxisVisible
    ? chart.tokens.spacing.axisTickGap + chart.tokens.typography.axisTickFontSize + 6
    : 0;

  let y = 14;
  if (chart.legend.position === 'top') {
    y = chart.legend.reserveSpace
      ? chart.padding.top - chart.legend.bandSize + chart.tokens.typography.legendFontSize + 2
      : 14;
  } else if (chart.legend.position === 'bottom') {
    y = chart.legend.reserveSpace
      ? chart.padding.top + chart.innerHeight + xAxisLabelBand + chart.tokens.typography.legendFontSize + 2
      : chart.height - 10;
  } else if (chart.legend.position === 'left') {
    y = chart.padding.top + chart.tokens.typography.legendFontSize;
    startX = chart.padding.left;
  } else if (chart.legend.position === 'right') {
    y = chart.padding.top + chart.tokens.typography.legendFontSize;
    startX = chart.padding.left + Math.max(0, chart.innerWidth - itemWidth);
  }

  return (
    <g>
      {legendSeries.map((series, index) => {
        const x = startX + index * itemWidth;
        const isInvalid = chart.seriesMeta.invalidNoFiniteYIds.has(series.id);
        const isVisible = chart.visibleSeries.some((item) => item.id === series.id);
        const color = pickSeriesColor(
          chart.tokens.color.seriesPalette,
          index,
          (series as { color?: string }).color
        );
        const isLineLike =
          series.type === 'line' ||
          (series.type === 'composed' && (series.renderAs ?? 'line') === 'line');
        const legendStrokeDasharray = series.type === 'line' ? series.strokeDasharray : undefined;
          return (
            <g
              key={series.id}
              transform={`translate(${x}, ${y})`}
              onClick={isInvalid ? undefined : () => chart.toggleSeries(series.id)}
              cursor={isInvalid ? 'default' : 'pointer'}
            >
            {isLineLike ? (
              <line
                x1={0}
                y1={-marker / 2 + 3}
                x2={symbolWidth}
                y2={-marker / 2 + 3}
                stroke={color}
                strokeWidth={chart.tokens.border.seriesStrokeWidth}
                strokeDasharray={legendStrokeDasharray}
                  opacity={isInvalid ? 0.2 : isVisible ? 1 : 0.3}
                />
              ) : (
                <rect
                x={0}
                y={-marker + 2}
                width={marker}
                height={marker}
                fill={color}
                  opacity={isInvalid ? 0.2 : isVisible ? 1 : 0.3}
                />
              )}
              <text
                x={symbolWidth + 4}
                y={0}
                fill={
                  isInvalid
                    ? chart.tokens.color.legendTextMuted
                    : isVisible
                      ? chart.tokens.color.legendText
                      : chart.tokens.color.legendTextMuted
                }
                fontFamily={fontFamily}
                fontSize={chart.tokens.typography.legendFontSize}
              >
              {getSeriesDisplayName(series as { id: string; label?: string })}
            </text>
          </g>
        );
      })}
    </g>
  );
}
