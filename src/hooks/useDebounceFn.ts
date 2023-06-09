import type { DependencyList } from 'react';
import { useEffect, useRef, useCallback } from 'react';

export type ReturnValue<T extends any[]> = {
  run: (...args: T) => void;
  cancel: () => void;
};
const useUpdateEffect: typeof useEffect = (effect, deps) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
    return () => undefined;
  }, deps);
};

function useDebounceFn<T extends any[]>(
  fn: (...args: T) => Promise<unknown>,
  deps: DependencyList | number,
  wait?: number
): ReturnValue<T> {
  const hooksDeps: DependencyList = (Array.isArray(deps) ? deps : []) as DependencyList;
  const hookWait: number = typeof deps === 'number' ? deps : wait || 0;
  const timer = useRef<NodeJS.Timeout>();

  const fnRef = useRef<(...args: T) => Promise<unknown>>(fn);
  fnRef.current = fn;

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }, []);

  const run = useCallback(
    async (...args: any): Promise<void> => {
      return new Promise(resolve => {
        cancel();
        timer.current = setTimeout(async () => {
          await fnRef.current(...args);
          resolve();
        }, hookWait);
      });
    },
    [hookWait, cancel]
  );

  useUpdateEffect(() => {
    run();
    return cancel;
  }, [...hooksDeps, run]);

  useEffect(() => cancel, []);

  return {
    run,
    cancel,
  };
}

export default useDebounceFn;
