import type { Meta, StoryObj } from '@storybook/react';

import { GenChart } from './GenChart';

type SalesRow = {
  month: string;
  revenue: number;
  expense: number;
  margin: number;
};

const salesData: SalesRow[] = [
  { month: 'Jan', revenue: 120, expense: 80, margin: 40 },
  { month: 'Feb', revenue: 140, expense: 95, margin: 45 },
  { month: 'Mar', revenue: 78, expense: 85, margin: 25 },
  { month: 'Apr', revenue: 160, expense: 100, margin: 60 },
  { month: 'May', revenue: 170, expense: 120, margin: 50 },
  { month: 'Jun', revenue: 150, expense: null, margin: 45 },
];

const pnlData: Array<{ month: string; profit: number; target: number }> = [
  { month: 'Jan', profit: 26, target: 18 },
  { month: 'Feb', profit: -12, target: -6 },
  { month: 'Mar', profit: 18, target: 12 },
  { month: 'Apr', profit: -24, target: -14 },
  { month: 'May', profit: 32, target: 22 },
  { month: 'Jun', profit: -8, target: -4 },
];

const meta: Meta<typeof GenChart<SalesRow>> = {
  title: 'gen-chart/GenChart',
  component: GenChart<SalesRow>,
};

export default meta;

type Story = StoryObj<typeof GenChart<SalesRow>>;

export const BarBasic: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="bar"
      width={760}
      height={360}
      data={salesData}
      x={(d) => d.month}
      series={[
        { id: 'revenue', type: 'bar', y: (d) => d.revenue, label: 'Revenue', color: '#2563eb'},
        { id: 'expense', type: 'bar', y: (d) => d.expense, label: 'Expense', color: '#f97316', strokeColor: '#1e40af', strokeWidth: 3 },
      ]}
      legend
      tooltip
      tokens={{
        border: {
          seriesStrokeWidth: 1,
          seriesStrokeColor: '#000',
        }
      }}
    />
  ),
};

export const ComposedLineBar: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="composed"
      width={760}
      height={360}
      data={salesData}
      x={(d) => d.month}
      series={[
        { id: 'revenue', type: 'bar', y: (d) => d.revenue, label: 'Revenue', color: '#0ea5e9' },
        { id: 'expense', type: 'bar', y: (d) => d.expense, label: 'Expense', color: '#f43f5e' },
        { id: 'margin', type: 'line', y: (d) => d.margin, label: 'Margin', strokeColor: '#f43f5e', curve: 'monotoneX' },
      ]}
      legend={{ enabled: true, position: 'bottom' }}
      tooltip
    />
  ),
};

export const LineTopXAxis: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="line"
      width={760}
      height={360}
      data={salesData}
      x={(d) => d.month}
      xAxis={{ position: 'top', showAllTicks: true, showTicks: false }}
      yAxis={{max: 230, show: false}}
      series={[
        { id: 'revenue', type: 'bar', y: (d) => d.revenue, label: 'Revenue', showValueLabel: true, strokeColor: '#2563eb' },
        { id: 'margin', type: 'line', y: (d) => d.margin, label: 'Margin', strokeColor: '#f43f5e', curve: 'monotoneX' },
      ]}
      grid={false}
      legend
      tooltip
    />
  ),
};

export const DualYAxisLine: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="line"
      width={760}
      height={360}
      data={salesData}
      x={(d) => d.month}
      yAxis={{ min: 0, max: 220, tickCount: 6, tickFormat: (v) => `${v}` }}
      yAxes={{
        right: {
          position: 'right',
          min: 0,
          max: 70,
          tickCount: 8,
          tickFormat: (v) => `${v}%`,
          show: false
        },
      }}
      series={[
        { id: 'revenue', type: 'line', y: (d) => d.revenue, yAxisId: 'left', showValueLabel: false, label: 'Revenue', strokeColor: '#2563eb', curve: 'monotoneX' },
        { id: 'margin', type: 'line', y: (d) => d.margin, yAxisId: 'right', showValueLabel: true, label: 'Margin', strokeColor: '#f43f5e', curve: 'monotoneX' },
      ]}
      legend
      tooltip
    />
  ),
};

export const ValueLabelStyledWithOverlapAvoidance: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="line"
      width={760}
      height={360}
      avoidValueLabelOverlap
      data={salesData}
      x={(d) => d.month}
      yAxis={{ min: 0, max: 180 }}
      series={[
        {
          id: 'revenue',
          type: 'line',
          y: (d) => d.revenue,
          label: 'Revenue',
          strokeColor: '#2563eb',
          curve: 'monotoneX',
          showValueLabel: true,
          hideZeroValueLabel: true,
          valueLabelStyle: { color: '#1e3a8a', fontSize: 12, fontWeight: 700 },
          valueLabelOffsetY: -10,
          valueLabelFormatter: (value) => `${value}`,
        },
        {
          id: 'expense',
          type: 'line',
          y: (d) => d.expense,
          label: 'Expense',
          strokeColor: '#dc2626',
          curve: 'monotoneX',
          showValueLabel: true,
          hideZeroValueLabel: true,
          valueLabelStyle: { color: '#7f1d1d', fontSize: 11, fontWeight: 600, opacity: 0.9 },
          valueLabelOffsetY: 8,
          valueLabelFormatter: (value) => `${value}`,
        },
      ]}
      legend
      tooltip
    />
  ),
};

export const BarNegativeValues: Story = {
  render: () => (
    <GenChart<{ month: string; profit: number; target: number }>
      kind="bar"
      width={760}
      height={360}
      data={pnlData}
      x={(d) => d.month}
      yAxis={{ min: -30, max: 40, tickCount: 8 }}
      series={[
        {
          id: 'profit',
          type: 'bar',
          label: 'Profit',
          y: (d) => d.profit,
          color: '#2563eb',
          negativeColor: '#dc2626',
          showValueLabel: true,
          valueLabelStyle: (value) => ({
            color: value < 0 ? '#7f1d1d' : '#1e3a8a',
            fontWeight: 700,
          }),
        },
        {
          id: 'target',
          type: 'bar',
          label: 'Target',
          y: (d) => d.target,
          color: '#0ea5e9',
          negativeColor: '#b91c1c',
          showValueLabel: true,
          valueLabelStyle: (value) => ({
            color: value < 0 ? '#7f1d1d' : '#0c4a6e',
            fontWeight: 600,
            opacity: 0.9,
          }),
        },
      ]}
      legend
      tooltip
    />
  ),
};

export const BarNegativeValuesOverlapAvoidance: Story = {
  render: () => (
    <GenChart<{ month: string; profit: number; target: number }>
      kind="bar"
      width={760}
      height={360}
      avoidValueLabelOverlap
      data={pnlData}
      x={(d) => d.month}
      yAxis={{ min: -30, max: 40, tickCount: 8 }}
      series={[
        {
          id: 'profit',
          type: 'bar',
          label: 'Profit',
          y: (d) => d.profit,
          color: '#2563eb',
          negativeColor: '#dc2626',
          showValueLabel: true,
          valueLabelStyle: (value) => ({
            color: value < 0 ? '#7f1d1d' : '#1e3a8a',
            fontWeight: 700,
          }),
        },
        {
          id: 'target',
          type: 'bar',
          label: 'Target',
          y: (d) => d.target,
          color: '#0ea5e9',
          negativeColor: '#b91c1c',
          showValueLabel: true,
          valueLabelStyle: (value) => ({
            color: value < 0 ? '#7f1d1d' : '#0c4a6e',
            fontWeight: 600,
            opacity: 0.9,
          }),
        },
      ]}
      legend
      tooltip
    />
  ),
};
