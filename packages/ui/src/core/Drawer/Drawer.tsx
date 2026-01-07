// packages/ui/src/composed/Drawer/Drawer.tsx
import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { DrawerProps } from './Drawer.types';
import styles from './Drawer.module.css';

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = 'right',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer,
  size = 'md',
}: DrawerProps) {
  // ESC 키 처리
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEsc, onOpenChange]);

  // Body 스크롤 제어
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onOpenChange(false);
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.drawerRoot}>
      {/* Overlay */}
      <div 
        className={styles.overlay}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div 
        className={`${styles.drawer} ${styles[side]} ${styles[size]}`}
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
        aria-describedby={description ? 'drawer-description' : undefined}
      >
        {/* Header */}
        {(title || description) && (
          <div className={styles.header}>
            <div className={styles.headerContent}>
              {title && (
                <h2 id="drawer-title" className={styles.title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id="drawer-description" className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => onOpenChange(false)}
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={styles.body}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
