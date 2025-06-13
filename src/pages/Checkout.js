import React, {
  useEffect,
  useState,
  useContext,
  useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import fetchData from '../utils/fetchData';
import { AuthContext } from '../AuthContext';
import SquareForm from '../components/SquareForm';
import '../styles/Checkout.css';

const Checkout = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [cartItems, setCartItems]       = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Redirect to login and fetch cart
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    (async () => {
      setIsLoading(true);
      try {
        const data = await fetchData(
          `${process.env.REACT_APP_API_BASE_URL}/api/cart/${user.id}`
        );
        if (!Array.isArray(data)) throw new Error('Unexpected cart format');
        setCartItems(data);
        setErrorMessage(null);
      } catch (err) {
        console.error('Cart load error:', err);
        setErrorMessage('Unable to load cart.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = useCallback(() => {
    navigate('/checkedout');
  }, [navigate]);

  const handleError = useCallback((msg) => {
    setErrorMessage(msg);
  }, []);

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {isLoading ? (
        <p>Loading…</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map(item => (
              <li key={item.productId}>
                <h2>{item.name}</h2>
                <p>Qty: {item.quantity}</p>
                <p>Total: ${(item.price * item.quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <SquareForm
            cartItems={cartItems}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </>
      )}
    </div>
  );
};

export default Checkout;
