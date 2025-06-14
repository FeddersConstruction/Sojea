// src/components/SquareForm.js
import React, { useCallback } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import { API_BASE_URL } from '../utils/config';

const SquareForm = ({
  cartItems,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}) => {
  // Build and log full 3DS/SCA verification details
  const createVerificationDetails = useCallback(() => {
    const amount = cartItems
      .reduce((sum, i) => sum + i.price * i.quantity, 0)
      .toFixed(2);

    const verificationDetails = {
      amount,                      // e.g. "10.00"
      currencyCode: 'USD',         // ISO 4217 code
      intent: 'CHARGE',            // "CHARGE" or "STORE"
      billingContact: {
        givenName:   'John',       // replace these with real buyer data
        familyName:  'Doe',
        email:       'john.doe@example.com',
        phone:       '5551234567',
        addressLines: ['123 Main St', 'Unit 4B'],
        city:        'New York',
        state:       'NY',
        countryCode: 'US',         // ISO 3166-1 alpha-2
        postalCode:  '10001',
      },
    };

    console.log('[SquareForm] verificationDetails →', verificationDetails);
    return verificationDetails;
  }, [cartItems]);

  // Handle tokenization result (and any 3DS verification)
  const handleCardTokenize = useCallback(
    async (tokenResult, verifiedBuyer) => {
      console.log('[SquareForm] tokenResult →', tokenResult);
      console.log('[SquareForm] verifiedBuyer →', verifiedBuyer);

      setIsProcessing(true);
      try {
        const resp = await fetch(
          `${API_BASE_URL}/api/checkout/process-payment`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nonce: tokenResult.token,
              items: cartItems,
            }),
          }
        );

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.message || 'Server error');
        }

        onSuccess();
      } catch (err) {
        console.error('[SquareForm] Payment error →', err);
        onError(err.message || 'Payment failed.');
      } finally {
        setIsProcessing(false);
      }
    },
    [cartItems, onSuccess, onError, setIsProcessing]
  );

  return (
    <PaymentForm
      applicationId={process.env.REACT_APP_SQUARE_APP_ID_TEST}
      locationId={process.env.REACT_APP_SQUARE_LOCATION_ID_TEST}
      cardTokenizeResponseReceived={handleCardTokenize}
      createVerificationDetails={createVerificationDetails}
    >
      <CreditCard />
      <button type="submit" disabled={isProcessing}>
        {isProcessing ? 'Processing…' : 'Pay Now'}
      </button>
    </PaymentForm>
  );
};

export default SquareForm;
