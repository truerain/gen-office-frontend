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
  { month: 'Mar', revenue: 110, expense: 85, margin: 25 },
  { month: 'Apr', revenue: 160, expense: 100, margin: 60 },
  { month: 'May', revenue: 170, expense: 120, margin: 50 },
  { month: 'Jun', revenue: 150, expense: 105, margin: 45 },
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
