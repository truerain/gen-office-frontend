export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export interface ChartColorTokens {
  background: string;
  textPrimary: string;
  textMuted: string;
  axis: string;
  grid: string;
  crosshair: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  legendText: string;
  legendTextMuted: string;
  seriesPalette: string[];
}

export interface ChartTypographyTokens {
  fontFamily: string;
  axisTickFontSize: number;
  legendFontSize: number;
  tooltipFontSize: number;
}

export interface ChartSpacingTokens {
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  axisTickGap: number;
  legendItemGap: number;
  legendMarkerSize: number;
  tooltipPaddingX: number;
  tooltipPaddingY: number;
}

export interface ChartBorderTokens {
  tooltipRadius: number;
  tooltipBorderWidth: number;
  seriesStrokeWidth: number;
  gridWidth: number;
  axisWidth: number;
}

export interface ChartMotionTokens {
  enabled: boolean;
  durationMs: number;
  easing: 'linear' | 'easeOut' | 'easeInOut';
}

export interface ChartTokens {
  color: ChartColorTokens;
  typography: ChartTypographyTokens;
  spacing: ChartSpacingTokens;
  border: ChartBorderTokens;
  motion: ChartMotionTokens;
}

