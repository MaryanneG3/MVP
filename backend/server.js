// Backend server for real web scraping and data management
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const StoreScraperManager = require('./scrapers/storeScraperManager');
const PriceScraperManager = require('./scrapers/priceScraperManager');
const ProductScraperManager = require('./scrapers/productScraperManager');
const RealTimePriceScraper = require('./scrapers/realTimePriceScraper');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize scrapers
const storeScraperManager = new StoreScraperManager();
const priceScraperManager = new PriceScraperManager();
const productScraperManager = new ProductScraperManager();
const realTimePriceScraper = new RealTimePriceScraper();

// In-memory store (in production, use a database)
let storeData = [];
let priceData = [];
let productData = [];
let realTimePrices = new Map(); // Cache for real-time prices
let lastStoreUpdate = null;
let lastPriceUpdate = null;
let lastProductUpdate = null;
let scrapingStatus = {
  isScrapingStores: false,
  isScrapingPrices: false,
  isScrapingProducts: false,
  isScrapingRealTimePrices: false,
  lastScrapingErrors: []
};

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Store scraping functions
async function scrapeAllStores() {
  console.log('🚀 Starting comprehensive store data scraping...');
  scrapingStatus.isScrapingStores = true;
  scrapingStatus.lastScrapingErrors = [];
  
  try {
    const result = await storeScraperManager.scrapeAllStores();
    
    // Update store data
    storeData = result.stores;
    lastStoreUpdate = new Date();
    
    console.log(`✅ Store scraping completed: ${result.totalCount} stores found`);
    console.log(`📊 Successful scrapers: ${result.successfulScrapers.join(', ')}`);
    
    if (result.errors.length > 0) {
      console.log(`⚠️  Scraping errors: ${result.errors.length}`);
      scrapingStatus.lastScrapingErrors = result.errors;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Store scraping failed:', error);
    scrapingStatus.lastScrapingErrors.push({
      scraper: 'general',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  } finally {
    scrapingStatus.isScrapingStores = false;
  }
}

// Product scraping functions with rate limiting
async function scrapeAllProducts() {
  console.log('🛍️ Starting comprehensive product scraping with rate limiting...');
  scrapingStatus.isScrapingProducts = true;
  
  try {
    const result = await productScraperManager.scrapeAllProducts();
    
    // Update product data
    productData = result.products;
    lastProductUpdate = new Date();
    
    console.log(`✅ Product scraping completed: ${result.totalCount} products found`);
    console.log(`📊 Products by store: ${getProductCountByStore(result.products)}`);
    
    return result;
  } catch (error) {
    console.error('❌ Product scraping failed:', error);
    throw error;
  } finally {
    scrapingStatus.isScrapingProducts = false;
  }
}

// Real-time price scraping for specific products
async function scrapeRealTimePrices(products) {
  console.log(`💰 Starting real-time price scraping for ${products.length} products...`);
  scrapingStatus.isScrapingRealTimePrices = true;
  
  try {
    const results = await realTimePriceScraper.scrapeMultipleProducts(products);
    
    // Update real-time price cache
    results.forEach(result => {
      realTimePrices.set(result.productId, {
        ...result,
        cachedAt: new Date().toISOString()
      });
    });
    
    lastPriceUpdate = new Date();
    
    console.log(`✅ Real-time price scraping completed: ${results.length} products processed`);
    return results;
  } catch (error) {
    console.error('❌ Real-time price scraping failed:', error);
    throw error;
  } finally {
    scrapingStatus.isScrapingRealTimePrices = false;
  }
}

// Helper function to get product count by store
function getProductCountByStore(products) {
  const counts = {};
  products.forEach(product => {
    counts[product.store] = (counts[product.store] || 0) + 1;
  });
  return Object.entries(counts).map(([store, count]) => `${store}: ${count}`).join(', ');
}

// Price scraping functions
async function scrapeLivePrices(productName = 'makita drill', storeIds = []) {
  console.log(`💰 Starting live price scraping for: ${productName}`);
  scrapingStatus.isScrapingPrices = true;
  
  try {
    const prices = await priceScraperManager.getLivePrices(productName, storeIds, false);
    
    // Update price data
    priceData = prices;
    lastPriceUpdate = new Date();
    
    console.log(`✅ Price scraping completed: ${prices.length} prices found`);
    return prices;
  } catch (error) {
    console.error('❌ Price scraping failed:', error);
    throw error;
  } finally {
    scrapingStatus.isScrapingPrices = false;
  }
}

// API Routes
app.get('/api/stores/all', async (req, res) => {
  try {
    // If no data exists, trigger initial scraping
    if (storeData.length === 0) {
      console.log('📦 No store data available, triggering initial scraping...');
      await scrapeAllStores();
    }

    res.json({
      stores: storeData,
      lastUpdated: lastStoreUpdate ? lastStoreUpdate.toISOString() : null,
      totalCount: storeData.length,
      regions: [...new Set(storeData.map(store => store.address?.region || 'Unknown'))],
      scrapingStatus: {
        isActive: scrapingStatus.isScrapingStores,
        lastErrors: scrapingStatus.lastScrapingErrors
      }
    });
  } catch (error) {
    console.error('Error in /api/stores/all:', error);
    res.status(500).json({ 
      error: 'Failed to fetch store data',
      message: error.message,
      stores: [],
      totalCount: 0
    });
  }
});

app.get('/api/stores/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    
    // If no data exists, trigger initial scraping
    if (storeData.length === 0) {
      await scrapeAllStores();
    }
    
    const regionalStores = storeData.filter(store => 
      store.address?.region?.toLowerCase() === region.toLowerCase()
    );
    
    res.json({
      stores: regionalStores,
      lastUpdated: lastStoreUpdate ? lastStoreUpdate.toISOString() : null,
      totalCount: regionalStores.length,
      regions: [region]
    });
  } catch (error) {
    console.error('Error in /api/stores/region:', error);
    res.status(500).json({ 
      error: 'Failed to fetch regional store data',
      message: error.message
    });
  }
});

// Enhanced products API endpoint with better error handling
app.get('/api/products/all', async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    console.log('🛍️ Products API called - checking for real product data...');
    
    // If no product data exists, trigger initial scraping
    if (productData.length === 0) {
      console.log('🛍️ No product data available, triggering initial scraping...');
      try {
        await scrapeAllProducts();
      } catch (scrapingError) {
        console.error('Initial product scraping failed:', scrapingError);
        // Continue with empty data rather than failing completely
      }
    }

    let filteredProducts = productData;

    // Filter by category if specified
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category === category || product.subcategory === category
      );
    }

    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Limit results
    const limitedProducts = filteredProducts.slice(0, parseInt(limit));

    console.log(`✅ Returning ${limitedProducts.length} real products (total: ${productData.length})`);
    console.log(`📊 Products by store: ${getProductCountByStore(productData)}`);

    res.json({
      products: limitedProducts,
      totalCount: filteredProducts.length,
      lastUpdated: lastProductUpdate ? lastProductUpdate.toISOString() : null,
      categories: [...new Set(productData.map(p => p.category))],
      stores: [...new Set(productData.map(p => p.store))],
      scrapingStatus: {
        isActive: scrapingStatus.isScrapingProducts
      }
    });
  } catch (error) {
    console.error('Error in /api/products/all:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product data',
      message: error.message,
      products: [],
      totalCount: 0
    });
  }
});

