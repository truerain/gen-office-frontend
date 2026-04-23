// packages/gen-grid/src/index.ts

import './core/table/tanstack-table';

// 1. main component
export { GenGrid } from './GenGrid';

// 2. types
export type {
  GenGridProps,
  GenGridEditorFactory,
  GenGridEditorContext,
  GenGridTreeOptions,
  GenGridContextMenuCell,
  GenGridContextMenuActionContext,
  GenGridContextMenuCustomAction,
  GenGridContextMenuOptions,
} from './GenGrid.types';
export type {
  GenGridValidationTrigger,
  GenGridValidationError,
  GenGridFieldValidatorContext,
  GenGridFieldValidator,
  GenGridValidationRule,
  GenGridFieldValidationMeta,
} from './validation/types';
export type { GenGridHandle } from './types/GenGridHandle';
export type { GenGridTableActions } from './core/table/tanstack-table';

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
export { PopupEditor } from './features/editing/PopupEditor';
export type { PopupEditorSelection } from './features/editing/PopupEditor';
export { ModalEditor } from './features/editing/ModalEditor';
export type { ModalEditorSelection } from './features/editing/ModalEditor';
