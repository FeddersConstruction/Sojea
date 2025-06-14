// server/index.js
const express = require('express');
const cors    = require('cors');

const cartRoutes     = require('./cart');
const checkoutRoutes = require('./checkout');
const licenseRoutes  = require('./licenses');
const productRoutes  = require('./products');
const userRoutes     = require('./users');

const app = express();

/* -------------------------------------------------- */
/*  Global CORS                                       */
/* -------------------------------------------------- */

const corsOptions = {
  origin: [
    'https://sojeaoj.com',   // production front end
    'http://localhost:3000', // local dev
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',      // (optional) common AJAX header
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // respond to all pre‑flight requests

/* -------------------------------------------------- */
/*  Middleware + Routes                               */
/* -------------------------------------------------- */

app.use(express.json());

app.use('/api/cart',     cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);

/* -------------------------------------------------- */
/*  Startup                                           */
/* -------------------------------------------------- */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
