const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const nodemailer = require('nodemailer');
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

// configure your SMTP transport via env vars
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.post('/process-payment', async (req, res) => {
  const { sourceId, userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ error: 'Missing userId or amount' });
  }

  try {
    // 1. Verify user
    const users = await readJSON(usersPath, []);
    if (!users.some(u => u.id === parseInt(userId, 10))) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    // 2. Load cart items
    const allCarts = await readJSON(cartFilePath, {});
    const items = allCarts[userId] || [];

    // 3. Charge via Square
    const client = new SquareClient({
      environment: SquareEnvironment.Production,
      token: accessToken,
    });
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: { amount: BigInt(Math.round(amount * 100)), currency: 'USD' },
    });
    console.log('Square payment result:', response);

    // 4. Send email
    const address = req.body.address || 'N/A';
    const itemLines = items
      .map(i => `• ${i.name} × ${i.quantity}`)
      .join('\n');

    await transporter.sendMail({
      from: `"Sojea Orders" <${process.env.SMTP_USER}>`,
      to: 'garrett.strange@yahoo.com',
      subject: `New Order from User ${userId}`,
      text: `
Shipping Address:
${address}

Order Items:
${itemLines}

Total: $${amount.toFixed(2)}
      `.trim()
    });

    // 5. Reply
    const safe = JSON.parse(
      JSON.stringify(response, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    );
    res.status(200).json(safe);

  } catch (err) {
    console.error('Payment or email error:', err);
    res.status(500).json({ error: err.message, details: err.body });
  }
});

module.exports = router;
