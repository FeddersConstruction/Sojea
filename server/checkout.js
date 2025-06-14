// server/checkout.js
const express = require('express');
const router  = express.Router();

const { SquareClient, SquareEnvironment, ApiError } = require('square');
const crypto = require('crypto');

console.log('[Checkout.js] Running in test mode (sandbox)');

// Use only the test token from environment
const accessToken = process.env.SQUARE_ACCESS_TEST_TOKEN;
console.log('[Checkout.js] Using access token:', accessToken);

// Initialize Square client with sandbox environment
const squareClient = new SquareClient({
  token:       accessToken,
  environment: SquareEnvironment.Sandbox,
});

// Sanity check
console.log('⚙️  ApiError is', typeof ApiError);
console.log('⚙️  payments.createPayment →', typeof squareClient.payments.createPayment);

router.post('/process-payment', async (req, res) => {
  console.log('[Checkout.js] /process-payment called');
  console.log('[Checkout.js] Request body:', req.body);

  const { items, nonce } = req.body;

  const totalCents = items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100;
  const idempotencyKey = crypto.randomUUID();

  try {
    console.log('[Checkout.js] Calling Square createPayment...');
    const { result } = await squareClient.payments.createPayment({
      sourceId:       nonce,
      idempotencyKey,
      amountMoney: {
        amount:   BigInt(Math.round(totalCents)),
        currency: 'USD',
      },
    });
    console.log('[Checkout.js] Square response:', result);

    res.status(200).json({ payment: result.payment });
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[Checkout.js] Square API error:', error.result);
      return res.status(400).json({ errors: error.result });
    }

    console.error('[Checkout.js] Unexpected error:', error);
    res.status(500).json({ message: 'Internal server error', detail: error.message });
  }
});

module.exports = router;
