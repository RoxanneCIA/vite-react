import type { FC, ReactNode, MutableRefObject } from 'react';
import React, { useRef, memo, useState, useMemo, useEffect } from 'react';

import type { FormInstance, FormItemProps, TableProps } from 'antd';
import { Button, Col, Row, Form, Table, Space, Card } from 'antd';
import type { ColumnGroupType } from 'antd/lib/table';
import type { Store } from 'antd/lib/form/interface';
import type { FilterValue, SortOrder, TablePaginationConfig } from 'antd/lib/table/interface';
import { stringify } from 'use-json-comparison';
import useMergedState from 'rc-util/es/hooks/useMergedState';

import { conversionSubmitValue, omitUndefined, parseDefaultColumnConfig } from './utils';
import type { DateFormatter, DateFormatterType } from './utils';
import { useDebounceFn, useDeepCompareEffect } from '@/hooks';
import Actions from './actions';
import './index.less';

// const TABLE_NULL = '-';

export interface StandardColumnType<T = unknown> extends Omit<ColumnGroupType<T>, 'children'> {
  dataIndex?: string | number | (string | number)[];
  colSize?: number;
  initialValue?: any;
  hideInSearch?: boolean;
  hideInTable?: boolean;
  formItemProps?: FormItemProps;
  dateFormat?: DateFormatterType;
  renderFormItem?: (form: FormInstance) => ReactNode;
}

export interface TableRequestParams {
  pageSize?: number;
  current?: number;
  [key: string]: any;
}

export interface TableSearchProps {
  searchText?: string;
  resetText?: string;
  span?: number | string;
  className?: string;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  collapseRender?: false | (() => ReactNode);
  onCollapse?: (collapsed: boolean) => void;
}

export interface ActionType {
  reload: () => void;
}

interface QueryFormProps {
  loading?: boolean;
  pagination?: TablePaginationConfig | false;
  columns?: StandardColumnType<any>[];
  formRef?: MutableRefObject<FormInstance | undefined>;
  search?: TableSearchProps;
  dateFormatter?: DateFormatter;
  onReset?: () => void;
  onSubmit?: (values: Store) => void;
  onFormSearchSubmit: (values: Store) => void;
}

