import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, message } from 'antd';
import { ShoppingOutlined, DollarOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import api from '../../api';

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    revenue: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/seller/dashboard');
        setStats(response.data);
      } catch (error) {
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="seller-dashboard">
      <h2>商家控制台</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={stats.productCount}
              prefix={<ShoppingOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={stats.orderCount}
              prefix={<DollarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总销售额"
              value={stats.revenue}
              prefix="¥"
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="库存预警"
              value={stats.lowStockCount}
              prefix={<WarningOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="最近订单" loading={loading}>
            {/* 订单列表组件 */}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="库存预警商品" loading={loading}>
            {/* 库存预警商品列表 */}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SellerDashboard;