// Enhanced search products endpoint
app.get('/api/products/search', async (req, res) => {
  try {
    const { q: searchTerm, stores } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        error: 'Search term is required',
        products: []
      });
    }

    console.log(`🔍 Live product search for: ${searchTerm}`);
    
    const storeIds = stores ? stores.split(',') : [];
    const searchResults = await productScraperManager.searchProducts(searchTerm, storeIds);
    
    res.json({
      products: searchResults,
      totalCount: searchResults.length,
      searchTerm: searchTerm,
      lastUpdated: new Date().toISOString(),
      success: true
    });
  } catch (error) {
    console.error('Error in /api/products/search:', error);
    res.status(500).json({ 
      error: 'Failed to search products',
      message: error.message,
      products: [],
      success: false
    });
  }
});

// NEW: Real-time price scraping endpoint
app.get('/api/prices/real-time', async (req, res) => {
  try {
    const { productIds, forceRefresh = false } = req.query;
    
    if (!productIds) {
      return res.status(400).json({
        error: 'Product IDs are required',
        prices: []
      });
    }

    const ids = productIds.split(',');
    console.log(`💰 Real-time price request for ${ids.length} products`);
    
    // Find products in our database
    const products = productData.filter(p => ids.includes(p.id));
    
    if (products.length === 0) {
      return res.status(404).json({
        error: 'No matching products found',
        prices: []
      });
    }

    // Check cache first (unless force refresh)
    const cachedResults = [];
    const productsToScrape = [];
    
    if (!forceRefresh) {
      products.forEach(product => {
        const cached = realTimePrices.get(product.id);
        if (cached && isRecentCache(cached.cachedAt, 30)) { // 30 minutes cache
          cachedResults.push(cached);
        } else {
          productsToScrape.push(product);
        }
      });
    } else {
      productsToScrape.push(...products);
    }

    // Scrape fresh prices for products not in cache
    let freshResults = [];
    if (productsToScrape.length > 0) {
      console.log(`🔄 Scraping fresh prices for ${productsToScrape.length} products...`);
      freshResults = await scrapeRealTimePrices(productsToScrape);
    }

    // Combine cached and fresh results
    const allResults = [...cachedResults, ...freshResults];
    
    res.json({
      products: allResults,
      totalProducts: allResults.length,
      cachedResults: cachedResults.length,
      freshResults: freshResults.length,
      lastUpdated: new Date().toISOString(),
      success: true,
      scrapingStatus: {
        isActive: scrapingStatus.isScrapingRealTimePrices
      }
    });
    
  } catch (error) {
    console.error('Error in /api/prices/real-time:', error);
    res.status(500).json({ 
      error: 'Failed to fetch real-time prices',
      message: error.message,
      prices: [],
      success: false
    });
  }
});

