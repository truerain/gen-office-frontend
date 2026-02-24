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
  direction = 'horizontal',
  leftWidth = 280,
  minLeftWidth = 220,
  maxLeftWidth,
  minRightWidth = 0,
  gap = 16,
  resizable = false,
  showResizeLine = true,
  onResize,
  className,
  leftClassName,
  rightClassName,
}: SplitLayoutProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [currentSize, setCurrentSize] = React.useState<number>(() => {
    return typeof leftWidth === 'number' ? leftWidth : 280;
  });

  React.useEffect(() => {
    if (!resizable) return;

    if (typeof leftWidth === 'number') {
      setCurrentSize(leftWidth);
      return;
    }

    if (typeof leftWidth !== 'string') return;
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const rootSize = direction === 'vertical' ? rect.height : rect.width;
    const raw = leftWidth.trim();
    let next: number | null = null;

    if (raw.endsWith('%')) {
      const ratio = Number(raw.slice(0, -1));
      if (Number.isFinite(ratio)) next = (rootSize * ratio) / 100;
    } else if (raw.endsWith('px')) {
      const px = Number(raw.slice(0, -2));
      if (Number.isFinite(px)) next = px;
    } else {
      const n = Number(raw);
      if (Number.isFinite(n)) next = n;
    }

    if (next != null && Number.isFinite(next)) setCurrentSize(next);
  }, [direction, leftWidth, resizable]);

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
      const raw = direction === 'vertical' ? e.clientY - rect.top : e.clientX - rect.left;

      const min = typeof minLeftWidth === 'number' ? minLeftWidth : 0;
      const max =
        typeof maxLeftWidth === 'number'
          ? maxLeftWidth
          : (direction === 'vertical' ? rect.height : rect.width) -
            (typeof minRightWidth === 'number' ? minRightWidth : 0);

      const next = Math.max(min, Math.min(raw, max));
      setCurrentSize(next);
      onResize?.(next);
    },
    [direction, isDragging, maxLeftWidth, minLeftWidth, minRightWidth, onResize, resizable]
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

  const resolvedLeftWidth = resizable ? currentSize : leftWidth;

  const style = {
    ['--split-gap' as any]: toCssSize(gap, '16px'),
    ['--split-left-width' as any]: toCssSize(resolvedLeftWidth, '280px'),
    ['--split-left-min' as any]: toCssSize(minLeftWidth, '220px'),
    ['--split-right-min' as any]: toCssSize(minRightWidth, '0px'),
  } as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      className={cn(styles.root, direction === 'vertical' && styles.rootVertical, className)}
      style={style}
    >
      <div className={cn(styles.left, direction === 'vertical' && styles.leftVertical, leftClassName)}>
        {left}
      </div>
      {resizable ? (
        <div
          className={cn(
            styles.resizer,
            direction === 'vertical' && styles.resizerVertical,
            !showResizeLine && styles.resizerNoLine,
            isDragging && styles.resizerActive
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      ) : null}
      <div className={cn(styles.right, direction === 'vertical' && styles.rightVertical, rightClassName)}>
        {right}
      </div>
    </div>
  );
}
