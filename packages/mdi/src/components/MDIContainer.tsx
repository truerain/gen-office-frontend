import { ReactNode } from 'react';
import { TabBar } from './TabBar';
import { TabContent } from './TabContent';

interface MDIContainerProps {
  className?: string;
  children?: ReactNode; // 탭이 없을 때 보여줄 내용
}

export const MDIContainer = ({ className = '', children }: MDIContainerProps) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <TabBar />
      <TabContent />
      {children}
    </div>
  );
};