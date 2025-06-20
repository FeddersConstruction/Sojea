import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';
import Navbar  from '../components/Navbar';
import Footer  from '../components/Footer';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('[Cart] Loaded user from localStorage:', user);
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchCart(user.id);
  }, [API, navigate]);

  const fetchCart = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/cart/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items);
      setTotalQuantity(data.totalQuantity);
      setTotalPrice(data.totalPrice);
    } catch (err) {
      console.error('[Cart] Could not load cart:', err);
      setError('Could not load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQty) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const res = await fetch(
      `${API}/api/cart/${user.id}/item/${productId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      }
    );
    const data = await res.json();
    if (res.ok) {
      setItems(data.items);
      setTotalQuantity(data.totalQuantity);
      setTotalPrice(data.totalPrice);
    } else {
      alert(data.message || 'Update failed');
    }
  };

  const removeItem = async (productId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const res = await fetch(
      `${API}/api/cart/${user.id}/item/${productId}`,
      { method: 'DELETE' }
    );
    const data = await res.json();
    if (res.ok) {
      setItems(data.items);
      setTotalQuantity(data.totalQuantity);
      setTotalPrice(data.totalPrice);
    } else {
      alert(data.message || 'Remove failed');
    }
  };

  if (loading) return <p className="cart-loading">Loading cart…</p>;
  if (error)   return <p className="cart-error">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="wrapper">
          <h2>Your Cart</h2>

          {items.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            <>
              <ul className="cart-list">
                {items.map(item => (
                  <li key={item.productId} className="cart-item">
                    <div className="item-top-row">
                      <span className="item-name">{item.name}</span>
                      <div className="item-controls">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity-1))}
                          disabled={item.quantity <= 1}
                        >−</button>
                        <span className="item-qty">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity+1)}
                        >+</button>
                        <button
                          className="item-remove"
                          onClick={() => removeItem(item.productId)}
                        >X</button>
                      </div>
                    </div>
                    <div className="item-subtotal">
                      {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="cart-summary">
                <div>Total items:</div>
                <div className="summary-value">{totalQuantity}</div>
                <div>Total price:</div>
                <div className="summary-value">${totalPrice.toFixed(2)}</div>
              </div>

              <button
                className="checkout-button"
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem('user'));
                  console.log('[Cart] Navigating to /checkout with userId:', user?.id);
                  navigate('/checkout', {
                    state: {
                      userId: user?.id,
                      totalQuantity,
                      totalPrice
                    }
                  });
                }}
              >
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
