import { useEffect, useRef } from 'react';
import type { DependencyList } from 'react';
import isDeepEqual from 'fast-deep-equal/es6/react';

const useDeepCompareMemoize = (value?: DependencyList) => {
  const ref = useRef<DependencyList>();
  if (!isDeepEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};

const useDeepCompareEffect: typeof useEffect = (effect, dep) => {
  useEffect(effect, useDeepCompareMemoize(dep));
};

export default useDeepCompareEffect;
