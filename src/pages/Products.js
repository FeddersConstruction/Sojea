import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import '../styles/Products.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { highlightOnUrl } from '../utils/highlight';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const API = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // ← wrap in backticks!
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

  useEffect(() => {
    if (!loading && !error) highlightOnUrl();
  }, [loading, error]);

  if (loading) return <p className="products-loading">Loading…</p>;
  if (error)   return <p className="products-error">{error}</p>;

  return (
    <>
      <Navbar />
      <section className="products-page">
        <p className="products-title">Our Products</p>
        <div className="products-grid">
          {products.map(prod => {
            // ← backticks here too
            const imageUrl = `${API}/api/products/img/${prod.image}`;
            const soldOut  = Boolean(prod.soldOut);

            return (
              <ProductCard
                key={prod.id}
                id={prod.id}
                imageUrl={imageUrl}
                name={prod.name}
                price={prod.price}
                description={prod.description}
                soldOut={soldOut}
              />
            );
          })}
        </div>
      </section>
      <Footer />
    </>
  );
}
