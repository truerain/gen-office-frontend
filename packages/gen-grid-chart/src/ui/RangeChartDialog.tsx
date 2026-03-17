import { useEffect, useMemo, useState } from 'react';
import { GenChart, ResponsiveChartContainer } from '@gen-office/gen-chart';
import type { GenChartTooltipContext } from '@gen-office/gen-chart';
import { SimpleDialog, SimpleSelect } from '@gen-office/ui';
import type {
  BarSeriesLayout,
  RangeChartKind,
  RangeChartRow,
  RangeChartSeries,
} from '../model/rangeToChartModel';
import styles from './RangeChartDialog.module.css';

export type RangeChartDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title?: string;
  error?: string | null;
  rows: RangeChartRow[];
  series: RangeChartSeries[];
  chartKind?: RangeChartKind;
  barSeriesLayout?: BarSeriesLayout;
};

export function RangeChartDialog({
  open,
  onOpenChange,
  title = 'Selection Chart',
  error,
  rows,
  series,
  chartKind = 'column',
  barSeriesLayout = 'grouped',
}: RangeChartDialogProps) {
  const isBarLike = chartKind === 'column' || chartKind === 'bar';
  const isPieLike = chartKind === 'pie' || chartKind === 'donut';
  const cartesianSeriesType: 'bar' | 'line' | 'area' = isBarLike
    ? 'bar'
    : chartKind === 'line'
      ? 'line'
      : 'area';
  const [pieSeriesId, setPieSeriesId] = useState<string>(series[0]?.id ?? '');

  useEffect(() => {
    if (!series.length) {
      setPieSeriesId('');
      return;
    }
    if (!series.some((item) => item.id === pieSeriesId)) {
      setPieSeriesId(series[0].id);
    }
  }, [pieSeriesId, series]);

  const pieSeries = useMemo(
    () => series.find((item) => item.id === pieSeriesId) ?? series[0],
    [pieSeriesId, series]
  );
  const numberFormatter = useMemo(() => new Intl.NumberFormat('ko-KR'), []);

  return (
    <SimpleDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      className={styles.dialog}
      resizable
      bodyScrollable={false}
    >
      <div className={styles.content}>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <div className={styles.chartWrap}>
            {isPieLike && series.length > 1 ? (
              <div className={styles.seriesSelectWrap}>
                <SimpleSelect
                  value={pieSeries?.id ?? ''}
                  onValueChange={setPieSeriesId}
                  placeholder="Select series"
                  options={series.map((item) => ({ value: item.id, label: item.label }))}
                />
              </div>
            ) : null}
            <ResponsiveChartContainer
              className={styles.chartCanvas}
              minHeight={220}
              fallbackHeight={220}
            >
              {({ width, height }) => {
                return isPieLike ? (
                  <GenChart<RangeChartRow>
                    kind={chartKind}
                    width={width}
                    height={height}
                    data={rows}
                    category={(d) => d.label}
                    value={(d) => {
                      const value = d[pieSeries?.id ?? ''];
                      return typeof value === 'number' ? value : 0;
                    }}
                    tooltip
                    legend={{ enabled: true, position: 'bottom', align: 'start' }}
                  />
                ) : (
                  <GenChart<RangeChartRow>
                    kind={isBarLike ? 'bar' : chartKind}
                    barOrientation={chartKind === 'bar' ? 'horizontal' : 'vertical'}
                    width={width}
                    height={height}
                    data={rows}
                    padding={{ top: 16, right: 16, bottom: 56, left: 52 }}
                    x={(d) => d.label}
                    series={series.map((item) => ({
                      id: item.id,
                      type: cartesianSeriesType,
                      label: item.label,
                      stackId:
                        isBarLike && barSeriesLayout !== 'grouped' ? 'range-stack-1' : undefined,
                      y: (d: RangeChartRow) => {
                        const value = d[item.id];
                        return typeof value === 'number' ? value : null;
                      },
                    }))}
                    yAxis={
                      isBarLike && barSeriesLayout === 'stacked100'
                        ? {
                            min: 0,
                            max: 100,
                            tickFormat: (value) => `${value}%`,
                          }
                        : undefined
                    }
                    tooltip={
                      isBarLike && barSeriesLayout === 'stacked100'
                        ? {
                            valueFormatter: (ctx: GenChartTooltipContext<RangeChartRow>) => {
                              const percent = ctx.value ?? 0;
                              const rawKey = `__raw__${ctx.seriesId ?? ''}`;
                              const rawValue = ctx.datum[rawKey];
                              const rawText =
                                typeof rawValue === 'number' && Number.isFinite(rawValue)
                                  ? numberFormatter.format(rawValue)
                                  : '-';
                              return `${rawText} (${percent.toFixed(2)}%)`;
                            },
                          }
                        : true
                    }
                    legend={{ enabled: true, position: 'bottom', align: 'start' }}
                  />
                );
              }}
            </ResponsiveChartContainer>
          </div>
        )}
      </div>
    </SimpleDialog>
  );
}