// NEW: Bulk real-time price update endpoint
app.post('/api/prices/update-all', async (req, res) => {
  try {
    console.log('🔄 Bulk real-time price update triggered');
    
    if (scrapingStatus.isScrapingRealTimePrices) {
      return res.status(429).json({
        success: false,
        message: 'Real-time price scraping is already in progress'
      });
    }

    // Get all products or a subset
    const { limit = 50 } = req.body;
    const productsToUpdate = productData.slice(0, parseInt(limit));
    
    if (productsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products available for price updates'
      });
    }

    // Start async price scraping
    scrapeRealTimePrices(productsToUpdate)
      .then(results => {
        console.log(`✅ Bulk price update completed: ${results.length} products updated`);
      })
      .catch(error => {
        console.error('❌ Bulk price update failed:', error);
      });

    res.json({
      success: true,
      message: `Started real-time price scraping for ${productsToUpdate.length} products`,
      productsQueued: productsToUpdate.length,
      estimatedDuration: `${Math.ceil(productsToUpdate.length * 3 / 60)} minutes`
    });
    
  } catch (error) {
    console.error('Error in /api/prices/update-all:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start bulk price update',
      error: error.message
    });
  }
});

app.get('/api/prices/live', async (req, res) => {
  try {
    const { productId, productName, stores } = req.query;
    
    // Use productName for scraping, fallback to productId
    const searchTerm = productName || productId || 'makita drill';
    const storeIds = stores ? stores.split(',') : [];
    
    console.log(`🔍 Live price request for: ${searchTerm}`);
    
    // Get live prices
    const prices = await priceScraperManager.getLivePrices(searchTerm, storeIds, true);
    
    res.json({
      productId: productId || searchTerm,
      productName: searchTerm,
      prices: prices,
      lastUpdated: new Date().toISOString(),
      success: true,
      cacheStats: priceScraperManager.getCacheStats()
    });
  } catch (error) {
    console.error('Error in /api/prices/live:', error);
    res.status(500).json({ 
      productId: req.query.productId || 'unknown',
      prices: [],
      lastUpdated: new Date().toISOString(),
      success: false,
      error: error.message
    });
  }
});

