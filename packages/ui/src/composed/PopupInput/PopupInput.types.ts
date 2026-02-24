import type { ReactNode } from 'react';

export type PopupInputContentRenderArgs = {
  open: boolean;
  close: () => void;
  value: string;
};

export interface PopupInputProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  openOnInputFocus?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  content: ReactNode | ((args: PopupInputContentRenderArgs) => ReactNode);
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
