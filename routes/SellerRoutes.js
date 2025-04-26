import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SellerDashboard from '../pages/seller/SellerDashboard';
import ProductManagement from '../pages/seller/ProductManagement';
import OrderManagement from '../pages/seller/OrderManagement';
import SubAccountManagement from '../pages/seller/SubAccountManagement';
import AnnouncementManagement from '../pages/seller/AnnouncementManagement';
import FinanceManagement from '../pages/seller/FinanceManagement';
import PreSaleManage from '../pages/seller/PreSaleManage';
import InventoryWarning from '../pages/seller/InventoryWarning';

function SellerRoutes() {
  return (
    <Routes>
      <Route path="" element={<SellerDashboard />} />
      <Route path="products" element={<ProductManagement />} />
      <Route path="presale" element={<PreSaleManage />} />
      <Route path="orders" element={<OrderManagement />} />
      <Route path="notices" element={<AnnouncementManagement />} />
      <Route path="subaccounts" element={<SubAccountManagement />} />
      <Route path="finance" element={<FinanceManagement />} />
      <Route path="inventory" element={<InventoryWarning />} />
    </Routes>
  );
}

export default SellerRoutes;
