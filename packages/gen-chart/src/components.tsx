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

export function ChartGrid() {
  const { chart, left, right } = useCartesianFrame<unknown>();
  const lines = Math.max(2, chart.options.yAxis?.tickCount ?? 5);
  const stroke = chart.tokens.color.grid;

  return (
    <g>
      {Array.from({ length: lines + 1 }).map((_, index) => {
        const y = chart.padding.top + (chart.innerHeight / lines) * index;
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
  const tickCount = Math.max(2, chart.options.xAxis?.tickCount ?? 5);

  let ticks: Array<string | number | Date> = [];
  if (chart.xMeta.kind === 'category') {
    const source = chart.xMeta.categories;
    const step = Math.max(1, Math.ceil(source.length / tickCount));
    ticks = source.filter((_, idx) => idx % step === 0);
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
  const ticks = Math.max(2, chart.options.yAxis?.tickCount ?? 5);
  const [minY, maxY] = chart.yDomain;
  const format = chart.options.yAxis?.tickFormat ?? ((value: unknown) => String(value));

  return (
    <g>
      <line x1={left} y1={top} x2={left} y2={bottom} stroke={axisColor} strokeWidth={chart.tokens.border.axisWidth} />
      {Array.from({ length: ticks + 1 }).map((_, index) => {
        const ratio = index / ticks;
        const value = maxY - (maxY - minY) * ratio;
        const y = top + ratio * chart.innerHeight;
        return (
          <g key={index}>
            <line x1={left - chart.tokens.spacing.axisTickGap} y1={y} x2={left} y2={y} stroke={axisColor} />
            <text
              x={left - chart.tokens.spacing.axisTickGap - 4}
              y={y + 3}
              textAnchor="end"
              fill={textColor}
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

export function LineSeries<TDatum>({ seriesId }: { seriesId: string }) {
  const { chart } = useChartContext<TDatum>();
  const series = getCartesianSeriesById(seriesId, chart.visibleSeries);
  if (!series) return null;
  if (series.type === 'composed' && (series.renderAs ?? 'line') !== 'line') return null;
  if (series.type !== 'line' && series.type !== 'composed') return null;

  const colorIndex = chart.visibleSeries.findIndex((item) => item.id === series.id);
  const stroke = pickSeriesColor(chart.tokens.color.seriesPalette, colorIndex, series.color);
  const strokeDasharray = series.type === 'line' ? series.strokeDasharray : undefined;
  const points: string[] = [];

  for (let i = 0; i < series.data.length; i += 1) {
    const datum = series.data[i];
    const yValue = series.y(datum, i);
    if (typeof yValue !== 'number' || !Number.isFinite(yValue)) continue;
    const x = chart.xToPx(series.x(datum, i));
    const y = chart.yToPx(yValue);
    points.push(`${x},${y}`);
  }

  if (points.length === 0) return null;
  return (
    <polyline
      fill="none"
      stroke={stroke}
      strokeWidth={chart.tokens.border.seriesStrokeWidth}
      strokeDasharray={strokeDasharray}
      points={points.join(' ')}
    />
  );
}

export function AreaSeries<TDatum>({ seriesId }: { seriesId: string }) {
  const { chart } = useChartContext<TDatum>();
  const series = getCartesianSeriesById(seriesId, chart.visibleSeries);
  if (!series || series.type !== 'area') return null;

  const colorIndex = chart.visibleSeries.findIndex((item) => item.id === series.id);
  const fill = pickSeriesColor(chart.tokens.color.seriesPalette, colorIndex, series.color);
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < series.data.length; i += 1) {
    const datum = series.data[i];
    const yValue = series.y(datum, i);
    if (typeof yValue !== 'number' || !Number.isFinite(yValue)) continue;
    points.push({
      x: chart.xToPx(series.x(datum, i)),
      y: chart.yToPx(yValue),
    });
  }

  if (points.length < 2) return null;
  const baselineY = chart.yToPx(Math.max(0, chart.yDomain[0]));
  const path = [
    `M ${points[0].x} ${baselineY}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${baselineY}`,
    'Z',
  ].join(' ');
  const strokePath = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <g>
      <path d={path} fill={fill} opacity={0.24} />
      <polyline fill="none" stroke={fill} strokeWidth={chart.tokens.border.seriesStrokeWidth} points={strokePath} />
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
        return <rect key={index} x={xStart} y={rectY} width={itemWidth} height={height} fill={fill} opacity={opacity} />;
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
        return <path key={index} d={path} fill={color} stroke="#fff" strokeWidth={chart.tokens.border.gridWidth} />;
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
  if (!chart.options.interactive?.tooltip || hover === null) return null;
  const textColor = chart.tokens.color.tooltipText;
  const width = 120;
  const height = chart.tokens.spacing.tooltipPaddingY * 2 + chart.tokens.typography.tooltipFontSize;

  return (
    <g>
      <circle cx={hover.point.x} cy={hover.point.y} r={4} fill={chart.tokens.color.textPrimary} />
      <rect
        x={hover.point.x + 10}
        y={hover.point.y - (height + 6)}
        width={width}
        height={height}
        rx={chart.tokens.border.tooltipRadius}
        fill={chart.tokens.color.tooltipBg}
        stroke={chart.tokens.color.tooltipBorder}
        strokeWidth={chart.tokens.border.tooltipBorderWidth}
      />
      <text
        x={hover.point.x + 10 + chart.tokens.spacing.tooltipPaddingX}
        y={hover.point.y - (height + 6) + chart.tokens.spacing.tooltipPaddingY + chart.tokens.typography.tooltipFontSize - 1}
        fontSize={chart.tokens.typography.tooltipFontSize}
        fill={textColor}
      >
        {hover.point.seriesId}
      </text>
    </g>
  );
}

export function ChartLegend() {
  const { chart } = useChartContext<unknown>();
  if (!chart.legend.enabled) return null;

  const marker = chart.tokens.spacing.legendMarkerSize;
  const itemGap = chart.tokens.spacing.legendItemGap;
  const symbolWidth = marker + 6;
  const itemWidth = symbolWidth + itemGap + 70;
  const totalWidth = chart.options.series.length * itemWidth;

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
      {chart.options.series.map((series, index) => {
        const x = startX + index * itemWidth;
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
          <g key={series.id} transform={`translate(${x}, ${y})`} onClick={() => chart.toggleSeries(series.id)} cursor="pointer">
            {isLineLike ? (
              <line
                x1={0}
                y1={-marker / 2 + 3}
                x2={symbolWidth}
                y2={-marker / 2 + 3}
                stroke={color}
                strokeWidth={chart.tokens.border.seriesStrokeWidth}
                strokeDasharray={legendStrokeDasharray}
                opacity={isVisible ? 1 : 0.3}
              />
            ) : (
              <rect
                x={0}
                y={-marker + 2}
                width={marker}
                height={marker}
                fill={color}
                opacity={isVisible ? 1 : 0.3}
              />
            )}
            <text
              x={symbolWidth + 4}
              y={0}
              fill={isVisible ? chart.tokens.color.legendText : chart.tokens.color.legendTextMuted}
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
