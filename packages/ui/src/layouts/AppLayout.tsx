import { ReactNode } from 'react';

interface AppLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export const AppLayout = ({ header, sidebar, children, footer }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {header && (
        <header className="h-16 border-b bg-background sticky top-0 z-sticky">
          {header}
        </header>
      )}
      
      <div className="flex flex-1">
        {sidebar && (
          <aside className="w-64 border-r bg-gray-50 hidden lg:block">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {footer && (
        <footer className="border-t bg-gray-50 py-4">
          {footer}
        </footer>
      )}
    </div>
  );
};