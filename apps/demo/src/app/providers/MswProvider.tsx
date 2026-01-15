import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

export function MswProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    //if (import.meta.env.DEV) {
      import('@/mocks/browser').then(({ worker }) =>
        worker.start({ onUnhandledRequest: 'bypass' }),
      );
    //}
  }, []);

  return <>{children}</>;
}
