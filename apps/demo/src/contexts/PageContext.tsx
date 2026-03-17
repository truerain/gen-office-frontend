// apps/demo/src/contexts/PageContext.tsx
import { createContext, useContext, type ReactNode } from 'react';

interface PageContextValue {
  /** 현재 페이지의 Menu ID */
  menuId?: string;
  openMenuPage?: (menuId: string, params?: Record<string, unknown>) => void;
}

const PageContext = createContext<PageContextValue | undefined>(undefined);



interface PageProviderProps {
  menuId?: string;
  openMenuPage?: (menuId: string, params?: Record<string, unknown>) => void;
  children: ReactNode;
}

export function PageProvider({ menuId, openMenuPage, children }: PageProviderProps) {
  return (
    <PageContext.Provider value={{ menuId, openMenuPage }}>
      {children}
    </PageContext.Provider>
  );
}


/**
 * 현재 페이지의 menuId를 가져오는 Hook
 * 
 * @example
 * ```typescript
 * function CustomerInfoPage() {
 *   const { menuId } = usePageContext();
 *   console.log('Current menuId:', menuId);
 * }
 * ```
 */
export function usePageContext() {
  const context = useContext(PageContext);
  
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  
  return context;
}
