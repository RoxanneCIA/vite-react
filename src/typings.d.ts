declare module 'dva-loading' {
  export default function createLoading(): never;
}

interface RouteConfig {
  path: string;
  component?: string;
  redirect?: string;
  routes?: RouteConfig[];
  exact?: boolean;
  [key: string]: any;
}

interface DynamicRoute extends Omit<RouteConfig, 'component' | 'routes'> {
  routes?: DynamicRoute[];
  component?: () => Promise<{
    [key: string]: any;
  }>;
}

type Dispatch<P = any, C = (payload: P) => void> = (action: {
  type: string;
  payload?: P;
  callback?: C;
  [key: string]: any;
}) => any;
