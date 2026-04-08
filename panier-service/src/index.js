const express = require('express');
const cors = require('cors');
const redis = require('redis');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Redis
const redisClient = redis.createClient({
  socket: { host: process.env.REDIS_HOST || 'localhost' }
});

redisClient.connect().then(() => {
  console.log('✅ Redis connecté');
});

// Middleware
app.use(cors());
app.use(express.json());

// URL service Catalogue
const CATALOGUE_URL = process.env.CATALOGUE_SERVICE_URL || 'http://localhost:3001';

// Ajouter au panier
app.post('/cart/add', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    console.log(`🛒 POST /cart/add - User: ${userId}, Product: ${productId}`);
    
    // APPELER SERVICE CATALOGUE
    console.log(`📞 Appel Catalogue: ${CATALOGUE_URL}/products/${productId}`);
    const response = await axios.get(`${CATALOGUE_URL}/products/${productId}`);
    
    if (!response.data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log(`✅ Produit trouvé: ${response.data.name}`);
    
    // STOCKER DANS REDIS
    await redisClient.hSet(`cart:${userId}`, productId.toString(), quantity.toString());
    console.log(`✅ Ajouté au panier`);
    
    res.json({ success: true, message: 'Product added' });
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer panier
app.get('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await redisClient.hGetAll(`cart:${userId}`);
    res.json({ userId, items: cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🛒 Panier Service - Port ${PORT}`);
});
