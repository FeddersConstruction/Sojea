// server/checkout.js
const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');

// 👉  OFFICIAL Square Node‑SDK import (v40+)
const { Client, Environment, ApiError } = require('square');

/* -------------------------------------------------- */
/*  Square client configuration                       */
/* -------------------------------------------------- */

// MODE: “test” (Sandbox) or “live” (Production)
const mode = process.env.SQUARE_MODE === 'live' ? 'live' : 'test';
console.log('[Checkout.js] Running in', mode.toUpperCase(), 'mode');

const accessToken =
  mode === 'test'
    ? process.env.SQUARE_ACCESS_TEST_TOKEN
    : process.env.SQUARE_ACCESS_LIVE_TOKEN;

if (!accessToken) {
  throw new Error('❌  Square access‑token env var is missing');
}

// Instantiate the client
const squareClient = new Client({
  accessToken,
  environment: mode === 'test' ? Environment.Sandbox : Environment.Production,
});

// Convenience handle
const paymentsApi = squareClient.paymentsApi;

// Sanity checks
console.log('⚙️  paymentsApi.createPayment →', typeof paymentsApi.createPayment);
console.log('⚙️  ApiError                  →', typeof ApiError);

/* -------------------------------------------------- */
/*  POST /api/checkout/process-payment                */
/* -------------------------------------------------- */
router.post('/process-payment', async (req, res) => {
  console.log('[Checkout.js] /process-payment called');
  console.log('[Checkout.js] Request body:', req.body);

  const { items, nonce } = req.body;

  if (!Array.isArray(items) || !nonce) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // 1) Calculate total in the *smallest* currency unit (cents)
  const totalCents = Math.round(
    items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100
  );

  // 2) Build the CreatePayment request
  const idempotencyKey = crypto.randomUUID();

  try {
    console.log('[Checkout.js] Calling Square createPayment…');
    const { result } = await paymentsApi.createPayment({
      sourceId: nonce,          // 🔑 Card token from Web Payments SDK
      idempotencyKey,           // 🔄 Safe retry key
      amountMoney: {
        amount:   BigInt(totalCents), // must be BigInt per Node‑SDK
        currency: 'USD',
      },
    });

    console.log('[Checkout.js] Square response:', result);
    return res.status(200).json({ payment: result.payment });
  } catch (err) {
    // 3) Handle API errors vs. other errors
    if (err instanceof ApiError) {
      console.error('[Checkout.js] Square API error:', err.result);
      return res.status(400).json({ errors: err.result });
    }
    console.error('[Checkout.js] Unexpected error:', err);
    return res
      .status(500)
      .json({ message: 'Internal server error', detail: err.message });
  }
});

module.exports = router;
