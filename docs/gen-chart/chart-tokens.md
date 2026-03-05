# gen-chart ChartTokens Spec (Draft)

## 목적
- `gen-chart`의 시각 표현을 일관되게 제어하는 UI 토큰 규격을 정의한다.
- 하드코딩 색상/크기 값을 제거하고, theme override를 안전하게 허용한다.
- 기본 정의 위치는 `@gen-office/theme` (`packages/theme`)로 고정한다.

## 설계 원칙
- semantic token 우선: 구현 컴포넌트가 아닌 의미 단위로 이름을 정의한다.
- 상태 분리: `default`, `muted`, `active`, `disabled` 상태를 토큰으로 구분한다.
- 최소 단위 고정: 색상(color), 타이포(typography), 간격(spacing), 보더(border), 모션(motion)으로 분리한다.
- backwards compatibility: 기존 `ChartTheme` 필드는 `ChartTokens`로 매핑 가능한 alias로 유지한다.

## 타입 초안
```ts
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
```

## 기본 토큰 (Light)
```ts
export const lightChartTokens: ChartTokens = {
  color: {
    background: '#ffffff',
    textPrimary: '#111827',
    textMuted: '#6b7280',
    axis: '#6b7280',
    grid: '#e5e7eb',
    crosshair: '#9ca3af',
    tooltipBg: '#ffffff',
    tooltipBorder: '#d1d5db',
    tooltipText: '#111827',
    legendText: '#111827',
    legendTextMuted: '#9ca3af',
    seriesPalette: ['#2563eb', '#16a34a', '#f59e0b', '#db2777', '#7c3aed', '#0891b2'],
  },
  typography: {
    fontFamily: 'var(--font-family, system-ui, -apple-system, Segoe UI, sans-serif)',
    axisTickFontSize: 11,
    legendFontSize: 11,
    tooltipFontSize: 11,
  },
  spacing: {
    paddingTop: 12,
    paddingRight: 16,
    paddingBottom: 30,
    paddingLeft: 42,
    axisTickGap: 4,
    legendItemGap: 12,
    legendMarkerSize: 10,
    tooltipPaddingX: 8,
    tooltipPaddingY: 6,
  },
  border: {
    tooltipRadius: 6,
    tooltipBorderWidth: 1,
    seriesStrokeWidth: 2,
    gridWidth: 1,
    axisWidth: 1,
  },
  motion: {
    enabled: true,
    durationMs: 240,
    easing: 'easeOut',
  },
};
```

## 컴포넌트 매핑 규칙
- `ChartGrid`:
- `color.grid`, `border.gridWidth`
- `ChartXAxis`, `ChartYAxis`:
- `color.axis`, `color.textMuted`, `typography.axisTickFontSize`, `border.axisWidth`, `spacing.axisTickGap`
- `LineSeries`, `AreaSeries`, `BarSeries`, `PieSeries`, `DonutSeries`:
- `color.seriesPalette`, `border.seriesStrokeWidth`
- `ChartTooltip`:
- `color.tooltipBg`, `color.tooltipBorder`, `color.tooltipText`, `border.tooltipRadius`, `border.tooltipBorderWidth`, `typography.tooltipFontSize`, `spacing.tooltipPaddingX`, `spacing.tooltipPaddingY`
- `ChartLegend`:
- `color.legendText`, `color.legendTextMuted`, `typography.legendFontSize`, `spacing.legendItemGap`, `spacing.legendMarkerSize`

## Theme Override 규칙
- 사용자 입력은 `DeepPartial<ChartTokens>`를 허용한다.
- merge 우선순위: `default tokens` <- `theme preset` <- `chart props override`
- `seriesPalette`가 비어 있으면 default palette로 fallback한다.
- numeric token은 음수 입력을 허용하지 않는다(음수면 default로 대체).

## 기존 ChartTheme 호환 매핑
- `ChartTheme.background` -> `color.background`
- `ChartTheme.gridColor` -> `color.grid`
- `ChartTheme.textColor` -> `color.textPrimary`
- `ChartTheme.axisColor` -> `color.axis`
- `ChartTheme.fontFamily` -> `typography.fontFamily`
- `ChartTheme.palette` -> `color.seriesPalette`

## 검증 체크리스트
- 토큰 미지정 시에도 모든 컴포넌트가 렌더된다.
- 하드코딩 색상/폰트/치수 값이 컴포넌트에서 제거된다.
- `series hidden/disabled` 상태가 legend 텍스트 토큰으로 구분된다.
- `prefers-reduced-motion` 환경에서 `motion.enabled=false`가 우선 적용된다.
