import type { GenGridContextMenuActionContext } from '@gen-office/gen-grid';

export type RangeChartSeries = {
  id: string;
  label: string;
};

export type BarSeriesLayout = 'grouped' | 'stacked' | 'stacked100';
export type RangeChartKind = 'column' | 'bar' | 'line' | 'area' | 'pie' | 'donut';

export type RangeChartRow = {
  label: string;
  [seriesId: string]: string | number | undefined;
};

export type RangeChartModel = {
  title: string;
  rows: RangeChartRow[];
  series: RangeChartSeries[];
  categoryHeader: string;
  barSeriesLayout: BarSeriesLayout;
};

export type RangeChartBuildResult =
  | { ok: true; model: RangeChartModel }
  | { ok: false; message: string };

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/,/g, '');
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function buildRangeChartModel<TData>(
  ctx: GenGridContextMenuActionContext<TData>,
  options?: {
    categoryColumnIndex?: number;
    barSeriesLayout?: BarSeriesLayout;
    messageWhenInvalid?: string;
  }
): RangeChartBuildResult {
  if (!ctx.bounds || ctx.matrix.length === 0 || ctx.bounds.columnIds.length < 2) {
    return {
      ok: false,
      message:
        options?.messageWhenInvalid ??
        'Select at least 2 columns including one numeric column.',
    };
  }

  const categoryColumnIndex = options?.categoryColumnIndex ?? 0;
  if (categoryColumnIndex < 0 || categoryColumnIndex >= ctx.bounds.columnIds.length) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'Invalid chart category column index.',
    };
  }

  const headerByColumnId = new Map<string, string>();
  for (const cell of ctx.cells) {
    if (!headerByColumnId.has(cell.columnId)) {
      headerByColumnId.set(cell.columnId, cell.columnHeader);
    }
  }

  const numericColumns = ctx.bounds.columnIds
    .map((columnId, index) => ({ columnId, index }))
    .filter(({ index }) => index !== categoryColumnIndex)
    .filter(({ index }) => ctx.matrix.some((row) => toFiniteNumber(row[index]) != null));

  if (numericColumns.length === 0) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'No numeric column found in selected range.',
    };
  }

  const series: RangeChartSeries[] = numericColumns.map(({ columnId }) => ({
    id: columnId,
    label: headerByColumnId.get(columnId) ?? columnId,
  }));
  const barSeriesLayout = options?.barSeriesLayout ?? 'grouped';

  const rows: RangeChartRow[] = [];
  for (let rowIndex = 0; rowIndex < ctx.matrix.length; rowIndex++) {
    const row = ctx.matrix[rowIndex] ?? [];
    const label =
      String(row[categoryColumnIndex] ?? `Row ${rowIndex + 1}`).trim() || `Row ${rowIndex + 1}`;

    const chartRow: RangeChartRow = { label };
    let hasAnyNumeric = false;
    for (const numericCol of numericColumns) {
      const value = toFiniteNumber(row[numericCol.index]);
      if (value == null) continue;
      chartRow[numericCol.columnId] = value;
      hasAnyNumeric = true;
    }

    if (hasAnyNumeric) {
      rows.push(chartRow);
    }
  }

  if (rows.length === 0) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'No numeric values found in selected range.',
    };
  }

  const categoryHeader =
    headerByColumnId.get(ctx.bounds.columnIds[categoryColumnIndex] ?? '') ?? 'Category';
  if (barSeriesLayout === 'stacked100') {
    for (const row of rows) {
      let sum = 0;
      for (const item of series) {
        const value = row[item.id];
        if (typeof value === 'number' && Number.isFinite(value)) {
          sum += value;
        }
      }
      if (!Number.isFinite(sum) || sum === 0) {
        for (const item of series) row[item.id] = 0;
        continue;
      }
      for (const item of series) {
        const value = row[item.id];
        const normalized =
          typeof value === 'number' && Number.isFinite(value) ? (value / sum) * 100 : 0;
        row[item.id] = Math.round(normalized * 100) / 100;
      }
    }
  }

  const seriesLabel = series.map((item) => item.label).join(', ');
  const layoutLabel =
    barSeriesLayout === 'grouped'
      ? 'Grouped'
      : barSeriesLayout === 'stacked'
        ? 'Stacked'
        : '100% Stacked';

  return {
    ok: true,
    model: {
      title: `${seriesLabel} by ${categoryHeader} (${layoutLabel})`,
      rows,
      series,
      categoryHeader,
      barSeriesLayout,
    },
  };
}
