import * as React from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { Treemap } from '@visx/hierarchy';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { AreaClosed, Bar, LinePath, Pie } from '@visx/shape';
import { Text } from '@visx/text';
import { hierarchy } from 'd3-hierarchy';

import { resolveChartTokens } from './tokens';
import type {
  CartesianChartProps,
  CartesianSeriesDef,
  GenChartLegendOptions,
  GenChartProps,
  GenChartTooltipContext,
  GenChartTooltipOptions,
  PieDonutChartProps,
  TreemapChartProps,
  TreemapNode,
} from './types';

type Point<T> = {
  datum: T;
  index: number;
  x: number;
  y: number;
  value: number;
};

type TooltipState<T> = {
  x: number;
  y: number;
  context: GenChartTooltipContext<T>;
};

const LEGEND_BAND = 28;

function resolveLegend(legend: boolean | GenChartLegendOptions | undefined) {
  if (legend === false) return { enabled: false, position: 'top' as const, align: 'start' as const };
  if (legend === true) return { enabled: true, position: 'top' as const, align: 'start' as const };
  if (!legend) return { enabled: false, position: 'top' as const, align: 'start' as const };
  return {
    enabled: legend.enabled !== false,
    position: legend.position ?? 'top',
    align: legend.align ?? 'start',
  };
}

function resolveTooltip<T>(tooltip: boolean | GenChartTooltipOptions<T> | undefined) {
  if (tooltip === false) return { enabled: false as const, config: undefined };
  if (tooltip === true) return { enabled: true as const, config: undefined };
  if (!tooltip) return { enabled: false as const, config: undefined };
  return { enabled: tooltip.enabled !== false, config: tooltip };
}

function legendJustify(align: 'start' | 'center' | 'end') {
  if (align === 'center') return 'center';
  if (align === 'end') return 'flex-end';
  return 'flex-start';
}

function renderTooltip<T>(
  tooltip: TooltipState<T>,
  tooltipOptions: ReturnType<typeof resolveTooltip<T>>,
  tokens: ReturnType<typeof resolveChartTokens>,
) {
  const label = tooltipOptions.config?.labelFormatter?.(tooltip.context) ?? tooltip.context.label;
  const value = tooltipOptions.config?.valueFormatter?.(tooltip.context)
    ?? (tooltip.context.value == null ? '-' : new Intl.NumberFormat('ko-KR').format(tooltip.context.value));

  return (
    <div
      className="gen-chart-tooltip"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        background: tokens.color.tooltipBg,
        color: tokens.color.tooltipText,
        borderColor: tokens.color.tooltipBorder,
        borderRadius: tokens.border.tooltipRadius,
      }}
    >
      <div>{label}</div>
      <div>{value}</div>
    </div>
  );
}

