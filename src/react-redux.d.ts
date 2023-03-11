import { ConnectState } from './models';

declare module 'react-redux' {
  export function useSelector<TState = ConnectState, TSelected = unknown>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;
}
