# @gen-office/gen-grid-chart

Reusable range-to-chart model builder and chart preview dialog for GenGrid selections.

## CSS requirement

This package renders charts via `@gen-office/gen-chart`. Import chart styles in your app entry:

```ts
import '@gen-office/gen-chart/index.css';
```

## Quick use (single option)

Use `useRangeChartContextMenu` to bind menu actions and dialog state with one options object.

- `chartKinds`: `['column', 'bar', 'line', 'area', 'pie', 'donut']`
- `barModes`: `['grouped', 'stacked', 'stacked100']` (applies to `column` and `bar`)
- `pie/donut`: when multiple numeric series are selected, a series `Select` appears in the dialog.
