import type { PropsWithChildren } from 'react';
import { QueryProvider } from './QueryProvider';
import { MswProvider } from './MswProvider';
import { AlertDialogProvider } from '@/shared/ui/AlertDialogProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <MswProvider>
        <AlertDialogProvider>
          {children}
        </AlertDialogProvider>
      </MswProvider>
    </QueryProvider>
  );
}
