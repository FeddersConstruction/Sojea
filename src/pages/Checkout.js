import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';
import SquareForm from '../components/SquareForm';
import Navbar from '../components/Navbar';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    // Redirect back to cart if we don't have totals
    if (!state || state.totalPrice == null) {
      navigate('/cart');
    }
  }, [state, navigate]);

  const { totalQuantity = 0, totalPrice = 0 } = state || {};

  return (
    <div className="container">
      <Navbar />
      <div className="wrapper">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-summary">
          <div>
            <strong>Total items:</strong> {totalQuantity}
          </div>
          <div>
            <strong>Total price:</strong> ${totalPrice.toFixed(2)}
          </div>
        </div>

        <SquareForm />
      </div>
    </div>
  );
}
