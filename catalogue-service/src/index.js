const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration BDD
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'catalogue',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'healthy', service: 'catalogue' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy' });
  }
});

// Routes produits
const productsRouter = require('./routes/products');
app.use('/products', productsRouter);

app.listen(PORT, () => {
  console.log(`📦 Catalogue Service - Port ${PORT}`);
});
