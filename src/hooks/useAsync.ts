import { useCallback, useEffect, useState } from 'react';

type AsyncFunction<P = unknown, T = unknown> = (data?: P) => Promise<T>;
type executeFn<P = unknown> = (data?: P) => void;
type Status = 'idle' | 'success' | 'pending' | 'error';

const useAsync = <T = unknown, P = unknown>(asyncFunction: AsyncFunction<P, T>, immediate = true) => {
  const [status, setStatus] = useState<Status>('idle');
  const [value, setValue] = useState<T>();
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback<executeFn<P>>(
    async data => {
      setStatus('pending');
      setError(null);

      try {
        const res = await asyncFunction(data);
        setValue(res);
        setStatus('success');
      } catch (err) {
        setError(err as Error);
        setStatus('error');
      }
    },
    [asyncFunction]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};

export default useAsync;
