// src/pages/Products.js
import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/Products.css';
import Navbar  from '../components/Navbar';
import Footer  from '../components/Footer';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setError('Could not load products');
        setLoading(false);
      });
  }, [API]);

  if (loading) return <p className="products-loading">Loading…</p>;
  if (error)   return <p className="products-error">{error}</p>;

  return (
    <>
      <Navbar />
      <section className="products-page">
      <h2 className="products-title">Our Products</h2>
      <div className="products-grid">
        {products.map(prod => {
          const imageUrl = `${API}/api/products/img/${prod.image}`;
          return (
            <ProductCard
              key={prod.id}
              id={prod.id}
              imageUrl={imageUrl}
              name={prod.name}
              price={prod.price}
            />
          );
        })}
      </div>
    </section>
    <Footer />
  </>
  );
}
