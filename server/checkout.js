// server/checkout.js
const express = require('express');
const router  = express.Router();
const crypto = require('crypto');

const { SquareClient, SquareEnvironment } = require('square');

console.log('[Checkout.js] Running in test mode (sandbox)');

const accessToken = process.env.SQUARE_ACCESS_TEST_TOKEN;
console.log('[Checkout.js] Using access token:', accessToken);

router.post('/process-payment', async (req, res) => {
    const idempotencyKey = crypto.randomUUID();
    const client = new SquareClient({
          environment: SquareEnvironment.Sandbox,
          token: "EAAAl3XF5cOyX88tUACOWxEOCSp0EEvnMaRV1yekGyx8zjCUOttCjIud1rBgs3PI",
      });

    console.log('[Checkout.js] Calling Square createPayment...');
    await client.payments.create({
        amountMoney: {
            amount: BigInt("100"),
            currency: "USD",
        },
        idempotencyKey: idempotencyKey,
        sourceId: "cnon:card-nonce-ok",
    });
    console.log('[Checkout.js] Square response:', result);
  }
);

module.exports = router;
