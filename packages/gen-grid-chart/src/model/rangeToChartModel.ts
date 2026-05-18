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
    categoryColumnIds?: readonly string[];
    categoryColumnIndex?: number;
    seriesColumnIds?: readonly string[];
    valueCategoryColumnIds?: readonly string[];
    valueCategoryLabels?: readonly string[];
    getSeriesLabel?: (params: { rowIndex: number; rowData: TData }) => string;
    transformSeriesValue?: (params: {
      row: TData;
      rowIndex: number;
      valueColumnId: string;
      value: number;
    }) => number | null;
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

  const valueCategoryColumnIds = options?.valueCategoryColumnIds?.length
    ? [...options.valueCategoryColumnIds]
    : [];
  if (valueCategoryColumnIds.length > 0) {
    const missingValueCategoryColumnId = valueCategoryColumnIds.find(
      (columnId) => !ctx.table.getColumn(columnId)
    );
    if (missingValueCategoryColumnId) {
      return {
        ok: false,
        message:
          options?.messageWhenInvalid ?? `Category value column "${missingValueCategoryColumnId}" not found.`,
      };
    }

    const selectedValueCategoryColumnIds = valueCategoryColumnIds.filter((columnId) =>
      selectedColumnIds.includes(columnId)
    );
    if (selectedValueCategoryColumnIds.length === 0) {
      return {
        ok: false,
        message:
          options?.messageWhenInvalid ??
          'Select at least one category value column included in valueCategoryColumnIds.',
      };
    }

    const series: RangeChartSeries[] = sourceRows.map((row, rowOffset) => {
      const rawLabel = options?.getSeriesLabel
        ? options.getSeriesLabel({ rowIndex: rowOffset, rowData: row.original as TData })
        : `Row ${rowOffset + 1}`;
      const label = String(rawLabel ?? `Row ${rowOffset + 1}`).trim() || `Row ${rowOffset + 1}`;
      return {
        id: `__row_${rowOffset}`,
        label,
      };
    });

    const categoryLabelsByColumnId = new Map<string, string>();
    if (
      options?.valueCategoryLabels &&
      options.valueCategoryLabels.length === valueCategoryColumnIds.length
    ) {
      valueCategoryColumnIds.forEach((columnId, index) => {
        categoryLabelsByColumnId.set(columnId, options.valueCategoryLabels![index] ?? columnId);
      });
    }

    const resultRows: RangeChartRow[] = selectedValueCategoryColumnIds.map((columnId) => {
      const chartRow: RangeChartRow = {
        label: categoryLabelsByColumnId.get(columnId) ?? resolveColumnHeader(ctx, columnId),
      };
      series.forEach((seriesItem, rowOffset) => {
        const row = sourceRows[rowOffset];
        const value = toFiniteNumber(row?.getValue(columnId));
        if (value == null || !row) return;
        const transformed = options?.transformSeriesValue
          ? options.transformSeriesValue({
              row: row.original as TData,
              rowIndex: rowOffset,
              valueColumnId: columnId,
              value,
            })
          : value;
        if (typeof transformed === 'number' && Number.isFinite(transformed)) {
          chartRow[seriesItem.id] = transformed;
        }
      });
      return chartRow;
    });

    const hasAnyNumeric = resultRows.some((row) =>
      series.some((seriesItem) => typeof row[seriesItem.id] === 'number')
    );
    if (!hasAnyNumeric) {
      return {
        ok: false,
        message: options?.messageWhenInvalid ?? 'No numeric values found in selected range.',
      };
    }

    return {
      ok: true,
      model: {
        title: `${resultRows.map((row) => row.label).join(', ')} trend`,
        rows: resultRows,
        series,
        categoryHeader: 'Category',
        barSeriesLayout: options?.barSeriesLayout ?? 'grouped',
      },
    };
  }

  const categoryColumnIds =
    options?.categoryColumnIds && options.categoryColumnIds.length > 0
      ? [...options.categoryColumnIds]
      : options?.categoryColumnId
        ? [options.categoryColumnId]
        : (() => {
            const categoryColumnIndex = options?.categoryColumnIndex ?? 0;
            if (categoryColumnIndex < 0 || categoryColumnIndex >= selectedColumnIds.length) {
              return [];
            }
            return [selectedColumnIds[categoryColumnIndex]!];
          })();

  if (!categoryColumnIds.length) {
    return {
      ok: false,
      message: options?.messageWhenInvalid ?? 'Invalid chart category column index.',
    };
  }

  const missingCategoryColumnId = categoryColumnIds.find(
    (categoryColumnId) => !ctx.table.getColumn(categoryColumnId)
  );
  if (missingCategoryColumnId) {
    return {
      ok: false,
      message:
        options?.messageWhenInvalid ?? `Category column "${missingCategoryColumnId}" not found.`,
    };
  }

  const categoryColumnIdSet = new Set(categoryColumnIds);
  const seriesColumnCandidates =
    options?.seriesColumnIds && options.seriesColumnIds.length > 0
      ? [...options.seriesColumnIds]
      : selectedColumnIds.filter((columnId) => !categoryColumnIdSet.has(columnId));

  if (options?.seriesColumnIds?.length) {
    const missingSeriesColumnId = options.seriesColumnIds.find(
      (columnId) => !ctx.table.getColumn(columnId)
    );
    if (missingSeriesColumnId) {
      return {
        ok: false,
        message:
          options?.messageWhenInvalid ?? `Series column "${missingSeriesColumnId}" not found.`,
      };
    }
  }

  const numericColumns = seriesColumnCandidates.filter((columnId) =>
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
    const categoryValues = categoryColumnIds.map((categoryColumnId) => {
      const categoryValue = row.getValue(categoryColumnId);
      return String(categoryValue ?? '').trim();
    });
    const joinedCategory = categoryValues.filter(Boolean).join(' / ');
    const label = joinedCategory || `Row ${rowOffset + 1}`;

    const chartRow: RangeChartRow = { label };
    let hasAnyNumeric = false;
    for (const columnId of numericColumns) {
      const value = toFiniteNumber(row.getValue(columnId));
      if (value == null) continue;
      const transformed = options?.transformSeriesValue
        ? options.transformSeriesValue({
            row: row.original as TData,
            rowIndex: rowOffset,
            valueColumnId: columnId,
            value,
          })
        : value;
      if (typeof transformed !== 'number' || !Number.isFinite(transformed)) continue;
      chartRow[columnId] = transformed;
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

  const categoryHeader = categoryColumnIds
    .map((categoryColumnId) => resolveColumnHeader(ctx, categoryColumnId))
    .join(' / ');

  if (barSeriesLayout === 'stacked100') {
    for (const row of resultRows) {
      let positiveSum = 0;
      let negativeSumAbs = 0;
      for (const item of series) {
        const value = row[item.id];
        if (typeof value === 'number' && Number.isFinite(value)) {
          row[`__raw__${item.id}`] = value;
          if (value > 0) positiveSum += value;
          if (value < 0) negativeSumAbs += Math.abs(value);
        }
      }
      for (const item of series) {
        const value = row[item.id];
        if (typeof value !== 'number' || !Number.isFinite(value) || value === 0) {
          row[item.id] = 0;
          continue;
        }
        if (value > 0) {
          row[item.id] = positiveSum > 0 ? (value / positiveSum) * 100 : 0;
          continue;
        }
        row[item.id] = negativeSumAbs > 0 ? -(Math.abs(value) / negativeSumAbs) * 100 : 0;
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
