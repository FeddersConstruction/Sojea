// server/index.js
const express = require('express');
const cors    = require('cors');

const cartRoutes     = require('./cart');
const checkoutRoutes = require('./checkout');
const licenseRoutes  = require('./licenses');
const productRoutes  = require('./products');
const userRoutes     = require('./users');

const app = express();

const corsOptions = {
  origin: [
    'https://sojeaoj.com',
    'http://localhost:3000'
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],        // include OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'],      // ensure your headers are allowed
  credentials: true
};

// apply CORS to all routes
app.use(cors(corsOptions));

// explicitly respond to preflight for any path
app.options('*', cors(corsOptions));

app.use(express.json());

// 📦 API endpoints
app.use('/api/cart',     cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/licenses', licenseRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users',    userRoutes);

// 🚀 listen on Cloud Run port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
