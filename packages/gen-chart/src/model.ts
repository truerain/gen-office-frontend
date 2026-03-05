import {
  ChartSeries,
  ChartSeriesBase,
  ChartXKind,
  ChartXMeta,
  GenChartModel,
  GenChartNearestDatum,
  GenChartOptions,
} from './types';

type CartesianSeries<TDatum> = Extract<ChartSeries<TDatum>, { x: unknown; y: unknown }>;

export function isPieSeries<TDatum>(
  series: ChartSeries<TDatum>
): series is Extract<ChartSeries<TDatum>, { type: 'pie' | 'donut' }> {
  return series.type === 'pie' || series.type === 'donut';
}

export function isCartesianSeries<TDatum>(series: ChartSeries<TDatum>): series is CartesianSeries<TDatum> {
  return (
    series.type === 'line' ||
    series.type === 'bar' ||
    series.type === 'area' ||
    series.type === 'composed'
  );
}

export function makeDefaultPadding() {
  return {
    top: 12,
    right: 16,
    bottom: 30,
    left: 42,
  };
}

export function createInitialVisibilityMap<TDatum>(series: ChartSeries<TDatum>[]) {
  const map: Record<string, boolean> = {};
  for (const item of series) {
    if (map[item.id] !== undefined) continue;
    map[item.id] = item.hidden !== true;
  }
  return map;
}

export function getVisibleSeries<TDatum>(
  series: ChartSeries<TDatum>[],
  visibilityMap: Record<string, boolean>
) {
  const seen = new Set<string>();
  return series.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return visibilityMap[item.id] !== false;
  });
}

function inferXKind<TDatum>(series: CartesianSeries<TDatum>[]): ChartXKind {
  for (const s of series) {
    for (let i = 0; i < s.data.length; i += 1) {
      const xValue = s.x(s.data[i], i);
      if (xValue instanceof Date) return 'date';
      if (typeof xValue === 'number') return 'number';
      if (typeof xValue === 'string') return 'category';
    }
  }
  return 'category';
}

function toNumericX(value: string | number | Date): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return Number.NaN;
}

export function buildXMeta<TDatum>(series: CartesianSeries<TDatum>[]): ChartXMeta {
  const kind = inferXKind(series);

  if (kind === 'category') {
    const categories: string[] = [];
    const seen = new Set<string>();
    for (const s of series) {
      for (let i = 0; i < s.data.length; i += 1) {
        const key = String(s.x(s.data[i], i));
        if (!seen.has(key)) {
          seen.add(key);
          categories.push(key);
        }
      }
    }
    const categoryIndexByKey = Object.fromEntries(categories.map((value, index) => [value, index]));
    return {
      kind,
      categories,
      categoryIndexByKey,
      minValue: 0,
      maxValue: Math.max(0, categories.length - 1),
    };
  }

  const values: number[] = [];
  for (const s of series) {
    for (let i = 0; i < s.data.length; i += 1) {
      const parsed = toNumericX(s.x(s.data[i], i));
      if (Number.isFinite(parsed)) values.push(parsed);
    }
  }

  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 1;
  return {
    kind,
    categories: [],
    categoryIndexByKey: {},
    minValue,
    maxValue: maxValue === minValue ? minValue + 1 : maxValue,
  };
}

export function buildYDomain<TDatum>(
  options: GenChartOptions<TDatum>,
  series: CartesianSeries<TDatum>[]
): [number, number] {
  const values: number[] = [];

  for (const s of series) {
    for (let i = 0; i < s.data.length; i += 1) {
      const y = s.y(s.data[i], i);
      if (typeof y === 'number' && Number.isFinite(y)) values.push(y);
    }
  }

  let min = values.length > 0 ? Math.min(...values) : 0;
  let max = values.length > 0 ? Math.max(...values) : 1;

  if (max === min) {
    max = min + 1;
  }

  const axisMin = options.yAxis?.min;
  const axisMax = options.yAxis?.max;
  if (typeof axisMin === 'number') min = axisMin;
  if (typeof axisMax === 'number') max = axisMax;
  if (max === min) max = min + 1;

  return [min, max];
}

