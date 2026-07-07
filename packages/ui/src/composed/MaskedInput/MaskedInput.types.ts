// packages/ui/src/composed/MaskedInput/MaskedInput.types.ts
// Defines the public MaskedInput component API.

import type { ChangeEventHandler } from 'react';
import type { InputProps } from '../../core/Input';
import type { MaskTokenDefinitions } from './maskEngine';

export type MaskedInputValueChange = {
  value: string;
  unmaskedValue: string;
  completed: boolean;
};

export type MaskedInputProps = Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> & {
  mask: string;
  value?: string;
  defaultValue?: string;
  unmask?: boolean;
  definitions?: MaskTokenDefinitions;
  onValueChange?: (next: MaskedInputValueChange) => void;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};
