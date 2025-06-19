// server/checkout.js

const express    = require('express');
const cors       = require('cors');
const router     = express.Router();
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const { SquareClient, SquareEnvironment } = require('square');
const { Storage } = require('@google-cloud/storage');

// Enable CORS (including OPTIONS preflight)
router.use(cors());

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,                  
  port:   +process.env.SMTP_PORT,                 
  secure: process.env.SMTP_SECURE === 'true',     
  auth: {
    user: process.env.SMTP_USER,                  
    pass: process.env.SMTP_PASS                   
  },
  logger: true,   
  debug: true     
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
// 1) process-payment (unchanged)
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
    const items      = allCarts[userId] || [];
    const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const amount     = BigInt(Math.round(totalPrice * 100));

    const client   = new SquareClient({
      environment: SquareEnvironment.Production,
      token: process.env.SQUARE_ACCESS_LIVE_TOKEN,
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
    res.status(200).json(safe);

  } catch (err) {
    console.error('[process-payment] Error:', err);
    res.status(500).json({ error: err.message, details: err.body });
  }
});

// ————————————————
// 2) send-email (with order and delivery times)
// ————————————————
router.post('/send-email', async (req, res) => {
  console.log('>>> [send-email] Method:', req.method, 'Path:', req.path);
  console.log('[send-email] Body:', req.body);
  const { userId, userEmail, address, deliveryTime } = req.body;
  if (!userId || !userEmail || !address || !deliveryTime) {
    console.warn('[send-email] Missing one of userId/userEmail/address/deliveryTime');
    return res.status(400).json({ error: 'Missing userId, userEmail, address, or deliveryTime' });
  }

  try {
    // Read cart
    const allCarts   = await readJSON(cartFilePath, {});
    const items      = allCarts[userId] || [];
    const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    // Build line items
    const lineItems = items.map(i => `• ${i.name} × ${i.quantity}`).join('\n');

    // Format the order timestamp (Eastern Time)
    const orderTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });

    // Format deliveryTime ("HH:MM") into "H:MM am/pm"
    const [h, m] = deliveryTime.split(':').map(Number);
    const ampm   = h >= 12 ? 'pm' : 'am';
    const hour12 = h % 12 || 12;
    const deliveryDisplay = `${hour12}:${m.toString().padStart(2,'0')} ${ampm}`;

    // Compose email body
    const bodyText = `
Order placed at: ${orderTime}

Customer Email:
${userEmail}

Shipping Address:
${address}

Delivery Slot:
Tomorrow at ${deliveryDisplay}

Order Items:
${lineItems}

Total: $${totalPrice.toFixed(2)}
    `.trim();

    // Send it
    const mailOpts = {
      from:    process.env.SMTP_FROM || process.env.SMTP_USER,
      to:      'sojea2025@outlook.com',
      subject: `New Order from ${userEmail}`,
      text:    bodyText
    };
    console.log('[send-email] Mail options:', mailOpts);

    const info = await transporter.sendMail(mailOpts);
    console.log('[send-email] sendMail response:', info);

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('[send-email] Error caught:', err);
    if (err.response)     console.error('[send-email] SMTP response:', err.response);
    if (err.responseCode) console.error('[send-email] SMTP responseCode:', err.responseCode);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
