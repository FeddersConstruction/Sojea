const express    = require('express');
const cors       = require('cors'); 
const router     = express.Router();
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const { SquareClient, SquareEnvironment } = require('square');
const { Storage } = require('@google-cloud/storage');

console.log('[Checkout.js] Running in test mode (sandbox)');
const accessToken  = process.env.SQUARE_ACCESS_TEST_TOKEN;
console.log('[Checkout.js] Using Square token:', accessToken);

router.use(cors());

// —– SMTP transport for email —–
const transporter = nodemailer.createTransport({
  host:     process.env.SMTP_HOST,
  port:     +process.env.SMTP_PORT,
  secure:   process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const storage      = new Storage();
const bucketName   = 'sojea';
const cartFilePath = 'json/cart.json';

async function ensureFileExists(path, defaultData) {
  const file   = storage.bucket(bucketName).file(path);
  const [ok]   = await file.exists();
  if (!ok)     await file.save(JSON.stringify(defaultData, null, 2));
}

async function readJSON(path, defaultData) {
  await ensureFileExists(path, defaultData);
  const buf = (await storage.bucket(bucketName).file(path).download())[0];
  return JSON.parse(buf.toString() || JSON.stringify(defaultData));
}
// —– 1) Payment endpoint (unchanged logic, but amount = cart total) —–
router.post('/process-payment', async (req, res) => {
  console.log('[process-payment] body:', req.body);
  const { sourceId, userId } = req.body;
  if (!sourceId || !userId) {
    return res.status(400).json({ error: 'Missing sourceId or userId' });
  }

  try {
    const allCarts   = await readJSON(cartFilePath, {});
    const items      = allCarts[userId] || [];
    const totalPrice = items.reduce((sum,i) => sum + i.quantity*i.price, 0);
    const amount     = BigInt(Math.round(totalPrice * 100));

    const client = new SquareClient({
      environment: SquareEnvironment.Sandbox,
      token: accessToken,
    });
    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: { amount, currency: 'USD' },
    });
    console.log('[process-payment] Square result:', response);

    const safe = JSON.parse(
      JSON.stringify(response, (_,v) => typeof v === 'bigint' ? v.toString() : v)
    );
    res.status(200).json(safe);

  } catch (err) {
    console.error('[process-payment] error:', err);
    res.status(500).json({ error: err.message, details: err.body });
  }
});

// —– 2) New email endpoint —–
router.post('/send-email', async (req, res) => {
  console.log('[send-email] body:', req.body);
  const { userId, userEmail, address } = req.body;
  if (!userId || !userEmail || !address) {
    return res.status(400).json({ error: 'Missing userId, userEmail, or address' });
  }

  try {
    // load cart items & total
    const allCarts   = await readJSON(cartFilePath, {});
    const items      = allCarts[userId] || [];
    const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    // build plaintext
    const lineItems = items.map(i => `• ${i.name} × ${i.quantity}`).join('\n');
    const bodyText  = `
Customer Email:
${userEmail}

Shipping Address:
${address}

Order Items:
${lineItems}

Total: $${totalPrice.toFixed(2)}
    `.trim();

    // send
    await transporter.sendMail({
      from:    process.env.SMTP_USER,
      to:      'garrett.strange@yahoo.com',
      subject: `New Order from ${userEmail}`,
      text:     bodyText
    });

    console.log('[send-email] sent ok');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('[send-email] error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;