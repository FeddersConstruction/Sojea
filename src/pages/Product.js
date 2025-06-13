// src/pages/Product.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import fetchData from '../utils/fetchData';
import { AuthContext } from '../AuthContext';
import '../styles/Product.css';
import { API_BASE_URL } from '../utils/config';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [product, setProduct]   = useState(null);
  const [error, setError]       = useState(null);
  const [cartMessage, setCartMessage] = useState('');

  const BASE = API_BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('[Product] Fetching products from:', `${BASE}/api/products`);

        const data = await fetchData(`${BASE}/api/products`);
        setProducts(data);
        setError(null);

        if (id !== undefined) {
          const found = data.find(p => p.id === parseInt(id, 10));
          setProduct(found);
        }
      } catch (err) {
        console.error('[Product] Error fetching products:', err);
        setError(err.message);
        setProducts([]);
        setProduct(null);
      }
    };

    fetchProducts();
  }, [id, BASE]);

  const handleAddToCart = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    const cartData = {
      userId:    user.id || user.userId,
      productId: product.id,
      quantity:  1,
      name:      product.name,
      price:     product.price,
    };

    console.log('[Product] Adding to cart with data:', cartData);

    if (product.price === undefined) {
      console.error('[Product] Product price is undefined.');
      setCartMessage('Error: Product price is missing.');
      return;
    }

    try {
      await fetchData(`${BASE}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData),
      });
      setCartMessage('Product added to cart');
    } catch (err) {
      console.error('[Product] Error adding to cart:', err);
      setCartMessage(
        err.message.includes('401')
          ? 'User not authorized. Please log in again.'
          : 'Error adding to cart'
      );
    }
  };

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  if (id === undefined) {
    return (
      <div className="product-list">
        <h1>Products</h1>
        <ul>
          {products.map(p => (
            <li key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      {cartMessage && <p>{cartMessage}</p>}
      <button onClick={() => navigate('/products')}>Back to Products</button>
    </div>
  );
};

export default Product;
