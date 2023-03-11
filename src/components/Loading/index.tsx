import React from 'react';
import { Row, Spin } from 'antd';

export default () => (
  <Row style={{ height: '100vh' }} justify="center" align="middle">
    <Spin size="large" spinning />
  </Row>
);
