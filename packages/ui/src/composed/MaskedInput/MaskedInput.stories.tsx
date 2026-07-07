// packages/ui/src/composed/MaskedInput/MaskedInput.stories.tsx
// Documents common MaskedInput usage examples for Storybook.

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MaskedInput } from './MaskedInput';

const meta = {
  title: 'Composed/MaskedInput',
  component: MaskedInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    unmask: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof MaskedInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PhoneNumber: Story = {
  args: {
    label: 'Phone number',
    mask: '000-0000-0000',
    placeholder: '010-1234-5678',
    clearable: true,
  },
};

export const BusinessRegistrationNumber: Story = {
  args: {
    label: 'Business registration number',
    mask: '000-00-00000',
    placeholder: '123-45-67890',
  },
};

export const ZipCode: Story = {
  args: {
    label: 'Zip code',
    mask: '00000',
    placeholder: '06236',
  },
};

export const CreditCard: Story = {
  args: {
    label: 'Credit card',
    mask: '0000 0000 0000 0000',
    placeholder: '1234 5678 9012 3456',
  },
};

export const CustomCode: Story = {
  args: {
    label: 'Item code',
    mask: 'AA-000-***',
    placeholder: 'AB-123-X9Z',
    helperText: 'A accepts letters, 0 accepts numbers, * accepts letters or numbers.',
  },
};

function ControlledUnmaskedValueExample() {
  const [value, setValue] = useState('01012345678');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '320px' }}>
      <MaskedInput
        label="Phone number"
        mask="000-0000-0000"
        value={value}
        unmask
        clearable
        onValueChange={(next) => setValue(next.unmaskedValue)}
      />
      <div style={{ fontSize: '0.875rem' }}>Stored value: {value || 'None'}</div>
    </div>
  );
}

export const ControlledUnmaskedValue: Story = {
  args: {
    mask: '000-0000-0000',
  },
  render: () => <ControlledUnmaskedValueExample />,
};

export const ErrorState: Story = {
  args: {
    label: 'Phone number',
    mask: '000-0000-0000',
    defaultValue: '0101234',
    error: true,
    helperText: 'Enter the full phone number.',
  },
};
