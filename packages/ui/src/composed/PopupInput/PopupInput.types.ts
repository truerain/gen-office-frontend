import type { ReactNode } from 'react';

export type PopupInputSelection<TData = unknown> = {
  value: string;
  label: string;
  data?: TData;
};

export type PopupInputContentRenderArgs<TData = unknown> = {
  open: boolean;
  close: () => void;
  value: string;
  displayValue: string;
  selection?: PopupInputSelection<TData> | null;
  setSelection: (selection: PopupInputSelection<TData> | null) => void;
};

export interface PopupInputProps<TData = unknown> {
  value?: string;
  displayValue?: string;
  selection?: PopupInputSelection<TData> | null;
  onValueChange?: (value: string) => void;
  onCommitValue?: (value: string, selection: PopupInputSelection<TData> | null) => void;
  onDisplayValueChange?: (displayValue: string) => void;
  onSelectionChange?: (selection: PopupInputSelection<TData> | null) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  openOnInputFocus?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  content: ReactNode | ((args: PopupInputContentRenderArgs<TData>) => ReactNode);
  triggerAriaLabel?: string;
  triggerIcon?: ReactNode;
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  inputClassName?: string;
  contentClassName?: string;
}
