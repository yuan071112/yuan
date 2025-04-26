import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Select, Tag, DatePicker } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../api';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FinanceManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const statusOptions = [
    { value: 'pending', label: '待处理' },
    { value: 'completed', label: '已完成' },
    { value: 'failed', label: '失败' },
  ];

  const typeOptions = [
    { value: 'order', label: '订单收款' },
    { value: 'withdraw', label: '提现' },
    { value: 'refund', label: '退款' },
  ];

  const columns = [
    {
      title: '交易ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => typeOptions.find(t => t.value === type)?.label || type,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'failed' ? 'red' : 'orange'
        }>
          {statusOptions.find(s => s.value === status)?.label || status}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => moment(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text) => text || '-',
    },
  ];

  useEffect(() => {
    fetchTransactions();
  }, [pagination.current]);

  const fetchTransactions = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/seller/transactions', {
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
          ...params,
        },
      });
      setTransactions(response.data.list);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
    } catch (error) {
      message.error('获取交易记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleFilter = async () => {
    try {
      const values = await form.validateFields();
      const params = {
        ...values,
        startTime: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endTime: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      };
      delete params.dateRange;
      fetchTransactions(params);
      setFilterVisible(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExport = async () => {
    try {
      const values = form.getFieldsValue();
      const params = {
        ...values,
        startTime: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endTime: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      };
      delete params.dateRange;

      const response = await api.get('/seller/transactions/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `交易记录_${moment().format('YYYYMMDD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error('导出失败');
    }
  };

  return (
    <div className="finance-management">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            onClick={() => setFilterVisible(true)}
          >
            筛选
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={transactions} 
        rowKey="transactionId"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title="筛选条件"
        visible={filterVisible}
        onOk={handleFilter}
        onCancel={() => setFilterVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="dateRange"
            label="时间范围"
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="type"
            label="交易类型"
          >
            <Select
              placeholder="请选择交易类型"
              options={typeOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="交易状态"
          >
            <Select
              placeholder="请选择交易状态"
              options={statusOptions}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="transactionId"
            label="交易ID"
          >
            <Input placeholder="请输入交易ID" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FinanceManagement;
