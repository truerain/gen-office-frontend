import * as SliderPrimitive from '@radix-ui/react-slider';

export type SliderSize = 'sm' | 'md' | 'lg';

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /**
   * Error state
   */
  error?: boolean;
  /**
   * Visual size
   */
  size?: SliderSize;
}
