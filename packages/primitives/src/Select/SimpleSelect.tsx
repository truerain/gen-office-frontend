import { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
//import { Check, ChevronDown } from 'lucide-react';
//import { cn } from '@gen-office/utils';
import {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
} from './Select';
import type { SelectProps as RadixSelectProps } from './Select.types';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SimpleSelectProps extends Omit<RadixSelectProps, 'children'> {
  /**
   * ID for the select trigger (used with Label htmlFor)
   */
  id?: string;
  
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;
  
  /**
   * Simple options array (mutually exclusive with groups)
   */
  options?: SelectOption[];
  
  /**
   * Grouped options (mutually exclusive with options)
   */
  groups?: SelectOptionGroup[];
  
  /**
   * Full width select
   */
  fullWidth?: boolean;
  
  /**
   * Error state
   */
  error?: boolean;
}

/**
 * Simple Select component with options/groups API
 * 
 * @example
 * // Basic usage with options
 * <SimpleSelect
 *   id="my-select"
 *   placeholder="Choose..."
 *   value={value}
 *   onValueChange={setValue}
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *   ]}
 * />
 * 
 * @example
 * // With grouped options
 * <SimpleSelect
 *   placeholder="Choose..."
 *   groups={[
 *     {
 *       label: 'Group 1',
 *       options: [
 *         { value: 'a', label: 'Option A' },
 *       ],
 *     },
 *   ]}
 * />
 */
export const SimpleSelect = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SimpleSelectProps
>(({ 
  id,
  placeholder = 'Select...',
  options = [],
  groups = [],
  fullWidth,
  error,
  ...props
}, ref) => {
  const hasGroups = groups.length > 0;
  const hasOptions = options.length > 0;
  
  return (
    <SelectPrimitive.Root {...props}>
      <SelectTrigger 
        ref={ref} 
        id={id} 
        fullWidth={fullWidth}
        error={error}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {/* Render simple options */}
        {hasOptions && !hasGroups && options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
        
        {/* Render grouped options */}
        {hasGroups && groups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </SelectPrimitive.Root>
  );
});

SimpleSelect.displayName = 'SimpleSelect';