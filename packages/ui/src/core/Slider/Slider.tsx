import { forwardRef } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@gen-office/utils';
import type { SliderProps } from './Slider.types';
import styles from './Slider.module.css';

const sizeClassName: Record<NonNullable<SliderProps['size']>, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

export const Slider = forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, error = false, size = 'md', ...props }, ref) => {
  const thumbCount = props.value?.length ?? props.defaultValue?.length ?? 1;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        styles.root,
        sizeClassName[size],
        error && styles.error,
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className={styles.track}>
        <SliderPrimitive.Range className={styles.range} />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, index) => (
        <SliderPrimitive.Thumb key={index} className={styles.thumb} />
      ))}
    </SliderPrimitive.Root>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;
