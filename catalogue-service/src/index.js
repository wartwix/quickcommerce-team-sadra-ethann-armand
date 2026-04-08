const express = require('express');
const cors = require('cors');
// On importe la config centralisée pour que les routes fonctionnent
const db = require('./config/database'); 

const app = express();
const PORT = process.env.PORT || 3000;

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

// Version endpoint
app.get('/version', (req, res) => {
  res.json({ 
    service: 'catalogue-service', 
    version: '1.0.0' 
  });
});

// Routes produits
const productsRouter = require('./routes/products');
app.use('/products', productsRouter);

app.listen(PORT, () => {
  console.log(`📦 Catalogue Service - Port ${PORT}`);
});