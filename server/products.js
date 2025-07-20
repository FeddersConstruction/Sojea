const express = require('express');
const { Storage } = require('@google-cloud/storage');
const nodePath   = require('path');   // avoid collision with product.path
const router     = express.Router();

const storage = new Storage();
const bucketName   = 'sojea';
const productsJson = 'products.json';

async function findFile(name) {
  const [files] = await storage.bucket(bucketName).getFiles({ prefix: '' });
  const file = files.find(f => f.name.endsWith(name));
  if (!file) throw new Error(`File not found: ${name}`);  // ← backticks
  return file.name;
}

async function readJson(name) {
  const file = storage.bucket(bucketName).file(name);
  const [exists] = await file.exists();
  if (!exists) throw new Error(`Missing file: ${name}`);  // ← backticks
  const data = (await file.download())[0];
  return JSON.parse(data.toString());
}

// Serve images
router.get('/img/:filename', async (req, res) => {
  try {
    const imgPath = `img/${req.params.filename}`;          // ← quotes
    const file    = storage.bucket(bucketName).file(imgPath);
    const [exists] = await file.exists();
    if (!exists) return res.status(404).json({ message: 'Image not found' });

    const [meta] = await file.getMetadata();
    res.setHeader('Content-Type', meta.contentType || 'application/octet-stream');
    file.createReadStream().pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Download product file
router.get('/:id/download', async (req, res) => {
  try {
    const filePath = await findFile(productsJson);
    const items    = await readJson(filePath);
    const prod     = items.find(p => p.id === +req.params.id);
    if (!prod) return res.status(404).json({ message: 'Not found' });

    // use your JSON field (renamed to filePath if you like)
    const objPath = prod.filePath.replace(/^\//, '');
    const file    = storage.bucket(bucketName).file(objPath);
    const [exists] = await file.exists();
    if (!exists) return res.status(404).json({ message: 'File missing' });

    const [meta] = await file.getMetadata();
    res.setHeader('Content-Type', meta.contentType || 'application/octet-stream');
    // ← backticks around the whole header value
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${nodePath.basename(objPath)}"`
    );
    file.createReadStream().pipe(res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: 'Internal server error' });
  }
});

// List products
router.get('/', async (req, res) => {
  try {
    const filePath = await findFile(productsJson);
    const items    = await readJson(filePath);

    const sanitized = items.map(
      ({ id, name, description, price, image, soldOut, path }) => ({
        id,
        name,
        description,
        price,
        image,
        soldOut: Boolean(soldOut),
        filePath: path,    // rename here if you like
      })
    );

    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const filePath = await findFile(productsJson);
    const items    = await readJson(filePath);
    const prod     = items.find(p => p.id === +req.params.id);
    if (!prod) return res.status(404).json({ message: 'Not found' });

    res.json({ ...prod, soldOut: Boolean(prod.soldOut) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add to cart
router.post('/add', async (req, res) => {
  const { userId, productId, quantity, name, price } = req.body;
  if (!userId || !productId || !quantity || !name || !price) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const users = await readJson('json/users.json');
    if (!users.some(u => u.id === userId)) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const cartFile = 'json/cart.json';
    let cartData   = await readJson(cartFile).catch(() => ({}));
    cartData[userId] = cartData[userId] || [];
    const item = cartData[userId].find(i => i.productId === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      cartData[userId].push({ productId, quantity, name, price });
    }

    await storage.bucket(bucketName)
      .file(cartFile)
      .save(JSON.stringify(cartData, null, 2));

    res.status(200).json({ message: 'Product added', cart: cartData[userId] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
