import * as React from 'react';
import { cn } from '@gen-office/utils';
import type { SplitLayoutProps } from './SplitLayout.types';
import styles from './SplitLayout.module.css';

function toCssSize(value?: number | string, fallback?: string) {
  if (value == null) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

function getRootSize(root: HTMLElement, direction: 'horizontal' | 'vertical') {
  const rect = root.getBoundingClientRect();
  return direction === 'vertical' ? rect.height : rect.width;
}

function resolveToPixels(leftWidth: number | string, rootSize: number): number | null {
  if (typeof leftWidth === 'number') return leftWidth;

  const raw = leftWidth.trim();
  if (raw.endsWith('%')) {
    if (rootSize <= 0) return null;
    const ratio = Number(raw.slice(0, -1));
    if (!Number.isFinite(ratio)) return null;
    return (rootSize * ratio) / 100;
  }

  if (raw.endsWith('px')) {
    const px = Number(raw.slice(0, -2));
    return Number.isFinite(px) ? px : null;
  }

  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function clampSize(
  next: number,
  rootSize: number,
  minLeftWidth?: number | string,
  maxLeftWidth?: number | string,
  minRightWidth?: number | string
) {
  const min = typeof minLeftWidth === 'number' ? minLeftWidth : 0;
  const max =
    typeof maxLeftWidth === 'number'
      ? maxLeftWidth
      : rootSize - (typeof minRightWidth === 'number' ? minRightWidth : 0);
  return Math.max(min, Math.min(next, max));
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
  const sizeLockedRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [currentSize, setCurrentSize] = React.useState<number | null>(() => {
    return typeof leftWidth === 'number' ? leftWidth : null;
  });

  React.useEffect(() => {
    sizeLockedRef.current = false;

    if (!resizable) {
      setCurrentSize(null);
      return;
    }

    if (typeof leftWidth === 'number') {
      setCurrentSize(leftWidth);
      sizeLockedRef.current = true;
      return;
    }

    setCurrentSize(null);

    const root = rootRef.current;
    if (!root) return;

    const applyMeasure = () => {
      if (sizeLockedRef.current) return;
      const rootSize = getRootSize(root, direction);
      const next = resolveToPixels(leftWidth, rootSize);
      if (next == null) return;
      setCurrentSize(clampSize(next, rootSize, minLeftWidth, maxLeftWidth, minRightWidth));
      sizeLockedRef.current = true;
    };

    applyMeasure();
    const observer = new ResizeObserver(applyMeasure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [direction, leftWidth, maxLeftWidth, minLeftWidth, minRightWidth, resizable]);

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
      const rootSize = direction === 'vertical' ? rect.height : rect.width;
      const next = clampSize(raw, rootSize, minLeftWidth, maxLeftWidth, minRightWidth);
      sizeLockedRef.current = true;
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

  const resolvedLeftWidth = resizable && currentSize != null ? currentSize : leftWidth;

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
