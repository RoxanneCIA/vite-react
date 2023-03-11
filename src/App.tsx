import type { FC } from 'react';
import React, { useEffect } from 'react';
import type { DvaInstance } from 'dva';
import { useDispatch, useSelector } from 'dva';
import type { RouteComponentProps } from 'dva/router';
import { Route, Switch, Redirect, routerRedux } from 'dva/router';
import dynamic from 'dva/dynamic';
import routesConfig from './config/routes';
import { flattenData } from './utils';
import history from './utils/history';
import Loading from './components/Loading';
import BasicLayout from './layouts/BasicLayout';

const loadCache = new Map();
const pageModule = import.meta.glob('./pages/**/*.tsx');
const layoutModule = import.meta.glob('./layouts/**/*.tsx');
const allRouteModule = { ...pageModule, ...layoutModule };
const { ConnectedRouter } = routerRedux;

const generateRoutes = (routeData: RouteConfig[], modules: Record<string, () => Promise<any>>) => {
  const importComponent = (path: string) => {
    return modules[`${path}.tsx`] || modules[`${path}/index.tsx`];
  };
  const getRoutes = (routeData: RouteConfig[]): DynamicRoute[] => {
    return routeData.map(route => {
      const { component, routes, ...rest } = route;
      if (routes?.length) {
        return component
          ? {
              routes: getRoutes(routes),
              component: typeof component === 'string' ? importComponent(component) : () => Promise.resolve(component),
              ...rest,
            }
          : { ...rest, routes: getRoutes(routes) };
      }
      return component
        ? {
            ...rest,
            exact: true,
            component: typeof component === 'string' ? importComponent(component) : () => Promise.resolve(component),
          }
        : { ...rest, exact: true };
    });
  };
  return getRoutes(routeData);
};

const dynamicRoutes = generateRoutes(routesConfig, allRouteModule);
interface IGetRouteElementOpts {
  route: DynamicRoute;
  index: number;
}

interface RoutersProps {
  history: routerRedux.ConnectedRouterProps['history'];
  app: DvaInstance;
}

const routeFilter = (route: RouteConfig, menuData: MenuItem[]) => {
  return menuData.some(menu => menu.path === route.path);
};

const traverseModifyRoutes = (routes: RouteConfig[], menuData: MenuItem[]): RouteConfig[] => {
  const resultRoutes = ([] as RouteConfig[]).concat(routes).map((resultRoute: RouteConfig) => {
    const { routes } = resultRoute;
    if (routes && routes?.map) {
      return {
        ...resultRoute,
        routes: routes?.map(route => ({ ...route })),
      };
    }
    return resultRoute;
  });
  return resultRoutes.map(currentRoute => {
    let currentRouteAccessible = typeof currentRoute.unaccessible === 'boolean' ? !currentRoute.unaccessible : true;
    if (currentRoute && currentRoute.access) {
      const accessProp = routeFilter;
      // 如果是方法需要执行以下
      if (typeof accessProp === 'function') {
        currentRouteAccessible = accessProp(currentRoute, menuData);
      } else if (typeof accessProp === 'boolean') {
        // 不是方法就直接 copy
        currentRouteAccessible = accessProp;
      }
      currentRoute.unaccessible = !currentRouteAccessible;
    }
    if (currentRoute.routes || currentRoute.childRoutes) {
      const childRoutes = currentRoute.routes || currentRoute.childRoutes;

      if (!Array.isArray(childRoutes)) {
        return currentRoute;
      }
      // 父亲没权限，理论上每个孩子都没权限
      // 可能有打平 的事情发生，所以都执行一下
      childRoutes.forEach(childRoute => {
        childRoute.unaccessible = !currentRouteAccessible;
      });
      const finallyChildRoute = traverseModifyRoutes(childRoutes, menuData);

      // 如果每个子节点都没有权限，那么自己也属于没有权限
      const isAllChildRoutesUnaccessible =
        Array.isArray(finallyChildRoute) && finallyChildRoute.every(route => route.unaccessible);

      if (!currentRoute.unaccessible && isAllChildRoutesUnaccessible) {
        currentRoute.unaccessible = true;
      }
      if (finallyChildRoute && finallyChildRoute?.length > 0) {
        return {
          ...currentRoute,
          routes: finallyChildRoute,
        };
      }
      delete currentRoute.routes;
    }
    return currentRoute;
  });
};

const renderRoutes = (routes: DynamicRoute[] = [], switchProps = {}) => {
  return (
    <Switch {...switchProps}>
      {routes.map((route, index) =>
        getRouteElement({
          route,
          index,
        })
      )}
    </Switch>
  );
};

const render = ({ route, props }: { route: DynamicRoute; props: any }) => {
  const routes = renderRoutes(route.routes || [], { location: props.location });
  const { component, path } = route;
  if (component) {
    const Component =
      loadCache.get(path) ??
      (dynamic as any)({
        resolve: () =>
          new Promise(resolve =>
            component().then(ret => {
              loadCache.set(path, ret.default);
              resolve(ret);
            })
          ),
        LoadingComponent: loadCache.has(path) ? null : Loading,
      });
    return (
      <Component {...props} route={route}>
        {routes}
      </Component>
    );
  }
  return routes;
};

const getRouteElement = ({ route, index }: IGetRouteElementOpts) => {
  const routeProps = {
    key: route.key || index,
    exact: route.exact,
    strict: route.strict,
    sensitive: route.sensitive,
    path: route.path,
  };
  if (route.redirect) return <Redirect {...routeProps} from={route.path} to={route.redirect} />;
  return <Route {...routeProps} render={props => render({ route, props })} />;
};

export const useInitialState = () => {
  const dispatch = useDispatch<Dispatch>();
  const menuData = useSelector(state => state.global.menuData);
  const loading = useSelector(state => !!state.loading.effects['global/fetchMenu']);
  const getInitialState = () => {
    // 获取请求
    dispatch;
  };
  useEffect(() => {
    if (history.location.pathname !== '/login') {
      getInitialState();
    }
  }, []);
  return {
    menuData,
    loading,
    getInitialState,
  };
};

const BlankLayout: FC<RouteComponentProps> = ({ children, ...props }) => {
  const { menuData, loading } = useInitialState();
  const modifyData = traverseModifyRoutes(routesConfig, flattenData(menuData));
  return (
    <BasicLayout menuData={menuData} menuLoading={loading} routes={modifyData} {...props}>
      {children}
    </BasicLayout>
  );
};

const Routers: FC<RoutersProps> = ({ history }) => {
  return (
    <ConnectedRouter history={history}>
      <Route path="/" render={props => <BlankLayout {...props}>{renderRoutes(dynamicRoutes)}</BlankLayout>} />
    </ConnectedRouter>
  );
};

export default Routers;
