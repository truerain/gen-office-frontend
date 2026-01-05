import * as SelectPrimitive from '@radix-ui/react-select';

export interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Helper text (description or error message)
   */
  helperText?: string;
  
  /**
   * Error state
   */
  error?: boolean;
  
  /**
   * Full width select
   * @default false
   */
  fullWidth?: boolean;
}

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  /**
   * Error state
   */
  error?: boolean;
  
  /**
   * Full width trigger
   */
  fullWidth?: boolean;
}

export interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

export interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {}

export interface SelectGroupProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {}

export interface SelectLabelProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {}

export interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {}