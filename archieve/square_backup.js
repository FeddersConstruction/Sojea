// server/checkout.js
const express = require('express');
const router  = express.Router();

const { SquareClient, SquareEnvironment, ApiError } = require('square');
const crypto = require('crypto');

// Determine mode (expects "test" or "live")
const mode = process.env.SQUARE_MODE === 'test' ? 'test' : 'live';
console.log('[Checkout.js] Running in', mode, 'mode');

// Select the appropriate token
const accessToken = mode === 'test'
  ? process.env.SQUARE_ACCESS_TEST_TOKEN
  : process.env.SQUARE_ACCESS_LIVE_TOKEN;
console.log('[Checkout.js] Using access token:', accessToken);

// Initialize Square client
const squareClient = new SquareClient({
  token:       accessToken,
  environment: mode === 'test'
    ? SquareEnvironment.Sandbox
    : SquareEnvironment.Production,
});

// Sanity‐check that ApiError is imported and payments API exists
console.log('⚙️  ApiError is', typeof ApiError);
console.log('⚙️  payments.createPayment →', typeof squareClient.payments.createPayment);

router.post('/process-payment', async (req, res) => {
  console.log('[Checkout.js] /process-payment called');
  console.log('[Checkout.js] Request body:', req.body);

  const { items, nonce } = req.body;

  // Calculate total amount in cents
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
    // Now that ApiError is imported properly, this won't blow up
    if (error instanceof ApiError) {
      console.error('[Checkout.js] Square API error:', error.result);
      return res.status(400).json({ errors: error.result });
    }

    console.error('[Checkout.js] Unexpected error:', error);
    res.status(500).json({ message: 'Internal server error', detail: error.message });
  }
});

module.exports = router;
