import { DownOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import type { FC, ReactNode } from 'react';
import React from 'react';

const defaultCollapseRender = (collapsed: boolean) => {
  const style = {
    marginLeft: '0.5em',
    transition: '0.3s all',
    transform: `rotate(${collapsed ? 0 : 0.5}turn)`,
  };
  if (collapsed) {
    return (
      <>
        展开
        <DownOutlined style={style} />
      </>
    );
  }
  return (
    <>
      收起
      <DownOutlined style={style} />
    </>
  );
};

interface ActionsProps {
  collapsed?: boolean;
  submitter?: ReactNode;
  collapseRender?: false | ((collapsed: boolean) => ReactNode);
  setCollapsed: (collapsed: boolean) => void;
}

const Actions: FC<ActionsProps> = props => {
  const { setCollapsed, collapsed = false, submitter, collapseRender: propsCollapseRender } = props;
  const collapseRender = propsCollapseRender || defaultCollapseRender;
  return (
    <Space>
      {submitter}
      {propsCollapseRender === false ? null : (
        <a className="ant-btn-link" onClick={() => setCollapsed(!collapsed)}>
          {collapseRender ? collapseRender(collapsed) : null}
        </a>
      )}
    </Space>
  );
};

export default Actions;
