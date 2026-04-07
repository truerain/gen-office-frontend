export type MonthRange = {
  from?: Date;
  to?: Date;
};

export interface RangeMonthPickerProps {
  value?: MonthRange;
  onChange?: (range?: MonthRange) => void;
  fromMonth?: Date;
  toMonth?: Date;
  placeholder?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
  locale?: string;
  format?: (date: Date) => string;
  clearable?: boolean;
  className?: string;
}
