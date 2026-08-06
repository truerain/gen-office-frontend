// packages/debug/src/index.ts
// Public entry for @gen-office/debug (state + render inspection hooks).

export { resolveDebugEnabled } from './env';
export type { DebugEnabledOptions } from './env';

export {
  useDebugState,
  useRenderCount,
  useWhyRender,
} from './hooks';

export type {
  UseDebugStateOptions,
  UseRenderCountOptions,
  UseWhyRenderOptions,
  WhyRenderDeps,
} from './hooks';
