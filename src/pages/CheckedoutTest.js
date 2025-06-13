// src/pages/CheckedoutSimple.js  (simplified license/clear version)
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
  const [cartError, setCartError] = useState(null);
  const navigate = useNavigate();

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

        await fetchData(`${API_BASE_URL}/api/cart/clear`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });

        setLicenseError(null);
        setCartError(null);
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
              <h2>License Details</h2>
              <p><strong>License Key:</strong> {lic.licenseKey}</p>
              <p><strong>Product:</strong> {lic.name}</p>
              <p><strong>Uses Remaining:</strong> {lic.usesRemaining}</p>
              <p><strong>Status:</strong> {lic.status}</p>
            </div>
          ))}
        </div>
      )}
      {cartError && <div className="error-message">{cartError}</div>}
      <button className="home-button" onClick={() => navigate('/')}>
        Return Home
      </button>
    </div>
  );
};

export default Checkedout;
