import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Start from './pages/Start';
//import Product from './pages/Product';
//import Login from './pages/Login';
//import Signup from './pages/Signup';
//import Checkedout from './pages/Checkedout';
import Products from './pages/Products';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

const App = () => {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<Start />} />
      <Route path="/products" element={<Products />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;