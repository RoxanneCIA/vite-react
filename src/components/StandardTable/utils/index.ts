import type { Moment } from 'moment';
import moment from 'moment';
import type { ColumnsType } from 'antd/lib/table';
import type { ColumnType, FilterValue } from 'antd/lib/table/interface';

type DataIndex = string | number | readonly (string | number)[];
export type DateFormatter = 'number' | 'string' | false;

const dateFormatterMap = {
  time: 'HH:mm:ss',
  timeRange: 'HH:mm:ss',
  date: 'YYYY-MM-DD',
  dateWeek: 'YYYY-wo',
  dateMonth: 'YYYY-MM',
  dateQuarter: 'YYYY-QQ',
  dateYear: 'YYYY',
  dateRange: 'YYYY-MM-DD',
  dateTime: 'YYYY-MM-DD HH:mm:ss',
  dateTimeRange: 'YYYY-MM-DD HH:mm:ss',
};

export type DateFormatterType = keyof typeof dateFormatterMap;

const isObject = <T>(o: T) => Object.prototype.toString.call(o) === '[object Object]';

const convertMoment = (value: Moment, dateFormatter?: DateFormatter, valueType?: keyof typeof dateFormatterMap) => {
  if (!dateFormatter) {
    return value;
  }

  if (moment.isMoment(value)) {
    if (dateFormatter === 'number') {
      return value.valueOf();
    }

    if (dateFormatter === 'string') {
      return value.format(dateFormatterMap[valueType ?? 'dateTimeRange']);
    }

    if (typeof dateFormatter === 'string' && dateFormatter !== 'string') {
      return value.format(dateFormatter);
    }
  }

  return value;
};

const isNil = <T>(value: T) => value === null || value === undefined;

const parseDataIndex = (dataIndex?: DataIndex) => {
  if (Array.isArray(dataIndex)) {
    return dataIndex.join(',');
  }
  return dataIndex === null || dataIndex === void 0 ? void 0 : dataIndex.toString();
};

export const isPlainObject = <T>(o: Record<string, T>) => {
  if (isObject(o) === false) return false;
  const ctor = o.constructor;
  if (ctor === undefined) return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;
  if (Object.prototype.hasOwnProperty.call(prot, 'isPrototypeOf') === false) {
    return false;
  }
  return true;
};

export const omitUndefined = <T>(obj: T): T => {
  const newObj = {} as T;
  Object.keys(obj || {}).forEach(key => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

export const parseDefaultColumnConfig = <T = unknown>(columns: ColumnsType<T>) => {
  const filter: Record<string, FilterValue> = {};
  const sort: Record<string, 'descend' | 'ascend'> = {};
  columns.forEach((column: ColumnType<T>) => {
    // 转换 dataIndex
    const dataIndex = parseDataIndex(column.dataIndex);

    if (!dataIndex) {
      return;
    } // 当 column 启用 filters 功能时，取出默认的筛选值

    if (column.filters && column.defaultFilteredValue) {
      filter[dataIndex] = column.defaultFilteredValue;
    } // 当 column 启用 sorter 功能时，取出默认的排序值

    if (column.sorter && column.defaultSortOrder) {
      sort[dataIndex] = column.defaultSortOrder;
    }
  });
  return {
    sort,
    filter,
  };
};

export const conversionSubmitValue = <T = any>(
  value: T,
  dateFormatter: DateFormatter,
  valueTypeMap: Record<string, DateFormatterType>,
  omitNil = true
) => {
  const tmpValue = {};
  if (typeof value !== 'object' || isNil(value) || value instanceof Blob) {
    return value;
  }

  Object.keys(value).forEach(key => {
    const itemValue = value[key];

    if (isNil(itemValue) && omitNil) {
      return;
    }

    if (
      isPlainObject(itemValue) && // 不是数组
      !Array.isArray(itemValue) && // 不是 moment
      !moment.isMoment(itemValue)
    ) {
      tmpValue[key] = conversionSubmitValue(itemValue, dateFormatter, valueTypeMap, omitNil);
      return;
    }

    if (Array.isArray(itemValue)) {
      tmpValue[key] = itemValue.map(arrayValue => {
        if (moment.isMoment(arrayValue)) {
          return convertMoment(arrayValue, dateFormatter, valueTypeMap[key]);
        }

        return conversionSubmitValue(arrayValue, dateFormatter, valueTypeMap, omitNil);
      });
      return;
    }

    tmpValue[key] = convertMoment(itemValue, dateFormatter, valueTypeMap[key]);
  });
  return tmpValue;
};
