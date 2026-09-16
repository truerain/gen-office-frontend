// packages/ui/src/composed/CustomModalInput/CustomModalInput.types.ts
// Public props for CustomModalInput — trigger + dialog shell with app-provided body.

import type { ReactNode } from 'react';
import type { SimpleDialogSize } from '../../core/Dialog';

export type CustomModalInputRenderContext<T> = {
  /** Draft value while the dialog is open (not yet committed). */
  value: T;
  /** Update the draft only; committed on Confirm. */
  onChange: (next: T) => void;
  /** Close without committing. */
  close: () => void;
  /**
   * Commit and close.
   * Pass `next` to commit that value immediately (e.g. row double-click);
   * omit to commit the current draft.
   */
  confirm: (next?: T) => void;
};

export type CustomModalInputProps<T> = {
  value: T;
  onChange: (next: T) => void;
  /** Text shown in the trigger input. */
  displayValue: string;
  /**
   * Dialog body. Receives draft `value` / `onChange`.
   * Not an extension of ModalInput list APIs.
   */
  render: (ctx: CustomModalInputRenderContext<T>) => ReactNode;
  title: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  /** Value applied when the trigger clear control is used. Required for clearable when `onClear` is omitted. */
  emptyValue?: T;
  /** Optional clear handler; wins over `emptyValue` when both are set. */
  onClear?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  size?: SimpleDialogSize;
  /** Dialog content height in px. Passed to SimpleDialog as initialHeight. @default 360 */
  modalHeight?: number;
  /** Dialog content width in px. Passed to SimpleDialog as initialWidth. */
  modalWidth?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerAriaLabel?: string;
  triggerIcon?: ReactNode;
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  dialogClassName?: string;
};
