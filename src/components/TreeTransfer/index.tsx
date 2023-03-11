import React, { useCallback, useMemo, useState } from 'react';
import type { RadioChangeEvent, TreeProps } from 'antd';
import { List, Col, Input, Radio, Row, Space, Tree } from 'antd';
import { debounce, uniqWith } from 'lodash';
import { CloseCircleOutlined } from '@ant-design/icons';
import useMergedState from 'rc-util/es/hooks/useMergedState';
import { filterTreeData, flattenTree, flattenTreeKeys, splitKey } from './utils';
import IconFont from '../Iconfont';
import type { FC } from 'react';
import type { TreeNode } from './utils';

import './index.less';

export interface TreeTransferProps<T extends TreeNode = TreeNode> {
  type?: 'radio' | 'checkbox';
  dataSource?: T[];
  targets?: T[];
  separator?: string;
  onChange?: (data: T[]) => void;
}

const TreeTransfer: FC<TreeTransferProps> = props => {
  const { onChange, targets, type = 'checkbox', separator = ',', dataSource = [] } = props;
  const [keywords, setKeywords] = useState<string>();
  const [viewData, setViewData] = useMergedState([], { value: targets ?? [], onChange });
  const treeData = useMemo(
    () => (keywords ? filterTreeData(dataSource, keywords, separator) : dataSource),
    [dataSource, keywords]
  );
  const targetKeys = useMemo(() => viewData.map(it => splitKey(it.key, separator)), [viewData]);
  const flattenTreeData = useMemo(() => flattenTree(treeData), [treeData]);
  const transformTargetKeys = useMemo(() => {
    return flattenTreeData.filter(item => targetKeys.includes(splitKey(item.key, separator))).map(it => it.key);
  }, [targetKeys, flattenTreeData]);
  const debounceChange = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value), 200),
    []
  );
  const handleViewData = (data: TreeNode[]) => {
    return data.map(it => {
      const { children, ...rest } = it;
      return rest;
    });
  };
  const handleClear = () => {
    if (viewData.length) {
      setViewData([]);
    }
  };
  const handleDelete = (item: TreeNode) => {
    const newViewData = handleViewData(viewData.filter(it => it.key !== item.key));
    setViewData(newViewData);
  };
  const handleRadioChange = (e: RadioChangeEvent) => {
    const findData = flattenTreeData.find(it => splitKey(it.key, separator) === splitKey(e.target.value, separator));
    if (findData) {
      const newViewData = handleViewData([findData]);
      setViewData(newViewData);
    }
  };
  const useKey = useMemo(() => (keywords ? Math.random().toString(16).slice(2) : 'b'), [keywords]);
  const treeProps: TreeProps = {
    height: 320,
    checkedKeys: transformTargetKeys,
    defaultExpandAll: !!keywords,
    selectable: false,
    checkable: type === 'checkbox',
    treeData,
  };
  return (
    <Row className="tree-transfer-content">
      <Col span={12} className="transfer-left">
        <div className="transfer-content">
          <div>
            <Input placeholder="搜索" allowClear onChange={debounceChange} prefix={<IconFont type="iconsousuo" />} />
          </div>
          <div className="scroll-content">
            {type === 'checkbox' ? (
              <Tree
                key={useKey}
                onCheck={(_, { node, checked }) => {
                  const flattenNodes = flattenTree([node]).filter(it => `${it.key}`.includes(separator));
                  const newViewData = checked
                    ? uniqWith(
                        [...viewData, ...flattenNodes],
                        (a, b) => splitKey(a.key, separator) === splitKey(b.key, separator)
                      )
                    : viewData.filter(
                        it => !flattenNodes.some(item => splitKey(item.key, separator) === splitKey(it.key, separator))
                      );
                  setViewData(newViewData);
                }}
                {...treeProps}
              />
            ) : (
              <Radio.Group
                value={transformTargetKeys.length ? splitKey(transformTargetKeys[0], separator) : undefined}
                onChange={handleRadioChange}
                style={{ width: '100%' }}
              >
                <Tree
                  key={useKey}
                  titleRender={node =>
                    node.children?.length ? (
                      node.title
                    ) : (
                      <Space>
                        <Radio value={splitKey(node.key, separator)}>{node.title}</Radio>
                      </Space>
                    )
                  }
                  {...treeProps}
                />
              </Radio.Group>
            )}
          </div>
        </div>
      </Col>
      <Col span={12} className="transfer-right">
        <div className="transfer-content">
          <div>
            <Row className="transfer-right-header" align="middle" justify="space-between">
              <Col>已选：{viewData.length}</Col>
              <Col>
                <a className="clear" onClick={handleClear}>
                  清空
                </a>
              </Col>
            </Row>
          </div>
          <div className="scroll-content">
            <List
              size="small"
              itemLayout="horizontal"
              dataSource={viewData}
              renderItem={item => (
                <List.Item key={item.key}>
                  <Col>{item.title}</Col>
                  <Col>
                    <CloseCircleOutlined
                      onClick={() => handleDelete(item)}
                      style={{ color: '#999', cursor: 'pointer' }}
                    />
                  </Col>
                </List.Item>
              )}
            />
          </div>
        </div>
      </Col>
    </Row>
  );
};

export { filterTreeData, flattenTree, flattenTreeKeys, splitKey };

export type { TreeNode };

export default TreeTransfer;
