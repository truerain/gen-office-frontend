import type * as React from 'react';

export type MasterDetailLayoutProps = {
  master: React.ReactNode;
  detail: React.ReactNode;

  title?: React.ReactNode;
  actions?: React.ReactNode;

  leftWidth?: number | string;
  minLeftWidth?: number | string;
  maxLeftWidth?: number | string;
  minRightWidth?: number | string;
  gap?: number;
  resizable?: boolean;
  showResizeLine?: boolean;
  onResize?: (nextLeftWidth: number) => void;

  className?: string;
  masterClassName?: string;
  detailClassName?: string;
};
