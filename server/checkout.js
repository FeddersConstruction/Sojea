// server/checkout.js
const express = require('express');
const router  = express.Router();

const { SquareClient, SquareEnvironment } = require('square');

console.log('[Checkout.js] Running in test mode (sandbox)');

const accessToken = process.env.SQUARE_ACCESS_TEST_TOKEN;
console.log('[Checkout.js] Using access token:', accessToken);

const squareClient = new SquareClient({
  token: accessToken,
  environment: SquareEnvironment.Sandbox,
});

router.post('/process-payment', async (req, res) => {
  console.log('[Checkout.js] /process-payment called');
  console.log('[Checkout.js] Request body:', req.body);

  try {
    console.log('[Checkout.js] Calling Square createPayment...');
    const { result } = await squareClient.payments.createPayment({
      amountMoney: {
        amount: BigInt("100"),
        currency: 'USD',
      },
      idempotencyKey: "304ebea4-7f82-45f3-8dc6-4037651010df",
      sourceId: "cnon:card-nonce-ok",
    });

    console.log('[Checkout.js] Square response:', result);
    res.status(200).json({ payment: result.payment });
  } catch (error) {
    console.error('[Checkout.js] Unexpected error:', error);
    res.status(500).json({ message: 'Internal server error', detail: error.message });
  }
});

module.exports = router;
