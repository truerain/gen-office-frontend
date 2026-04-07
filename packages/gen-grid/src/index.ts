// packages/gen-grid/src/index.ts

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