export function buildXDomainFromMeta(meta: ChartXMeta): [unknown, unknown] {
  if (meta.kind === 'category') {
    return [meta.categories[0] ?? '', meta.categories[meta.categories.length - 1] ?? ''];
  }
  if (meta.kind === 'date') {
    return [new Date(meta.minValue), new Date(meta.maxValue)];
  }
  return [meta.minValue, meta.maxValue];
}

interface NearestPoint<TDatum> extends GenChartNearestDatum<TDatum> {
  dist2: number;
}

export function getNearestPoint<TDatum>(
  points: GenChartNearestDatum<TDatum>[],
  xPx: number,
  yPx: number
): GenChartNearestDatum<TDatum> | null {
  let nearest: NearestPoint<TDatum> | null = null;

  for (const point of points) {
    const dx = point.x - xPx;
    const dy = point.y - yPx;
    const dist2 = dx * dx + dy * dy;
    if (nearest === null || dist2 < nearest.dist2) {
      nearest = { ...point, dist2 };
    }
  }

  if (nearest === null) return null;
  const { dist2: _unused, ...rest } = nearest;
  return rest;
}

export function createGenChartModel<TDatum>(
  options: GenChartOptions<TDatum>
): GenChartModel<TDatum> {
  warnChartDevIssues(options);
  const visibilityMap = createInitialVisibilityMap(options.series);
  const visibleSeries = getVisibleSeries(options.series, visibilityMap);
  const visibleCartesian = visibleSeries.filter(isCartesianSeries);
  const xMeta = buildXMeta(visibleCartesian);
  const xDomain = buildXDomainFromMeta(xMeta);
  const yDomain = buildYDomain(options, visibleCartesian);

  const model: GenChartModel<TDatum> = {
    options,
    visibleSeries,
    xDomain,
    yDomain,
    toggleSeries(seriesId) {
      visibilityMap[seriesId] = !(visibilityMap[seriesId] ?? true);
    },
    setSeriesVisibility(seriesId, visible) {
      visibilityMap[seriesId] = visible;
    },
    getNearestDatum() {
      return null;
    },
  };

  return model;
}

export function getSeriesDisplayName<TDatum>(series: ChartSeriesBase<TDatum> | { id: string; label?: string }) {
  return series.label?.trim() || series.id;
}

function isDevRuntime() {
  const meta = import.meta as unknown as { env?: { DEV?: boolean; PROD?: boolean } };
  if (meta.env?.PROD === true) return false;
  if (meta.env?.DEV === true) return true;

  const g = globalThis as { process?: { env?: { NODE_ENV?: string } } };
  return g.process?.env?.NODE_ENV !== 'production';
}

function warnDev(code: string, message: string) {
  if (!isDevRuntime()) return;
  console.warn(`[gen-chart][${code}] ${message}`);
}

function isAllNullY<TDatum>(series: Extract<ChartSeries<TDatum>, { x: unknown; y: unknown }>) {
  let hasFinite = false;
  for (let i = 0; i < series.data.length; i += 1) {
    const value = series.y(series.data[i], i);
    if (typeof value === 'number' && Number.isFinite(value)) {
      hasFinite = true;
      break;
    }
  }
  return !hasFinite;
}

export function warnChartDevIssues<TDatum>(
  options: GenChartOptions<TDatum>,
  size?: { width: number; height: number }
) {
  if (options.series.length === 0) {
    warnDev('GC001_EMPTY_SERIES', 'series is empty. At least one series is recommended.');
  }

  if (size) {
    if (size.width <= 0) warnDev('GC002_INVALID_WIDTH', `width is ${size.width}. Chart may not render.`);
    if (size.height <= 0) warnDev('GC003_INVALID_HEIGHT', `height is ${size.height}. Chart may not render.`);
  }

  const idSet = new Set<string>();
  for (const series of options.series) {
    if (idSet.has(series.id)) {
      warnDev('GC004_DUPLICATE_SERIES_ID', `duplicate series.id detected: "${series.id}".`);
      continue;
    }
    idSet.add(series.id);
  }

  for (const series of options.series) {
    if (!isCartesianSeries(series)) continue;
    if (isAllNullY(series)) {
      warnDev('GC005_NO_FINITE_Y', `series "${series.id}" has no finite y values.`);
    }
  }
}
