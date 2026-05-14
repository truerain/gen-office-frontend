import * as React from 'react';
import { AxisBottom, AxisLeft, AxisRight, AxisTop } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { Treemap } from '@visx/hierarchy';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { AreaClosed, Bar, LinePath, Pie } from '@visx/shape';
import { Text } from '@visx/text';
import { hierarchy } from 'd3-hierarchy';
import { curveLinear, curveMonotoneX, curveStep } from 'd3-shape';

import { resolveChartTokens } from './tokens';
import type {
  CartesianChartProps,
  CartesianSeriesDef,
  GenChartGridOptions,
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
  yAxisId: string;
};

type TooltipState<T> = {
  x: number;
  y: number;
  context: GenChartTooltipContext<T>;
};

const LEGEND_BAND = 28;
const TOOLTIP_MAX_WIDTH = 220;
const TOOLTIP_MARGIN = 8;

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

function resolveGrid(grid: boolean | GenChartGridOptions | undefined) {
  if (grid === false) return { show: false as const };
  if (grid === true) return { show: true as const };
  if (!grid) return { show: true as const };
  return { show: grid.show !== false };
}

function legendJustify(align: 'start' | 'center' | 'end') {
  if (align === 'center') return 'center';
  if (align === 'end') return 'flex-end';
  return 'flex-start';
}

