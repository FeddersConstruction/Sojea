const express = require('express');
const router  = express.Router();

const { Client: SquareClient, Environment: SquareEnvironment, ApiError } = require('square');
const crypto = require('crypto');

// Determine mode: 'test' or 'live' (defaults to 'live' if not set)
const mode = process.env.SQUARE_MODE === 'test' ? 'test' : 'live';
console.log('[Checkout.js] Running in', mode, 'mode');

// Choose access token based on mode
const accessToken = mode === 'test'
  ? process.env.SQUARE_ACCESS_TEST_TOKEN
  : process.env.SQUARE_ACCESS_LIVE_TOKEN;

console.log('[Checkout.js] Using access token:', accessToken ? '[SET]' : '[NOT SET – MISSING ENV VAR]');

// Initialize Square client
const squareClient = new SquareClient({
  accessToken,
  environment: mode === 'test' ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
});

// Confirm API availability
console.log('⚙️  ApiError is', typeof ApiError);
console.log('⚙️  squareClient.payments.createPayment →', typeof squareClient.payments.createPayment);

// Main endpoint for processing payment
router.post('/process-payment', async (req, res) => {
  console.log('[Checkout.js] /process-payment called');
  console.log('[Checkout.js] Request body:', req.body);

  const { nonce } = req.body;

  if (!nonce) {
    return res.status(400).json({ message: 'Missing required nonce field in request body.' });
  }

  const idempotencyKey = crypto.randomUUID(); // ensures no double charges

  try {
    console.log('[Checkout.js] Creating payment with Square...');

    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId: nonce,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(100), // Hardcoded $1.00 in cents
        currency: 'USD',
      },
    });

    console.log('[Checkout.js] Payment successful:', result);
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
