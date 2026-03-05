import { BarChart3 } from 'lucide-react';
import {
  AreaSeries,
  BarSeries,
  CartesianChart,
  ChartGrid,
  ChartLegend,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
  ComposedSeries,
  DonutSeries,
  LineSeries,
  PieSeries,
  ResponsiveChartContainer,
} from '@gen-office/gen-chart';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

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

const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));
const maxCost = Math.max(...monthlyData.map((d) => d.cost));
const maxProfit = Math.max(...monthlyData.map((d) => d.profit));
const maxChannelValue = Math.max(...channelData.map((d) => d.value));

export default function ChartDemoPage(_props: PageComponentProps) {
  return (
    <div className={styles.page}>
      <PageHeader
        title="Chart Demo"
        description="Line, Bar(Column), Area, Composed, Pie, Donut samples"
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
                <CartesianChart<MonthlyPoint>
                  width={width}
                  height={height}
                  series={[
                    {
                      id: 'revenue',
                      type: 'line',
                      label: 'Revenue',
                      data: monthlyData,
                      x: (d) => d.month,
                      y: (d) => d.revenue,
                      showValueLabel: true,
                      valueLabelPredicate: (value) => value === maxRevenue,
                    },
                    {
                      id: 'cost',
                      type: 'line',
                      label: 'Cost',
                      data: monthlyData,
                      x: (d) => d.month,
                      y: (d) => d.cost,
                      showValueLabel: true,
                      valueLabelPredicate: (value) => value === maxCost,
                    },
                  ]}
                  interactive={{ tooltip: true, legend: true }}
                >
                  <ChartGrid />
                  <ChartXAxis />
                  <ChartYAxis />
                  <LineSeries seriesId="revenue" />
                  <LineSeries seriesId="cost" />
                  <ChartTooltip />
                  <ChartLegend />
                </CartesianChart>
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Bar (Column)</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={280} fallbackHeight={280}>
              {({ width, height }) => (
                <CartesianChart<MonthlyPoint>
                  width={width}
                  height={height}
                  series={[
                    {
                      id: 'revenue',
                      type: 'bar',
                      label: 'Revenue',
                      data: monthlyData,
                      x: (d) => d.month,
                      y: (d) => d.revenue,
                      showValueLabel: true,
                      valueLabelPredicate: (value) => value === maxRevenue,
                    },
                    {
                      id: 'cost',
                      type: 'bar',
                      label: 'Cost',
                      data: monthlyData,
                      x: (d) => d.month,
                      y: (d) => d.cost,
                      showValueLabel: true,
                      valueLabelPredicate: (value) => value === maxCost,
                    },
                  ]}
                  interactive={{ tooltip: true, legend: true }}
                >
                  <ChartGrid />
                  <ChartXAxis />
                  <ChartYAxis />
                  <BarSeries seriesId="revenue" />
                  <BarSeries seriesId="cost" />
                  <ChartTooltip />
                  <ChartLegend />
                </CartesianChart>
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Area</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={280} fallbackHeight={280}>
              {({ width, height }) => (
                <CartesianChart<MonthlyPoint>
                  width={width}
                  height={height}
                  series={[
                    {
                      id: 'profit-area',
                      type: 'area',
                      label: 'Profit',
                      data: monthlyData,
                      x: (d) => d.month,
                      y: (d) => d.profit,
                      showValueLabel: true,
                      valueLabelPredicate: (value) => value === maxProfit,
                    },
                  ]}
                  interactive={{ tooltip: true, legend: true }}
                >
                  <ChartGrid />
                  <ChartXAxis />
                  <ChartYAxis />
                  <AreaSeries seriesId="profit-area" />
                  <ChartTooltip />
                  <ChartLegend />
                </CartesianChart>
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Composed (Line + Bar)</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={280} fallbackHeight={280}>
              {({ width, height }) => (
                <CartesianChart<MonthlyPoint>
                  width={width}
                  height={height}
                  series={[
                    {
                      id: 'revenue-bar',
                      type: 'composed',
                      renderAs: 'bar',
                      label: 'Revenue',
                      data: monthlyData,
                      x: (d) => d.month,
                      y: (d) => d.revenue,
                      showValueLabel: true,
                      valueLabelPredicate: (value) => value === maxRevenue,
                    },
                    {
                      id: 'profit-line',
                      type: 'composed',
                      renderAs: 'line',
                      label: 'Profit',
                      data: monthlyData,
                      x: (d) => d.month,
                      y: (d) => d.profit,
                      showValueLabel: true,
                      valueLabelPredicate: (value) => value === maxProfit,
                    },
                  ]}
                  interactive={{ tooltip: true, legend: true }}
                >
                  <ChartGrid />
                  <ChartXAxis />
                  <ChartYAxis />
                  <ComposedSeries seriesId="revenue-bar" />
                  <ComposedSeries seriesId="profit-line" />
                  <ChartTooltip />
                  <ChartLegend />
                </CartesianChart>
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Pie</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={300} fallbackHeight={300}>
              {({ width, height }) => (
                <CartesianChart<ChannelPoint>
                  width={width}
                  height={height}
                  type="pie"
                  series={[
                    {
                      id: 'channel-pie',
                      type: 'pie',
                      label: 'Channel Share',
                      data: channelData,
                      category: (d) => d.channel,
                      value: (d) => d.value,
                      showValueLabel: true,
                      valueLabelPosition: 'inside',
                      valueLabelFormatter: (value, datum) => `${datum.channel}: ${value}`,
                    },
                  ]}
                  interactive={{ tooltip: true, legend: true }}
                >
                  <PieSeries seriesId="channel-pie" />
                  <ChartTooltip />
                  <ChartLegend />
                </CartesianChart>
              )}
            </ResponsiveChartContainer>
          </div>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Donut + Token Override</h3>
          <div className={styles.chartWrap}>
            <ResponsiveChartContainer minHeight={300} fallbackHeight={300}>
              {({ width, height }) => (
                <CartesianChart<ChannelPoint>
                  width={width}
                  height={height}
                  type="donut"
                  tokens={{
                    color: {
                      background: '#f8fbff',
                      seriesPalette: ['#0f766e', '#2563eb', '#f59e0b'],
                    },
                  }}
                  series={[
                    {
                      id: 'channel-donut',
                      type: 'donut',
                      label: 'Channel Share',
                      data: channelData,
                      category: (d) => d.channel,
                      value: (d) => d.value,
                      innerRadius: 72,
                      outerRadius: 118,
                      showValueLabel: true,
                      valueLabelPredicate: (value) => value === maxChannelValue,
                      valueLabelPosition: 'top',
                      valueLabelFormatter: (value, datum) => `${datum.channel}: ${value}`,
                    },
                  ]}
                  interactive={{ tooltip: true, legend: true }}
                >
                  <DonutSeries seriesId="channel-donut" />
                  <ChartTooltip />
                  <ChartLegend />
                </CartesianChart>
              )}
            </ResponsiveChartContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
