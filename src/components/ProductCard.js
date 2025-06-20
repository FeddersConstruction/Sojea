// src/components/ProductCard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

export default function ProductCard({ id, imageUrl, name, price }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_BASE_URL;

  const decrement = () => setQuantity(q => Math.max(1, q - 1));
  const increment = () => setQuantity(q => q + 1);

  const handleAdd = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      return navigate('/auth');
    }

    try {
      const resp = await fetch(`${API}/api/products/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:    user.id,
          productId: id,
          quantity,
          name,
          price
        })
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
      alert('Could not add to cart');
    }
  };

  return (
    <div className="product-card">
      <img src={imageUrl} alt={name} className="product-image" />

      <div className="product-main">
        <div className="product-info">
          <h3 className="product-name">{name}</h3>
          <p className="product-price">${price}</p>
        </div>

        <div className="product-actions">
          <div className="quantity-controls">
            <button
              className="quantity-button"
              onClick={decrement}
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span className="quantity-value">{quantity}</span>
            <button
              className="quantity-button"
              onClick={increment}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button className="add-button" onClick={handleAdd}>
            Add to Cart
          </button>
        </div>
      </div>

      {added && <div className="added-message">Added to cart!</div>}
    </div>
);
}