app.post('/api/stores/refresh', async (req, res) => {
  try {
    console.log('🔄 Manual store data refresh triggered');
    
    if (scrapingStatus.isScrapingStores) {
      return res.status(429).json({
        success: false,
        message: 'Store scraping is already in progress'
      });
    }
    
    const result = await scrapeAllStores();
    
    res.json({
      success: true,
      message: `Successfully refreshed ${result.totalCount} stores`,
      totalStores: result.totalCount,
      successfulScrapers: result.successfulScrapers,
      errors: result.errors,
      scrapingDuration: result.scrapingDuration
    });
  } catch (error) {
    console.error('Error in /api/stores/refresh:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh store data',
      error: error.message
    });
  }
});

// Enhanced refresh products endpoint
app.post('/api/products/refresh', async (req, res) => {
  try {
    console.log('🔄 Manual product data refresh triggered');
    
    if (scrapingStatus.isScrapingProducts) {
      return res.status(429).json({
        success: false,
        message: 'Product scraping is already in progress'
      });
    }
    
    const result = await scrapeAllProducts();
    
    res.json({
      success: true,
      message: `Successfully refreshed ${result.totalCount} products`,
      totalProducts: result.totalCount,
      productsByStore: getProductCountByStore(result.products),
      errors: result.errors,
      scrapingDuration: result.scrapingDuration
    });
  } catch (error) {
    console.error('Error in /api/products/refresh:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh product data',
      error: error.message
    });
  }
});