const QueryForm = memo<QueryFormProps>(props => {
  const [form] = Form.useForm();
  const {
    search,
    loading = false,
    formRef,
    columns = [],
    onFormSearchSubmit,
    onSubmit: propsSubmit,
    onReset: propsReset,
    pagination,
    dateFormatter = false,
  } = props;
  const {
    className,
    span = 6,
    searchText = '查询',
    resetText = '重置',
    defaultCollapsed = true,
    collapsed: controlCollapsed,
    onCollapse,
    collapseRender,
  } = search || {};
  const fieldsValueType = useRef({});
  const [collapsed, setCollapsed] = useMergedState(() => defaultCollapsed, {
    value: controlCollapsed,
    onChange: onCollapse,
  });
  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
    form.submit();
  }, [form]);
  const [formContent, totalSpan, currentSpan] = useMemo(() => {
    let totalSpan = 0;
    let currentSpan = 0;
    const columnsForm = columns
      .map((item, idx) => {
        const {
          colSize = 1,
          key,
          dataIndex = idx,
          initialValue,
          hideInSearch = false,
          title,
          formItemProps = {},
          dateFormat,
          renderFormItem,
        } = item;
        if (hideInSearch) return null;
        if (renderFormItem) {
          const colSpan = Math.min(6 * (colSize || 1), 24);
          totalSpan += colSpan;
          const { dependencies, shouldUpdate, ...rest } = formItemProps;
          const itemProps = {
            labelCol: { flex: '0 0 80px' },
            colon: false,
            label: title,
            name: key || dataIndex,
            initialValue,
            ...rest,
          };
          if (dateFormat) {
            fieldsValueType.current = { ...fieldsValueType.current, [itemProps.name as any]: dateFormat };
          }
          const hidden = collapsed && !!idx && totalSpan >= 24;
          if (hidden) {
            return dependencies || shouldUpdate ? (
              <Form.Item
                key={key || idx}
                noStyle
                dependencies={dependencies}
                shouldUpdate={shouldUpdate}
                hidden={hidden}
              >
                {() => (
                  <Form.Item {...itemProps} hidden={hidden}>
                    {renderFormItem(form)}
                  </Form.Item>
                )}
              </Form.Item>
            ) : (
              <Form.Item key={key || idx} {...itemProps} hidden={hidden}>
                {renderFormItem(form)}
              </Form.Item>
            );
          }
          if (24 - (currentSpan % 24) < colSpan) {
            totalSpan += 24 - (currentSpan % 24);
            currentSpan += 24 - (currentSpan % 24);
          }

          currentSpan += colSpan;
          return (
            <Col key={key || idx} span={colSpan}>
              {dependencies || shouldUpdate ? (
                <Form.Item noStyle dependencies={dependencies} shouldUpdate={shouldUpdate}>
                  {() => <Form.Item {...itemProps}>{renderFormItem(form)}</Form.Item>}
                </Form.Item>
              ) : (
                <Form.Item {...itemProps}>{renderFormItem(form)}</Form.Item>
              )}
            </Col>
          );
        }
        return null;
      })
      .filter(it => it !== null);
    return [columnsForm, totalSpan, currentSpan];
  }, [columns, form, collapsed]);
  const offset = useMemo(() => 24 - ((currentSpan % 24) + Number(span || 6)), [currentSpan]);
  const needCollapseRender = useMemo(() => totalSpan >= 24, [totalSpan]);
  const onSubmit = (values: Store) => {
    const finalValues = conversionSubmitValue(values, dateFormatter, fieldsValueType.current);
    onFormSearchSubmit({
      ...finalValues,
      ...(pagination ? { current: 1, pageSize: pagination.pageSize ?? 10 } : {}),
      _timestamp: Date.now(),
    });
    propsSubmit?.(values);
  };
  const onReset = () => {
    const finalValues = conversionSubmitValue(form.getFieldsValue(), dateFormatter, fieldsValueType.current);
    onFormSearchSubmit({
      ...finalValues,
      ...(pagination ? { current: 1, pageSize: pagination.pageSize ?? 10 } : {}),
    });
    propsReset?.();
  };
  return (
    <div className="table-search">
      <Form form={form} className={className} onFinish={onSubmit} onReset={onReset}>
        <Row gutter={24}>
          {formContent}
          <Col span={span} offset={offset} style={{ textAlign: 'right' }}>
            <Form.Item>
              <Actions
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                collapseRender={needCollapseRender ? collapseRender : false}
                submitter={
                  <Space>
                    <Button loading={loading} type="primary" htmlType="submit">
                      {searchText}
                    </Button>
                    <Button htmlType="reset">{resetText}</Button>
                  </Space>
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
});

interface StandardTableProps<RecordType extends Record<string, unknown> = any> extends TableProps<RecordType> {
  headerTitle?: ReactNode | ((formValues?: Store) => ReactNode);
  search?: false | TableSearchProps;
  formRef?: MutableRefObject<FormInstance | undefined>;
  actionRef?: MutableRefObject<ActionType | undefined>;
  columns?: StandardColumnType<RecordType>[];
  params?: Store;
  dateFormatter?: DateFormatter;
  onRequest?: (
    params: TableRequestParams,
    sort: Record<string, SortOrder>,
    filter: Record<string, FilterValue | null>
  ) => void;
  onReset?: () => void;
  onSubmit?: (values: Store) => void;
}

