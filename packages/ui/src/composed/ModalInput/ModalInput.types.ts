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

type ModalInputBaseProps<TData = unknown> = {
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
  modalWidth?: number | string;
  modalHeight?: number | string;
  listColumns?: ModalInputListColumn<TData>[];
  className?: string;
  inputClassName?: string;
  dialogClassName?: string;
  listClassName?: string;
  formatDisplayValue?: (
    selectedItems: ModalInputSelection<TData>[],
    mode: 'single' | 'multi'
  ) => string;
};

export type SingleModalInputProps<TData = unknown> = ModalInputBaseProps<TData> & {
  mode: 'single';
  selectedItem?: ModalInputSelection<TData> | null;
  onSelectedItemChange?: (selectedItem: ModalInputSelection<TData> | null) => void;
  onCommit?: (selectedItem: ModalInputSelection<TData> | null) => void;
};

export type MultiModalInputProps<TData = unknown> = ModalInputBaseProps<TData> & {
  mode: 'multi';
  selectedItems?: ModalInputSelection<TData>[];
  onSelectedItemsChange?: (selectedItems: ModalInputSelection<TData>[]) => void;
  onCommit?: (selectedItems: ModalInputSelection<TData>[]) => void;
};

export type ModalInputProps<TData = unknown> =
  | SingleModalInputProps<TData>
  | MultiModalInputProps<TData>;
