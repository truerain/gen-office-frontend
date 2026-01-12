import type { PropsWithChildren } from 'react';
import { MswProvider } from './MswProvider';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <MswProvider>
      <QueryProvider>{children}</QueryProvider>
    </MswProvider>
  );
}
