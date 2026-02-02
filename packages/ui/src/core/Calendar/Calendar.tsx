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
