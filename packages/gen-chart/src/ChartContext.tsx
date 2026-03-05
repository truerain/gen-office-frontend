import * as React from 'react';
import { GenChartNearestDatum, UseGenChartResult } from './types';

export interface ChartHoverState<TDatum> {
  point: GenChartNearestDatum<TDatum>;
  pointerX: number;
  pointerY: number;
}

export interface ChartContextValue<TDatum> {
  chart: UseGenChartResult<TDatum>;
  hover: ChartHoverState<TDatum> | null;
  setHover: (value: ChartHoverState<TDatum> | null) => void;
}

const ChartContext = React.createContext<ChartContextValue<unknown> | null>(null);

export function ChartProvider<TDatum>({
  value,
  children,
}: {
  value: ChartContextValue<TDatum>;
  children: React.ReactNode;
}) {
  return <ChartContext.Provider value={value as ChartContextValue<unknown>}>{children}</ChartContext.Provider>;
}

export function useChartContext<TDatum>() {
  const value = React.useContext(ChartContext);
  if (value === null) {
    throw new Error('gen-chart: Chart component must be used inside <CartesianChart>.');
  }
  return value as ChartContextValue<TDatum>;
}

