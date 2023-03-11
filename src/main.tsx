import { enableES5 } from 'immer';
import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider, message } from 'antd';
import dva from 'dva';
import createLoading from 'dva-loading';
import 'moment/dist/locale/zh-cn';
import zhCN from 'antd/lib/locale/zh_CN';
import history from './utils/history';
import Routers from './App';
import './root.css';
import './global.less';

enableES5();

const app = dva({
  history,
  onError(e) {
    message.error(e.message);
  },
});

app.use(createLoading());

const globalModules = import.meta.glob('./models/*.ts');
const pagesModule = import.meta.glob('./pages/**/model(/*)?.ts');
const allModule = { ...globalModules, ...pagesModule };
const promiseModule = Object.keys(allModule).map(path => allModule[path]());

Promise.all(promiseModule)
  .then(res => {
    res.forEach(mod => {
      mod?.default?.namespace && app.model(mod.default);
    });
  })
  .finally(() => {
    app.router(api => {
      const { history, app } = api!;
      return <Routers history={history} app={app} />;
    });

    const App = app.start();

    ReactDOM.render(
      <ConfigProvider locale={zhCN}>
        <App />
      </ConfigProvider>,
      document.getElementById('root')
    );
  });
