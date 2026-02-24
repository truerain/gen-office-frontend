import type * as React from 'react';

export type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  direction?: 'horizontal' | 'vertical';

  leftWidth?: number | string;
  minLeftWidth?: number | string;
  maxLeftWidth?: number | string;
  minRightWidth?: number | string;
  gap?: number;
  resizable?: boolean;
  showResizeLine?: boolean;
  onResize?: (nextLeftWidth: number) => void;

  className?: string;
  leftClassName?: string;
  rightClassName?: string;
};
