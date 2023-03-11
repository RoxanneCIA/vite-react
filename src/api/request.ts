import axios from 'axios';
import { localforage, logout, trimParams } from '@/utils';
import { message } from 'antd';
import { BASE_URL } from '@/constants';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 1000 * 12,
  timeoutErrorMessage: '请求超时，请稍后重试',
});

request.interceptors.request.use(config => {
  config.headers.authorization = localforage.getItem(localforage.token);
  if (config.data) {
    config.data = trimParams(config.data);
  }
  if (config.params) {
    config.params = trimParams(config.params);
  }
  return config;
});

request.interceptors.response.use(
  res => {
    const { status, message: msg } = res.data;
    switch (status) {
      case 401:
      case 40301:
      case 40101:
        logout();
        break;
      case 403:
        message.warning('无访问权限');
        break;
      default:
        if (status !== 200 && msg) message.error(msg);
        break;
    }
    return res.data;
  },
  err => {
    const { status } = err.response;
    switch (status) {
      case 401:
        logout();
        break;
      case 403:
        message.warning('无访问权限');
        break;
      default:
        message.error('网络异常，请稍后重试');
        break;
    }
    return err.response;
  }
);

export const exportInstance = () =>
  axios.create({
    baseURL: BASE_URL,
    headers: {
      authorization: localforage.getItem(localforage.token),
      'Content-Type': 'application/json;application/octet-stream',
    },
    responseType: 'blob',
  });

export default request;
