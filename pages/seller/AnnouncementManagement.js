import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api';
import moment from 'moment';

const { TextArea } = Input;

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => text.length > 50 ? `${text.substring(0, 50)}...` : text,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      render: (time) => time ? moment(time).format('YYYY-MM-DD HH:mm') : '-',
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
            title="确定要删除该公告吗？"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
          {record.status === 'draft' && (
            <Button 
              type="link"
              onClick={() => handlePublish(record._id)}
            >
              发布
            </Button>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/seller/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      message.error('获取公告列表失败');
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
    form.setFieldsValue(record);
    setEditingId(record._id);
    setVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/seller/announcements/${id}`);
      message.success('删除成功');
      fetchAnnouncements();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.put(`/seller/announcements/${id}/publish`);
      message.success('发布成功');
      fetchAnnouncements();
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await api.put(`/seller/announcements/${editingId}`, values);
        message.success('更新成功');
      } else {
        await api.post('/seller/announcements', values);
        message.success('添加成功');
      }
      setVisible(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="announcement-management">
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加公告
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={announcements} 
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title={editingId ? '编辑公告' : '添加公告'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <TextArea rows={6} placeholder="请输入公告内容" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            initialValue="draft"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select>
              <Option value="draft">草稿</Option>
              <Option value="published">发布</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AnnouncementManagement;
