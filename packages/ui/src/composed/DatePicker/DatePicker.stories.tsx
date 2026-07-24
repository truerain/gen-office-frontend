// packages/ui/src/composed/DatePicker/DatePicker.stories.tsx
// Documents DatePicker family usage examples for Storybook.

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { DateRange } from 'react-day-picker';
import { DatePicker } from './DatePicker';
import { RangeDatePicker } from './RangeDatePicker';
import { MonthPicker } from './MonthPicker';
import { RangeMonthPicker } from './RangeMonthPicker';
import { MultiMonthPicker } from './MultiMonthPicker';
import type { MonthRange } from './RangeMonthPicker.types';

const meta = {
  title: 'Composed/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    locale: {
      control: 'text',
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const fieldStyle = { width: '280px' } as const;

function DatePickerExample(props: {
  disabled?: boolean;
  locale?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState<Date | undefined>(new Date(2026, 6, 24));

  return (
    <div style={fieldStyle}>
      <DatePicker
        value={value}
        onChange={setValue}
        disabled={props.disabled}
        locale={props.locale}
        placeholder={props.placeholder}
      />
    </div>
  );
}

export const Single: Story = {
  args: {
    placeholder: 'Select date',
    locale: 'ko-KR',
  },
  render: (args) => (
    <DatePickerExample
      disabled={args.disabled}
      locale={args.locale}
      placeholder={args.placeholder}
    />
  ),
};

export const SingleDisabled: Story = {
  args: {
    disabled: true,
    locale: 'ko-KR',
  },
  render: (args) => (
    <DatePickerExample
      disabled={args.disabled}
      locale={args.locale}
      placeholder={args.placeholder}
    />
  ),
};

function RangeDatePickerExample() {
  const [value, setValue] = useState<DateRange | undefined>({
    from: new Date(2026, 6, 1),
    to: new Date(2026, 6, 15),
  });

  return (
    <div style={fieldStyle}>
      <RangeDatePicker value={value} onChange={setValue} locale="ko-KR" />
    </div>
  );
}

export const Range: Story = {
  args: {
    placeholder: 'Select date range',
  },
  render: () => <RangeDatePickerExample />,
};

function MonthPickerExample() {
  const [value, setValue] = useState<Date | undefined>(new Date(2026, 6, 1));

  return (
    <div style={fieldStyle}>
      <MonthPicker
        value={value}
        onChange={setValue}
        locale="ko-KR"
        fromMonth={new Date(2024, 0, 1)}
        toMonth={new Date(2027, 11, 1)}
      />
    </div>
  );
}

export const Month: Story = {
  args: {
    placeholder: 'Select month',
  },
  render: () => <MonthPickerExample />,
};

function RangeMonthPickerExample() {
  const [value, setValue] = useState<MonthRange | undefined>({
    from: new Date(2026, 0, 1),
    to: new Date(2026, 5, 1),
  });

  return (
    <div style={fieldStyle}>
      <RangeMonthPicker
        value={value}
        onChange={setValue}
        locale="ko-KR"
        fromMonth={new Date(2024, 0, 1)}
        toMonth={new Date(2027, 11, 1)}
      />
    </div>
  );
}

export const RangeMonth: Story = {
  args: {
    placeholder: 'Select month range',
  },
  render: () => <RangeMonthPickerExample />,
};

function MultiMonthPickerExample(props: { visibleYears?: 1 | 2 }) {
  const [value, setValue] = useState<Date[] | undefined>([
    new Date(2026, 0, 1),
    new Date(2026, 2, 1),
    new Date(2026, 6, 1),
  ]);

  return (
    <div style={fieldStyle}>
      <MultiMonthPicker
        value={value}
        onChange={setValue}
        locale="ko-KR"
        visibleYears={props.visibleYears}
        fromMonth={new Date(2019, 0, 1)}
        toMonth={new Date(2028, 11, 1)}
        format={(date) =>
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        }
      />
    </div>
  );
}

export const MultiMonth: Story = {
  args: {
    placeholder: 'Select months',
  },
  render: () => <MultiMonthPickerExample />,
};

export const MultiMonthTwoYears: Story = {
  args: {
    placeholder: 'Select months',
  },
  render: () => <MultiMonthPickerExample visibleYears={2} />,
};
