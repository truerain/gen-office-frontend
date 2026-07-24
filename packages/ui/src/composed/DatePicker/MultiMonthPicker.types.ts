// packages/ui/src/composed/DatePicker/MultiMonthPicker.types.ts
// Public props for MultiMonthPicker (non-contiguous multi-month selection).

export interface MultiMonthPickerProps {
  value?: Date[];
  onChange?: (months?: Date[]) => void;
  fromMonth?: Date;
  toMonth?: Date;
  placeholder?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
  locale?: string;
  format?: (date: Date) => string;
  /** When true, shows a clear button in the popover. Default: true. */
  clearable?: boolean;
  /** Number of year panels in the popover. Default: 1. */
  visibleYears?: 1 | 2;
  className?: string;
}
