import React from 'react';
import type { FC, ReactNode } from 'react';
import { Space, Card, Button, Divider, Row, Typography, Col, Spin } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

interface GridContentProps {
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  onBack?: () => void;
}

const GridContent: FC<GridContentProps> = ({
  className,
  children,
  title,
  loading,
  action,
  onBack = () => history.back(),
}) => {
  return (
    <Row gutter={[0, 8]} className={className}>
      <Col span={24}>
        <Card bordered={false} bodyStyle={{ padding: 5 }}>
          <Row justify="space-between">
            <Col>
              <Space split={<Divider type="vertical" style={{ borderLeft: '1px solid rgb(0, 0, 0)' }} />}>
                <Button icon={<LeftOutlined />} type="text" onClick={onBack}>
                  返回
                </Button>
                <Typography.Title level={5} style={{ fontSize: 14 }}>
                  {title}
                </Typography.Title>
              </Space>
            </Col>
            <Col>{action}</Col>
          </Row>
        </Card>
      </Col>
      <Col span={24}>
        <Card style={{ height: '100%' }} bordered={false}>
          <Spin spinning={loading}>{children}</Spin>
        </Card>
      </Col>
    </Row>
  );
};

export default GridContent;
