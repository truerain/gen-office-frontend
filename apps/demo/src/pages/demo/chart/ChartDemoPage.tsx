import { useEffect, useMemo, useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import { GenChart, ResponsiveChartContainer } from '@gen-office/gen-chart';
import type { TreemapNode } from '@gen-office/gen-chart';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { useAlertDialog } from '@/shared/ui/AlertDialogContext';

import styles from './ChartDemoPage.module.css';

type MonthlyPoint = {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
};

type ChannelPoint = {
  channel: string;
  value: number;
};

type DeltaPoint = {
  month: string;
  delta: number;
};

const monthlyData: MonthlyPoint[] = [
  { month: 'Jan', revenue: 120, cost: 84, profit: 36 },
  { month: 'Feb', revenue: 138, cost: 91, profit: 47 },
  { month: 'Mar', revenue: 152, cost: 98, profit: 54 },
  { month: 'Apr', revenue: 166, cost: 102, profit: 64 },
  { month: 'May', revenue: 181, cost: 110, profit: 71 },
  { month: 'Jun', revenue: 173, cost: 108, profit: 65 },
];

const channelData: ChannelPoint[] = [
  { channel: 'Web', value: 49 },
  { channel: 'Mobile', value: 31 },
  { channel: 'Store', value: 20 },
];

const deltaData: DeltaPoint[] = [
  { month: 'Jan', delta: 24 },
  { month: 'Feb', delta: -18 },
  { month: 'Mar', delta: 12 },
  { month: 'Apr', delta: -26 },
  { month: 'May', delta: 33 },
  { month: 'Jun', delta: -11 },
];

const treemapData: TreemapNode = {
  id: 'root',
  name: 'All Channels',
  children: [
    {
      id: 'digital',
      name: 'Digital',
      children: [
        { id: 'web', name: 'Web', value: 49 },
        { id: 'mobile', name: 'Mobile', value: 31 },
        { id: 'app', name: 'App', value: 26 },
        { id: 'social', name: 'Social', value: 18 },
        { id: 'search', name: 'Search', value: 22 },
      ],
    },
    {
      id: 'offline',
      name: 'Offline',
      children: [
        { id: 'store', name: 'Store', value: 20 },
        { id: 'partners', name: 'Partners', value: 14 },
        { id: 'branch-a', name: 'Branch A', value: 17 },
        { id: 'branch-b', name: 'Branch B', value: 15 },
        { id: 'reseller', name: 'Reseller', value: 12 },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      children: [
        { id: 'b2b', name: 'B2B', value: 28 },
      ],
    },
  ],
};

const treemapColorById: Record<string, string> = {
  web: '#2563eb',
  mobile: '#0f766e',
  app: '#7c3aed',
  social: '#e11d48',
  search: '#0891b2',
  store: '#f59e0b',
  partners: '#db2777',
  'branch-a': '#16a34a',
  'branch-b': '#ea580c',
  reseller: '#6d28d9',
  b2b: '#334155',
};

export default function ChartDemoPage(_props: PageComponentProps) {
  const { openAlert } = useAlertDialog();
  const lastShownParamsSignatureRef = useRef<string>('');
  const paramsSignature = useMemo(() => {
    if (_props.initialParams == null) return '';
    try {
      return JSON.stringify(_props.initialParams);
    } catch {
      return String(_props.initialParams);
    }
  }, [_props.initialParams]);

  const paramsPretty = useMemo(() => {
    if (_props.initialParams == null) return '';
    try {
      return JSON.stringify(_props.initialParams, null, 2);
    } catch {
      return String(_props.initialParams);
    }
  }, [_props.initialParams]);

  useEffect(() => {
    if (!paramsSignature) return;
    if (lastShownParamsSignatureRef.current === paramsSignature) return;

    lastShownParamsSignatureRef.current = paramsSignature;
    void openAlert({
      type: 'info',
      confirmText: 'OK',
      message: (
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {paramsPretty}
        </pre>
      ),
    });
  }, [openAlert, paramsPretty, paramsSignature]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Chart Demo (visx)"
        description="Line, Bar, Area, Composed, Pie, Donut, Treemap"
        breadcrumbItems={[
          { label: 'UI Demo', icon: <BarChart3 size={16} /> },
          { label: 'Chart Demo', icon: <BarChart3 size={16} /> },
        ]}
      />

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Line</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={280} fallbackHeight={280}>
              {({ width, height }) => (
                <GenChart<MonthlyPoint>
                  kind="line"
                  width={width}
                  height={height}
                  data={monthlyData}
                  x={(d) => d.month}
                  series={[
                    { id: 'revenue', type: 'line', label: 'Revenue', y: (d) => d.revenue },
                    { id: 'cost', type: 'line', label: 'Cost', y: (d) => d.cost },
                  ]}
                  tooltip
                  legend
                />
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Bar</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={280} fallbackHeight={280}>
              {({ width, height }) => (
                <GenChart<MonthlyPoint>
                  kind="bar"
                  width={width}
                  height={height}
                  data={monthlyData}
                  x={(d) => d.month}
                  series={[
                    { id: 'revenue', type: 'bar', label: 'Revenue', y: (d) => d.revenue },
                    { id: 'cost', type: 'bar', label: 'Cost', y: (d) => d.cost },
                  ]}
                  tooltip
                  legend
                />
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Bar (Negative + Zero Axis)</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={280} fallbackHeight={280}>
              {({ width, height }) => (
                <GenChart<DeltaPoint>
                  kind="bar"
                  width={width}
                  height={height}
                  data={deltaData}
                  x={(d) => d.month}
                  xAxis={{ showAllTicks: true, position: 'zero' }}
                  yAxis={{ min: -40, max: 40 }}
                  series={[
                    {
                      id: 'delta',
                      type: 'bar',
                      label: 'Delta',
                      y: (d) => d.delta,
                      color: '#0ea5e9',
                      negativeColor: '#dc2626',
                    },
                  ]}
                  tooltip
                  legend
                />
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Area</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={280} fallbackHeight={280}>
              {({ width, height }) => (
                <GenChart<MonthlyPoint>
                  kind="area"
                  width={width}
                  height={height}
                  data={monthlyData}
                  x={(d) => d.month}
                  series={[
                    { id: 'profit', type: 'area', label: 'Profit', y: (d) => d.profit },
                  ]}
                  tooltip
                  legend
                />
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Composed (Line + Bar)</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={280} fallbackHeight={280}>
              {({ width, height }) => (
                <GenChart<MonthlyPoint>
                  kind="composed"
                  width={width}
                  height={height}
                  data={monthlyData}
                  x={(d) => d.month}
                  series={[
                    { id: 'revenue', type: 'bar', label: 'Revenue', y: (d) => d.revenue },
                    { id: 'profit', type: 'line', label: 'Profit', y: (d) => d.profit },
                  ]}
                  tooltip
                  legend
                />
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Pie</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={300} fallbackHeight={300}>
              {({ width, height }) => (
                <GenChart<ChannelPoint>
                  kind="pie"
                  width={width}
                  height={height}
                  data={channelData}
                  category={(d) => d.channel}
                  value={(d) => d.value}
                  tooltip
                  legend
                />
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Donut</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={300} fallbackHeight={300}>
              {({ width, height }) => (
                <GenChart<ChannelPoint>
                  kind="donut"
                  width={width}
                  height={height}
                  data={channelData}
                  category={(d) => d.channel}
                  value={(d) => d.value}
                  tokens={{
                    color: {
                      background: '#f8fbff',
                      seriesPalette: ['#0f766e', '#2563eb', '#f59e0b'],
                    },
                  }}
                  tooltip
                  legend
                />
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Treemap</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={300} fallbackHeight={300}>
              {({ width, height }) => (
                <GenChart
                  kind="treemap"
                  width={width}
                  height={height}
                  data={treemapData}
                  color={(node) => treemapColorById[node.id] ?? '#475569'}
                  tile="squarify"
                  minLabelArea={1400}
                  tooltip
                />
              )}
            </ResponsiveChartContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
