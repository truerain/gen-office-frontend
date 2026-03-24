export interface MonthPickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  fromMonth?: Date;
  toMonth?: Date;
  placeholder?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
  locale?: string;
  format?: (date: Date) => string;
  clearable?: boolean;
  parse?: (value: string) => Date | undefined;
  className?: string;
}
