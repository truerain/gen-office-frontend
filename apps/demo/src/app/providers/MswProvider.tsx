import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

export function MswProvider({ children }: PropsWithChildren) {
  const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  const [ready, setReady] = useState(!import.meta.env.DEV || !useMock);

  useEffect(() => {
    if (!useMock) return;

    let active = true;

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
  }, [useMock]);

  if (!ready) return null;

  return <>{children}</>;
}