function resolveSeriesCurve(curve: CartesianSeriesDef<unknown>['curve']) {
  if (curve === 'monotoneX') return curveMonotoneX;
  if (curve === 'step') return curveStep;
  return curveLinear;
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
  const defaultYAxisId = 'left';
  const getSeriesYAxisId = (series: CartesianSeriesDef<T>) => series.yAxisId ?? defaultYAxisId;
  const tokens = resolveChartTokens(props.theme, props.tokens);
  const grid = resolveGrid(props.grid);
  const legend = resolveLegend(props.legend);
  const tooltipOptions = resolveTooltip(props.tooltip);
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null);
  const rightAxisEntries = Object.entries(props.yAxes ?? {}).filter(([, axis]) => (axis.position ?? 'right') === 'right');
  const hasRightAxis = rightAxisEntries.some(([, axis]) => axis.show !== false);
  const isLeftAxisVisible = (props.yAxis?.show ?? true) !== false;
  const leftAxisPadding = isLeftAxisVisible ? 44 : 16;
  const rightAxisPadding = hasRightAxis ? 44 : 16;

  const basePadding = {
    top: props.padding?.top ?? 16,
    right: props.padding?.right ?? rightAxisPadding,
    bottom: props.padding?.bottom ?? 36,
    left: props.padding?.left ?? leftAxisPadding,
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

  const yAxisValues = new Map<string, number[]>();
  const pushYAxisValue = (axisId: string, value: number) => {
    const list = yAxisValues.get(axisId) ?? [];
    list.push(value);
    yAxisValues.set(axisId, list);
  };
  props.series.forEach((series) => {
    const axisId = getSeriesYAxisId(series);
    props.data.forEach((datum, index) => {
      const value = series.y(datum, index);
      if (typeof value === 'number' && Number.isFinite(value)) pushYAxisValue(axisId, value);
    });
  });
  if (stackedBarSeries.length > 0) {
    const stackTotals = new Map<string, { pos: number; neg: number; axisId: string }>();
    stackedBarSeries.forEach((series) => {
      const stackId = String(series.stackId);
      const axisId = getSeriesYAxisId(series);
      props.data.forEach((datum, index) => {
        const value = series.y(datum, index);
        if (typeof value !== 'number' || !Number.isFinite(value)) return;
        const key = `${axisId}:${stackId}:${index}`;
        const prev = stackTotals.get(key) ?? { pos: 0, neg: 0, axisId };
        if (value >= 0) {
          prev.pos += value;
        } else {
          prev.neg += value;
        }
        stackTotals.set(key, prev);
      });
    });
    stackTotals.forEach((total) => {
      pushYAxisValue(total.axisId, total.pos);
      pushYAxisValue(total.axisId, total.neg);
    });
  }
  const resolveYAxisOptions = (axisId: string) => (axisId === defaultYAxisId ? props.yAxis : props.yAxes?.[axisId]);
  const yScaleByAxis = new Map<string, ReturnType<typeof scaleLinear<number>>>();
  const yDomainByAxis = new Map<string, { min: number; max: number }>();
  const allAxisIds = new Set<string>([defaultYAxisId]);
  props.series.forEach((series) => allAxisIds.add(getSeriesYAxisId(series)));
  rightAxisEntries.forEach(([axisId]) => allAxisIds.add(axisId));

  allAxisIds.forEach((axisId) => {
    const values = yAxisValues.get(axisId) ?? [];
    const minYFromData = values.length ? Math.min(...values, 0) : 0;
    const maxYFromData = values.length ? Math.max(...values) : 1;
    const axisOptions = resolveYAxisOptions(axisId);
    const minY = typeof axisOptions?.min === 'number' ? axisOptions.min : minYFromData;
    const maxYCandidate = typeof axisOptions?.max === 'number' ? axisOptions.max : maxYFromData;
    const maxY = maxYCandidate <= minY ? minY + 1 : maxYCandidate;
    yDomainByAxis.set(axisId, { min: minY, max: maxY });
    yScaleByAxis.set(axisId, scaleLinear<number>({
      domain: [minY, maxY],
      range: [innerHeight, 0],
      nice: true,
    }));
  });
  const yScale = yScaleByAxis.get(defaultYAxisId)
    ?? scaleLinear<number>({ domain: [0, 1], range: [innerHeight, 0], nice: true });
  const leftDomain = yDomainByAxis.get(defaultYAxisId) ?? { min: 0, max: 1 };
  const valueXScale = scaleLinear<number>({
    domain: [leftDomain.min, leftDomain.max],
    range: [0, innerWidth],
    nice: true,
  });
  const yBand = scaleBand<string>({
    domain: xValues.map((value) => String(value)),
    range: [0, innerHeight],
    padding: 0.22,
  });
  const xAxisTop =
    props.xAxis?.position === 'top'
      ? 0
      : props.xAxis?.position === 'zero' && leftDomain.min < 0 && leftDomain.max > 0
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
            : Number((yScaleByAxis.get(getSeriesYAxisId(series)) ?? yScale)(y)),
          value: y,
          yAxisId: getSeriesYAxisId(series),
        });
      });
      map.set(series.id, points);
    });
    return map;
  }, [barOrientation, getSeriesYAxisId, getX, props.data, props.series, props.x, valueXScale, yBand, yScale, yScaleByAxis]);

  const groupedBarWidth = allCategory
    ? Math.max(4, (xBand.bandwidth() / Math.max(1, groupedBarSeries.length)) * 0.92)
    : 14;
  const stackedBarWidth = allCategory
    ? Math.max(4, xBand.bandwidth() * 0.92)
    : 14;
  const groupedBarHeight = Math.max(4, (yBand.bandwidth() / Math.max(1, groupedBarSeries.length)) * 0.92);
  const stackedBarHeight = Math.max(4, yBand.bandwidth() * 0.92);
  const clampLabelX = (x: number) => Math.max(6, Math.min(innerWidth - 6, x));
  const clampLabelY = (y: number) => Math.max(10, Math.min(innerHeight - 4, y));
  const placedLabelRows = new Map<number, number[]>();
  const placedLabelRects: Array<{ left: number; right: number; top: number; bottom: number }> = [];
  const resolveLabelPlacement = (
    x: number,
    y: number,
    opts?: {
      label?: string;
      fontSize?: number;
      textAnchor?: 'start' | 'middle' | 'end';
      verticalAnchor?: 'start' | 'middle' | 'end';
    },
  ) => {
    const clampedX = clampLabelX(x);
    const baseY = clampLabelY(y);
    if (!props.avoidValueLabelOverlap) return { x: clampedX, y: baseY, hidden: false };
    const bucket = Math.round(clampedX / 8);
    const rows = placedLabelRows.get(bucket) ?? [];
    const offsets = [0, -12, 12, -24, 24];
    for (const offset of offsets) {
      const candidateY = clampLabelY(baseY + offset);
      const isOverlap = rows.some((rowY) => Math.abs(rowY - candidateY) < 10);
      if (isOverlap) continue;
      if (opts?.label) {
        const fontSize = opts.fontSize ?? 11;
        const estimatedWidth = Math.max(12, opts.label.length * fontSize * 0.58);
        const estimatedHeight = fontSize + 4;
        const textAnchor = opts.textAnchor ?? 'middle';
        const verticalAnchor = opts.verticalAnchor ?? 'end';
        const left =
          textAnchor === 'middle' ? clampedX - estimatedWidth / 2 : textAnchor === 'end' ? clampedX - estimatedWidth : clampedX;
        const top =
          verticalAnchor === 'middle'
            ? candidateY - estimatedHeight / 2
            : verticalAnchor === 'start'
              ? candidateY
              : candidateY - estimatedHeight;
        const rect = {
          left,
          right: left + estimatedWidth,
          top,
          bottom: top + estimatedHeight,
        };
        const hasRectOverlap = placedLabelRects.some(
          (placed) =>
            rect.left < placed.right &&
            rect.right > placed.left &&
            rect.top < placed.bottom &&
            rect.bottom > placed.top,
        );
        if (hasRectOverlap) continue;
        placedLabelRects.push(rect);
      }
      if (!isOverlap) {
        rows.push(candidateY);
        placedLabelRows.set(bucket, rows);
        return { x: clampedX, y: candidateY, hidden: false };
      }
    }
    return { x: clampedX, y: baseY, hidden: true };
  };

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
            const seriesYScale = yScaleByAxis.get(getSeriesYAxisId(series)) ?? yScale;
            const yStart = Number(seriesYScale(start));
            const yEnd = Number(seriesYScale(end));
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
    const tooltipX = Math.max(
      TOOLTIP_MARGIN,
      Math.min(props.width - TOOLTIP_MAX_WIDTH - TOOLTIP_MARGIN, padding.left + bestAnchorX + 12),
    );
    const tooltipY = Math.max(
      TOOLTIP_MARGIN,
      Math.min(props.height - 52, padding.top + bestAnchorY - 44),
    );
    setTooltip({
      x: tooltipX,
      y: tooltipY,
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
    getSeriesYAxisId,
    padding.left,
    padding.top,
    pointsBySeries,
    props.series,
    props.width,
    props.height,
    tooltipOptions.enabled,
    valueXScale,
    xBand,
    yBand,
    yScale,
    yScaleByAxis,
  ]);

  return (
    <div className="gen-chart-root" style={{ width: props.width, height: props.height, background: tokens.color.background }}>
      {legend.enabled && legend.position === 'top' ? (
        <div className="gen-chart-legend" style={{ justifyContent: legendJustify(legend.align) }}>
          {props.series.map((series) => (
            <span key={series.id} className="gen-chart-legend-item">
              <i style={{ background: typeof series.color === 'string' ? series.color : colorScale(series.id) }} />
              {series.label ?? series.id}
            </span>
          ))}
        </div>
      ) : null}
      <svg width={props.width} height={props.height} role="img" style={{ display: 'block', overflow: 'hidden' }}>
        <Group left={padding.left} top={padding.top}>
          {grid.show ? (
            <GridRows
              scale={yScale}
              width={innerWidth}
              stroke={tokens.color.grid}
              strokeWidth={tokens.border.gridWidth}
              numTicks={resolveYAxisOptions(defaultYAxisId)?.tickCount ?? 5}
            />
          ) : null}

          {(() => {
            const stackAcc = new Map<string, { pos: number; neg: number }>();
            return props.series.map((series) => {
            const points = pointsBySeries.get(series.id) ?? [];
            const color = typeof series.color === 'string' ? series.color : colorScale(series.id);
            const seriesStrokeWidth = series.strokeWidth ?? tokens.border.seriesStrokeWidth;
            const seriesStrokeColor = series.strokeColor ?? tokens.border.seriesStrokeColor ?? color;
            const seriesNegativeStrokeColor =
              series.strokeColor ?? tokens.border.seriesStrokeColor ?? (series.negativeColor ?? '#dc2626');
            const resolveBarFill = (point: Point<T>) => {
              if (point.value < 0) return series.negativeColor ?? '#dc2626';
              if (typeof series.color === 'function') return series.color(point.value, point.datum, point.index);
              return color;
            };
            const getValueLabel = (point: Point<T>) =>
              series.valueLabelFormatter?.(point.value, point.datum, point.index) ?? new Intl.NumberFormat('ko-KR').format(point.value);
            const shouldShowValueLabel = (point: Point<T>) =>
              Boolean(series.showValueLabel) && !(series.hideZeroValueLabel && point.value === 0);
            const resolveValueLabelStyle = (point: Point<T>) => {
              const rawStyle =
                typeof series.valueLabelStyle === 'function'
                  ? series.valueLabelStyle(point.value, point.datum, point.index)
                  : series.valueLabelStyle;
              return {
                fill: rawStyle?.color ?? tokens.color.textMuted,
                fontSize: rawStyle?.fontSize ?? 11,
                fontWeight: rawStyle?.fontWeight,
                opacity: rawStyle?.opacity,
              };
            };
            const labelOffsetY = series.valueLabelOffsetY ?? -8;
            if (series.type === 'line') {
              return (
                <React.Fragment key={series.id}>
                  <LinePath<Point<T>>
                    data={points}
                    x={(d: Point<T>) => d.x}
                    y={(d: Point<T>) => d.y}
                    curve={resolveSeriesCurve(series.curve)}
                    stroke={seriesStrokeColor}
                    strokeWidth={seriesStrokeWidth}
                  />
                  {series.showValueLabel ? points.map((point) => (
                    (() => {
                      if (!shouldShowValueLabel(point)) return null;
                      const placement = resolveLabelPlacement(point.x, point.y + labelOffsetY);
                      if (placement.hidden) return null;
                      const labelStyle = resolveValueLabelStyle(point);
                      return (
                    <Text
                      key={`${series.id}-value-${point.index}`}
                      y={placement.y}
                      x={placement.x}
                      textAnchor="middle"
                      verticalAnchor="end"
                      fill={labelStyle.fill}
                      fontSize={labelStyle.fontSize}
                      fontWeight={labelStyle.fontWeight}
                      opacity={labelStyle.opacity}
                    >
                      {getValueLabel(point)}
                    </Text>
                      );
                    })()
                  )) : null}
                </React.Fragment>
              );
            }
            if (series.type === 'area') {
              return (
                <React.Fragment key={series.id}>
                  <AreaClosed<Point<T>>
                    data={points}
                    x={(d: Point<T>) => d.x}
                    y={(d: Point<T>) => d.y}
                    yScale={yScale}
                    curve={resolveSeriesCurve(series.curve)}
                    fill={color}
                    fillOpacity={0.24}
                    stroke={seriesStrokeColor}
                    strokeWidth={seriesStrokeWidth}
                  />
                  {series.showValueLabel ? points.map((point) => (
                    (() => {
                      if (!shouldShowValueLabel(point)) return null;
                      const placement = resolveLabelPlacement(point.x, point.y + labelOffsetY);
                      if (placement.hidden) return null;
                      const labelStyle = resolveValueLabelStyle(point);
                      return (
                    <Text
                      key={`${series.id}-value-${point.index}`}
                      y={placement.y}
                      x={placement.x}
                      textAnchor="middle"
                      verticalAnchor="end"
                      fill={labelStyle.fill}
                      fontSize={labelStyle.fontSize}
                      fontWeight={labelStyle.fontWeight}
                      opacity={labelStyle.opacity}
                    >
                      {getValueLabel(point)}
                    </Text>
                      );
                    })()
                  )) : null}
                </React.Fragment>
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
                        <React.Fragment key={`${series.id}-${point.index}`}>
                          <Bar
                            x={Math.min(xStart, xEnd)}
                            y={y}
                            width={barWidth}
                            height={stackedBarHeight}
                            fill={resolveBarFill(point)}
                            stroke={
                              value < 0 ? seriesNegativeStrokeColor : seriesStrokeColor
                            }
                            strokeWidth={seriesStrokeWidth}
                            opacity={0.9}
                          />
                          {(() => {
                            if (!shouldShowValueLabel(point)) return null;
                            const labelStyle = resolveValueLabelStyle(point);
                            const label = getValueLabel(point);
                            const placement = resolveLabelPlacement(
                              Math.max(xStart, xEnd) + 4,
                              point.y + (series.valueLabelOffsetY ?? 0),
                              {
                                label,
                                fontSize: Number(labelStyle.fontSize ?? 11),
                                textAnchor: 'start',
                                verticalAnchor: 'middle',
                              },
                            );
                            if (placement.hidden) return null;
                            return (
                              <Text x={placement.x} y={placement.y} verticalAnchor="middle" fill={labelStyle.fill} fontSize={labelStyle.fontSize} fontWeight={labelStyle.fontWeight} opacity={labelStyle.opacity}>
                                {label}
                              </Text>
                            );
                          })()}
                        </React.Fragment>
                      );
                    }

                    const seriesYScale = yScaleByAxis.get(point.yAxisId) ?? yScale;
                    const yStart = Number(seriesYScale(start));
                    const yEnd = Number(seriesYScale(end));
                    const barHeight = Math.max(1, Math.abs(yEnd - yStart));
                    const x = allCategory
                      ? point.x - stackedBarWidth / 2
                      : point.x - stackedBarWidth / 2;

                    return (
                      <React.Fragment key={`${series.id}-${point.index}`}>
                        <Bar
                          x={x}
                          y={Math.min(yStart, yEnd)}
                          width={stackedBarWidth}
                          height={barHeight}
                          fill={resolveBarFill(point)}
                          stroke={
                            value < 0 ? seriesNegativeStrokeColor : seriesStrokeColor
                          }
                          strokeWidth={seriesStrokeWidth}
                          opacity={0.9}
                        />
                        {(() => {
                          if (!shouldShowValueLabel(point)) return null;
                          const isNegative = value < 0;
                          const labelY =
                            (isNegative ? Math.max(yStart, yEnd) + 12 : Math.min(yStart, yEnd) - 4) +
                            (series.valueLabelOffsetY ?? 0);
                          const labelStyle = resolveValueLabelStyle(point);
                          const label = getValueLabel(point);
                          const placement = resolveLabelPlacement(x + stackedBarWidth / 2, labelY, {
                            label,
                            fontSize: Number(labelStyle.fontSize ?? 11),
                            textAnchor: 'middle',
                            verticalAnchor: isNegative ? 'start' : 'end',
                          });
                          if (placement.hidden) return null;
                          return (
                            <Text
                              x={placement.x}
                              y={placement.y}
                              textAnchor="middle"
                              verticalAnchor={isNegative ? 'start' : 'end'}
                              fill={labelStyle.fill}
                              fontSize={labelStyle.fontSize}
                              fontWeight={labelStyle.fontWeight}
                              opacity={labelStyle.opacity}
                            >
                              {label}
                            </Text>
                          );
                        })()}
                      </React.Fragment>
                    );
                  }

                  if (barOrientation === 'horizontal') {
                    const zeroX = Number(valueXScale(0));
                    const barWidth = Math.max(1, Math.abs(zeroX - point.x));
                    const y = point.y - (yBand.bandwidth() / 2) + barIndex * groupedBarHeight;
                    return (
                      <React.Fragment key={`${series.id}-${point.index}`}>
                        <Bar
                          x={Math.min(zeroX, point.x)}
                          y={y}
                          width={barWidth}
                          height={groupedBarHeight}
                          fill={resolveBarFill(point)}
                          stroke={
                            point.value < 0 ? seriesNegativeStrokeColor : seriesStrokeColor
                          }
                          strokeWidth={seriesStrokeWidth}
                          opacity={0.9}
                        />
                        {(() => {
                          if (!shouldShowValueLabel(point)) return null;
                          const labelStyle = resolveValueLabelStyle(point);
                          const label = getValueLabel(point);
                          const placement = resolveLabelPlacement(
                            Math.max(zeroX, point.x) + 4,
                            y + groupedBarHeight / 2 + (series.valueLabelOffsetY ?? 0),
                            {
                              label,
                              fontSize: Number(labelStyle.fontSize ?? 11),
                              textAnchor: 'start',
                              verticalAnchor: 'middle',
                            },
                          );
                          if (placement.hidden) return null;
                          return (
                            <Text x={placement.x} y={placement.y} verticalAnchor="middle" fill={labelStyle.fill} fontSize={labelStyle.fontSize} fontWeight={labelStyle.fontWeight} opacity={labelStyle.opacity}>
                              {label}
                            </Text>
                          );
                        })()}
                      </React.Fragment>
                    );
                  }

                  const x = allCategory
                    ? point.x - (xBand.bandwidth() / 2) + barIndex * groupedBarWidth
                    : point.x - groupedBarWidth / 2;
                  const seriesYScale = yScaleByAxis.get(point.yAxisId) ?? yScale;
                  const zeroY = Number(seriesYScale(0));
                  const barHeight = Math.max(1, Math.abs(zeroY - point.y));
                  return (
                    <React.Fragment key={`${series.id}-${point.index}`}>
                      <Bar
                        x={x}
                        y={Math.min(zeroY, point.y)}
                        width={groupedBarWidth}
                        height={barHeight}
                        fill={resolveBarFill(point)}
                        stroke={
                          point.value < 0 ? seriesNegativeStrokeColor : seriesStrokeColor
                        }
                        strokeWidth={seriesStrokeWidth}
                        opacity={0.9}
                      />
                      {(() => {
                        if (!shouldShowValueLabel(point)) return null;
                        const isNegative = point.value < 0;
                        const labelY =
                          (isNegative ? Math.max(zeroY, point.y) + 12 : Math.min(zeroY, point.y) - 4) +
                          (series.valueLabelOffsetY ?? 0);
                        const labelStyle = resolveValueLabelStyle(point);
                        const label = getValueLabel(point);
                        const placement = resolveLabelPlacement(x + groupedBarWidth / 2, labelY, {
                          label,
                          fontSize: Number(labelStyle.fontSize ?? 11),
                          textAnchor: 'middle',
                          verticalAnchor: isNegative ? 'start' : 'end',
                        });
                        if (placement.hidden) return null;
                        return (
                          <Text
                            x={placement.x}
                            y={placement.y}
                            textAnchor="middle"
                            verticalAnchor={isNegative ? 'start' : 'end'}
                            fill={labelStyle.fill}
                            fontSize={labelStyle.fontSize}
                            fontWeight={labelStyle.fontWeight}
                            opacity={labelStyle.opacity}
                          >
                            {label}
                          </Text>
                        );
                      })()}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            );
            });
          })()}

          {props.xAxis?.show !== false ? (
            barOrientation !== 'horizontal' && props.xAxis?.position === 'top' ? (
              <AxisTop
                top={0}
                scale={allCategory ? xBand : xLinear}
                hideTicks={props.xAxis?.showTicks === false}
                stroke={tokens.color.axis}
                tickStroke={tokens.color.axis}
                tickLabelProps={() => ({
                  fill: tokens.color.textMuted,
                  fontSize: tokens.typography.axisTickFontSize,
                  textAnchor: 'middle',
                })}
                numTicks={props.xAxis?.tickCount}
                tickFormat={props.xAxis?.tickFormat as ((value: any) => string) | undefined}
              />
            ) : (
              <AxisBottom
                top={barOrientation === 'horizontal' ? innerHeight : xAxisTop}
                scale={barOrientation === 'horizontal' ? valueXScale : (allCategory ? xBand : xLinear)}
                hideTicks={barOrientation === 'horizontal' ? props.yAxis?.showTicks === false : props.xAxis?.showTicks === false}
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
            )
          ) : null}

          {resolveYAxisOptions(defaultYAxisId)?.show !== false ? (
            <AxisLeft
              scale={barOrientation === 'horizontal' ? yBand : yScale}
              hideTicks={barOrientation === 'horizontal' ? props.xAxis?.showTicks === false : resolveYAxisOptions(defaultYAxisId)?.showTicks === false}
              stroke={tokens.color.axis}
              tickStroke={tokens.color.axis}
              tickLabelProps={() => ({
                fill: tokens.color.textMuted,
                fontSize: tokens.typography.axisTickFontSize,
                textAnchor: 'end',
              })}
              numTicks={barOrientation === 'horizontal' ? undefined : (resolveYAxisOptions(defaultYAxisId)?.tickCount ?? 5)}
              tickFormat={
                (barOrientation === 'horizontal' ? props.xAxis?.tickFormat : resolveYAxisOptions(defaultYAxisId)?.tickFormat) as
                  | ((value: any) => string)
                  | undefined
              }
            />
          ) : null}

          {barOrientation !== 'horizontal'
            ? rightAxisEntries
              .filter(([, axis]) => axis.show !== false)
              .map(([axisId, axis]) => (
                <AxisRight
                  key={`right-axis-${axisId}`}
                  left={innerWidth}
                  scale={yScaleByAxis.get(axisId) ?? yScale}
                  hideTicks={axis.showTicks === false}
                  stroke={tokens.color.axis}
                  tickStroke={tokens.color.axis}
                  tickLabelProps={() => ({
                    fill: tokens.color.textMuted,
                    fontSize: tokens.typography.axisTickFontSize,
                    textAnchor: 'start',
                  })}
                  numTicks={axis.tickCount ?? 5}
                  tickFormat={axis.tickFormat as ((value: any) => string) | undefined}
                />
              ))
            : null}

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
              <i style={{ background: typeof series.color === 'string' ? series.color : colorScale(series.id) }} />
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
