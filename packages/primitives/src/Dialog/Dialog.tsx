import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@gen-office/utils';
import type {
  DialogOverlayProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
} from './Dialog.types';
import styles from './Dialog.module.css';

// Main Dialog Root (re-export)
export const Dialog = DialogPrimitive.Root;

// Dialog Trigger
export const DialogTrigger = DialogPrimitive.Trigger;

// Dialog Portal
export const DialogPortal = DialogPrimitive.Portal;

// Dialog Close
export const DialogClose = DialogPrimitive.Close;

// Dialog Overlay
export const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(styles.overlay, className)}
    {...props}
  />
));

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Dialog Content
export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showClose = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(styles.content, className)}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close className={styles.close}>
          <X className={styles.closeIcon} />
          <span className={styles.srOnly}>Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));

DialogContent.displayName = DialogPrimitive.Content.displayName;

// Dialog Header
export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(styles.header, className)}
      {...props}
    />
  )
);

DialogHeader.displayName = 'DialogHeader';

// Dialog Footer
export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(styles.footer, className)}
      {...props}
    />
  )
);

DialogFooter.displayName = 'DialogFooter';

// Dialog Title
export const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(styles.title, className)}
    {...props}
  />
));

DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Dialog Description
export const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(styles.description, className)}
    {...props}
  />
));

DialogDescription.displayName = DialogPrimitive.Description.displayName;