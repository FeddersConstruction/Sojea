// server/checkout.js
const express = require('express');
const router = express.Router();

const { 
  SquareClient, 
  SquareEnvironment, 
  SquareError 
} = require('square');
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

router.post('/process-payment', async (req, res) => {
  console.log('[Checkout.js] /process-payment called');
  console.log('[Checkout.js] Request body:', req.body);

  const { items, nonce } = req.body;
  console.log('[Checkout.js] Parsed items:', items);
  console.log('[Checkout.js] Parsed nonce:', nonce);

  // Calculate total amount in cents
  const totalCents = items
    .reduce((sum, i) => sum + i.price * i.quantity, 0) * 100;
  console.log('[Checkout.js] Calculated totalCents:', totalCents);

  // Generate idempotency key
  const idempotencyKey = crypto.randomUUID();
  console.log('[Checkout.js] Generated idempotencyKey:', idempotencyKey);

  try {
    // Create the payment
    console.log('[Checkout.js] Calling Square createPayment...');
    const response = await squareClient.paymentsApi.createPayment({
      sourceId:       nonce,
      idempotencyKey,
      amountMoney: {
        amount:   BigInt(Math.round(totalCents)),
        currency: 'USD',
      },
    });
    console.log('[Checkout.js] Square response:', response);

    // On success, return the payment object
    res.status(200).json({ payment: response.result.payment });
  } catch (error) {
    if (error instanceof SquareError) {
      // Handle Square API errors
      console.error('[Checkout.js] Square API error:', error.errors);
      res.status(400).json({ errors: error.errors });
    } else {
      // Handle unexpected errors
      console.error('[Checkout.js] Unexpected error:', error);
      res.status(500).json({ message: 'Internal server error', detail: error.message });
    }
  }
});

module.exports = router;
