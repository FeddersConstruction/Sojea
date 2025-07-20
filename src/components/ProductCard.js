// src/components/ProductCard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

export default function ProductCard({
  id,
  imageUrl,
  name,
  price,
  description,
  soldOut = false,
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE_URL;

  // Debug: see soldOut value
  useEffect(() => {
    console.log(`🛒 [${name}] soldOut =`, soldOut);
  }, [name, soldOut]);

  // Auto-open description overlay if URL matches
  useEffect(() => {
    if (window.location.pathname === `/products/${id}`) {
      setShowDesc(true);
    }
  }, [id]);

  const handleOpen = () => setShowDesc(true);
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowDesc(false);
      setIsClosing(false);
    }, 400);
  };

  const decrement = () => setQuantity(q => Math.max(1, q - 1));
  const increment = () => setQuantity(q => q + 1);

  const handleAdd = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      console.warn('🔒 Not logged in — redirecting to /auth');
      return navigate('/auth');
    }

    const url  = `${API}/api/products/add`;
    const body = { userId: user.id, productId: id, quantity, name, price };

    console.group(`🛒 Add to Cart [${name}]`);
    console.log('Request URL:', url);
    console.log('Request payload:', body);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      try {
        data = await resp.json();
      } catch {
        data = null;
      }

      console.log('Response status:', resp.status);
      console.log('Response body:', data);

      if (!resp.ok) {
        const msg = data?.message || `HTTP ${resp.status}`;
        console.error('❌ Add-to-cart failed:', msg);
        alert(`Could not add to cart: ${msg}`);
      } else {
        console.log('✅ Added to cart!');
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }
    } catch (err) {
      console.error('🚨 Network or unexpected error:', err);
      alert('Network error adding to cart');
    } finally {
      console.groupEnd();
    }
  };

  return (
    <div className="product-card" data-product-id={id}>
      {!showDesc && (
        <button className="info-button" onClick={handleOpen}>
          Info
        </button>
      )}

      {showDesc && (
        <div className={`description-overlay ${isClosing ? 'slide-out' : 'slide-in'}`}>
          <button
            className="close-desc"
            onClick={soldOut ? undefined : handleClose}
            disabled={soldOut}
            style={{ opacity: soldOut ? 0.6 : 1 }}
          >
            {soldOut ? 'Sold Out' : 'Order Now!'}
          </button>
          <p className="product-description">{description}</p>
        </div>
      )}

      <img src={imageUrl} alt={name} className="product-image" />

      <div className="product-main">
        <div className="product-info">
          <h3 className="product-name">{name}</h3>
          <p className="product-price">${price}</p>
        </div>

        <div className="product-actions">
          <div className="quantity-controls">
            <button
              onClick={decrement}
              className="quantity-button"
              aria-label="Decrease quantity"
              disabled={soldOut}
            >
              &minus;
            </button>
            <span className="quantity-value">{quantity}</span>
            <button
              onClick={increment}
              className="quantity-button"
              aria-label="Increase quantity"
              disabled={soldOut}
            >
              +
            </button>
          </div>

          <button
            className="add-button"
            onClick={soldOut ? undefined : handleAdd}
            disabled={soldOut}
            style={{ opacity: soldOut ? 0.6 : 1 }}
          >
            {soldOut ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {added && <div className="added-message">Added to cart!</div>}
    </div>
  );
}
