import type { PropsWithChildren } from 'react';
import { QueryProvider } from './QueryProvider';
import { MswProvider } from './MswProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider><MswProvider>{children}</MswProvider></QueryProvider>
  );
}
