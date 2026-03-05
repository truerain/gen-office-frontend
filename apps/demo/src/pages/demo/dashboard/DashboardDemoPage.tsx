import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { LayoutDashboard } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import {
  BarSeries,
  CartesianChart,
  ChartGrid,
  ChartLegend,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
  LineSeries,
  ResponsiveChartContainer,
} from '@gen-office/gen-chart';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

import styles from './DashboardDemoPage.module.css';

type SummaryRow = {
  id: string;
  metric: string;
  subtitle?: string;
  value: number;
  target: number;
  rate: number;
};

type SalesTrendRow = {
  id: string;
  month: string;
  plan: number;
  actual: number;
};

type ProfitTrendRow = {
  id: string;
  month: string;
  plan: number;
  actual: number;
};

const managementResultRows: SummaryRow[] = [
  { id: 'm1', metric: '매출', subtitle: '', value: 12840, target: 12100, rate: 106.1 },
  { id: 'm11', metric: '매출', subtitle: '서비스', value: 128, target: 12100, rate: 106.1 },
  { id: 'm12', metric: '매출', subtitle: '소매', value: 1284, target: 12100, rate: 106.1 },
  { id: 'm2', metric: '영업이익', subtitle: '', value: 18.9, target: 18.2, rate: 103.8 },
  { id: 'm21', metric: '영업이익', subtitle: '서비스', value: 18.9, target: 18.2, rate: 103.8 },
  { id: 'm22', metric: '영업이익', subtitle: '소매', value: 18.9, target: 18.2, rate: 103.8 },
];

const salesAchievementRows: SummaryRow[] = [
  { id: 's0', metric: '합계', value: 12100, target: 12100, rate: 100.0 },
  { id: 's1', metric: '목표 매출(백만)', value: 12100, target: 12100, rate: 100.0 },
  { id: 's2', metric: '실적 매출(백만)', value: 12840, target: 12100, rate: 106.1 },
  { id: 's3', metric: '달성률(%)', value: 106.1, target: 100.0, rate: 106.1 },
  { id: 's4', metric: '잔여 목표(백만)', value: 0, target: 0, rate: 100.0 },
];

const majorKpiRows: SummaryRow[] = [
  { id: 'k1', metric: '신규 고객 수', value: 1480, target: 1320, rate: 112.1 },
  { id: 'k2', metric: '재구매율(%)', value: 41.2, target: 39.0, rate: 105.6 },
  { id: 'k3', metric: '평균 객단가(천원)', value: 182, target: 175, rate: 104.0 },
  { id: 'k4', metric: '생산성 지수', value: 103.4, target: 100.0, rate: 103.4 },
  { id: 'k5', metric: '생산성 지수', value: 103.4, target: 100.0, rate: 103.4 },
  { id: 'k6', metric: '생산성 지수', value: 103.4, target: 100.0, rate: 103.4 },
  { id: 'k7', metric: '생산성 지수', value: 103.4, target: 100.0, rate: 103.4 },
];

const salesTrendRows: SalesTrendRow[] = [
  { id: 't1', month: '1월', plan: 10800, actual: 11100 },
  { id: 't2', month: '2월', plan: 11300, actual: 11870 },
  { id: 't3', month: '3월', plan: 12100, actual: 12840 },
  { id: 't4', month: '4월', plan: 12400, actual: 12230 },
  { id: 't5', month: '5월', plan: 12900, actual: 13140 },
  { id: 't6', month: '6월', plan: 13300, actual: 13650 },
  { id: 't7', month: '7월', plan: 13800, actual: 14110 },
  { id: 't8', month: '8월', plan: 14000, actual: 13880 },
  { id: 't9', month: '9월', plan: 14300, actual: 14520 },
  { id: 't10', month: '10월', plan: 14700, actual: 14940 },
  { id: 't11', month: '11월', plan: 15100, actual: 15460 },
  { id: 't12', month: '12월', plan: 15800, actual: 16210 },
];

const operatingProfitTrendRows: ProfitTrendRow[] = [
  { id: 'p1', month: '1월', plan: 1850, actual: 1910 },
  { id: 'p2', month: '2월', plan: 2070, actual: 2180 },
  { id: 'p3', month: '3월', plan: 2280, actual: 2430 },
  { id: 'p4', month: '4월', plan: 2210, actual: 2260 },
  { id: 'p5', month: '5월', plan: 2310, actual: 2370 },
  { id: 'p6', month: '6월', plan: 2460, actual: 2510 },
  { id: 'p7', month: '7월', plan: 2560, actual: 2620 },
  { id: 'p8', month: '8월', plan: 2490, actual: 2550 },
  { id: 'p9', month: '9월', plan: 2610, actual: 2680 },
  { id: 'p10', month: '10월', plan: 2700, actual: 2740 },
  { id: 'p11', month: '11월', plan: 2760, actual: 2810 },
  { id: 'p12', month: '12월', plan: 2890, actual: 2950 },
];

