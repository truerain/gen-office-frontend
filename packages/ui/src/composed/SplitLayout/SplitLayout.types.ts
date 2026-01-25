import type * as React from 'react';

export type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;

  leftWidth?: number | string;
  minLeftWidth?: number | string;
  maxLeftWidth?: number | string;
  minRightWidth?: number | string;
  gap?: number;
  resizable?: boolean;
  onResize?: (nextLeftWidth: number) => void;

  className?: string;
  leftClassName?: string;
  rightClassName?: string;
};
