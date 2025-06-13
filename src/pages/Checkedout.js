// src/pages/Checkedout.js  (detailed downloadAllProducts version)
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchData from '../utils/fetchData';
import { AuthContext } from '../AuthContext';
import '../styles/Checkedout.css';
import { API_BASE_URL } from '../utils/config';

const Checkedout = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [licenses, setLicenses] = useState([]);
  const [licenseError, setLicenseError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState({});
  const navigate = useNavigate();

  const downloadProduct = async (productId, productName) => {
    try {
      setDownloadStatus(prev => ({ ...prev, [productId]: 'downloading' }));
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/download`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = productName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadStatus(prev => ({ ...prev, [productId]: 'completed' }));
    } catch (error) {
      console.error('Download error:', error);
      setDownloadStatus(prev => ({ ...prev, [productId]: 'failed' }));
    }
  };

  const downloadAllProducts = async (products) => {
    for (const product of products) {
      try {
        // verify existence
        const check = await fetch(`${API_BASE_URL}/api/products/${product.productId}`);
        if (!check.ok) throw new Error(`Verification failed: ${check.status}`);
        setDownloadStatus(prev => ({ ...prev, [product.productId]: 'downloading' }));

        const resp = await fetch(
          `${API_BASE_URL}/api/products/${product.productId}/download`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Accept': 'application/octet-stream'
            }
          }
        );
        if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
        const blob = await resp.blob();
        const ext = resp.headers.get('content-type')?.split('/')[1] || 'zip';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${product.name}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setDownloadStatus(prev => ({ ...prev, [product.productId]: 'completed' }));
      } catch (err) {
        console.error(`Download failed for ${product.name}:`, err);
        setDownloadStatus(prev => ({ ...prev, [product.productId]: 'failed' }));
      }
      await new Promise(r => setTimeout(r, 1500));
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    const createLicensesAndClearCart = async () => {
      try {
        const cartItems = await fetchData(`${API_BASE_URL}/api/cart/${user.id}`);
        if (!cartItems.length) {
          setLicenseError('Your cart is empty');
          return;
        }

        await fetchData(`${API_BASE_URL}/api/licenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            products: cartItems.map(item => ({
              id: item.productId,
              name: item.name,
              quantity: item.quantity
            }))
          })
        });

        const userLicenses = await fetchData(`${API_BASE_URL}/api/licenses/${user.id}`);
        setLicenses(userLicenses.licenses);

        await downloadAllProducts(cartItems);

        await fetchData(`${API_BASE_URL}/api/cart/clear`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
      } catch (err) {
        console.error('Checkout process error:', err);
        setLicenseError('Failed to process checkout. Please contact support.');
      }
    };

    createLicensesAndClearCart();
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="checkedout-container">
      <h1>Thank you for your purchase!</h1>
      {licenseError ? (
        <div className="error-message">{licenseError}</div>
      ) : (
        <div className="licenses-container">
          {licenses.map(lic => (
            <div key={lic.licenseKey} className="license-card">
              <h2>{lic.name}</h2>
              <p><strong>License Key:</strong> {lic.licenseKey}</p>
              <p><strong>Uses Remaining:</strong> {lic.usesRemaining}</p>
            </div>
          ))}
        </div>
      )}
      <button className="home-button" onClick={() => navigate('/')}>
        Return Home
      </button>
    </div>
  );
};

export default Checkedout;
