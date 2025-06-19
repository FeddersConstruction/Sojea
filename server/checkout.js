// server/checkout.js

const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { SquareClient, SquareEnvironment } = require('square');
const { Storage } = require('@google-cloud/storage');

console.log('[Checkout.js] Running in test mode (sandbox)');

const accessToken   = process.env.SQUARE_ACCESS_TEST_TOKEN;
console.log('[Checkout.js] Using access token:', accessToken);

const storage       = new Storage();
const bucketName    = 'sojea';
const cartFilePath  = 'json/cart.json';

async function ensureFileExists(path, defaultData) {
  const file = storage.bucket(bucketName).file(path);
  const [exists] = await file.exists();
  if (!exists) {
    await file.save(JSON.stringify(defaultData, null, 2));
  }
}

async function readJSON(path, defaultData) {
  await ensureFileExists(path, defaultData);
  const data = (await storage.bucket(bucketName).file(path).download())[0];
  return JSON.parse(data.toString() || JSON.stringify(defaultData));
}

router.post('/process-payment', async (req, res) => {
  console.log('[process-payment] incoming body:', req.body);
  const { sourceId, userId } = req.body;

  if (!sourceId) {
    console.warn('[process-payment] Missing sourceId');
    return res.status(400).json({ error: 'Missing sourceId in request body' });
  }
  if (!userId) {
    console.warn('[process-payment] Missing userId');
    return res.status(400).json({ error: 'Missing userId in request body' });
  }

  try {
    // 1. Load cart and compute total price
    console.log(`[process-payment] loading cart for userId=${userId}`);
    const allCarts   = await readJSON(cartFilePath, {});
    const items      = allCarts[userId] || [];
    console.log('[process-payment] cart items:', items);

    const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    console.log('[process-payment] totalPrice (dollars):', totalPrice);

    // 2. Convert to cents and BigInt
    const amount = BigInt(Math.round(totalPrice * 100));
    console.log('[process-payment] charging amount (cents):', amount.toString());

    // 3. Send payment to Square
    const client   = new SquareClient({
      environment: SquareEnvironment.Sandbox,
      token: accessToken,
    });
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: { amount, currency: 'USD' },
    });
    console.log('[process-payment] Square payment result:', response);

    // 4. Serialize BigInts to strings and return
    const safe = JSON.parse(
      JSON.stringify(response, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    );
    res.status(200).json(safe);

  } catch (err) {
    console.error('[process-payment] Payment error:', err);
    res.status(500).json({ error: err.message, details: err.body });
  }
});

module.exports = router;
