// apps/demo/src/contexts/PageContext.tsx
import { createContext, useContext, type ReactNode } from 'react';

interface PageContextValue {
  /** 현재 페이지의 Menu ID */
  menuId?: string;
}

const PageContext = createContext<PageContextValue | undefined>(undefined);



interface PageProviderProps {
  menuId?: string;
  children: ReactNode;
}

export function PageProvider({ menuId, children }: PageProviderProps) {
  return (
    <PageContext.Provider value={{ menuId }}>
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