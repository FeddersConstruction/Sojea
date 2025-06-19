const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const { SquareClient, SquareEnvironment } = require('square');
const { Storage } = require('@google-cloud/storage');

console.log('[Checkout.js] Running in test mode (sandbox)');
const accessToken = process.env.SQUARE_ACCESS_LIVE_TOKEN;
console.log('[Checkout.js] Using access token:', accessToken);

const storage      = new Storage();
const bucketName   = 'sojea';
const cartFilePath = 'json/cart.json';
const usersPath    = 'json/users.json';

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
  const { sourceId, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId in request body' });
  }

  try {
    // 1. Verify user
    const users = await readJSON(usersPath, []);
    if (!users.some(u => u.id === parseInt(userId, 10))) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    // 2. Load their cart and compute total
    const allCarts = await readJSON(cartFilePath, {});
    const items = allCarts[userId] || [];
    const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    // 3. Convert to cents and BigInt
    const amount = BigInt(Math.round(totalPrice * 100));

    // 4. Send to Square
    const client = new SquareClient({
      environment: SquareEnvironment.Production,
      token: accessToken,
    });

    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: { amount, currency: 'USD' },
    });

    console.log('Square payment result:', response);

    // 5. Serialize BigInts as strings
    const safe = JSON.parse(
      JSON.stringify(response, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    );
    res.status(200).json(safe);

  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: err.message, details: err.body });
  }
});

module.exports = router;
