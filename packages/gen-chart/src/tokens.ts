import { lightChartTokens, type ChartTokens, type DeepPartial } from '@gen-office/theme';
import { ChartTheme } from './types';

function sanitizeNumber(value: number | undefined, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) return fallback;
  return value;
}

function mergeChartTokens(base: ChartTokens, override?: DeepPartial<ChartTokens>): ChartTokens {
  if (!override) return base;
  return {
    color: {
      ...base.color,
      ...override.color,
      seriesPalette:
        override.color?.seriesPalette && override.color.seriesPalette.length > 0
          ? [...override.color.seriesPalette]
          : base.color.seriesPalette,
    },
    typography: {
      ...base.typography,
      ...override.typography,
    },
    spacing: {
      ...base.spacing,
      ...override.spacing,
    },
    border: {
      ...base.border,
      ...override.border,
    },
    motion: {
      ...base.motion,
      ...override.motion,
    },
  };
}

function mapLegacyTheme(theme?: ChartTheme): DeepPartial<ChartTokens> {
  if (!theme) return {};
  return {
    color: {
      background: theme.background,
      grid: theme.gridColor,
      textPrimary: theme.textColor,
      axis: theme.axisColor,
      seriesPalette: theme.palette,
    },
    typography: {
      fontFamily: theme.fontFamily,
    },
  };
}

export function resolveChartTokens(theme?: ChartTheme, override?: DeepPartial<ChartTokens>): ChartTokens {
  const withLegacy = mergeChartTokens(lightChartTokens, mapLegacyTheme(theme));
  const merged = mergeChartTokens(withLegacy, override);

  return {
    ...merged,
    spacing: {
      ...merged.spacing,
      paddingTop: sanitizeNumber(merged.spacing.paddingTop, lightChartTokens.spacing.paddingTop),
      paddingRight: sanitizeNumber(merged.spacing.paddingRight, lightChartTokens.spacing.paddingRight),
      paddingBottom: sanitizeNumber(merged.spacing.paddingBottom, lightChartTokens.spacing.paddingBottom),
      paddingLeft: sanitizeNumber(merged.spacing.paddingLeft, lightChartTokens.spacing.paddingLeft),
      axisTickGap: sanitizeNumber(merged.spacing.axisTickGap, lightChartTokens.spacing.axisTickGap),
      legendItemGap: sanitizeNumber(merged.spacing.legendItemGap, lightChartTokens.spacing.legendItemGap),
      legendMarkerSize: sanitizeNumber(merged.spacing.legendMarkerSize, lightChartTokens.spacing.legendMarkerSize),
      tooltipPaddingX: sanitizeNumber(merged.spacing.tooltipPaddingX, lightChartTokens.spacing.tooltipPaddingX),
      tooltipPaddingY: sanitizeNumber(merged.spacing.tooltipPaddingY, lightChartTokens.spacing.tooltipPaddingY),
    },
    border: {
      ...merged.border,
      tooltipRadius: sanitizeNumber(merged.border.tooltipRadius, lightChartTokens.border.tooltipRadius),
      tooltipBorderWidth: sanitizeNumber(
        merged.border.tooltipBorderWidth,
        lightChartTokens.border.tooltipBorderWidth
      ),
      seriesStrokeWidth: sanitizeNumber(
        merged.border.seriesStrokeWidth,
        lightChartTokens.border.seriesStrokeWidth
      ),
      gridWidth: sanitizeNumber(merged.border.gridWidth, lightChartTokens.border.gridWidth),
      axisWidth: sanitizeNumber(merged.border.axisWidth, lightChartTokens.border.axisWidth),
    },
    motion: {
      ...merged.motion,
      durationMs: sanitizeNumber(merged.motion.durationMs, lightChartTokens.motion.durationMs),
    },
  };
}

