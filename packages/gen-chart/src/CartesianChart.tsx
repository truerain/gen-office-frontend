import * as React from 'react';
import { ChartProvider, ChartHoverState } from './ChartContext';
import { useGenChart } from './useGenChart';
import { UseGenChartOptions } from './types';

export interface CartesianChartProps<TDatum> extends UseGenChartOptions<TDatum> {
  children?: React.ReactNode;
}

export function CartesianChart<TDatum>(props: CartesianChartProps<TDatum>): JSX.Element {
  const chart = useGenChart(props);
  const [hover, setHover] = React.useState<ChartHoverState<TDatum> | null>(null);

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!chart.options.interactive?.tooltip && !chart.options.interactive?.crosshair) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const point = chart.getNearestDatum(x, y);
      if (point === null) {
        setHover(null);
        return;
      }
      setHover({ point, pointerX: x, pointerY: y });
    },
    [chart]
  );

  return (
    <ChartProvider<TDatum> value={{ chart, hover, setHover }}>
      <div className="gen-chart-root" style={{ width: chart.width, height: chart.height }}>
        <svg
          width={chart.width}
          height={chart.height}
          viewBox={`0 0 ${chart.width} ${chart.height}`}
          role="img"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHover(null)}
          style={{ background: chart.tokens.color.background }}
        >
          {props.children}
        </svg>
      </div>
    </ChartProvider>
  );
}
