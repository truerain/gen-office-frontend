// packages/gen-grid/src/index.ts

// 1. main component
export { GenGrid } from './GenGrid';

// 2. types
export type {
  GenGridProps,
  GenGridEditorFactory,
  GenGridEditorContext,
  GenGridTreeOptions,
} from './GenGrid.types';
export type { GenGridHandle } from './types/GenGridHandle';

// 3. provider
export { GenGridProvider, useGenGridContext } from './core/context/GenGridProvider';

// 4. helpers
export {
  textColumn,
  numberColumn,
  currencyColumn,
  dateColumn,
  selectColumn,
} from './helpers/columnHelpers';
