import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

export function MswProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(!import.meta.env.DEV);

  useEffect(() => {
    let active = true;
    if (!import.meta.env.DEV) return undefined;

    import('@/mocks/browser')
      .then(({ worker }) => worker.start({ onUnhandledRequest: 'bypass' }))
      .catch(() => {
        // If MSW fails, allow the app to render to avoid a blank screen.
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
