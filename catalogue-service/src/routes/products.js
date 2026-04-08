const express = require('express');
const router = express.Router();
const db = require('../config/database');
const redis = require('../config/redis');

const CACHE_TTL = 300; // 5 minutes

// GET /api/products - Liste des produits (avec cache)
router.get('/', async (req, res, next) => {
  try {
    const cacheKey = 'products:all';
    
    // 1. Vérifier le cache Redis
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log('✅ Cache HIT - Redis');
      return res.json({
        products: JSON.parse(cachedData),
        source: 'cache',
        instance: process.env.INSTANCE_ID
      });
    }
    
    // 2. Cache MISS - Requête BDD
    console.log('❌ Cache MISS - Query BDD');
    const result = await db.query('SELECT * FROM products ORDER BY id');
    
    // 3. Stocker dans Redis
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result.rows));
    
    res.json({
      products: result.rows,
      source: 'database',
      instance: process.env.INSTANCE_ID
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Produit par ID (avec cache)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;
    
    // Vérifier cache
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log(`✅ Cache HIT - Product ${id}`);
      return res.json({
        product: JSON.parse(cachedData),
        source: 'cache',
        instance: process.env.INSTANCE_ID
      });
    }
    
    // Query BDD
    console.log(`❌ Cache MISS - Product ${id}`);
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    // Stocker dans cache
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result.rows[0]));
    
    res.json({
      product: result.rows[0],
      source: 'database',
      instance: process.env.INSTANCE_ID
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Créer un produit (invalide cache)
router.post('/', async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;
    
    const result = await db.query(
      'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *',
      [name, price, stock]
    );
    
    // Invalider le cache
    await redis.del('products:all');
    console.log('🗑️  Cache invalidé');
    
    res.status(201).json({
      product: result.rows[0],
      instance: process.env.INSTANCE_ID
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
