import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Maximize2, Minimize2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from './Dialog';
import type { DialogProps } from './Dialog.types';

export type SimpleDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const SIMPLE_DIALOG_SIZE_STYLES: Record<SimpleDialogSize, React.CSSProperties> = {
  sm: {
    maxWidth: '24rem',
  },
  md: {
    maxWidth: '32rem',
  },
  lg: {
    maxWidth: '48rem',
  },
  xl: {
    maxWidth: '64rem',
  },
  full: {
    width: 'calc(100vw - 2rem)',
    maxWidth: 'calc(100vw - 2rem)',
    maxHeight: 'calc(100vh - 2rem)',
  },
};

export interface SimpleDialogProps extends DialogProps {
  /**
   * Dialog title
   */
  title?: string;
  
  /**
   * Dialog content
   */
  children: React.ReactNode;

  /**
   * Optional fixed footer content.
   */
  footer?: React.ReactNode;
  
  /**
   * Show close button
   * @default true
   */
  showClose?: boolean;
  
  /**
   * Custom class name for content
   */
  className?: string;

  /**
   * Allow dragging by the dialog header
   * @default true
   */
  draggable?: boolean;

  /**
   * Preset dialog size
   * @default 'md'
   */
  size?: SimpleDialogSize;

  /**
   * Allow runtime resize with drag handle
   * @default false
   */
  resizable?: boolean;

  /**
   * Enable body scrolling.
   * @default true
   */
  bodyScrollable?: boolean;

  /**
   * External ref for the dialog body element.
   */
  bodyRef?: React.Ref<HTMLDivElement>;

  /**
   * Initial width used before user resize.
   */
  initialWidth?: number;

  /**
   * Initial height used before user resize.
   */
  initialHeight?: number;

  /**
   * Minimum width for runtime resize.
   * @default 320
   */
  minResizableWidth?: number;

  /**
   * Minimum height for runtime resize.
   * @default 200
   */
  minResizableHeight?: number;
}

/**
 * Simple Dialog component with title prop
 * 
 * @example
 * // Basic usage
 * <SimpleDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Dialog Title"
 * >
 *   <p>Dialog content</p>
 * </SimpleDialog>
 */
