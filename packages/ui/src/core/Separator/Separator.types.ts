import * as SeparatorPrimitive from '@radix-ui/react-separator';

export type SeparatorVariant = 'subtle' | 'default' | 'strong';

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  variant?: SeparatorVariant;
}
