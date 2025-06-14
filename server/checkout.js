const express = require('express');
const router  = express.Router();

const { Client, Environment, ApiError } = require('square');
const crypto = require('crypto');

const mode = process.env.SQUARE_MODE === 'test' ? 'test' : 'live';
console.log('[Checkout.js] Running in', mode, 'mode');

const accessToken = mode === 'test'
  ? process.env.SQUARE_ACCESS_TEST_TOKEN
  : process.env.SQUARE_ACCESS_LIVE_TOKEN;

console.log('[Checkout.js] Using access token:', accessToken ? '[SET]' : '[NOT SET – MISSING ENV VAR]');

const squareClient = new Client({
  environment: mode === 'test' ? Environment.Sandbox : Environment.Production,
  accessToken,
});

console.log('⚙️  ApiError is', typeof ApiError);
console.log('⚙️  squareClient.paymentsApi.createPayment →', typeof squareClient.paymentsApi.createPayment);

router.post('/process-payment', async (req, res) => {
  console.log('[Checkout.js] /process-payment called', req.body);
  const { nonce } = req.body;

  if (!nonce) return res.status(400).json({ message: 'Missing required nonce.' });

  const idempotencyKey = crypto.randomUUID();

  try {
    console.log('[Checkout.js] Creating payment with Square...');
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId: nonce,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(100),
        currency: 'USD',
      },
    });

    console.log('[Checkout.js] Payment successful:', result);
    res.status(200).json({ payment: result.payment });

  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[Checkout.js] Square API error:', error.errors);
      return res.status(400).json({ errors: error.errors });
    }

    console.error('[Checkout.js] Unexpected error:', error);
    res.status(500).json({ message: 'Internal server error', detail: error.message });
  }
});

module.exports = router;
