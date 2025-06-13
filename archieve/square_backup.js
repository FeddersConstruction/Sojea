// server/checkout.js
const express = require('express');
const router  = express.Router();
const { SquareClient } = require('square');
const crypto = require('crypto');

// Initialize Square client
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN
});

router.post('/process-payment', async (req, res) => {
  const { items, nonce } = req.body;

  // Calculate total amount in cents
  const totalCents = items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100;
  const idempotencyKey = crypto.randomUUID();

  try {
    const response = await squareClient.payments.create({
      sourceId: nonce,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(Math.round(totalCents)),
        currency: 'USD'
      }
    });

    res.status(200).json({ payment: response.payment });
  } catch (err) {
    console.error('Square payment error:', err);
    const message = err instanceof Error
      ? err.message
      : 'Internal server error';
    res.status(500).json({ message });
  }
});

module.exports = router;
