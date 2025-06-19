// server/checkout.js

const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const sgMail  = require('@sendgrid/mail');
const { SquareClient, SquareEnvironment } = require('square');
const { Storage } = require('@google-cloud/storage');

console.log('[Checkout.js] Running in test mode (sandbox)');
const accessToken = process.env.SQUARE_ACCESS_TEST_TOKEN;
console.log('[Checkout.js] Using access token:', accessToken);

// initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const storage      = new Storage();
const bucketName   = 'sojea';
const cartFilePath = 'json/cart.json';

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
  const { sourceId, userId, address } = req.body;

  if (!sourceId) {
    console.warn('[process-payment] Missing sourceId');
    return res.status(400).json({ error: 'Missing sourceId in request body' });
  }
  if (!userId) {
    console.warn('[process-payment] Missing userId');
    return res.status(400).json({ error: 'Missing userId in request body' });
  }

  try {
    // 1. Load their cart and compute total
    console.log(`[process-payment] Loading cart for userId=${userId}`);
    const allCarts   = await readJSON(cartFilePath, {});
    const items      = allCarts[userId] || [];
    console.log('[process-payment] Cart items:', items);

    const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    console.log('[process-payment] Computed totalPrice:', totalPrice);

    // 2. Convert to cents and BigInt
    const amount = BigInt(Math.round(totalPrice * 100));
    console.log('[process-payment] Charging amount (cents):', amount.toString());

    // 3. Send to Square
    const client   = new SquareClient({
      environment: SquareEnvironment.Production,
      token: accessToken,
    });
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: { amount, currency: 'USD' },
    });
    console.log('[process-payment] Square payment result:', response);

    // 4. Send order email via SendGrid
    const itemLines = items.map(i => `• ${i.name} × ${i.quantity}`).join('\n');
    const msg = {
      to:      'garrett.strange@yahoo.com',
      from:    'orders@sojea.com',
      subject: `New Order from User ${userId}`,
      text: `
Shipping Address:
${address || 'N/A'}

Order Items:
${itemLines}

Total: $${totalPrice.toFixed(2)}
      `.trim(),
    };
    console.log('[process-payment] Sending email with:', msg);
    await sgMail.send(msg);
    console.log('[process-payment] Email sent');

    // 5. Serialize BigInts as strings and return
    const safe = JSON.parse(
      JSON.stringify(response, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    );
    res.status(200).json(safe);

  } catch (err) {
    console.error('[process-payment] Payment/email error:', err);
    res.status(500).json({ error: err.message, details: err.body });
  }
});

module.exports = router;
