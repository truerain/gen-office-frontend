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

function resolveColumnHeader<TData>(
  ctx: GenGridContextMenuActionContext<TData>,
  columnId: string
): string {
  const fromCells = ctx.cells.find((cell) => cell.columnId === columnId)?.columnHeader;
  if (fromCells) return fromCells;
  const column = ctx.table.getColumn(columnId);
  if (!column) return columnId;
  const header = column.columnDef.header;
  if (typeof header === 'string' || typeof header === 'number') {
    return String(header);
  }
  return columnId;
}

function areAllBoundsOnSameColumnWindow<TData>(ctx: GenGridContextMenuActionContext<TData>): boolean {
  if (ctx.boundsList.length <= 1) return true;
  const first = ctx.boundsList[0];
  if (!first) return true;
  return ctx.boundsList.every((bounds) => {
    if (bounds.columnIds.length !== first.columnIds.length) return false;
    return bounds.columnIds.every((columnId, idx) => columnId === first.columnIds[idx]);
  });
}

export function buildRangeChartModel<TData>(
  ctx: GenGridContextMenuActionContext<TData>,
  options?: {
    categoryColumnId?: string;
    categoryColumnIndex?: number;
    barSeriesLayout?: BarSeriesLayout;
    messageWhenInvalid?: string;
  }
): RangeChartBuildResult {
  if (!ctx.boundsList.length) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'Select at least one range first.',
    };
  }
  if (!areAllBoundsOnSameColumnWindow(ctx)) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'Select ranges that share the same column range.',
    };
  }

  const primaryBounds = ctx.boundsList[0]!;
  const selectedColumnIds = primaryBounds.columnIds;
  if (!selectedColumnIds.length) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'Select at least one numeric column.',
    };
  }

  const rows = ctx.table.getRowModel().rows;
  const sourceRows = ctx.boundsList.flatMap((bounds) =>
    rows.slice(bounds.rowMin, bounds.rowMax + 1)
  );
  if (!sourceRows.length) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'No rows available for chart.',
    };
  }

  const categoryColumnId = options?.categoryColumnId
    ? options.categoryColumnId
    : (() => {
        const categoryColumnIndex = options?.categoryColumnIndex ?? 0;
        if (categoryColumnIndex < 0 || categoryColumnIndex >= selectedColumnIds.length) {
          return null;
        }
        return selectedColumnIds[categoryColumnIndex]!;
      })();

  if (!categoryColumnId) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'Invalid chart category column index.',
    };
  }

  const categoryColumn = ctx.table.getColumn(categoryColumnId);
  if (!categoryColumn) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? `Category column "${categoryColumnId}" not found.`,
    };
  }

  const numericColumns = selectedColumnIds
    .filter((columnId) => columnId !== categoryColumnId)
    .filter((columnId) =>
      sourceRows.some((row) => toFiniteNumber(row.getValue(columnId)) != null)
    );

  if (numericColumns.length === 0) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'No numeric column found in selected range.',
    };
  }

  const series: RangeChartSeries[] = numericColumns.map((columnId) => ({
    id: columnId,
    label: resolveColumnHeader(ctx, columnId),
  }));

  const barSeriesLayout = options?.barSeriesLayout ?? 'grouped';
  const resultRows: RangeChartRow[] = [];
  for (let rowOffset = 0; rowOffset < sourceRows.length; rowOffset++) {
    const row = sourceRows[rowOffset]!;
    const categoryValue = row.getValue(categoryColumnId);
    const label = String(categoryValue ?? `Row ${rowOffset + 1}`).trim() || `Row ${rowOffset + 1}`;

    const chartRow: RangeChartRow = { label };
    let hasAnyNumeric = false;
    for (const columnId of numericColumns) {
      const value = toFiniteNumber(row.getValue(columnId));
      if (value == null) continue;
      chartRow[columnId] = value;
      hasAnyNumeric = true;
    }
    if (hasAnyNumeric) {
      resultRows.push(chartRow);
    }
  }

  if (resultRows.length === 0) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'No numeric values found in selected range.',
    };
  }

  const categoryHeader = resolveColumnHeader(ctx, categoryColumnId);
  if (barSeriesLayout === 'stacked100') {
    for (const row of resultRows) {
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
      rows: resultRows,
      series,
      categoryHeader,
      barSeriesLayout,
    },
  };
}
