import { Button } from 'antd';
import React from 'react';
import bg from '@/assets/main-bg-3.png';
import './welcome.less';

export default () => (
  <div className="container">
    <div className="inner">
      <img src={bg} alt="" />
      <Button type="primary">进入xx目录</Button>
    </div>
  </div>
);
