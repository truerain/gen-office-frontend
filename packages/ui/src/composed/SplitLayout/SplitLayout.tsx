import * as React from 'react';
import { cn } from '@gen-office/utils';
import type { SplitLayoutProps } from './SplitLayout.types';
import styles from './SplitLayout.module.css';

function toCssSize(value?: number | string, fallback?: string) {
  if (value == null) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

export function SplitLayout({
  left,
  right,
  leftWidth = 280,
  minLeftWidth = 220,
  maxLeftWidth,
  minRightWidth = 0,
  gap = 16,
  resizable = false,
  onResize,
  className,
  leftClassName,
  rightClassName,
}: SplitLayoutProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [currentWidth, setCurrentWidth] = React.useState<number>(() => {
    return typeof leftWidth === 'number' ? leftWidth : 280;
  });

  React.useEffect(() => {
    if (typeof leftWidth === 'number') setCurrentWidth(leftWidth);
  }, [leftWidth]);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizable) return;
      e.preventDefault();
      (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
    },
    [resizable]
  );

  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizable || !isDragging) return;
      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const raw = e.clientX - rect.left;

      const min = typeof minLeftWidth === 'number' ? minLeftWidth : 0;
      const max =
        typeof maxLeftWidth === 'number'
          ? maxLeftWidth
          : rect.width - (typeof minRightWidth === 'number' ? minRightWidth : 0);

      const next = Math.max(min, Math.min(raw, max));
      setCurrentWidth(next);
      onResize?.(next);
    },
    [isDragging, maxLeftWidth, minLeftWidth, minRightWidth, onResize, resizable]
  );

  const handlePointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizable) return;
      try {
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    },
    [resizable]
  );

  const resolvedLeftWidth =
    resizable && typeof leftWidth === 'number'
      ? currentWidth
      : typeof leftWidth === 'number'
        ? leftWidth
        : leftWidth;

  const style = {
    ['--split-gap' as any]: toCssSize(gap, '16px'),
    ['--split-left-width' as any]: toCssSize(resolvedLeftWidth, '280px'),
    ['--split-left-min' as any]: toCssSize(minLeftWidth, '220px'),
    ['--split-right-min' as any]: toCssSize(minRightWidth, '0px'),
  } as React.CSSProperties;

  return (
    <div ref={rootRef} className={cn(styles.root, className)} style={style}>
      <div className={cn(styles.left, leftClassName)}>{left}</div>
      {resizable ? (
        <div
          className={cn(styles.resizer, isDragging && styles.resizerActive)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      ) : null}
      <div className={cn(styles.right, rightClassName)}>{right}</div>
    </div>
  );
}
