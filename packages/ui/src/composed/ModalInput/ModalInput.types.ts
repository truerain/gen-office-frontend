import type { ReactNode } from 'react';

export type ModalInputSelection<TData = unknown> = {
  value: string;
  label: string;
  description?: string;
  data?: TData;
  disabled?: boolean;
  keywords?: string[];
};

export type ModalInputListColumn<TData = unknown> = {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (item: ModalInputSelection<TData>) => ReactNode;
};

export interface ModalInputProps<TData = unknown> {
  value?: string;
  displayValue?: string;
  selection?: ModalInputSelection<TData> | null;
  onValueChange?: (value: string) => void;
  onDisplayValueChange?: (displayValue: string) => void;
  onSelectionChange?: (selection: ModalInputSelection<TData> | null) => void;
  onCommitValue?: (value: string, selection: ModalInputSelection<TData> | null) => void;
  items?: ModalInputSelection<TData>[];
  fetchItems?: (keyword: string) => Promise<ModalInputSelection<TData>[]>;
  searchOnInputChange?: boolean;
  title?: string;
  modalDescription?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  openOnInputFocus?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerAriaLabel?: string;
  triggerIcon?: ReactNode;
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  confirmOnDoubleClick?: boolean;
  autoFocusSearch?: boolean;
  modalHeight?: number | string;
  listColumns?: ModalInputListColumn<TData>[];
  className?: string;
  inputClassName?: string;
  dialogClassName?: string;
  listClassName?: string;
}
