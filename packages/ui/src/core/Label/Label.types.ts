import * as LabelPrimitive from '@radix-ui/react-label';

export interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /**
   * Required indicator
   */
  required?: boolean;
  
  /**
   * Error state
   */
  error?: boolean;
}