export default function DashboardDemoPage(_props: PageComponentProps) {
  const numberFormatter = useMemo(() => new Intl.NumberFormat('ko-KR'), []);
  const percentFormatter = useMemo(
    () =>
      new Intl.NumberFormat('ko-KR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    []
  );

  const summaryColumns = useMemo<ColumnDef<SummaryRow, any>[]>(
    () => [
      { accessorKey: 'metric', header: '지표', size: 80, meta: { pinned: 'left', rowSpan: true } },
      { accessorKey: 'subtitle', header: '', size: 80, meta: { pinned: 'left', rowSpan: true } },
      {
        accessorKey: 'value',
        header: '실적',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => numberFormatter.format(Number(getValue() ?? 0)),
      },
      {
        accessorKey: 'target',
        header: '목표',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => numberFormatter.format(Number(getValue() ?? 0)),
      },
      {
        accessorKey: 'rate',
        header: '달성률(%)',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => percentFormatter.format(Number(getValue() ?? 0)),
      },
    ],
    [numberFormatter, percentFormatter]
  );

  const summaryColumns2 = useMemo<ColumnDef<SummaryRow, any>[]>(
    () => [
      { accessorKey: 'metric', header: '구분', size: 150, meta: { pinned: 'left', rowSpan: true } },
      {
        accessorKey: 'value',
        header: '매출',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => numberFormatter.format(Number(getValue() ?? 0)),
      },
      {
        accessorKey: 'target',
        header: '구성비',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => numberFormatter.format(Number(getValue() ?? 0)),
      },
      {
        accessorKey: 'rate',
        header: '달성도(%)',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => percentFormatter.format(Number(getValue() ?? 0)),
      },
    ],
    [numberFormatter, percentFormatter]
  );

  const summaryColumns3 = useMemo<ColumnDef<SummaryRow, any>[]>(
    () => [
      { accessorKey: 'metric', header: '구분', size: 150, meta: { pinned: 'left', rowSpan: true } },
      {
        accessorKey: 'value',
        header: '전년',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => numberFormatter.format(Number(getValue() ?? 0)),
      },
      {
        accessorKey: 'target',
        header: '실적',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => numberFormatter.format(Number(getValue() ?? 0)),
      },
      {
        accessorKey: 'rate',
        header: '전년비(%)',
        size: 110,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => percentFormatter.format(Number(getValue() ?? 0)),
      },
    ],
    [numberFormatter, percentFormatter]
  );

  const salesPlanMax = useMemo(() => Math.max(...salesTrendRows.map((row) => row.plan)), []);
  const salesActualMax = useMemo(() => Math.max(...salesTrendRows.map((row) => row.actual)), []);
  const profitPlanMax = useMemo(() => Math.max(...operatingProfitTrendRows.map((row) => row.plan)), []);
  const profitActualMax = useMemo(() => Math.max(...operatingProfitTrendRows.map((row) => row.actual)), []);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Dashboard Demo"
        description="상단 3분할 Grid + 하단 2분할 Chart"
        breadcrumbItems={[
          { label: 'UI Demo', icon: <LayoutDashboard size={16} /> },
          { label: 'Dashboard Demo', icon: <LayoutDashboard size={16} /> },
        ]}
      />

      <div className={styles.layout}>
        <div className={styles.topRow}>
          <section className={`${styles.panel} ${styles.managementPanel}`}>
            <h3 className={styles.panelTitle}>3월 경영실적</h3>
            <div className={styles.gridWrap}>
              <GenGridCrud<SummaryRow>
                data={managementResultRows}
                columns={summaryColumns}
                getRowId={(row) => row.id}
                onCommit={async () => ({ ok: true, nextData: managementResultRows })}
                actionBar={{ enabled: false }}
                gridProps={{
                  height: '100%',
                  enableColumnSizing: true,
                  fitColumns: 'fill',
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                  rowSpanning: true,
                  rowSpanningMode: 'visual',
                  getCellStyle: ({ columnId }) => ({
                    borderRight: columnId == 'metric' ? '' : 'none',
                    backgroundColor: columnId === 'value' ? '#d5d5d5' : undefined,
                  }),
                }}
              />
            </div>
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>3월 매출 달성률</h3>
            <div className={styles.gridWrap}>
              <GenGridCrud<SummaryRow>
                data={salesAchievementRows}
                columns={summaryColumns2}
                getRowId={(row) => row.id}
                onCommit={async () => ({ ok: true, nextData: salesAchievementRows })}
                actionBar={{ enabled: false }}
                gridProps={{
                  height: '100%',
                  enableColumnSizing: true,
                  fitColumns: 'fill',
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                  getCellStyle: ({ row }) => ({
                    border: 'none',
                  backgroundColor: row.id === 's0' ? '#d5d5d5' : undefined,   
                  }),
                }}
              />
            </div>
          </section>

          <section className={`${styles.panel} ${styles.managementPanel3}`}>
            <h3 className={styles.panelTitle}>3월 주요지표</h3>
            <div className={styles.gridWrap}>
              <GenGridCrud<SummaryRow>
                data={majorKpiRows}
                columns={summaryColumns3}
                getRowId={(row) => row.id}
                onCommit={async () => ({ ok: true, nextData: majorKpiRows })}
                actionBar={{ enabled: false }}
                gridProps={{
                  height: '100%',
                  enableColumnSizing: true,
                  fitColumns: 'fill',
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                  getCellStyle: ({columnId }) => ({
                    border: 'none',
                    borderRight:
                      columnId === 'metric' ? '1px solid var(--grid-cell-border)' : 'none',
                    backgroundColor: columnId === 'target' ? '#d5d5d5' : undefined,
                  }),
                }}
              />
            </div>
          </section>
        </div>

        <div className={styles.bottomRow}>
          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>매출추이 (1월~12월)</h3>
            <div className={styles.gridWrap}>
              <ResponsiveChartContainer minHeight={260} fallbackHeight={260}>
                {({ width, height }) => (
                  <CartesianChart<SalesTrendRow>
                    width={width}
                    height={height}
                    xAxis={{ showAllTicks: true }}
                    series={[
                      {
                        id: 'sales-plan',
                        type: 'line',
                        label: '계획',
                        data: salesTrendRows,
                        x: (d) => d.month,
                        y: (d) => d.plan,
                        color: '#9ca3af',
                        strokeDasharray: '6 4',
                        showValueLabel: true,
                        valueLabelPredicate: (value) => value === salesPlanMax,
                      },
                      {
                        id: 'sales-actual',
                        type: 'line',
                        label: '실적',
                        data: salesTrendRows,
                        x: (d) => d.month,
                        y: (d) => d.actual,
                        color: '#86efac',
                        showValueLabel: false,
                        valueLabelPredicate: (value) => value === salesActualMax,
                      },
                    ]}
                    interactive={{ tooltip: true, legend: { enabled: true, position: 'bottom', align: 'center' } }}
                  >
                    <ChartGrid />
                    <ChartXAxis />
                    <ChartYAxis />
                    <LineSeries seriesId="sales-plan" />
                    <LineSeries seriesId="sales-actual" />
                    <ChartTooltip />
                    <ChartLegend />
                  </CartesianChart>
                )}
              </ResponsiveChartContainer>
            </div>
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>영업이익 (1월~12월)</h3>
            <div className={styles.gridWrap}>
              <ResponsiveChartContainer minHeight={260} fallbackHeight={260}>
                {({ width, height }) => (
                  <CartesianChart<ProfitTrendRow>
                    width={width}
                    height={height}
                    xAxis={{ showAllTicks: true }}
                    series={[
                      {
                        id: 'operating-profit-actual',
                        type: 'bar',
                        label: '실적',
                        data: operatingProfitTrendRows,
                        x: (d) => d.month,
                        y: (d) => d.actual,
                        color: '#86efac',
                        layout: 'overlay',
                        maxBarWidth: 18,
                        showValueLabel: true,
                        valueLabelPosition: 'top',
                        valueLabelPredicate: (value) => value === profitActualMax,
                      },
                      {
                        id: 'operating-profit-plan',
                        type: 'bar',
                        label: '계획',
                        data: operatingProfitTrendRows,
                        x: (d) => d.month,
                        y: (d) => d.plan,
                        color: '#9ca3af',
                        layout: 'overlay',
                        maxBarWidth: 34,
                        opacity: 0.45,
                        showValueLabel: false,
                        valueLabelPosition: 'inside',
                        valueLabelPredicate: (value) => value === profitPlanMax,
                      },
                    ]}
                    interactive={{ tooltip: true, legend: { enabled: true, position: 'bottom', align: 'center' } }}
                  >
                    <ChartGrid />
                    <ChartXAxis />
                    <ChartYAxis />
                    <BarSeries seriesId="operating-profit-plan" />
                    <BarSeries seriesId="operating-profit-actual" />
                    <ChartTooltip />
                    <ChartLegend />
                  </CartesianChart>
                )}
              </ResponsiveChartContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
