import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Start from './pages/Start';
import Products from './pages/Products';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout, { CheckedOut } from './pages/Checkout';

const App = () => (
  <Routes>
    <Route path="/" element={<Start />} />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<Products />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/checkedout" element={<CheckedOut />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
