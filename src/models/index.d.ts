import type { GlobalModelState } from './global';

export interface Loading {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    [key: string]: any;
  };
}

export interface ConnectState {
  loading: Loading;
  global: GlobalModelState;
}
