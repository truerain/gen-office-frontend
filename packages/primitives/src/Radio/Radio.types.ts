import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  /**
   * Error state
   */
  error?: boolean;
}

export interface RadioProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /**
   * Error state
   */
  error?: boolean;
}