function CartesianRenderer<T>(props: CartesianChartProps<T>) {
  const tokens = resolveChartTokens(props.theme, props.tokens);
  const legend = resolveLegend(props.legend);
  const tooltipOptions = resolveTooltip(props.tooltip);
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null);

  const basePadding = {
    top: props.padding?.top ?? 16,
    right: props.padding?.right ?? 16,
    bottom: props.padding?.bottom ?? 36,
    left: props.padding?.left ?? 44,
  };

  const padding = {
    top: basePadding.top + (legend.enabled && legend.position === 'top' ? LEGEND_BAND : 0),
    right: basePadding.right,
    bottom: basePadding.bottom + (legend.enabled && legend.position === 'bottom' ? LEGEND_BAND : 0),
    left: basePadding.left,
  };

  const innerWidth = Math.max(0, props.width - padding.left - padding.right);
  const innerHeight = Math.max(0, props.height - padding.top - padding.bottom);

  const xValues = props.data.map((datum, index) => props.x(datum, index));
  const allCategory = xValues.every((value) => typeof value === 'string');
  const xBand = scaleBand<string>({
    domain: xValues.map((value) => String(value)),
    range: [0, innerWidth],
    padding: 0.22,
  });

  const xLinearValues = xValues
    .map((value) => (value instanceof Date ? value.getTime() : typeof value === 'number' ? value : Number.NaN))
    .filter((value) => Number.isFinite(value));
  const minX = xLinearValues.length ? Math.min(...xLinearValues) : 0;
  const maxX = xLinearValues.length ? Math.max(...xLinearValues) : 1;
  const xLinear = scaleLinear<number>({
    domain: [minX, maxX === minX ? minX + 1 : maxX],
    range: [0, innerWidth],
  });

  const barSeries = props.series.filter((series) => series.type === 'bar');
  const stackedBarSeries = barSeries.filter((series) => Boolean(series.stackId));
  const groupedBarSeries = barSeries.filter((series) => !series.stackId);
  const barOrientation = props.barOrientation ?? 'vertical';

  const yValues: number[] = [];
  props.series.forEach((series) => {
    props.data.forEach((datum, index) => {
      const value = series.y(datum, index);
      if (typeof value === 'number' && Number.isFinite(value)) yValues.push(value);
    });
  });
  if (stackedBarSeries.length > 0) {
    const stackTotals = new Map<string, { pos: number; neg: number }>();
    stackedBarSeries.forEach((series) => {
      const stackId = String(series.stackId);
      props.data.forEach((datum, index) => {
        const value = series.y(datum, index);
        if (typeof value !== 'number' || !Number.isFinite(value)) return;
        const key = `${stackId}:${index}`;
        const prev = stackTotals.get(key) ?? { pos: 0, neg: 0 };
        if (value >= 0) {
          prev.pos += value;
        } else {
          prev.neg += value;
        }
        stackTotals.set(key, prev);
      });
    });
    stackTotals.forEach((total) => {
      yValues.push(total.pos, total.neg);
    });
  }
  const minYFromData = yValues.length ? Math.min(...yValues, 0) : 0;
  const maxYFromData = yValues.length ? Math.max(...yValues) : 1;
  const minY = typeof props.yAxis?.min === 'number' ? props.yAxis.min : minYFromData;
  const maxYCandidate = typeof props.yAxis?.max === 'number' ? props.yAxis.max : maxYFromData;
  const maxY = maxYCandidate <= minY ? minY + 1 : maxYCandidate;

  const yScale = scaleLinear<number>({
    domain: [minY, maxY],
    range: [innerHeight, 0],
    nice: true,
  });
  const valueXScale = scaleLinear<number>({
    domain: [minY, maxY],
    range: [0, innerWidth],
    nice: true,
  });
  const yBand = scaleBand<string>({
    domain: xValues.map((value) => String(value)),
    range: [0, innerHeight],
    padding: 0.22,
  });
  const xAxisTop =
    props.xAxis?.position === 'zero' && minY < 0 && maxY > 0
      ? Number(yScale(0))
      : innerHeight;

  const colorScale = scaleOrdinal<string, string>({
    domain: props.series.map((series) => series.id),
    range: tokens.color.seriesPalette,
  });

  const getX = React.useCallback((raw: string | number | Date) => {
    if (allCategory) return (xBand(String(raw)) ?? 0) + (xBand.bandwidth() / 2);
    const numberValue = raw instanceof Date ? raw.getTime() : Number(raw);
    return Number(xLinear(numberValue));
  }, [allCategory, xBand, xLinear]);

  const pointsBySeries = React.useMemo(() => {
    const map = new Map<string, Point<T>[]>();
    props.series.forEach((series) => {
      const points: Point<T>[] = [];
      props.data.forEach((datum, index) => {
        const y = series.y(datum, index);
        if (typeof y !== 'number' || !Number.isFinite(y)) return;
        const xRaw = props.x(datum, index);
        const isHorizontalBar = series.type === 'bar' && barOrientation === 'horizontal';
        points.push({
          datum,
          index,
          x: isHorizontalBar ? Number(valueXScale(y)) : getX(xRaw),
          y: isHorizontalBar
            ? (yBand(String(xRaw)) ?? 0) + yBand.bandwidth() / 2
            : Number(yScale(y)),
          value: y,
        });
      });
      map.set(series.id, points);
    });
    return map;
  }, [barOrientation, getX, props.data, props.series, props.x, valueXScale, yBand, yScale]);

  const groupedBarWidth = allCategory
    ? Math.max(4, (xBand.bandwidth() / Math.max(1, groupedBarSeries.length)) * 0.92)
    : 14;
  const stackedBarWidth = allCategory
    ? Math.max(4, xBand.bandwidth() * 0.92)
    : 14;
  const groupedBarHeight = Math.max(4, (yBand.bandwidth() / Math.max(1, groupedBarSeries.length)) * 0.92);
  const stackedBarHeight = Math.max(4, yBand.bandwidth() * 0.92);

  const onMove = React.useCallback((event: React.MouseEvent<SVGRectElement>) => {
    if (!tooltipOptions.enabled) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;

    let bestDist = Number.POSITIVE_INFINITY;
    let bestSeries: CartesianSeriesDef<T> | null = null;
    let bestPoint: Point<T> | null = null;
    let bestAnchorX = 0;
    let bestAnchorY = 0;

    const hoverStackAcc = new Map<string, { pos: number; neg: number }>();
    for (const series of props.series) {
      const points = pointsBySeries.get(series.id) ?? [];
      const isGroupedBarSeries = series.type === 'bar' && !series.stackId;
      const barIndex = isGroupedBarSeries
        ? Math.max(0, groupedBarSeries.findIndex((item) => item.id === series.id))
        : -1;
      for (const point of points) {
        let hoverX = point.x;
        let hoverY = point.y;

        if (series.type === 'bar' && series.stackId) {
          const stackId = String(series.stackId);
          const key = `${stackId}:${point.index}`;
          const prev = hoverStackAcc.get(key) ?? { pos: 0, neg: 0 };
          const value = point.value;
          const start = value >= 0 ? prev.pos : prev.neg;
          const end = start + value;
          if (value >= 0) {
            prev.pos = end;
          } else {
            prev.neg = end;
          }
          hoverStackAcc.set(key, prev);

          if (barOrientation === 'horizontal') {
            const xStart = Number(valueXScale(start));
            const xEnd = Number(valueXScale(end));
            hoverX = (xStart + xEnd) / 2;
            hoverY = point.y;
          } else {
            const yStart = Number(yScale(start));
            const yEnd = Number(yScale(end));
            hoverX = point.x;
            hoverY = (yStart + yEnd) / 2;
          }
        } else if (isGroupedBarSeries) {
          if (barOrientation === 'horizontal') {
            hoverY =
              point.y - (yBand.bandwidth() / 2) + barIndex * groupedBarHeight + groupedBarHeight / 2;
          } else {
            hoverX =
              allCategory
                ? point.x - (xBand.bandwidth() / 2) + barIndex * groupedBarWidth + groupedBarWidth / 2
                : point.x;
          }
        }

        const dx = hoverX - x;
        const dy = hoverY - y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          bestSeries = series;
          bestPoint = point;
          bestAnchorX = hoverX;
          bestAnchorY = hoverY;
        }
      }
    }

    if (!bestSeries || !bestPoint) {
      setTooltip(null);
      return;
    }

    const raw = bestSeries.y(bestPoint.datum, bestPoint.index);
    const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
    setTooltip({
      x: padding.left + bestAnchorX + 12,
      y: padding.top + bestAnchorY - 44,
      context: {
        label: bestSeries.label ?? bestSeries.id,
        value,
        datum: bestPoint.datum,
        seriesId: bestSeries.id,
      },
    });
  }, [
    allCategory,
    barOrientation,
    groupedBarHeight,
    groupedBarSeries,
    groupedBarWidth,
    padding.left,
    padding.top,
    pointsBySeries,
    props.series,
    tooltipOptions.enabled,
    valueXScale,
    xBand,
    yBand,
    yScale,
  ]);

  return (
    <div className="gen-chart-root" style={{ width: props.width, height: props.height, background: tokens.color.background }}>
      {legend.enabled && legend.position === 'top' ? (
        <div className="gen-chart-legend" style={{ justifyContent: legendJustify(legend.align) }}>
          {props.series.map((series) => (
            <span key={series.id} className="gen-chart-legend-item">
              <i style={{ background: series.color ?? colorScale(series.id) }} />
              {series.label ?? series.id}
            </span>
          ))}
        </div>
      ) : null}
      <svg width={props.width} height={props.height} role="img">
        <Group left={padding.left} top={padding.top}>
          <GridRows
            scale={yScale}
            width={innerWidth}
            stroke={tokens.color.grid}
            strokeWidth={tokens.border.gridWidth}
            numTicks={props.yAxis?.tickCount ?? 5}
          />

          {(() => {
            const stackAcc = new Map<string, { pos: number; neg: number }>();
            return props.series.map((series) => {
            const points = pointsBySeries.get(series.id) ?? [];
            const color = series.color ?? colorScale(series.id);
            if (series.type === 'line') {
              return (
                <LinePath<Point<T>>
                  key={series.id}
                  data={points}
                  x={(d: Point<T>) => d.x}
                  y={(d: Point<T>) => d.y}
                  stroke={color}
                  strokeWidth={tokens.border.seriesStrokeWidth}
                />
              );
            }
            if (series.type === 'area') {
              return (
                <AreaClosed<Point<T>>
                  key={series.id}
                  data={points}
                  x={(d: Point<T>) => d.x}
                  y={(d: Point<T>) => d.y}
                  yScale={yScale}
                  fill={color}
                  fillOpacity={0.24}
                  stroke={color}
                  strokeWidth={tokens.border.seriesStrokeWidth}
                />
              );
            }

            const barIndex = Math.max(0, groupedBarSeries.findIndex((item) => item.id === series.id));
            return (
              <React.Fragment key={series.id}>
                {points.map((point) => {
                  if (series.stackId) {
                    const stackId = String(series.stackId);
                    const key = `${stackId}:${point.index}`;
                    const prev = stackAcc.get(key) ?? { pos: 0, neg: 0 };
                    const value = point.value;
                    const start = value >= 0 ? prev.pos : prev.neg;
                    const end = start + value;
                    if (value >= 0) {
                      prev.pos = end;
                    } else {
                      prev.neg = end;
                    }
                    stackAcc.set(key, prev);

                    if (barOrientation === 'horizontal') {
                      const xStart = Number(valueXScale(start));
                      const xEnd = Number(valueXScale(end));
                      const barWidth = Math.max(1, Math.abs(xEnd - xStart));
                      const y = point.y - stackedBarHeight / 2;
                      return (
                        <Bar
                          key={`${series.id}-${point.index}`}
                          x={Math.min(xStart, xEnd)}
                          y={y}
                          width={barWidth}
                          height={stackedBarHeight}
                          fill={value < 0 ? (series.negativeColor ?? '#dc2626') : color}
                          opacity={0.9}
                        />
                      );
                    }

                    const yStart = Number(yScale(start));
                    const yEnd = Number(yScale(end));
                    const barHeight = Math.max(1, Math.abs(yEnd - yStart));
                    const x = allCategory
                      ? point.x - stackedBarWidth / 2
                      : point.x - stackedBarWidth / 2;

                    return (
                      <Bar
                        key={`${series.id}-${point.index}`}
                        x={x}
                        y={Math.min(yStart, yEnd)}
                        width={stackedBarWidth}
                        height={barHeight}
                        fill={value < 0 ? (series.negativeColor ?? '#dc2626') : color}
                        opacity={0.9}
                      />
                    );
                  }

                  if (barOrientation === 'horizontal') {
                    const zeroX = Number(valueXScale(0));
                    const barWidth = Math.max(1, Math.abs(zeroX - point.x));
                    const y = point.y - (yBand.bandwidth() / 2) + barIndex * groupedBarHeight;
                    return (
                      <Bar
                        key={`${series.id}-${point.index}`}
                        x={Math.min(zeroX, point.x)}
                        y={y}
                        width={barWidth}
                        height={groupedBarHeight}
                        fill={point.value < 0 ? (series.negativeColor ?? '#dc2626') : color}
                        opacity={0.9}
                      />
                    );
                  }

                  const x = allCategory
                    ? point.x - (xBand.bandwidth() / 2) + barIndex * groupedBarWidth
                    : point.x - groupedBarWidth / 2;
                  const zeroY = Number(yScale(0));
                  const barHeight = Math.max(1, Math.abs(zeroY - point.y));
                  return (
                    <Bar
                      key={`${series.id}-${point.index}`}
                      x={x}
                      y={Math.min(zeroY, point.y)}
                      width={groupedBarWidth}
                      height={barHeight}
                      fill={point.value < 0 ? (series.negativeColor ?? '#dc2626') : color}
                      opacity={0.9}
                    />
                  );
                })}
              </React.Fragment>
            );
            });
          })()}

          {props.xAxis?.show !== false ? (
            <AxisBottom
              top={barOrientation === 'horizontal' ? innerHeight : xAxisTop}
              scale={barOrientation === 'horizontal' ? valueXScale : (allCategory ? xBand : xLinear)}
              stroke={tokens.color.axis}
              tickStroke={tokens.color.axis}
              tickLabelProps={() => ({
                fill: tokens.color.textMuted,
                fontSize: tokens.typography.axisTickFontSize,
                textAnchor: 'middle',
              })}
              numTicks={barOrientation === 'horizontal' ? (props.yAxis?.tickCount ?? 5) : props.xAxis?.tickCount}
              tickFormat={
                (barOrientation === 'horizontal' ? props.yAxis?.tickFormat : props.xAxis?.tickFormat) as
                  | ((value: any) => string)
                  | undefined
              }
            />
          ) : null}

          {props.yAxis?.show !== false ? (
            <AxisLeft
              scale={barOrientation === 'horizontal' ? yBand : yScale}
              stroke={tokens.color.axis}
              tickStroke={tokens.color.axis}
              tickLabelProps={() => ({
                fill: tokens.color.textMuted,
                fontSize: tokens.typography.axisTickFontSize,
                textAnchor: 'end',
              })}
              numTicks={barOrientation === 'horizontal' ? undefined : (props.yAxis?.tickCount ?? 5)}
              tickFormat={
                (barOrientation === 'horizontal' ? props.xAxis?.tickFormat : props.yAxis?.tickFormat) as
                  | ((value: any) => string)
                  | undefined
              }
            />
          ) : null}

          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setTooltip(null)}
          />
        </Group>
      </svg>

      {legend.enabled && legend.position === 'bottom' ? (
        <div className="gen-chart-legend" style={{ justifyContent: legendJustify(legend.align) }}>
          {props.series.map((series) => (
            <span key={series.id} className="gen-chart-legend-item">
              <i style={{ background: series.color ?? colorScale(series.id) }} />
              {series.label ?? series.id}
            </span>
          ))}
        </div>
      ) : null}

      {tooltip && tooltipOptions.enabled ? renderTooltip(tooltip, tooltipOptions, tokens) : null}
    </div>
  );
}

