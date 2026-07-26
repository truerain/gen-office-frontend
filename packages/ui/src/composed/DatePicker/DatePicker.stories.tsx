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
import { MultiDatePicker } from './MultiDatePicker';
import type { MonthRange } from './RangeMonthPicker.types';
import type { MultiDatePickerProps } from './MultiDatePicker.types';
import type { MultiMonthPickerProps } from './MultiMonthPicker.types';

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
type MultiDateStory = StoryObj<MultiDatePickerProps>;
type MultiMonthStory = StoryObj<MultiMonthPickerProps>;

const fieldStyle = { width: '280px' } as const;

const formatSummaryOptions = ['default (+N more)', '외 N건', 'and N more'] as const;

const formatSummaryArgType = {
  control: 'select' as const,
  options: [...formatSummaryOptions],
  mapping: {
    'default (+N more)': undefined,
    '외 N건': (firstLabel: string, restCount: number) => `${firstLabel} 외 ${restCount}건`,
    'and N more': (firstLabel: string, restCount: number) => `${firstLabel} and ${restCount} more`,
  },
  description: 'Overflow label when selection exceeds summaryThreshold',
};

function resolveFormatSummary(
  value: MultiMonthPickerProps['formatSummary'] | (typeof formatSummaryOptions)[number] | undefined
): MultiMonthPickerProps['formatSummary'] {
  if (typeof value === 'string') {
    return formatSummaryArgType.mapping[value as (typeof formatSummaryOptions)[number]];
  }
  return value;
}

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

function MultiDatePickerExample(props: { numberOfMonths?: number }) {
  const [value, setValue] = useState<Date[] | undefined>([
    new Date(2026, 6, 1),
    new Date(2026, 6, 10),
    new Date(2026, 6, 24),
  ]);

  return (
    <div style={fieldStyle}>
      <MultiDatePicker
        value={value}
        onChange={setValue}
        locale="ko-KR"
        calendarProps={props.numberOfMonths ? { numberOfMonths: props.numberOfMonths } : undefined}
      />
    </div>
  );
}

export const MultiDate: Story = {
  args: {
    placeholder: 'Select dates',
  },
  render: () => <MultiDatePickerExample />,
};

export const MultiDateTwoMonths: Story = {
  args: {
    placeholder: 'Select dates',
  },
  render: () => <MultiDatePickerExample numberOfMonths={2} />,
};

export const MultiDateFormatSummary: MultiDateStory = {
  name: 'MultiDateFormatSummary',
  args: {
    placeholder: 'Select dates',
    locale: 'ko-KR',
    summaryThreshold: 2,
    // Storybook mapping key; resolved to formatSummary fn via argTypes.mapping
    formatSummary: '외 N건' as unknown as MultiDatePickerProps['formatSummary'],
  },
  argTypes: {
    formatSummary: formatSummaryArgType,
    summaryThreshold: {
      control: { type: 'number', min: 1, max: 10 },
    },
    format: { control: false },
    calendarProps: { control: false },
    onChange: { control: false },
    value: { control: false },
  },
  render: function MultiDateFormatSummaryRender(args) {
    const [value, setValue] = useState<Date[] | undefined>([
      new Date(2026, 6, 1),
      new Date(2026, 6, 10),
      new Date(2026, 6, 24),
      new Date(2026, 7, 5),
    ]);

    return (
      <div style={fieldStyle}>
        <MultiDatePicker
          {...args}
          value={value}
          onChange={setValue}
          formatSummary={resolveFormatSummary(
            args.formatSummary as
              | MultiDatePickerProps['formatSummary']
              | (typeof formatSummaryOptions)[number]
              | undefined
          )}
          format={
            args.format ??
            ((date) =>
              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)
          }
        />
      </div>
    );
  },
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

function MultiMonthPickerExample(
  props: MultiMonthPickerProps & { initialValue?: Date[] }
) {
  const [value, setValue] = useState<Date[] | undefined>(
    props.initialValue ?? [
      new Date(2026, 0, 1),
      new Date(2026, 2, 1),
      new Date(2026, 6, 1),
    ]
  );

  const { initialValue: _initialValue, value: _value, onChange: _onChange, ...pickerProps } = props;

  return (
    <div style={fieldStyle}>
      <MultiMonthPicker
        {...pickerProps}
        value={value}
        onChange={setValue}
        locale={props.locale ?? 'ko-KR'}
        fromMonth={props.fromMonth ?? new Date(2019, 0, 1)}
        toMonth={props.toMonth ?? new Date(2028, 11, 1)}
        formatSummary={resolveFormatSummary(
          props.formatSummary as
            | MultiMonthPickerProps['formatSummary']
            | (typeof formatSummaryOptions)[number]
            | undefined
        )}
        format={
          props.format ??
          ((date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
        }
      />
    </div>
  );
}

const multiMonthControlArgTypes: MultiMonthStory['argTypes'] = {
  formatSummary: formatSummaryArgType,
  summaryThreshold: {
    control: { type: 'number', min: 1, max: 10 },
  },
  format: { control: false },
  onChange: { control: false },
  value: { control: false },
  fromMonth: { control: false },
  toMonth: { control: false },
};

export const MultiMonth: MultiMonthStory = {
  args: {
    placeholder: 'Select months',
    locale: 'ko-KR',
    visibleYears: 1,
    summaryThreshold: 2,
    formatSummary: 'default (+N more)' as unknown as MultiMonthPickerProps['formatSummary'],
  },
  argTypes: multiMonthControlArgTypes,
  render: (args) => <MultiMonthPickerExample {...args} />,
};

export const MultiMonthTwoYears: MultiMonthStory = {
  args: {
    placeholder: 'Select months',
    locale: 'ko-KR',
    visibleYears: 2,
    summaryThreshold: 2,
    formatSummary: 'default (+N more)' as unknown as MultiMonthPickerProps['formatSummary'],
  },
  argTypes: multiMonthControlArgTypes,
  render: (args) => <MultiMonthPickerExample {...args} />,
};

export const MultiMonthFormatSummary: MultiMonthStory = {
  name: 'MultiMonthFormatSummary',
  args: {
    placeholder: 'Select months',
    locale: 'ko-KR',
    summaryThreshold: 2,
    fromMonth: new Date(2019, 0, 1),
    toMonth: new Date(2028, 11, 1),
    formatSummary: '외 N건' as unknown as MultiMonthPickerProps['formatSummary'],
  },
  argTypes: multiMonthControlArgTypes,
  render: (args) => (
    <MultiMonthPickerExample
      {...args}
      initialValue={[
        new Date(2026, 0, 1),
        new Date(2026, 2, 1),
        new Date(2026, 6, 1),
        new Date(2026, 9, 1),
      ]}
    />
  ),
};
