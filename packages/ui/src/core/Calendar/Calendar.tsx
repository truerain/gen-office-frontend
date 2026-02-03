import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@gen-office/utils';
import type { CalendarProps } from './Calendar.types';
import { format } from 'date-fns';

import "react-day-picker/dist/style.css";
import styles from './Calendar.module.css';

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      formatters={{
        formatCaption: (month, options) =>
          format(month, 'yyyy.M', { locale: options?.locale }),
      }}
      classNames={{
        //months: styles.months,
        month: styles.month,
        caption: styles.caption,
        caption_label: styles.captionLabel,
        //nav: styles.nav,
        //nav_button: styles.navButton,
        //nav_button_previous: styles.navButtonPrevious,
        //nav_button_next: styles.navButtonNext,
        table: styles.table,
        head_row: styles.headRow,
        head_cell: styles.headCell,
        row: styles.row,
        cell: styles.cell,
        day: styles.day,
        day_selected: styles.daySelected,
        day_today: styles.dayToday,
        day_outside: styles.dayOutside,
        day_disabled: styles.dayDisabled,
        day_range_middle: styles.dayRangeMiddle,
        day_range_start: styles.dayRangeStart,
        day_range_end: styles.dayRangeEnd,
        day_hidden: styles.dayHidden,
        ...classNames,
      }}
      components={{
        Chevron: ({ className: iconClassName, orientation, size }) => {
          const iconProps = {
            className: cn(styles.icon, iconClassName),
            size,
          };
          if (orientation === 'left') return <ChevronLeft {...iconProps} />;
          if (orientation === 'right') return <ChevronRight {...iconProps} />;
          if (orientation === 'up') {
            return <ChevronLeft {...iconProps} style={{ transform: 'rotate(90deg)' }} />;
          }
          return <ChevronRight {...iconProps} style={{ transform: 'rotate(90deg)' }} />;
        },
      }}
      {...props}
    />
  );
}
