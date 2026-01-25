import type * as React from 'react';

export type MasterDetailLayoutProps = {
  master: React.ReactNode;
  detail: React.ReactNode;

  title?: React.ReactNode;
  actions?: React.ReactNode;

  leftWidth?: number | string;
  minLeftWidth?: number | string;
  minRightWidth?: number | string;
  gap?: number;

  className?: string;
  masterClassName?: string;
  detailClassName?: string;
};
