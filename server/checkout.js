// server/checkout.js
const express = require('express');
const router  = express.Router();
const crypto = require('crypto');

const { SquareClient, SquareEnvironment } = require('square');

console.log('[Checkout.js] Running in test mode (sandbox)');

const accessToken = process.env.SQUARE_ACCESS_TEST_TOKEN;
console.log('[Checkout.js] Using access token:', accessToken);

router.post('/process-payment', async (req, res) => {
  const { sourceId } = req.body;
  const client = new SquareClient({
    environment: SquareEnvironment.Sandbox,
    token: process.env.SQUARE_ACCESS_TEST_TOKEN,
  });

  try {
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: { amount: BigInt(100), currency: 'USD' },
    });

    console.log('Square payment result:', response);
    res.status(200).json(response);  // <-- Send the result back!
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: err.message, details: err.body });
  }
});


module.exports = router;
