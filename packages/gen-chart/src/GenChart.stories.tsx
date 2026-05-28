import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { GenChart } from './GenChart';
import type { TreemapNode } from './types';
import './index.css';

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

const motionSalesData: SalesRow[][] = [
  salesData,
  [
    { month: 'Jan', revenue: 108, expense: 78, margin: 30 },
    { month: 'Feb', revenue: 126, expense: 88, margin: 38 },
    { month: 'Mar', revenue: 171, expense: 101, margin: 70 },
    { month: 'Apr', revenue: 149, expense: 94, margin: 55 },
    { month: 'May', revenue: 194, expense: 118, margin: 76 },
    { month: 'Jun', revenue: 205, expense: 121, margin: 84 },
  ],
  [
    { month: 'Jan', revenue: 142, expense: 96, margin: 46 },
    { month: 'Feb', revenue: 131, expense: 90, margin: 41 },
    { month: 'Mar', revenue: 158, expense: 108, margin: 50 },
    { month: 'Apr', revenue: 188, expense: 119, margin: 69 },
    { month: 'May', revenue: 176, expense: 111, margin: 65 },
    { month: 'Jun', revenue: 219, expense: 126, margin: 93 },
  ],
];

const channelData = [
  { channel: 'Web', value: 49 },
  { channel: 'Mobile', value: 31 },
  { channel: 'Store', value: 20 },
];

const motionChannelData = [
  channelData,
  [
    { channel: 'Web', value: 38 },
    { channel: 'Mobile', value: 42 },
    { channel: 'Store', value: 20 },
  ],
  [
    { channel: 'Web', value: 55 },
    { channel: 'Mobile', value: 25 },
    { channel: 'Store', value: 20 },
  ],
];

const treemapData: TreemapNode = {
  id: 'root',
  name: 'Channels',
  children: [
    {
      id: 'digital',
      name: 'Digital',
      children: [
        { id: 'web', name: 'Web', value: 49 },
        { id: 'mobile', name: 'Mobile', value: 31 },
        { id: 'app', name: 'App', value: 26 },
      ],
    },
    {
      id: 'offline',
      name: 'Offline',
      children: [
        { id: 'store', name: 'Store', value: 20 },
        { id: 'partners', name: 'Partners', value: 14 },
      ],
    },
  ],
};

const motionTreemapData: TreemapNode[] = [
  treemapData,
  {
    id: 'root',
    name: 'Channels',
    children: [
      {
        id: 'digital',
        name: 'Digital',
        children: [
          { id: 'web', name: 'Web', value: 62 },
          { id: 'mobile', name: 'Mobile', value: 18 },
          { id: 'app', name: 'App', value: 34 },
        ],
      },
      {
        id: 'offline',
        name: 'Offline',
        children: [
          { id: 'store', name: 'Store', value: 12 },
          { id: 'partners', name: 'Partners', value: 28 },
        ],
      },
    ],
  },
];

const storyToolbarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
};

const storyButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
};

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

export const BarOverlay: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="bar"
      width={760}
      height={360}
      data={salesData}
      x={(d) => d.month}
      series={[
        {
          id: 'revenue',
          type: 'bar',
          layout: 'overlay',
          y: (d) => d.revenue,
          label: 'Revenue',
          color: '#2563eb',
        },
        {
          id: 'expense',
          type: 'bar',
          layout: 'overlay',
          y: (d) => d.expense,
          label: 'Expense',
          color: '#f97316',
        },
      ]}
      legend
      tooltip
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
          valueLabelOffsetY: (value, _datum, index) => (index % 2 === 0 ? -12 : -8) + (value >= 120 ? -2 : 0),
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
          color: (value, _, index) => (index === 0 ? '#1d4ed8' : value >= 0 ? '#60a5fa' : '#93c5fd'),
          negativeColor: '#dc2626',
          showValueLabel: true,
          valueLabelOffsetY: (value) => (value < 0 ? 2 : -2),
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
          color: (value) => (value >= 15 ? '#0f766e' : value >= 0 ? '#2dd4bf' : '#99f6e4'),
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

export const MotionEnterBar: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="bar"
      width={760}
      height={360}
      data={salesData}
      x={(d) => d.month}
      series={[
        { id: 'revenue', type: 'bar', y: (d) => d.revenue, label: 'Revenue', color: '#2563eb' },
        { id: 'expense', type: 'bar', y: (d) => d.expense, label: 'Expense', color: '#f97316' },
      ]}
      motion={{ mode: 'enter', durationMs: 1200, easing: 'easeOut' }}
      legend
      tooltip
    />
  ),
};

