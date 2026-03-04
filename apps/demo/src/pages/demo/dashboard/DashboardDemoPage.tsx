import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { LayoutDashboard } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
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

type TrendRow = {
  id: string;
  month: string;
  amount: number;
  yoy: number;
  plan: number;
};

const managementResultRows: SummaryRow[] = [
  { id: 'm1', metric: '매출', subtitle: '', value: 12840, target: 12100, rate: 106.1 },
  { id: 'm11', metric: '매출', subtitle: '서비스', value: 128, target: 12100, rate: 106.1 },
  { id: 'm12', metric: '매출', subtitle: '판매', value: 1284, target: 12100, rate: 106.1 },
  { id: 'm2', metric: '영업이익', subtitle: '', value: 18.9, target: 18.2, rate: 103.8 },
  { id: 'm21', metric: '영업이익', subtitle: '서비스', value: 18.9, target: 18.2, rate: 103.8 },
  { id: 'm22', metric: '영업이익', subtitle: '판매', value: 18.9, target: 18.2, rate: 103.8 },
];

const salesAchievementRows: SummaryRow[] = [
  { id: 's1', metric: '목표 매출(백만원)', value: 12100, target: 12100, rate: 100.0 },
  { id: 's2', metric: '실적 매출(백만원)', value: 12840, target: 12100, rate: 106.1 },
  { id: 's3', metric: '달성률(%)', value: 106.1, target: 100.0, rate: 106.1 },
  { id: 's4', metric: '잔여 목표(백만원)', value: 0, target: 0, rate: 100.0 },
];

const majorKpiRows: SummaryRow[] = [
  { id: 'k1', metric: '신규 고객 수(건)', value: 1480, target: 1320, rate: 112.1 },
  { id: 'k2', metric: '재구매율(%)', value: 41.2, target: 39.0, rate: 105.6 },
  { id: 'k3', metric: '평균 객단가(천원)', value: 182, target: 175, rate: 104.0 },
  { id: 'k4', metric: '생산성 지수', value: 103.4, target: 100.0, rate: 103.4 },
];

const salesTrendRows: TrendRow[] = [
  { id: 't1', month: '2026-01', amount: 11100, yoy: 103.2, plan: 10700 },
  { id: 't2', month: '2026-02', amount: 11870, yoy: 108.4, plan: 11400 },
  { id: 't3', month: '2026-03', amount: 12840, yoy: 112.4, plan: 12100 },
];

const operatingProfitTrendRows: TrendRow[] = [
  { id: 'p1', month: '2026-01', amount: 1910, yoy: 101.8, plan: 1830 },
  { id: 'p2', month: '2026-02', amount: 2180, yoy: 107.1, plan: 2010 },
  { id: 'p3', month: '2026-03', amount: 2430, yoy: 110.5, plan: 2200 },
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
      { accessorKey: 'metric', header: '지표', size: 80, meta: { pinned: 'left', rowSpan: true, } },
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

  const trendColumns = useMemo<ColumnDef<TrendRow, any>[]>(
    () => [
      { accessorKey: 'month', header: '월', size: 120, meta: { pinned: 'left', align: 'center', mono: true } },
      {
        accessorKey: 'amount',
        header: '실적(백만원)',
        size: 140,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => numberFormatter.format(Number(getValue() ?? 0)),
      },
      {
        accessorKey: 'plan',
        header: '계획(백만원)',
        size: 140,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => numberFormatter.format(Number(getValue() ?? 0)),
      },
      {
        accessorKey: 'yoy',
        header: '전년동월비(%)',
        size: 130,
        meta: { align: 'right', mono: true },
        cell: ({ getValue }) => percentFormatter.format(Number(getValue() ?? 0)),
      },
    ],
    [numberFormatter, percentFormatter]
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Dashboard Demo"
        description="상단 3분할 / 하단 2분할 Grid 대시보드 샘플"
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
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                  rowSpanning: true,
                  rowSpanningMode: 'visual',
                  getCellStyle: ({ columnId, row, rowIndex }) => {
                    if (columnId === 'value') {
                      return {
                        borderLeft: 'none',
                        borderRight: 'none',
                        backgroundColor: '#f5f5f5',
                      };
                    }

                    if (columnId !== 'metric') {
                      return {
                        borderLeft: 'none',
                        borderRight: 'none',
                      };
                    }

                    const prevMetric = rowIndex > 0 ? managementResultRows[rowIndex - 1]?.metric : undefined;
                    const isFirstRowInGroup = rowIndex === 0 || prevMetric !== row.metric;

                    return {
                      borderLeft: 'none',
                      borderRight: isFirstRowInGroup ? 'none' : '1px solid var(--grid-cell-border)',
                    };
                  },
                }}
              />
            </div>
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>3월 매출 달성도</h3>
            <div className={styles.gridWrap}>
              <GenGridCrud<SummaryRow>
                data={salesAchievementRows}
                columns={summaryColumns}
                getRowId={(row) => row.id}
                onCommit={async () => ({ ok: true, nextData: salesAchievementRows })}
                actionBar={{ enabled: false }}
                gridProps={{
                  height: '100%',
                  enableColumnSizing: true,
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                }}
              />
            </div>
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>3월 주요지표</h3>
            <div className={styles.gridWrap}>
              <GenGridCrud<SummaryRow>
                data={majorKpiRows}
                columns={summaryColumns}
                getRowId={(row) => row.id}
                onCommit={async () => ({ ok: true, nextData: majorKpiRows })}
                actionBar={{ enabled: false }}
                gridProps={{
                  height: '100%',
                  enableColumnSizing: true,
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                }}
              />
            </div>
          </section>
        </div>

        <div className={styles.bottomRow}>
          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>매출추이</h3>
            <div className={styles.gridWrap}>
              <GenGridCrud<TrendRow>
                data={salesTrendRows}
                columns={trendColumns}
                getRowId={(row) => row.id}
                onCommit={async () => ({ ok: true, nextData: salesTrendRows })}
                actionBar={{ enabled: false }}
                gridProps={{
                  height: '100%',
                  enableColumnSizing: true,
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                }}
              />
            </div>
          </section>

          <section className={styles.panel}>
            <h3 className={styles.panelTitle}>영업이익 추이</h3>
            <div className={styles.gridWrap}>
              <GenGridCrud<TrendRow>
                data={operatingProfitTrendRows}
                columns={trendColumns}
                getRowId={(row) => row.id}
                onCommit={async () => ({ ok: true, nextData: operatingProfitTrendRows })}
                actionBar={{ enabled: false }}
                gridProps={{
                  height: '100%',
                  enableColumnSizing: true,
                  enableActiveRowHighlight: true,
                  rowHeight: 34,
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
