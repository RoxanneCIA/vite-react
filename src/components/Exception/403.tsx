import { Result, Button } from 'antd';
import { Link } from 'dva/router';
import React from 'react';

const Exception403 = () => (
  <Result
    status="403"
    title="403"
    subTitle="抱歉，你无权访问该页面"
    extra={
      <Link to="/">
        <Button type="primary">返回首页</Button>
      </Link>
    }
  />
);

export default Exception403;