export const SimpleDialog = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SimpleDialogProps
>(({ 
  title,
  children,
  footer,
  showClose = true,
  draggable = true,
  size = 'md',
  resizable = false,
  bodyScrollable = true,
  bodyRef,
  initialWidth,
  initialHeight,
  minResizableWidth = 320,
  minResizableHeight = 200,
  className,
  onOpenChange,
  ...props
}, ref) => {
  const isOpen = props.open ?? false;
  const contentRef = useRef<React.ElementRef<typeof DialogPrimitive.Content> | null>(null);
  const dragStateRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const resizeStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const restoreStateRef = useRef<{
    position: { left: number; top: number } | null;
    dimensions: { width: number; height: number } | null;
  } | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const headerIconButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    width: '2rem',
    height: '2rem',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: '0.25rem',
    background: 'transparent',
    color: 'var(--color-fg-secondary)',
    cursor: 'pointer',
  };

  const setMergedRef = useCallback(
    (node: React.ElementRef<typeof DialogPrimitive.Content> | null) => {
      contentRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );
  const setMergedBodyRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof bodyRef === 'function') {
        bodyRef(node);
      } else if (bodyRef) {
        (bodyRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [bodyRef]
  );

  useEffect(() => {
    return () => {
      dragStateRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!resizable || !isOpen || dimensions) {
      return;
    }

    let frame = 0;
    let cancelled = false;
    const maxMeasureRetries = 120;

    const measure = (attempt: number) => {
      if (cancelled) return;
      frame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        const node = contentRef.current;
        if (!node) return;

        const rect = node.getBoundingClientRect();
        const computed = window.getComputedStyle(node);
        const cssWidth = Number.parseFloat(computed.width) || 0;
        const cssHeight = Number.parseFloat(computed.height) || 0;
        const minWidth = Number.parseFloat(computed.minWidth) || 0;
        const minHeight = Number.parseFloat(computed.minHeight) || 0;
        const nextWidth = Math.max(minResizableWidth, Math.round(Math.max(rect.width, cssWidth, minWidth)));
        const nextHeight = Math.max(minResizableHeight, Math.round(Math.max(rect.height, cssHeight, minHeight)));
        const hasStableHeight = nextHeight > 220 || minHeight > 220 || cssHeight > 220;

        if (hasStableHeight) {
          setDimensions((prev) => prev ?? { width: nextWidth, height: nextHeight });
          return;
        }

        if (attempt < maxMeasureRetries) {
          measure(attempt + 1);
          return;
        }

        // Final guard: never leave resizable dialog collapsed to header-only height.
        setDimensions((prev) => {
          if (prev) return prev;
          const fallbackHeight = Math.max(
            minResizableHeight,
            initialHeight ?? Math.min(window.innerHeight - 32, 640)
          );
          const fallbackWidth = Math.max(minResizableWidth, initialWidth ?? nextWidth);
          return { width: fallbackWidth, height: fallbackHeight };
        });
      });
    };

    measure(0);
    return () => {
      cancelled = true;
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [
    dimensions,
    initialHeight,
    initialWidth,
    isOpen,
    minResizableHeight,
    minResizableWidth,
    resizable,
  ]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setPosition(null);
        setDimensions(null);
        setIsMaximized(false);
        dragStateRef.current = null;
        resizeStateRef.current = null;
        restoreStateRef.current = null;
      }
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const handleHeaderPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement;
      if (target.closest('button, input, textarea, select, a, [role="button"]')) {
        return;
      }

      const node = contentRef.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      if (isMaximized) {
        setIsMaximized(false);
      }
      dragStateRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      setPosition({ left: rect.left, top: rect.top });
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [draggable, isMaximized]
  );

  const handleHeaderPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setPosition({
      left: event.clientX - dragState.offsetX,
      top: event.clientY - dragState.offsetY,
    });
  }, []);

  const handleHeaderPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleResizePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizable || event.button !== 0) {
      return;
    }

    const node = contentRef.current;
    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();
    if (isMaximized) {
      setIsMaximized(false);
    }
    resizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    };
    setDimensions({
      width: rect.width,
      height: rect.height,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  }, [isMaximized, resizable]);

  const handleResizePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    const maxWidth = window.innerWidth - 16;
    const maxHeight = window.innerHeight - 16;

    const nextWidth = Math.min(
      maxWidth,
      Math.max(minResizableWidth, resizeState.startWidth + (event.clientX - resizeState.startX))
    );
    const nextHeight = Math.min(
      maxHeight,
      Math.max(minResizableHeight, resizeState.startHeight + (event.clientY - resizeState.startY))
    );

    setDimensions({
      width: nextWidth,
      height: nextHeight,
    });
    event.preventDefault();
  }, [minResizableHeight, minResizableWidth]);

  const handleResizePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const resizeState = resizeStateRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) {
      return;
    }

    resizeStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleToggleMaximize = useCallback(() => {
    const margin = 16;
    if (isMaximized) {
      setPosition(restoreStateRef.current?.position ?? null);
      setDimensions(restoreStateRef.current?.dimensions ?? null);
      setIsMaximized(false);
      restoreStateRef.current = null;
      return;
    }

    restoreStateRef.current = {
      position,
      dimensions,
    };
    setPosition({ left: margin, top: margin });
    setDimensions({
      width: Math.max(minResizableWidth, window.innerWidth - margin * 2),
      height: Math.max(minResizableHeight, window.innerHeight - margin * 2),
    });
    setIsMaximized(true);
    dragStateRef.current = null;
    resizeStateRef.current = null;
  }, [dimensions, isMaximized, minResizableHeight, minResizableWidth, position]);

  return (
    <Dialog {...props} onOpenChange={handleOpenChange}>
      <DialogContent
        ref={setMergedRef}
        showClose={false}
        aria-describedby={undefined}
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          overflow: 'hidden',
          ...SIMPLE_DIALOG_SIZE_STYLES[size],
          ...(!dimensions && typeof initialWidth === 'number'
            ? { width: `${Math.max(minResizableWidth, initialWidth)}px` }
            : {}),
          ...(!dimensions && typeof initialHeight === 'number'
            ? {
                height: `${Math.max(minResizableHeight, initialHeight)}px`,
                maxHeight: `${Math.max(minResizableHeight, initialHeight)}px`,
              }
            : {}),
          ...(dimensions
            ? {
                width: `${dimensions.width}px`,
                maxWidth: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                maxHeight: `${dimensions.height}px`,
              }
            : {}),
          ...(position
            ? {
                left: `${position.left}px`,
                top: `${position.top}px`,
                transform: 'none',
              }
            : {}),
        }}
      >
        {(title || showClose) && (
          <DialogHeader
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={handleHeaderPointerUp}
            onPointerCancel={handleHeaderPointerUp}
            style={
              draggable
                ? { cursor: 'move', userSelect: 'none', flex: '0 0 auto', position: 'relative', zIndex: 2 }
                : { flex: '0 0 auto', position: 'relative', zIndex: 2 }
            }
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                minHeight: '2rem',
              }}
            >
              {title ? <DialogTitle>{title}</DialogTitle> : <span aria-hidden style={{ flex: 1 }} />}
              {showClose && (
                <div style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center', flex: '0 0 auto' }}>
                  {resizable && (
                    <button
                      type="button"
                      onClick={handleToggleMaximize}
                      aria-label={isMaximized ? 'Restore dialog size' : 'Maximize dialog'}
                      style={headerIconButtonStyle}
                    >
                      {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  )}
                  <DialogPrimitive.Close asChild>
                    <button type="button" aria-label="Close" style={headerIconButtonStyle}>
                      <X size={16} />
                    </button>
                  </DialogPrimitive.Close>
                </div>
              )}
            </div>
          </DialogHeader>
        )}
        <DialogBody
          ref={setMergedBodyRef}
          style={{
            flex: '1 1 0',
            minHeight: 0,
            minWidth: 0,
            overflow: bodyScrollable ? 'auto' : 'hidden',
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </DialogBody>
        {footer ? <DialogFooter style={{ flex: '0 0 auto' }}>{footer}</DialogFooter> : null}
        {resizable && (
          <div
            role="presentation"
            onPointerDown={handleResizePointerDown}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
            style={{
              position: 'absolute',
              right: '0.25rem',
              bottom: '0.25rem',
              width: '1rem',
              height: '1rem',
              cursor: 'nwse-resize',
              userSelect: 'none',
              touchAction: 'none',
              zIndex: 1,
            }}
            aria-hidden="true"
          />
        )}
      </DialogContent>
    </Dialog>
  );
});

SimpleDialog.displayName = 'SimpleDialog';
