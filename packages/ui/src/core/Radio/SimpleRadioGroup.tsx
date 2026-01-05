import { forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Label } from '../Label';
import { RadioGroup, Radio } from './Radio';
import type { RadioGroupProps } from './Radio.types';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SimpleRadioGroupProps extends Omit<RadioGroupProps, 'children'> {
  /**
   * Radio options array
   */
  options: RadioOption[];
  
  /**
   * Layout direction
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Error state
   */
  error?: boolean;
}

/**
 * Simple RadioGroup component with options API
 * 
 * @example
 * // Basic usage
 * <SimpleRadioGroup
 *   value={value}
 *   onValueChange={setValue}
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *   ]}
 * />
 * 
 * @example
 * // Horizontal layout
 * <SimpleRadioGroup
 *   orientation="horizontal"
 *   options={options}
 * />
 */
export const SimpleRadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  SimpleRadioGroupProps
>(({ 
  options = [],
  orientation = 'vertical',
  error,
  ...props
}, ref) => {
  return (
    <RadioGroup 
      ref={ref} 
      error={error}
      style={{
        display: 'flex',
        flexDirection: orientation === 'horizontal' ? 'row' : 'column',
        gap: orientation === 'horizontal' ? '1rem' : '0.75rem',
      }}
      {...props}
    >
      {options.map((option) => (
        <div 
          key={option.value}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Radio
            value={option.value}
            id={`radio-${option.value}`}
            disabled={option.disabled}
            error={error}
          />
          <Label 
            htmlFor={`radio-${option.value}`}
            style={{ cursor: option.disabled ? 'not-allowed' : 'pointer' }}
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
});

SimpleRadioGroup.displayName = 'SimpleRadioGroup';