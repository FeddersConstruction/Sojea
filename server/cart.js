// server/cart.js

const express = require('express');
const cors    = require('cors');
const { Storage } = require('@google-cloud/storage');
const router  = express.Router();

router.use(cors());

const storage      = new Storage();
const bucketName   = 'sojea';
const cartFilePath = 'json/cart.json';
const usersPath    = 'json/users.json';

async function ensureFileExists(path, defaultData) {
  const file = storage.bucket(bucketName).file(path);
  const [exists] = await file.exists();
  if (!exists) await file.save(JSON.stringify(defaultData, null, 2));
}

async function readJSON(path, defaultData) {
  await ensureFileExists(path, defaultData);
  const buf = (await storage.bucket(bucketName).file(path).download())[0];
  return JSON.parse(buf.toString() || JSON.stringify(defaultData));
}

async function writeJSON(path, data) {
  await storage.bucket(bucketName).file(path).save(JSON.stringify(data, null, 2));
}

// GET cart + totals
router.get('/:userId', async (req, res) => {
  const uid = parseInt(req.params.userId, 10);
  try {
    const users = await readJSON(usersPath, []);
    if (!users.some(u => u.id === uid)) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    const allCarts = await readJSON(cartFilePath, {});
    const items    = allCarts[uid] || [];

    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice    = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    res.json({ items, totalQuantity, totalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update single item quantity
router.put('/:userId/item/:productId', async (req, res) => {
  const uid = parseInt(req.params.userId, 10);
  const pid = parseInt(req.params.productId, 10);
  const { quantity } = req.body;
  if (quantity == null || quantity < 1) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const users   = await readJSON(usersPath, []);
    if (!users.some(u => u.id === uid)) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    const allCarts = await readJSON(cartFilePath, {});
    const userCart = allCarts[uid] || [];

    const item = userCart.find(i => i.productId === pid);
    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }
    item.quantity = quantity;

    allCarts[uid] = userCart;
    await writeJSON(cartFilePath, allCarts);

    const totalQuantity = userCart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice    = userCart.reduce((sum, i) => sum + i.quantity * i.price, 0);

    res.json({ items: userCart, totalQuantity, totalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE single item
router.delete('/:userId/item/:productId', async (req, res) => {
  const uid = parseInt(req.params.userId, 10);
  const pid = parseInt(req.params.productId, 10);

  try {
    const users   = await readJSON(usersPath, []);
    if (!users.some(u => u.id === uid)) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    const allCarts = await readJSON(cartFilePath, {});
    let userCart   = allCarts[uid] || [];

    userCart = userCart.filter(i => i.productId !== pid);
    allCarts[uid] = userCart;
    await writeJSON(cartFilePath, allCarts);

    const totalQuantity = userCart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice    = userCart.reduce((sum, i) => sum + i.quantity * i.price, 0);

    res.json({ items: userCart, totalQuantity, totalPrice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE entire cart
router.delete('/:userId', async (req, res) => {
  const uid = parseInt(req.params.userId, 10);
  try {
    const users = await readJSON(usersPath, []);
    if (!users.some(u => u.id === uid)) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    const allCarts = await readJSON(cartFilePath, {});
    allCarts[uid]  = [];
    await writeJSON(cartFilePath, allCarts);

    res.json({ items: [], totalQuantity: 0, totalPrice: 0 });
  } catch (err) {
    console.error('[cart-clear] error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
