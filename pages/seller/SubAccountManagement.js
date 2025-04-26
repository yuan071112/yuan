import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api';

const { Option } = Select;

const SubAccountManagement = () => {
  const [subAccounts, setSubAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const permissionOptions = [
    { value: 'product', label: '商品管理' },
    { value: 'order', label: '订单管理' },
    { value: 'finance', label: '财务管理' },
    { value: 'marketing', label: '营销管理' },
  ];

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <Space size="small">
          {permissions.map(perm => (
            <Tag key={perm}>{permissionOptions.find(p => p.value === perm)?.label || perm}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title={`确定要${record.status === 'active' ? '禁用' : '启用'}该子账号吗？`}
            onConfirm={() => handleToggleStatus(record._id, record.status)}
          >
            <Button 
              type="link" 
              danger={record.status === 'active'}
            >
              {record.status === 'active' ? '禁用' : '启用'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchSubAccounts();
  }, []);

  const fetchSubAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/sub-accounts');
      setSubAccounts(response.data);
    } catch (error) {
      message.error('获取子账号列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      permissions: record.permissions || []
    });
    setEditingId(record._id);
    setVisible(true);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/seller/sub-accounts/${id}`, {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      });
      message.success('操作成功');
      fetchSubAccounts();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await api.put(`/seller/sub-accounts/${editingId}`, values);
        message.success('更新成功');
      } else {
        await api.post('/seller/sub-accounts', values);
        message.success('添加成功');
      }
      setVisible(false);
      fetchSubAccounts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="subaccount-management">
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加子账号
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={subAccounts} 
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingId ? '编辑子账号' : '添加子账号'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingId && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="permissions"
            label="权限"
            rules={[{ required: true, message: '请选择至少一项权限' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择权限"
              options={permissionOptions}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue="active"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubAccountManagement;
