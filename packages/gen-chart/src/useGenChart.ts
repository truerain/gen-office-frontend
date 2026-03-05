import * as React from 'react';
import {
  ChartLegendOptions,
  GenChartNearestDatum,
  UseGenChartOptions,
  UseGenChartResult,
} from './types';
import {
  buildXDomainFromMeta,
  buildXMeta,
  buildYDomain,
  applySeriesPolicy,
  createInitialVisibilityMap,
  getNearestPoint,
  isCartesianSeries,
  warnChartDevIssues,
} from './model';
import { resolveChartTokens } from './tokens';

function valueToNumber(value: string | number | Date): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return Number.NaN;
}

function resolveLegendOptions(legend: boolean | ChartLegendOptions | undefined) {
  if (legend === false) {
    return {
      enabled: false,
      position: 'top' as const,
      align: 'start' as const,
      reserveSpace: false,
    };
  }
  if (legend === true || legend === undefined) {
    return {
      enabled: legend === true,
      position: 'top' as const,
      align: 'start' as const,
      reserveSpace: true,
    };
  }
  return {
    enabled: legend.enabled !== false,
    position: legend.position ?? 'top',
    align: legend.align ?? 'start',
    reserveSpace: legend.reserveSpace ?? true,
  };
}

export function useGenChart<TDatum>(options: UseGenChartOptions<TDatum>): UseGenChartResult<TDatum> {
  const [visibilityMap, setVisibilityMap] = React.useState<Record<string, boolean>>(() =>
    createInitialVisibilityMap(options.series)
  );

  React.useEffect(() => {
    setVisibilityMap(createInitialVisibilityMap(options.series));
  }, [options.series]);

  const padding = React.useMemo(
    () => {
      const tokens = resolveChartTokens(options.theme, options.tokens);
      return {
        top: options.padding?.top ?? tokens.spacing.paddingTop,
        right: options.padding?.right ?? tokens.spacing.paddingRight,
        bottom: options.padding?.bottom ?? tokens.spacing.paddingBottom,
        left: options.padding?.left ?? tokens.spacing.paddingLeft,
      };
    },
    [options.padding, options.theme, options.tokens]
  );

  const tokens = React.useMemo(
    () => resolveChartTokens(options.theme, options.tokens),
    [options.theme, options.tokens]
  );

  const legend = React.useMemo(
    () => resolveLegendOptions(options.interactive?.legend),
    [options.interactive?.legend]
  );

  const legendBandSize = React.useMemo(() => {
    if (!legend.enabled || !legend.reserveSpace) return 0;
    if (legend.position !== 'top' && legend.position !== 'bottom') return 0;
    return tokens.spacing.legendMarkerSize + tokens.typography.legendFontSize + 8;
  }, [legend, tokens.spacing.legendMarkerSize, tokens.typography.legendFontSize]);

  const width = Math.max(0, options.width);
  const height = Math.max(0, options.height);
  const adjustedPadding = React.useMemo(() => {
    if (legendBandSize <= 0) return padding;
    if (legend.position === 'top') {
      return { ...padding, top: padding.top + legendBandSize };
    }
    if (legend.position === 'bottom') {
      return { ...padding, bottom: padding.bottom + legendBandSize };
    }
    return padding;
  }, [legend.position, legendBandSize, padding]);

  const innerWidth = Math.max(0, width - adjustedPadding.left - adjustedPadding.right);
  const innerHeight = Math.max(0, height - adjustedPadding.top - adjustedPadding.bottom);

  const seriesPolicy = React.useMemo(
    () => applySeriesPolicy(options.series),
    [options.series]
  );

  const visibleSeries = React.useMemo(
    () =>
      seriesPolicy.uniqueSeries.filter(
        (item) => visibilityMap[item.id] !== false && !seriesPolicy.invalidNoFiniteYIds.has(item.id)
      ),
    [seriesPolicy, visibilityMap]
  );

  const visibleCartesian = React.useMemo(
    () => visibleSeries.filter(isCartesianSeries),
    [visibleSeries]
  );

  const xMeta = React.useMemo(() => buildXMeta(visibleCartesian), [visibleCartesian]);
  const xDomain = React.useMemo(() => buildXDomainFromMeta(xMeta), [xMeta]);
  const yDomain = React.useMemo(() => buildYDomain(options, visibleCartesian), [options, visibleCartesian]);

  const xToPx = React.useCallback(
    (value: string | number | Date) => {
      if (innerWidth <= 0) return adjustedPadding.left;
      const left = adjustedPadding.left;
      if (xMeta.kind === 'category') {
        const key = String(value);
        const index = xMeta.categoryIndexByKey[key] ?? 0;
        const count = Math.max(1, xMeta.categories.length);
        return left + ((index + 0.5) / count) * innerWidth;
      }
      const raw = valueToNumber(value);
      if (!Number.isFinite(raw)) return left;
      const range = xMeta.maxValue - xMeta.minValue || 1;
      return left + ((raw - xMeta.minValue) / range) * innerWidth;
    },
    [adjustedPadding.left, innerWidth, xMeta]
  );

  const yToPx = React.useCallback(
    (value: number) => {
      if (innerHeight <= 0) return adjustedPadding.top + innerHeight;
      const top = adjustedPadding.top;
      const [minY, maxY] = yDomain;
      const range = maxY - minY || 1;
      return top + innerHeight - ((value - minY) / range) * innerHeight;
    },
    [adjustedPadding.top, innerHeight, yDomain]
  );

  const nearestCandidates = React.useMemo(() => {
    const points: GenChartNearestDatum<TDatum>[] = [];
    for (const series of visibleCartesian) {
      for (let i = 0; i < series.data.length; i += 1) {
        const datum = series.data[i];
        const yValue = series.y(datum, i);
        if (typeof yValue !== 'number' || !Number.isFinite(yValue)) continue;
        const xValue = series.x(datum, i);
        points.push({
          seriesId: series.id,
          datum,
          x: xToPx(xValue),
          y: yToPx(yValue),
        });
      }
    }
    return points;
  }, [visibleCartesian, xToPx, yToPx]);

  const toggleSeries = React.useCallback((seriesId: string) => {
    setVisibilityMap((prev) => ({ ...prev, [seriesId]: !(prev[seriesId] ?? true) }));
  }, []);

  const setSeriesVisibility = React.useCallback((seriesId: string, visible: boolean) => {
    setVisibilityMap((prev) => ({ ...prev, [seriesId]: visible }));
  }, []);

  React.useEffect(() => {
    warnChartDevIssues(options, { width: options.width, height: options.height });
  }, [options.series, options.width, options.height]);

  const getNearestDatum = React.useCallback(
    (xPx: number, yPx: number) => getNearestPoint(nearestCandidates, xPx, yPx),
    [nearestCandidates]
  );

  return {
    options,
    visibleSeries,
    xDomain,
    yDomain,
    toggleSeries,
    setSeriesVisibility,
    getNearestDatum,
    width,
    height,
    innerWidth,
    innerHeight,
    padding: adjustedPadding,
    xMeta,
    xToPx,
    yToPx,
    tokens,
    legend: {
      enabled: legend.enabled,
      position: legend.position,
      align: legend.align,
      reserveSpace: legend.reserveSpace,
      bandSize: legendBandSize,
    },
    seriesMeta: {
      uniqueSeries: seriesPolicy.uniqueSeries,
      duplicateSeriesIds: seriesPolicy.duplicateSeriesIds,
      invalidNoFiniteYIds: seriesPolicy.invalidNoFiniteYIds,
    },
  };
}
