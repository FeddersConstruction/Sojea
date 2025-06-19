// src/pages/Checkout.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';
import SquareForm from '../components/SquareForm';

export function CheckedOut() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!state || !state.address || !state.userId) {
      return navigate('/');
    }

    async function finalize() {
      try {
        // 1) send email
        await fetch('/api/checkout/send-email', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            userId:    state.userId,
            userEmail: state.userEmail,
            address:   state.address
          })
        });

        // 2) clear cart
        await fetch(`/api/cart/${state.userId}`, {
          method: 'DELETE'
        });

      } catch (err) {
        console.error('[CheckedOut] finalize error:', err);
      } finally {
        setDone(true);
      }
    }

    finalize();
  }, [state, navigate]);

  if (!done) {
    return <p className="checkout-loading">Finalizing your order…</p>;
  }

  return (
    <div className="container">
      <div className="wrapper">
        <h1 className="checkout-title">Thank You!</h1>
        <p>Your order is confirmed and on its way.</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!state || state.totalPrice == null || !state.userId) {
      navigate('/cart');
    }
  }, [state, navigate]);

  const { totalQuantity = 0, totalPrice = 0, userId } = state || {};
  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email;

  const handleSuccess = () => {
    navigate('/checkedout', {
      state: { address, totalQuantity, totalPrice, userId, userEmail }
    });
  };

  return (
    <div className="container">
      <div className="wrapper">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-summary green-text">
          <div><strong>Total items:</strong> {totalQuantity}</div>
          <div><strong>Total price:</strong> ${totalPrice.toFixed(2)}</div>
        </div>

        <div className="address-entry">
          <label htmlFor="address">Shipping Address</label>
          <textarea
            id="address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="123 Main St, City, State ZIP"
          />
        </div>

        <SquareForm
          userId={userId}
          amount={totalPrice}
          address={address}
          onPaymentSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
