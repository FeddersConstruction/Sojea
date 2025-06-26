// src/pages/Checkout.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';
import SquareForm from '../components/SquareForm';

export function CheckedOut() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const API = process.env.REACT_APP_API_BASE_URL;

  // Format deliveryTime into "H:MM am/pm"
  const formatDelivery = t => {
    const [h, m] = t.split(':').map(Number);
    const ampm   = h >= 12 ? 'pm' : 'am';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2,'0')} ${ampm}`;
  };

  useEffect(() => {
    if (!state || !state.address || !state.userId || !state.deliveryTime) {
      navigate('/');
      return;
    }

    const storageKey = `order_sent_${state.userId}`;
    if (localStorage.getItem(storageKey)) {
      // Already sent; skip re-sending
      setDone(true);
      return;
    }

    async function finalize() {
      try {
        await fetch(`${API}/api/checkout/send-email`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            userId:       state.userId,
            userEmail:    state.userEmail,
            address:      state.address,
            deliveryTime: state.deliveryTime
          })
        });

        await fetch(`${API}/api/cart/${state.userId}`, { method: 'DELETE' });

        // Mark as sent so we don't double-send
        localStorage.setItem(storageKey, 'true');
      } catch (err) {
        console.error('[CheckedOut] finalize error:', err);
      } finally {
        setDone(true);
      }
    }

    finalize();
  }, [state, navigate, API]);

  if (!done) {
    return <p className="checkout-loading">Finalizing your order…</p>;
  }

  const deliveryStr = formatDelivery(state.deliveryTime);
  return (
    <div className="container">
      <div className="wrapper">
        <h1 className="checkout-title">Thank You!</h1>
        <p>Your order was placed successfully.</p>
        <p><strong>Delivery:</strong> Tomorrow at {deliveryStr}</p>
        <button onClick={() => navigate('/')}>Return Home</button>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { state }       = useLocation();
  const navigate        = useNavigate();
  const [address, setAddress]           = useState('');
  const [deliveryTime, setDeliveryTime] = useState('07:30');
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!state || state.totalPrice == null || !state.userId) {
      navigate('/cart');
    }
  }, [state, navigate]);

  const { totalQuantity = 0, totalPrice = 0, userId } = state || {};
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const userEmail = user.email;

  const handleSuccess = () => {
    navigate('/checkedout', {
      state: {
        address,
        totalQuantity,
        totalPrice,
        userId,
        userEmail,
        deliveryTime
      }
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

        <div className="time-entry">
          <label htmlFor="deliveryTime">Delivery time (Tomorrow 7:30 am – 12:00 pm)</label>
          <input
            id="deliveryTime"
            type="time"
            step="1800"       // 30-minute increments
            min="07:30"
            max="12:00"
            value={deliveryTime}
            onChange={e => setDeliveryTime(e.target.value)}
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
