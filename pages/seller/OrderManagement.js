import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, message } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../api';
import moment from 'moment';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const statusMap = {
    'pending': { text: '待付款', color: 'orange' },
    'paid': { text: '已付款', color: 'blue' },
    'shipped': { text: '已发货', color: 'geekblue' },
    'completed': { text: '已完成', color: 'green' },
    'cancelled': { text: '已取消', color: 'red' }
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: '买家',
      dataIndex: 'buyer',
      key: 'buyer',
      render: (buyer) => buyer?.username || '未知用户',
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '商品数量',
      dataIndex: 'items',
      key: 'items',
      render: (items) => items.reduce((sum, item) => sum + item.quantity, 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusMap[status]?.color || 'default'}>
          {statusMap[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setModalVisible(true);
            }}
          >
            详情
          </Button>
          {record.status === 'paid' && (
            <Button 
              type="link" 
              onClick={() => handleShip(record._id)}
            >
              发货
            </Button>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/orders');
      setOrders(response.data);
    } catch (error) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async (orderId) => {
    try {
      await api.put(`/seller/orders/${orderId}/ship`);
      message.success('发货成功');
      fetchOrders();
    } catch (error) {
      message.error('发货失败');
    }
  };

  return (
    <div className="order-management">
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title="订单详情"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedOrder && (
          <div>
            <h3>订单信息</h3>
            <p>订单号: {selectedOrder.orderNumber}</p>
            <p>买家: {selectedOrder.buyer?.username || '未知用户'}</p>
            <p>状态: 
              <Tag color={statusMap[selectedOrder.status]?.color || 'default'}>
                {statusMap[selectedOrder.status]?.text || selectedOrder.status}
              </Tag>
            </p>
            <p>总金额: ¥{selectedOrder.totalAmount.toFixed(2)}</p>
            <p>下单时间: {moment(selectedOrder.createdAt).format('YYYY-MM-DD HH:mm')}</p>

            <h3 style={{ marginTop: 16 }}>收货信息</h3>
            <p>收货人: {selectedOrder.shippingAddress?.name}</p>
            <p>联系电话: {selectedOrder.shippingAddress?.phone}</p>
            <p>收货地址: {selectedOrder.shippingAddress?.address}</p>

            <h3 style={{ marginTop: 16 }}>商品列表</h3>
            <Table
              columns={[
                { title: '商品名称', dataIndex: ['product', 'name'], key: 'name' },
                { title: '单价', dataIndex: 'price', key: 'price', render: (price) => `¥${price.toFixed(2)}` },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '小计', key: 'subtotal', render: (_, record) => `¥${(record.price * record.quantity).toFixed(2)}` },
              ]}
              dataSource={selectedOrder.items}
              rowKey={record => record.product._id}
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
