import { ReactNode } from 'react';

export interface Tab {
  id: string;
  title: string;
  content: ReactNode;
  closable?: boolean;
  icon?: ReactNode;
  modified?: boolean;
}

export type TabPosition = 'top' | 'bottom' | 'left' | 'right';

export interface MDIConfig  {
  maxTabs?: number;
  tabPosition?: TabPosition;
  enableTabReorder?: boolean;
  enableTabClose?: boolean;
  persistTabs?: boolean;
}