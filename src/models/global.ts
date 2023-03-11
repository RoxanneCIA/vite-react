import { httpMenuList, httpUserInfo } from '@/api/services';
import { UPDATE_STATE } from '@/constants';
import { effectFetch } from '@/utils';
import type { Effect, Model } from 'dva';
import type { Reducer } from 'redux';

export interface GlobalModelState {
  userInfo: Partial<UserInfo>;
  menuData: MenuItem[];
}

interface GlobalModelType extends Model {
  namespace: string;
  state: GlobalModelState;
  effects: {
    fetchUser: Effect;
    fetchMenu: Effect;
  };
  reducers: {
    [UPDATE_STATE]: Reducer<GlobalModelState>;
  };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',
  state: {
    userInfo: {},
    menuData: [],
  },
  effects: {
    fetchUser: effectFetch(httpUserInfo, 'userInfo'),
    fetchMenu: effectFetch(httpMenuList, 'menuData'),
  },
  reducers: {
    [UPDATE_STATE](state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default GlobalModel;
