import { Result, Button } from 'antd';
import { Link } from 'dva/router';
import React from 'react';

const Exception404 = () => (
  <Result
    status="404"
    title="404"
    subTitle="暂无页面"
    extra={
      <Link to="/">
        <Button type="primary">返回首页</Button>
      </Link>
    }
  />
);

export default Exception404;
