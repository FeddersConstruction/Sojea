// server/cart.js

const express = require('express');
const cors    = require('cors');
const { Storage } = require('@google-cloud/storage');
const router  = express.Router();

console.log('[cart.js] Loaded cart router');
router.use(cors());

const storage      = new Storage();
const bucketName   = 'sojea';
const cartFilePath = 'json/cart.json';
const usersPath    = 'json/users.json';

async function ensureFileExists(path, defaultData) {
  const file   = storage.bucket(bucketName).file(path);
  const [exists] = await file.exists();
  if (!exists) {
    console.log(`[ensureFileExists] Creating ${path}`);
    await file.save(JSON.stringify(defaultData, null, 2));
  }
}

async function readJSON(path, defaultData) {
  await ensureFileExists(path, defaultData);
  console.log(`[readJSON] Reading ${path}`);
  const buf = (await storage.bucket(bucketName).file(path).download())[0];
  return JSON.parse(buf.toString() || JSON.stringify(defaultData));
}

async function writeJSON(path, data) {
  console.log(`[writeJSON] Writing ${path}`, data);
  await storage.bucket(bucketName).file(path)
    .save(JSON.stringify(data, null, 2));
}

// … existing GET, PUT, DELETE item routes …

// DELETE entire cart
router.delete('/:userId', async (req, res) => {
  console.log('>>> [cart-clear] Method:', req.method, 'Path:', req.path);
  const uid = parseInt(req.params.userId, 10);
  console.log('[cart-clear] Clearing cart for userId:', uid);

  try {
    const users = await readJSON(usersPath, []);
    if (!users.some(u => u.id === uid)) {
      console.warn('[cart-clear] Unauthorized user:', uid);
      return res.status(401).json({ message: 'User not authorized' });
    }

    const allCarts = await readJSON(cartFilePath, {});
    console.log('[cart-clear] Current carts:', allCarts);
    allCarts[uid]  = [];
    await writeJSON(cartFilePath, allCarts);

    console.log('[cart-clear] Cart cleared for user', uid);
    res.json({ items: [], totalQuantity: 0, totalPrice: 0 });

  } catch (err) {
    console.error('[cart-clear] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
