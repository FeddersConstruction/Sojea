// src/components/SquareForm.js
import React, { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';

export default function SquareForm() {
  const [status, setStatus] = useState('');  // For displaying payment status messages

  // ✅ Square sandbox credentials
  const applicationId = 'sandbox-sq0idb-n5RoAfVLRwaiPBzgJ3guFw';
  const locationId    = 'LA6VHX7XNJCD6';

  // Handles the response from tokenization
  const cardTokenizeResponseReceived = async (tokenResult, verifiedBuyer) => {
    if (tokenResult?.token) {
      console.log('✅ Nonce received:', tokenResult.token);
      setStatus('Processing payment…');

      try {
        const resp = await fetch(
          'https://sojea-871454313426.us-south1.run.app/api/checkout/process-payment',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceId: tokenResult.token }),
          }
        );
        const data = await resp.json();

        if (resp.ok) {
          console.log('💳 Payment successful:', data);
          setStatus('✅ Payment Successful!');
        } else {
          console.error('❌ Payment failed:', data);
          setStatus('❌ Payment Failed: ' + (data.message || data.errors?.[0]?.detail || 'Unknown'));
        }
      } catch (err) {
        console.error('🌐 Network error:', err);
        setStatus('❌ Payment Failed: Network error');
      }
    } else {
      console.error('⚠️ Tokenization error:', tokenResult);
      setStatus('❌ Card Tokenization Failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>🧪 Test Payment — $1.00</h2>

      <PaymentForm
        applicationId={applicationId}
        locationId={locationId}
        cardTokenizeResponseReceived={cardTokenizeResponseReceived}
      >
        <CreditCard />
      </PaymentForm>

      <div style={{ marginTop: 20, minHeight: 24 }}>
        {status}
      </div>
    </div>
  );
}
