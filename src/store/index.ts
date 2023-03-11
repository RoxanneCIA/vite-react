import equal from 'fast-deep-equal';
import type { Draft } from 'immer';
import producer from 'immer';
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from 'react';

type Listener<T> = (state: T) => void;
type Mutator<T> = Partial<T & Record<string, unknown>> | ((state: Draft<T>) => void);
type Selector<T, Result> = (state: T) => Result;

const isSSR =
  typeof window === 'undefined' || /ServerSideRendering/.test(window.navigator && window.navigator.userAgent);

const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect;

export class Store<T> {
  private state: T;

  private listeners: Array<Listener<T>> = [];

  constructor(initialState: T) {
    this.state = Object(initialState);
  }

  getState(): Readonly<T> {
    return this.state;
  }

  update(mutate: Mutator<T>) {
    let nextState = this.state;
    if (typeof mutate === 'function') {
      nextState = producer(this.state, draft => mutate(draft));
    } else {
      nextState = producer(this.state, draft => {
        Object.keys(mutate).forEach(key => {
          Object.assign(draft, { [key]: mutate[key] });
        });
      });
    }
    if (this.state !== nextState) {
      this.state = nextState;
      this.listeners.forEach(fn => fn(this.state));
    }
  }

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);
    return () => this.listeners.splice(this.listeners.indexOf(listener), 1);
  }
  useSelector<F extends Selector<T, any> = Selector<T, T>>(selector: F, deps: any[] = []): ReturnType<F> {
    const currSelector = useCallback(selector, deps);
    const selectorRef = useRef(selector);
    const stateRef = useRef<ReturnType<F>>();
    const forceUpdate = useReducer(() => ({}), {})[1];

    useIsomorphicLayoutEffect(() => {
      selectorRef.current = currSelector;
    });

    if (stateRef.current === undefined || currSelector !== selectorRef.current) {
      stateRef.current = currSelector(this.state);
    }

    useIsomorphicLayoutEffect(() => {
      const checkUpdate = () => {
        const nextState = selectorRef.current(this.state);
        if (!equal(stateRef.current, nextState)) {
          stateRef.current = nextState;
          forceUpdate();
        }
      };
      checkUpdate();
      return void this.subscribe(checkUpdate);
    }, []);

    return stateRef.current as ReturnType<F>;
  }
}

function createStore<T>(initialState: T) {
  return new Store(initialState);
}

export default createStore;
