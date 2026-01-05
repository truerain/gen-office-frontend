import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './Dialog';
import type { DialogProps } from './Dialog.types';

export interface SimpleDialogProps extends DialogProps {
  /**
   * Dialog title
   */
  title?: string;
  
  /**
   * Dialog description
   */
  description?: string;
  
  /**
   * Dialog content
   */
  children: React.ReactNode;
  
  /**
   * Show close button
   * @default true
   */
  showClose?: boolean;
  
  /**
   * Custom class name for content
   */
  className?: string;
}

/**
 * Simple Dialog component with title and description props
 * 
 * @example
 * // Basic usage
 * <SimpleDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Dialog Title"
 *   description="Dialog description"
 * >
 *   <p>Dialog content</p>
 * </SimpleDialog>
 */
export const SimpleDialog = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SimpleDialogProps
>(({ 
  title,
  description,
  children,
  showClose = true,
  className,
  ...props
}, ref) => {
  return (
    <Dialog {...props}>
      <DialogContent ref={ref} showClose={showClose} className={className}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
});

SimpleDialog.displayName = 'SimpleDialog';