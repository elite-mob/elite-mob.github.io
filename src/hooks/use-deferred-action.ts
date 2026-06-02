import { useCallback, useEffect, useRef } from 'react';

/**
 * Runs an action immediately, or after `isDeferred` becomes false (e.g. mobile menu closed).
 */
export function useDeferredAction(isDeferred: boolean) {
  const pendingRef = useRef<(() => void) | null>(null);

  const runOrDefer = useCallback(
    (action: () => void) => {
      if (isDeferred) {
        pendingRef.current = action;
      } else {
        action();
      }
    },
    [isDeferred],
  );

  useEffect(() => {
    if (isDeferred || !pendingRef.current) return;

    const action = pendingRef.current;
    pendingRef.current = null;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        action();
      });
    });
  }, [isDeferred]);

  return runOrDefer;
}
