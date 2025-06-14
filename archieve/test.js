// "square": "^42.3.0",
const express = require('express');
const router  = express.Router();
const { Client, Environment } = require('square');
const crypto = require('crypto');

// Initialize Square client
const squareClient = new Client({
  environment: process.env.SQUARE_ENVIRONMENT === 'production'
    ? Environment.Production
    : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN
});

router.post('/process-payment', async (req, res) => {
  const { items, nonce } = req.body;

  // Calculate total amount in cents
  const totalCents = items
    .reduce((sum, i) => sum + i.price * i.quantity, 0) * 100;

  const idempotencyKey = crypto.randomUUID();

  try {
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId: nonce,
      idempotencyKey,
      amountMoney: {
        amount: Math.round(totalCents),
        currency: 'USD'
      }
    });

    res.status(200).json({ payment: result.payment });
  } catch (err) {
    console.error('Square payment error:', err);
    // Surface Square’s error message if available
    const message = err?.errors?.[0]?.detail || 'Internal server error';
    res.status(500).json({ message });
  }
});

module.exports = router;
