import React, { useState } from 'react';
import { PaymentForm, CreditCard } from 'react-square-web-payments-sdk';
import '../styles/SquareForm.css';

export default function SquareForm({ userId, amount, address, onPaymentSuccess }) {
  const [status, setStatus] = useState('');

  const applicationId = 'sq0idp-RsIaXDcpZMkSJN1s7xKT6g';
  const locationId    = 'L089JN7J44VK6';
  const processUrl    = 'https://sojea-871454313426.us-south1.run.app/api/checkout/process-payment';

  const cardTokenizeResponseReceived = async (tokenResult) => {
    if (!tokenResult?.token) {
      setStatus('❌ Card Tokenization Failed');
      return;
    }

    console.log('[SquareForm] sourceId token:', tokenResult.token);
    console.log('[SquareForm] posting body:', { userId, amount, address });

    setStatus('Processing payment…');

    try {
      const resp = await fetch(processUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          userId,
          amount,
          address
        })
      });

      const data = await resp.json();
      console.log('[SquareForm] Response from /process-payment:', resp.status, data);

      if (resp.ok) {
        setStatus('✅ Payment Successful!');
        onPaymentSuccess();
      } else {
        setStatus('❌ Payment Failed: ' + (data.error || 'Unknown'));
      }
    } catch (err) {
      console.error('[SquareForm] Network error:', err);
      setStatus('❌ Payment Failed: Network error');
    }
  };

  return (
    <div className="sq-form-container">
      <PaymentForm
        applicationId={applicationId}
        locationId={locationId}
        cardTokenizeResponseReceived={cardTokenizeResponseReceived}
      >
        <CreditCard />
      </PaymentForm>
      <div className="payment-status">{status}</div>
    </div>
  );
}