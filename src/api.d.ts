interface RES<T> {
  srvTime: number;
  status: number;
  message: string;
  data: T;
}

interface ResPagination {
  pageIndex: number;
  pageSize: number;
  total: number;
}

interface ResPage<T> extends ResPagination {
  rows: T[];
}

interface UserInfo {
  eid: string;
  email: string;
  empCode: string;
  entryDate: string;
  gender: 1;
  iconUri: string;
  id: string;
  isSendMessage: 1;
  mobile: string;
  name: string;
  needHour: 1;
  officePlace: string;
  orgId: string;
  orgName: string;
  personalStatus: 0;
  place: string;
  positionId: string;
  positionName: string;
  userSpecialRole: string;
  userType: 1;
  virtualName: string;
}

interface MenuItem {
  children: MenuItem[];
  code: string;
  icon: string;
  id: string;
  name: string;
  orderNum: number;
  parentId: string;
  path: string;
  spread: boolean;
}
