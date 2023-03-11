import type { FC } from 'react';
import React, { useMemo } from 'react';
import { Avatar, Dropdown, Layout, Menu, Space } from 'antd';
import type { RouteComponentProps } from 'dva/router';
import { Link } from 'dva/router';
import pathToRegexp from 'path-to-regexp';
import { useSelector } from 'dva';
import logo from '@/assets/logo.png';
import { CaretDownOutlined } from '@ant-design/icons';
import WithExceptionOpChildren from '@/components/WithExceptionOpChildren';
import Loading from '@/components/Loading';
import './BasicLayout.less';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const flatRoutes = (routes: RouteConfig[], result: RouteConfig[] = []) => {
  routes.forEach(route => {
    const { routes: childRoutes = [], redirect, ...rest } = route;
    if (redirect) return;
    result.push(rest);
    flatRoutes(childRoutes, result);
  });
  return result;
};

interface BasicLayoutProps extends RouteComponentProps {
  routes: RouteConfig[];
  menuLoading?: boolean;
  menuData?: MenuItem[];
}

const BasicLayout: FC<BasicLayoutProps> = ({ children, routes, location, menuLoading, menuData = [] }) => {
  const userInfo = useSelector(state => state.global.userInfo);
  const routeArray = useMemo(() => flatRoutes(routes), [routes]);
  const matchPath = routeArray.find(route => (route.path ? pathToRegexp(route.path).test(location.pathname) : false));
  const renderSubMenu = (menus: MenuItem[] = []) => {
    return menus.map(menu => (
      <SubMenu key={menu.path} title={menu.name}>
        {renderMenuItem(menu.children)}
      </SubMenu>
    ));
  };
  const renderMenuItem = (menus: MenuItem[] = []) => {
    return menus.map(menu =>
      menu.children?.length ? (
        renderSubMenu(menu.children)
      ) : (
        <Menu.Item key={menu.path}>
          <Link to={menu.path}>{menu.name}</Link>
        </Menu.Item>
      )
    );
  };
  if (matchPath?.layout === false) return <>{children}</>;
  return (
    <Layout>
      <Header>
        <div className="logo">
          <img style={{ height: 32 }} src={logo} alt="" />
        </div>
        <Space className="user-info">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="logout">退出登录</Menu.Item>
              </Menu>
            }
            className="account"
          >
            <Space>
              <Avatar size={28} src={userInfo.iconUri} />
              <span>{userInfo.name}</span>
              <CaretDownOutlined />
            </Space>
          </Dropdown>
        </Space>
      </Header>
      <Layout className="inner-container">
        {!matchPath?.hideInMenu ? (
          <Sider width={200} className="menu-sider">
            {menuData.map(menu => {
              return (
                <Menu
                  key={menu.id}
                  mode="inline"
                  selectedKeys={matchPath ? [matchPath.path] : []}
                  defaultOpenKeys={menu.children.map(it => it.path)}
                  style={{ height: '100%', borderRight: 0 }}
                >
                  {renderSubMenu(menu.children)}
                </Menu>
              );
            })}
          </Sider>
        ) : null}
        <Layout className="scroll-container">
          <Content className="container-content">
            {menuLoading ? (
              <Loading />
            ) : (
              <WithExceptionOpChildren currentPathConfig={matchPath ?? {}}>{children}</WithExceptionOpChildren>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;