function PieDonutRenderer<T>(props: PieDonutChartProps<T>) {
  const tokens = resolveChartTokens(props.theme, props.tokens);
  const legend = resolveLegend(props.legend);
  const tooltipOptions = resolveTooltip(props.tooltip);
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null);
  const plotHeight = Math.max(0, props.height - (legend.enabled ? LEGEND_BAND : 0));
  const radius = Math.max(8, Math.min(props.width, plotHeight) / 2 - 14);
  const outerRadius = props.outerRadius ?? radius;
  const innerRadius = props.kind === 'donut' ? (props.innerRadius ?? Math.round(outerRadius * 0.58)) : 0;
  const cx = props.width / 2;
  const cy = plotHeight / 2;

  const colorScale = scaleOrdinal<number, string>({
    domain: props.data.map((_, index) => index),
    range: tokens.color.seriesPalette,
  });

  return (
    <div className="gen-chart-root" style={{ width: props.width, height: props.height, background: tokens.color.background }}>
      {legend.enabled && legend.position === 'top' ? (
        <div className="gen-chart-legend" style={{ justifyContent: legendJustify(legend.align) }}>
          {props.data.map((datum, index) => (
            <span key={index} className="gen-chart-legend-item">
              <i style={{ background: props.color?.(datum, index) ?? colorScale(index) }} />
              {props.category(datum, index)}
            </span>
          ))}
        </div>
      ) : null}
      <svg
        width={props.width}
        height={plotHeight}
        role="img"
        style={{ display: 'block', flex: '1 1 auto', minHeight: 0 }}
      >
        <Group left={cx} top={cy}>
          <Pie<T>
            data={props.data}
            pieValue={(datum: T) => Math.max(0, props.value(datum, props.data.indexOf(datum)))}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            padAngle={0.01}
          >
            {(pie: any) => pie.arcs.map((arc: any, index: number) => {
              const fill = props.color?.(arc.data as T, index) ?? colorScale(index);
              const [lx, ly] = pie.path.centroid(arc);
              return (
                <g key={`${props.kind}-${index}`}>
                  <path
                    d={pie.path(arc) ?? ''}
                    fill={fill}
                    stroke="#fff"
                    strokeWidth={1}
                    onMouseMove={(event) => {
                      if (!tooltipOptions.enabled) return;
                      const rect = event.currentTarget.getBoundingClientRect();
                      const value = props.value(arc.data as T, index);
                      setTooltip({
                        x: event.clientX - rect.left + 12,
                        y: event.clientY - rect.top - 40,
                        context: {
                          label: props.category(arc.data as T, index),
                          value,
                          datum: arc.data as T,
                        },
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  <Text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    fill={tokens.color.textPrimary}
                    fontSize={tokens.typography.axisTickFontSize}
                    width={80}
                  >
                    {props.category(arc.data as T, index)}
                  </Text>
                </g>
              );
            })}
          </Pie>
        </Group>
      </svg>

      {legend.enabled && legend.position === 'bottom' ? (
        <div className="gen-chart-legend" style={{ justifyContent: legendJustify(legend.align) }}>
          {props.data.map((datum, index) => (
            <span key={index} className="gen-chart-legend-item">
              <i style={{ background: props.color?.(datum, index) ?? colorScale(index) }} />
              {props.category(datum, index)}
            </span>
          ))}
        </div>
      ) : null}

      {tooltip && tooltipOptions.enabled ? renderTooltip(tooltip, tooltipOptions, tokens) : null}
    </div>
  );
}

function TreemapRenderer(props: TreemapChartProps) {
  const tokens = resolveChartTokens(props.theme, props.tokens);
  const tooltipOptions = resolveTooltip(props.tooltip);
  const [tooltip, setTooltip] = React.useState<TooltipState<TreemapNode> | null>(null);
  const valueAccessor = props.value ?? ((node: TreemapNode) => node.value ?? 0);
  const labelAccessor = props.label ?? ((node: TreemapNode) => node.name);
  const minLabelArea = props.minLabelArea ?? 1600;

  const root = React.useMemo(
    () => hierarchy<TreemapNode>(props.data).sum((node: TreemapNode) => Math.max(0, valueAccessor(node))),
    [props.data, valueAccessor],
  );

  const colorScale = scaleOrdinal<number, string>({
    domain: [0, 1, 2, 3, 4, 5],
    range: tokens.color.seriesPalette,
  });

  return (
    <div className="gen-chart-root" style={{ width: props.width, height: props.height, background: tokens.color.background }}>
      <svg width={props.width} height={props.height} role="img">
        <Treemap<TreemapNode> root={root} size={[props.width, props.height]} round padding={2}>
          {(tree: any) => tree
            .descendants()
            .filter((node: any) => !node.children)
            .map((node: any, index: number) => {
              const width = Math.max(0, node.x1 - node.x0);
              const height = Math.max(0, node.y1 - node.y0);
              const area = width * height;
              const fill = props.color?.(node.data as TreemapNode, node.depth, index) ?? colorScale(node.depth % 6);
              return (
                <g key={(node.data as TreemapNode).id} transform={`translate(${node.x0}, ${node.y0})`}>
                  <rect
                    width={width}
                    height={height}
                    fill={fill}
                    stroke="#fff"
                    onClick={() => props.onNodeClick?.(node.data as TreemapNode)}
                    onMouseMove={(event) => {
                      if (!tooltipOptions.enabled) return;
                      const rect = event.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: event.clientX - rect.left + 12 + node.x0,
                        y: event.clientY - rect.top - 40 + node.y0,
                        context: {
                          label: labelAccessor(node.data as TreemapNode),
                          value: typeof node.value === 'number' ? node.value : null,
                          datum: node.data as TreemapNode,
                        },
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                  {area >= minLabelArea ? (
                    <Text x={8} y={8} verticalAnchor="start" fill="#fff" width={Math.max(0, width - 12)} fontSize={12}>
                      {labelAccessor(node.data as TreemapNode)}
                    </Text>
                  ) : null}
                </g>
              );
            })}
        </Treemap>
      </svg>
      {tooltip && tooltipOptions.enabled ? renderTooltip(tooltip, tooltipOptions, tokens) : null}
    </div>
  );
}

export function GenChart<T>(props: GenChartProps<T>): JSX.Element {
  if (props.kind === 'pie' || props.kind === 'donut') {
    return <PieDonutRenderer {...(props as PieDonutChartProps<T>)} />;
  }
  if (props.kind === 'treemap') {
    return <TreemapRenderer {...(props as TreemapChartProps)} />;
  }
  return <CartesianRenderer {...(props as CartesianChartProps<T>)} />;
}
