import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductList from '../pages/buyer/ProductList';
import ProductDetail from '../pages/buyer/ProductDetail';
import ShoppingCart from '../pages/buyer/ShoppingCart';
import OrderList from '../pages/buyer/OrderList';
import AddressManage from '../pages/buyer/AddressManage';
import NoticeList from '../pages/buyer/NoticeList';
import ProductReview from '../pages/buyer/ProductReview';
import CustomerService from '../pages/buyer/CustomerService';
import Favorites from '../pages/buyer/Favorites';

function BuyerRoutes() {
  return (
    <Routes>
      <Route path="products" element={<ProductList />} />
      <Route path="products/:id" element={<ProductDetail />} />
      <Route path="cart" element={<ShoppingCart />} />
      <Route path="orders" element={<OrderList />} />
      <Route path="addresses" element={<AddressManage />} />
      <Route path="notices" element={<NoticeList />} />
      <Route path="reviews/:id" element={<ProductReview />} />
      <Route path="service" element={<CustomerService />} />
      <Route path="favorites" element={<Favorites />} />
    </Routes>
  );
}

export default BuyerRoutes;
