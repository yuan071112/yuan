import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import MainLayout from './layouts/MainLayout';
import BuyerRoutes from './routes/BuyerRoutes';
import SellerRoutes from './routes/SellerRoutes';

const { Content } = Layout;

function App() {
  return (
    <Router>
      <MainLayout>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            <Route path="/buyer/*" element={<BuyerRoutes />} />
            <Route path="/seller/*" element={<SellerRoutes />} />
            <Route path="/" element={<div>Welcome to E-commerce Site</div>} />
          </Routes>
        </Content>
      </MainLayout>
    </Router>
  );
}

export default App;
