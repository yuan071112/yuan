import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Sider, Footer } = Layout;

function MainLayout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.3)' }} />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<ShopOutlined />}>
            <Link to="/buyer">买家中心</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<ShoppingCartOutlined />}>
            <Link to="/seller">商家中心</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header style={{ padding: 0, background: '#fff' }}>
          <div style={{ float: 'right', marginRight: '20px' }}>
            <Button type="text" icon={<UserOutlined />} onClick={() => navigate('/login')}>
              登录/注册
            </Button>
          </div>
        </Header>
        {children}
        <Footer style={{ textAlign: 'center' }}>
          E-commerce Site ©2023
        </Footer>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
