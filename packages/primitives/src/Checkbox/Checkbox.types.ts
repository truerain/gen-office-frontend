import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  /**
   * Error state
   */
  error?: boolean;
}