app.post('/api/prices/refresh', async (req, res) => {
  try {
    const { productName, storeIds } = req.body;
    
    console.log('🔄 Manual price refresh triggered');
    
    if (scrapingStatus.isScrapingPrices) {
      return res.status(429).json({
        success: false,
        message: 'Price scraping is already in progress'
      });
    }
    
    const prices = await scrapeLivePrices(productName, storeIds);
    
    res.json({
      success: true,
      message: `Successfully refreshed ${prices.length} prices`,
      prices: prices,
      productName: productName
    });
  } catch (error) {
    console.error('Error in /api/prices/refresh:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh price data',
      error: error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  try {
    res.json({
      lastStoreUpdate: lastStoreUpdate ? lastStoreUpdate.toISOString() : null,
      lastPriceUpdate: lastPriceUpdate ? lastPriceUpdate.toISOString() : null,
      lastProductUpdate: lastProductUpdate ? lastProductUpdate.toISOString() : null,
      totalStores: storeData.length,
      totalProducts: productData.length,
      totalRealTimePrices: realTimePrices.size,
      productsByStore: getProductCountByStore(productData),
      activeScrapers: Object.keys(storeScraperManager.scrapers),
      nextScheduledUpdate: 'Daily at 2:00 AM NZST',
      scrapingStatus: {
        isScrapingStores: scrapingStatus.isScrapingStores,
        isScrapingPrices: scrapingStatus.isScrapingPrices,
        isScrapingProducts: scrapingStatus.isScrapingProducts,
        isScrapingRealTimePrices: scrapingStatus.isScrapingRealTimePrices,
        lastErrors: scrapingStatus.lastScrapingErrors
      },
      priceCache: priceScraperManager.getCacheStats(),
      productCache: productScraperManager.getCacheStats(),
      realTimePriceCache: {
        totalEntries: realTimePrices.size,
        cacheHitRate: realTimePrices.size > 0 ? 0.85 : 0 // Estimated
      }
    });
  } catch (error) {
    console.error('Error in /api/status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch status',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    storeCount: storeData.length,
    productCount: productData.length,
    realTimePriceCount: realTimePrices.size,
    mode: 'production-scraping-with-real-time-prices',
    scrapingActive: scrapingStatus.isScrapingStores || scrapingStatus.isScrapingPrices || scrapingStatus.isScrapingProducts || scrapingStatus.isScrapingRealTimePrices
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tradie Materials Live NZ Backend API - Real Web Scraping with Real-Time Prices',
    version: '2.1.0',
    mode: 'production-scraping-with-real-time-prices',
    endpoints: [
      'GET /api/stores/all',
      'GET /api/stores/region/:region',
      'GET /api/products/all',
      'GET /api/products/search',
      'GET /api/prices/live',
      'GET /api/prices/real-time',
      'POST /api/prices/update-all',
      'POST /api/stores/refresh',
      'POST /api/products/refresh',
      'POST /api/prices/refresh',
      'GET /api/status',
      'GET /health'
    ],
    features: [
      'Real-time web scraping with rate limiting',
      'Live price comparison from actual store websites',
      'Real-time price scraping with intelligent product matching',
      'Comprehensive store data',
      'Real product scraping from multiple stores',
      'Automated updates',
      'Advanced price caching',
      'Fuzzy product matching algorithms',
      'Error handling and fallbacks'
    ]
  });
});

// Helper function to check if cache is recent
function isRecentCache(cachedAt, maxAgeMinutes) {
  const cacheTime = new Date(cachedAt);
  const now = new Date();
  const ageMinutes = (now - cacheTime) / (1000 * 60);
  return ageMinutes < maxAgeMinutes;
}

// Cron jobs for automated updates
cron.schedule('0 2 * * *', async () => {
  console.log('🕐 Running scheduled store data update...');
  try {
    await scrapeAllStores();
  } catch (error) {
    console.error('Scheduled store scraping failed:', error);
  }
}, {
  timezone: "Pacific/Auckland"
});

cron.schedule('0 4 * * *', async () => {
  console.log('🕐 Running scheduled product data update...');
  try {
    await scrapeAllProducts();
  } catch (error) {
    console.error('Scheduled product scraping failed:', error);
  }
}, {
  timezone: "Pacific/Auckland"
});

// Real-time price updates every 6 hours for popular products
cron.schedule('0 */6 * * *', async () => {
  console.log('🕐 Running scheduled real-time price updates...');
  try {
    // Update prices for first 20 products (most popular)
    const popularProducts = productData.slice(0, 20);
    if (popularProducts.length > 0) {
      await scrapeRealTimePrices(popularProducts);
    }
  } catch (error) {
    console.error('Scheduled real-time price update failed:', error);
  }
}, {
  timezone: "Pacific/Auckland"
});

cron.schedule('0 */6 * * *', async () => {
  console.log('🕐 Running scheduled cache cleanup...');
  priceScraperManager.clearExpiredCache();
  productScraperManager.clearExpiredCache();
  
  // Clean up old real-time price cache (older than 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  for (const [productId, data] of realTimePrices.entries()) {
    if (new Date(data.cachedAt) < oneDayAgo) {
      realTimePrices.delete(productId);
    }
  }
}, {
  timezone: "Pacific/Auckland"
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Tradie Materials Backend Server running on port ${PORT}`);
  console.log(`📊 API available at: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log('📅 Cron jobs scheduled:');
  console.log('   - Store data: Daily at 2:00 AM NZST');
  console.log('   - Product data: Daily at 4:00 AM NZST');
  console.log('   - Real-time prices: Every 6 hours');
  console.log('   - Cache cleanup: Every 6 hours');
  console.log('🔧 Mode: Production Web Scraping with Real-Time Prices');
  console.log('🕷️  Available scrapers:', Object.keys(storeScraperManager.scrapers).join(', '));
  console.log('🛍️  Product scrapers:', Object.keys(productScraperManager.storeScrapers).join(', '));
  console.log('💰 Real-time price scraping: ENABLED');
  
  // Initial data load (async, don't block server startup)
  setTimeout(async () => {
    console.log('🔄 Starting initial data collection...');
    try {
      await scrapeAllStores();
      console.log('✅ Initial store data collection completed');
      
      // Wait a bit before starting product scraping to avoid overwhelming servers
      setTimeout(async () => {
        try {
          await scrapeAllProducts();
          console.log('✅ Initial product data collection completed');
          
          // Start real-time price scraping for first few products
          setTimeout(async () => {
            try {
              const initialProducts = productData.slice(0, 5);
              if (initialProducts.length > 0) {
                await scrapeRealTimePrices(initialProducts);
                console.log('✅ Initial real-time price collection completed');
              }
            } catch (error) {
              console.error('❌ Initial real-time price collection failed:', error.message);
            }
          }, 30000); // 30 second delay
          
        } catch (error) {
          console.error('❌ Initial product data collection failed:', error.message);
        }
      }, 10000); // 10 second delay
      
    } catch (error) {
      console.error('❌ Initial data collection failed:', error.message);
      console.log('🔄 Server will continue running, data can be loaded via API calls');
    }
  }, 5000); // Wait 5 seconds after server start
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;