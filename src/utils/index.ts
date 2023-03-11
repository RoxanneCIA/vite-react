import type { TablePaginationConfig } from 'antd';
import { message } from 'antd';
import type { AxiosResponse } from 'axios';
import type { Effect } from 'dva';
import { AUTHORIZATION_TOKEN, UPDATE_STATE } from '../constants';

export const localforage = {
  token: AUTHORIZATION_TOKEN,
  setItem: <T = string>(key: string, value: T) => {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      try {
        const str = JSON.stringify(value);
        localStorage.setItem(key, str);
      } catch (error) {
        throw new Error('error');
      }
    }
  },
  getItem: <T = string>(key: string, parse = false): T | string | null => {
    const strData = localStorage.getItem(key);
    if (parse) {
      try {
        return JSON.parse(strData ?? '{}');
      } catch (error) {
        throw new Error('error');
      }
    }
    return strData;
  },
  removeItem: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

export async function to<T, E = Error>(promise: Promise<T>): Promise<[T | null, E | null]> {
  try {
    const ret = await promise;
    return [ret, null];
  } catch (error) {
    return [null, error as E];
  }
}

export const logout = () => {
  console.log('logout');
};

export const trimParams = <T = string | number | [] | boolean>(data: T | Record<string, T>) => {
  if (!data) return data;
  if (typeof data === 'boolean' || typeof data === 'number' || data instanceof Array) return data;
  if (typeof data === 'string') return data.trim();
  if (data instanceof Object && Object.prototype.toString.call(data) === '[object Object]') {
    for (const key in data) {
      data[key] = trimParams(data[key]) as T;
    }
  }
  return data;
};

export const getParam = (name: string) => {
  const search = window.location.search || location.hash;
  const pattern = new RegExp(`[?&]${name}=([^&]+)`, 'g');
  const matcher = pattern.exec(search);
  let items = null;
  if (matcher !== null) {
    try {
      items = decodeURIComponent(decodeURIComponent(matcher[1]));
    } catch (e) {
      try {
        items = decodeURIComponent(matcher[1]);
      } catch (error) {
        items = matcher[1];
      }
    }
  }
  return items;
};

export const effectPagination = <T, D>(
  url: (data: D) => Promise<T>,
  stateKey: string,
  transform?: typeof setPagination
): Effect => {
  return function* ({ payload, callback }, { call, put }) {
    const { data, status } = yield call(url, payload);
    if (status === 200) {
      const { rows = [], ...rest } = data;
      yield put({
        type: UPDATE_STATE,
        payload: {
          [stateKey]: {
            list: rows,
            pagination: transform ? transform({ ...payload, ...rest }) : setPagination(rest),
          },
        },
      });
      callback?.();
    }
  };
};

export const effectFetch = <D, T, R, P>(
  url: (data: D) => Promise<T>,
  stateKey: string,
  transform?: (data: R) => P
): Effect => {
  return function* ({ payload, callback }, { call, put }) {
    const { status, data } = yield call(url, payload);
    if (status === 200) {
      yield put({
        type: UPDATE_STATE,
        payload: {
          [stateKey]: transform ? transform(data) : data,
        },
      });
      callback?.();
    }
  };
};

export const effectOperate = <T, D>(url: (data: D) => Promise<T>, msg?: string): Effect => {
  return function* ({ payload, callback }, { call }) {
    const { status, message: resMsg = msg } = yield call(url, payload);
    if (status === 200) {
      callback?.();
      if (resMsg) message.success(resMsg);
    } else {
      message.warning('操作失败！');
    }
  };
};

export const setPagination = (data: ResPagination) => {
  const { pageIndex, ...rest } = data;
  return { current: pageIndex, ...rest };
};

export const getIndex = (idx: number, pagination: TablePaginationConfig) => {
  const { pageSize = 10, current = 1 } = pagination;
  return idx + 1 + pageSize * (current - 1);
};

export const exportExcel = (excelInfo: AxiosResponse<BlobPart>) => {
  const { data, headers } = excelInfo;
  const contentType = headers['content-type'];
  const blob = new Blob([data], { type: contentType });
  const contentDisposition = headers['content-disposition'];
  let fileName = 'unknown';
  if (contentDisposition) {
    fileName = window.decodeURI(headers['content-disposition'].split('=')[1]);
  }
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
};

export const flattenData = <T>(data: T[] = [], result: T[] = [], node = 'children') => {
  data.forEach(item => {
    const children = item[node];
    result.push(item);
    flattenData(children, result);
  });
  return result;
};
