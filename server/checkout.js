// server/checkout.js

const express    = require('express');
const cors       = require('cors');
const router     = express.Router();
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const { SquareClient, SquareEnvironment } = require('square');
const { Storage } = require('@google-cloud/storage');

console.log('[Checkout.js] Loaded checkout router');
console.log('[Checkout.js] Using Square token:', process.env.SQUARE_ACCESS_LIVE_TOKEN);

// Enable CORS (including OPTIONS preflight)
router.use(cors());

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,                  // smtp.gmail.com
  port:   +process.env.SMTP_PORT,                 // 587
  secure: process.env.SMTP_SECURE === 'true',     // false
  auth: {
    user: process.env.SMTP_USER,                  // fedderslit@gmail.com
    pass: process.env.SMTP_PASS                   // Wade!Frog6
  },
  logger: true,   // enable nodemailer internal logging
  debug: true     // include SMTP protocol debug output
});

// verify SMTP connectivity once at startup
transporter.verify()
  .then(() => console.log('[send-email][verify] SMTP connection is OK'))
  .catch(err => console.error('[send-email][verify] SMTP connection FAILED', err));

const storage      = new Storage();
const bucketName   = 'sojea';
const cartFilePath = 'json/cart.json';

async function ensureFileExists(path, defaultData) {
  const file = storage.bucket(bucketName).file(path);
  const [exists] = await file.exists();
  if (!exists) {
    console.log(`[ensureFileExists] Creating ${path} with defaultData`);
    await file.save(JSON.stringify(defaultData, null, 2));
  }
}

async function readJSON(path, defaultData) {
  await ensureFileExists(path, defaultData);
  console.log(`[readJSON] Reading ${path}`);
  const buf = (await storage.bucket(bucketName).file(path).download())[0];
  return JSON.parse(buf.toString() || JSON.stringify(defaultData));
}

// ————————————————
// 1) process-payment
// ————————————————
router.post('/process-payment', async (req, res) => {
  console.log('>>> [process-payment] Method:', req.method, 'Path:', req.path);
  console.log('[process-payment] Body:', req.body);
  const { sourceId, userId } = req.body;
  if (!sourceId || !userId) {
    console.warn('[process-payment] Missing sourceId or userId');
    return res.status(400).json({ error: 'Missing sourceId or userId' });
  }

  try {
    const allCarts   = await readJSON(cartFilePath, {});
    console.log('[process-payment] Loaded cart:', allCarts[userId]);
    const items      = allCarts[userId] || [];
    const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    console.log('[process-payment] Computed totalPrice:', totalPrice);
    const amount     = BigInt(Math.round(totalPrice * 100));
    console.log('[process-payment] Charging amount (cents):', amount.toString());

    const client   = new SquareClient({
      environment: SquareEnvironment.Production,
      token: process.env.SQUARE_ACCESS_TEST_TOKEN,
    });
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: { amount, currency: 'USD' },
    });
    console.log('[process-payment] Square response:', response);

    const safe = JSON.parse(
      JSON.stringify(response, (_, v) =>
        typeof v === 'bigint' ? v.toString() : v
      )
    );
    console.log('[process-payment] Sending success response');
    res.status(200).json(safe);

  } catch (err) {
    console.error('[process-payment] Error:', err);
    res.status(500).json({ error: err.message, details: err.body });
  }
});

// ————————————————
// 2) send-email
// ————————————————
router.post('/send-email', async (req, res) => {
  console.log('>>> [send-email] Method:', req.method, 'Path:', req.path);
  console.log('[send-email] Body:', req.body);
  const { userId, userEmail, address } = req.body;
  if (!userId || !userEmail || !address) {
    console.warn('[send-email] Missing userId/userEmail/address');
    return res.status(400).json({ error: 'Missing userId, userEmail, or address' });
  }

  try {
    const allCarts   = await readJSON(cartFilePath, {});
    console.log('[send-email] Loaded cart for userId=', userId, allCarts[userId]);
    const items      = allCarts[userId] || [];
    const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    console.log('[send-email] Computed totalPrice:', totalPrice);

    const lineItems = items.map(i => `• ${i.name} × ${i.quantity}`).join('\n');
    console.log('[send-email] Line items:\n', lineItems);

    const bodyText = `
Customer Email:
${userEmail}

Shipping Address:
${address}

Order Items:
${lineItems}

Total: $${totalPrice.toFixed(2)}
    `.trim();

    const mailOpts = {
      from:    process.env.SMTP_FROM || process.env.SMTP_USER, // fedderslit@gmail.com
      to:      'sojea2025@outlook.com',
      subject: `New Order from ${userEmail}`,
      text:    bodyText
    };

    const info = await transporter.sendMail(mailOpts);
    console.log('[send-email] sendMail response:', info);

    console.log('[send-email] Email sent successfully');
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('[send-email] Error caught:', err);
    if (err.response)     console.error('[send-email] SMTP response:', err.response);
    if (err.responseCode) console.error('[send-email] SMTP responseCode:', err.responseCode);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
