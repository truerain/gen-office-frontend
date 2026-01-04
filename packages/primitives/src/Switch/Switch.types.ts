import * as SwitchPrimitive from '@radix-ui/react-switch';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /**
   * Error state
   */
  error?: boolean;
}