export const MotionEnterLine: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="line"
      width={760}
      height={360}
      data={salesData}
      x={(d) => d.month}
      series={[
        {
          id: 'revenue',
          type: 'line',
          y: (d) => d.revenue,
          label: 'Revenue',
          strokeColor: '#2563eb',
          curve: 'monotoneX',
        },
        {
          id: 'margin',
          type: 'line',
          y: (d) => d.margin,
          label: 'Margin',
          strokeColor: '#f43f5e',
          curve: 'monotoneX',
        },
      ]}
      motion={{ mode: 'enter', durationMs: 1000, easing: 'easeInOut' }}
      legend
      tooltip
    />
  ),
};

function MotionResetOnChangeComposedDemo() {
  const [sampleIndex, setSampleIndex] = React.useState(0);
  const data = motionSalesData[sampleIndex] ?? motionSalesData[0];

  return (
    <div>
      <div style={storyToolbarStyle}>
        <button
          type="button"
          style={storyButtonStyle}
          onClick={() => setSampleIndex((index) => (index + 1) % motionSalesData.length)}
        >
          Change data
        </button>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          Sample {sampleIndex + 1} / {motionSalesData.length} · reset-on-change
        </span>
      </div>
      <GenChart<SalesRow>
        kind="composed"
        width={760}
        height={360}
        data={data}
        x={(d) => d.month}
        yAxis={{ min: 0, max: 240 }}
        series={[
          { id: 'revenue', type: 'bar', y: (d) => d.revenue, label: 'Revenue', color: '#0ea5e9' },
          {
            id: 'margin',
            type: 'line',
            y: (d) => d.margin,
            label: 'Margin',
            strokeColor: '#f43f5e',
            curve: 'monotoneX',
          },
        ]}
        motion={{
          mode: 'reset-on-change',
          changeKey: sampleIndex,
          durationMs: 2000,
          easing: 'easeOut',
        }}
        legend
        tooltip
      />
    </div>
  );
}

export const MotionResetOnChangeComposed: Story = {
  render: () => <MotionResetOnChangeComposedDemo />,
};

function MotionResetOnChangePieDemo() {
  const [sampleIndex, setSampleIndex] = React.useState(0);
  const data = motionChannelData[sampleIndex] ?? motionChannelData[0];

  return (
    <div>
      <div style={storyToolbarStyle}>
        <button
          type="button"
          style={storyButtonStyle}
          onClick={() => setSampleIndex((index) => (index + 1) % motionChannelData.length)}
        >
          Change data
        </button>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          Sample {sampleIndex + 1} / {motionChannelData.length}
        </span>
      </div>
      <GenChart
        kind="donut"
        width={760}
        height={360}
        data={data}
        category={(d) => d.channel}
        value={(d) => d.value}
        motion={{
          mode: 'reset-on-change',
          changeKey: sampleIndex,
          durationMs: 1600,
          easing: 'easeOut',
        }}
        legend
        tooltip
      />
    </div>
  );
}

export const MotionResetOnChangeDonut: Story = {
  render: () => <MotionResetOnChangePieDemo />,
};

function MotionResetOnChangeTreemapDemo() {
  const [sampleIndex, setSampleIndex] = React.useState(0);
  const data = motionTreemapData[sampleIndex] ?? motionTreemapData[0];

  return (
    <div>
      <div style={storyToolbarStyle}>
        <button
          type="button"
          style={storyButtonStyle}
          onClick={() => setSampleIndex((index) => (index + 1) % motionTreemapData.length)}
        >
          Change data
        </button>
        <span style={{ fontSize: 13, color: '#6b7280' }}>
          Sample {sampleIndex + 1} / {motionTreemapData.length}
        </span>
      </div>
      <GenChart
        kind="treemap"
        width={760}
        height={360}
        data={data}
        color={(node) =>
          ({
            web: '#2563eb',
            mobile: '#0f766e',
            app: '#7c3aed',
            store: '#f59e0b',
            partners: '#db2777',
          })[node.id] ?? '#475569'
        }
        motion={{
          mode: 'reset-on-change',
          changeKey: sampleIndex,
          durationMs: 1400,
          easing: 'easeOut',
        }}
        tooltip
      />
    </div>
  );
}

export const MotionResetOnChangeTreemap: Story = {
  render: () => <MotionResetOnChangeTreemapDemo />,
};

export const MotionDisabled: Story = {
  render: () => (
    <GenChart<SalesRow>
      kind="bar"
      width={760}
      height={360}
      data={salesData}
      x={(d) => d.month}
      series={[
        { id: 'revenue', type: 'bar', y: (d) => d.revenue, label: 'Revenue', color: '#2563eb' },
        { id: 'expense', type: 'bar', y: (d) => d.expense, label: 'Expense', color: '#f97316' },
      ]}
      motion={false}
      legend
      tooltip
    />
  ),
};