const StandardTable: FC<StandardTableProps> = props => {
  const {
    headerTitle,
    formRef: propsFormRef,
    actionRef,
    columns = [],
    onRequest,
    onReset,
    onSubmit,
    onChange,
    loading,
    params = {},
    pagination: propsPagination,
    search,
    dateFormatter,
    ...rest
  } = props;
  const formRef = propsFormRef || useRef<FormInstance>();
  const [formSearch, setFormSearch] = useState<Store | undefined>(search !== false ? {} : undefined);
  const [tableFilter, setTableFilter] = useState<Record<string, FilterValue | null>>({});
  const [tableSorter, setTableSorter] = useState<Record<string, SortOrder>>({});
  useEffect(() => {
    const { sort, filter } = parseDefaultColumnConfig(columns);
    setTableFilter(filter);
    setTableSorter(sort);
  }, []);
  const useLocaleFilter = useMemo(() => {
    return columns === null || columns === undefined
      ? undefined
      : columns.every(function (column) {
          return column.filters === undefined && column.onFilter === undefined;
        });
  }, [columns]);
  const actionReload = () => {
    if (propsPagination) {
      fetchData?.({ current: propsPagination.current, pageSize: propsPagination.pageSize });
    }
  };
  const fetchData = useMemo(() => {
    if (!onRequest || !formSearch) return undefined;
    return (pageInfo?: Pick<TablePaginationConfig, 'current' | 'pageSize'>) => {
      const actionParams: Store = {
        ...formSearch,
        ...(pageInfo ?? {}),
        ...params,
      };
      delete actionParams._timestamp;
      onRequest?.(actionParams, tableSorter, tableFilter);
    };
  }, [onRequest, formSearch, tableFilter, tableSorter, params]);
  const fetchListDebounce = useDebounceFn(async () => {
    if (fetchData) {
      fetchData();
    }
  }, 10);
  useDeepCompareEffect(() => {
    fetchListDebounce.run();
    return () => fetchListDebounce.cancel();
  }, [stringify(formSearch), stringify(tableFilter), stringify(tableSorter)]);
  useEffect(() => {
    if (actionRef) {
      actionRef.current = {
        reload: actionReload,
      };
    }
  }, [propsPagination]);
  const tableColumns = useMemo(() => columns.filter(it => !it.hideInTable), [columns]);
  return (
    <div className="standard-table">
      {search === false ? null : (
        <QueryForm
          search={search}
          dateFormatter={dateFormatter}
          onSubmit={onSubmit}
          onReset={onReset}
          formRef={formRef}
          columns={columns}
          pagination={propsPagination}
          onFormSearchSubmit={setFormSearch}
        />
      )}
      {tableColumns.length ? (
        <Card style={{ flex: 1 }} bordered={false} bodyStyle={{ paddingTop: headerTitle ? 0 : 20, paddingBottom: 0 }}>
          {headerTitle ? (
            <div className="table-list-toolbar">
              <div className="table-list-toolbar-container">
                <Space>{typeof headerTitle === 'function' ? headerTitle(formSearch) : headerTitle}</Space>
              </div>
            </div>
          ) : null}
          <Table
            rowKey="id"
            columns={tableColumns}
            loading={loading}
            pagination={
              propsPagination
                ? {
                    defaultPageSize: 10,
                    showQuickJumper: true,
                    showSizeChanger: true,
                    showTotal: total => `共 ${total} 条`,
                    onChange: (page, pageSize) =>
                      setFormSearch(value => ({ ...(value ?? {}), current: page, pageSize })),
                    ...propsPagination,
                  }
                : propsPagination
            }
            onChange={(pagination, filters, sorter, extra) => {
              onChange?.(pagination, filters, sorter, extra);
              if (!useLocaleFilter) {
                setTableFilter(omitUndefined(filters));
              }
              if (Array.isArray(sorter)) {
                const data = sorter.reduce<Record<string, SortOrder>>((pre, value) => {
                  return { ...pre, [''.concat(value.field as string)]: value.order! };
                }, {});
                setTableSorter(omitUndefined(data));
              } else {
                let _sorter$column;
                const sorterOfColumn =
                  (_sorter$column = sorter.column) === null || _sorter$column === undefined
                    ? undefined
                    : _sorter$column.sorter;
                const isSortByField =
                  (sorterOfColumn === null || sorterOfColumn === undefined ? undefined : sorterOfColumn.toString()) ===
                  sorterOfColumn;
                setTableSorter(
                  omitUndefined({
                    [''.concat((isSortByField ? sorterOfColumn : sorter.field) as string)]: sorter.order,
                  } as Record<string, SortOrder>)
                );
              }
            }}
            scroll={{ x: 'max-content' }}
            {...rest}
          />
        </Card>
      ) : null}
    </div>
  );
};

export default StandardTable;
