import { useState } from 'react';
import type * as React from 'react';
import type {
  GenGridContextMenuActionContext,
  GenGridContextMenuCustomAction,
} from '@gen-office/gen-grid';
import {
  type BarSeriesLayout,
  buildRangeChartModel,
  type RangeChartKind,
  type RangeChartRow,
  type RangeChartSeries,
} from '../model/rangeToChartModel';
import type { RangeChartDialogProps } from '../ui/RangeChartDialog';

export type UseRangeChartContextMenuOptions<TData> = {
  menuLabel?: React.ReactNode;
  chartKinds?: readonly RangeChartKind[];
  barModes?: readonly BarSeriesLayout[];
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
  getCategoryColumnIndex?: (ctx: GenGridContextMenuActionContext<TData>) => number;
  messageWhenCategoryMissing?: string;
  messageWhenInvalid?: string;
  dialogTitle?: string;
  dialogTitleWhenError?: string;
};

export type UseRangeChartContextMenuResult<TData> = {
  contextMenuAction: GenGridContextMenuCustomAction<TData>;
  dialogProps: RangeChartDialogProps;
  closeDialog: () => void;
};

const DEFAULT_MODES: readonly BarSeriesLayout[] = ['grouped', 'stacked', 'stacked100'];
const DEFAULT_CHART_KINDS: readonly RangeChartKind[] = ['column', 'bar', 'line', 'area', 'pie', 'donut'];

function modeLabel(mode: BarSeriesLayout): string {
  if (mode === 'grouped') return 'Grouped';
  if (mode === 'stacked') return 'Stacked';
  return '100% Stacked';
}

function chartKindLabel(kind: RangeChartKind): string {
  if (kind === 'column') return 'Column';
  if (kind === 'bar') return 'Bar';
  if (kind === 'line') return 'Line';
  if (kind === 'area') return 'Area';
  if (kind === 'pie') return 'Pie';
  return 'Donut';
}

export function useRangeChartContextMenu<TData>(
  options: UseRangeChartContextMenuOptions<TData> = {}
): UseRangeChartContextMenuResult<TData> {
  const defaultDialogTitle = options.dialogTitle ?? 'Selection Chart';
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(defaultDialogTitle);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RangeChartRow[]>([]);
  const [series, setSeries] = useState<RangeChartSeries[]>([]);
  const [chartKind, setChartKind] = useState<RangeChartKind>('column');
  const [layout, setLayout] = useState<BarSeriesLayout>('grouped');

  const kinds = options.chartKinds?.length ? options.chartKinds : DEFAULT_CHART_KINDS;
  const modes = options.barModes?.length ? options.barModes : DEFAULT_MODES;

  const resolveCategoryColumnIndex = (ctx: GenGridContextMenuActionContext<TData>): number => {
    if (options.getCategoryColumnIndex) {
      return options.getCategoryColumnIndex(ctx);
    }
    return options.categoryColumnIndex ?? 0;
  };

  const openFromRange = (
    ctx: GenGridContextMenuActionContext<TData>,
    nextChartKind: RangeChartKind,
    barSeriesLayout: BarSeriesLayout
  ) => {
    const categoryColumnIds = options.categoryColumnIds?.length
      ? options.categoryColumnIds
      : options.categoryColumnId
        ? [options.categoryColumnId]
        : [];
    const missingCategoryColumnId = categoryColumnIds.find(
      (columnId) => !ctx.table.getColumn(columnId)
    );
    if (missingCategoryColumnId) {
      setError(
        options.messageWhenCategoryMissing ??
          `Category column "${missingCategoryColumnId}" was not found.`
      );
      setRows([]);
      setSeries([]);
      setChartKind(nextChartKind);
      setLayout(barSeriesLayout);
      setTitle(options.dialogTitleWhenError ?? defaultDialogTitle);
      setOpen(true);
      return;
    }

    const categoryColumnIndex = resolveCategoryColumnIndex(ctx);
    const built = buildRangeChartModel(ctx, {
      categoryColumnId: options.categoryColumnId,
      categoryColumnIds: options.categoryColumnIds,
      categoryColumnIndex,
      seriesColumnIds: options.seriesColumnIds,
      valueCategoryColumnIds: options.valueCategoryColumnIds,
      valueCategoryLabels: options.valueCategoryLabels,
      getSeriesLabel: options.getSeriesLabel,
      transformSeriesValue: options.transformSeriesValue,
      barSeriesLayout,
      messageWhenInvalid: options.messageWhenInvalid,
    });

    if (!built.ok) {
      setError(built.message);
      setRows([]);
      setSeries([]);
      setChartKind(nextChartKind);
      setLayout(barSeriesLayout);
      setTitle(options.dialogTitleWhenError ?? defaultDialogTitle);
      setOpen(true);
      return;
    }

    setError(null);
    setRows(built.model.rows);
    setSeries(built.model.series);
    setChartKind(nextChartKind);
    setLayout(built.model.barSeriesLayout);
    setTitle(options.dialogTitle ?? `${built.model.title} [${chartKindLabel(nextChartKind)}]`);
    setOpen(true);
  };

  const contextMenuAction: GenGridContextMenuCustomAction<TData> = {
    key: 'chart',
    label: options.menuLabel ?? 'Chart',
    disabled: ({ boundsList }) => boundsList.length === 0,
    children: kinds.map((kind) => {
      if (kind === 'column' || kind === 'bar') {
        return {
          key: `chart-${kind}`,
          label: chartKindLabel(kind),
          disabled: ({ boundsList }) => boundsList.length === 0,
          children: modes.map((mode) => ({
            key: `chart-${kind}-${mode}`,
            label: modeLabel(mode),
            disabled: ({ boundsList }) => boundsList.length === 0,
            onClick: (ctx) => openFromRange(ctx, kind, mode),
          })),
        };
      }
      return {
        key: `chart-${kind}`,
        label: chartKindLabel(kind),
        disabled: ({ boundsList }) => boundsList.length === 0,
        onClick: (ctx) => openFromRange(ctx, kind, 'grouped'),
      };
    }),
  };

  const dialogProps: RangeChartDialogProps = {
    open,
    onOpenChange: setOpen,
    title,
    error,
    rows,
    series,
    chartKind,
    barSeriesLayout: layout,
  };

  return {
    contextMenuAction,
    dialogProps,
    closeDialog: () => setOpen(false),
  };
}
