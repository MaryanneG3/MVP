// Price scraping manager for live product pricing
class PriceScraperManager {
  constructor() {
    this.priceCache = new Map();
    this.scrapingQueue = [];
    this.isProcessing = false;
    
    // Product search patterns for different stores
    this.searchPatterns = {
      bunnings: {
        searchUrl: 'https://www.bunnings.co.nz/search/products',
        searchParam: 'q',
        priceSelector: '.price, .product-price, [data-price]',
        stockSelector: '.stock-status, .availability',
        productSelector: '.product-item, .search-result-item'
      },
      mitre10: {
        searchUrl: 'https://www.mitre10.co.nz/search',
        searchParam: 'q',
        priceSelector: '.price, .product-price',
        stockSelector: '.stock-status',
        productSelector: '.product-tile'
      },
      placemakers: {
        searchUrl: 'https://www.placemakers.co.nz/search',
        searchParam: 'q',
        priceSelector: '.price, .product-price',
        stockSelector: '.stock-status',
        productSelector: '.product-item'
      },
      repco: {
        searchUrl: 'https://www.repco.co.nz/search',
        searchParam: 'q',
        priceSelector: '.price, .product-price',
        stockSelector: '.stock-status',
        productSelector: '.product-item'
      }
    };
  }

  // Scrape live prices for a specific product across all stores
  async scrapeLivePrices(productName, storeIds = []) {
    console.log(`🔍 Scraping live prices for: ${productName}`);
    
    // Check if Puppeteer is available in this environment
    try {
      const puppeteer = require('puppeteer');
      return await this.scrapeWithPuppeteer(productName, storeIds);
    } catch (error) {
      console.log('⚠️ Puppeteer not available in this environment, using fallback pricing');
      return this.getFallbackPrices(productName, storeIds);
    }
  }

  // Scrape with Puppeteer when available
  async scrapeWithPuppeteer(productName, storeIds) {
    const targetStores = storeIds.length > 0 ? storeIds : Object.keys(this.searchPatterns);
    const results = [];
    
    let browser;
    try {
      const puppeteer = require('puppeteer');
      
      // Try to launch browser with fallback options
      const launchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      };

      // Try to find Chrome executable
      try {
        browser = await puppeteer.launch(launchOptions);
      } catch (chromeError) {
        console.log('⚠️ Chrome not found, trying with system Chrome...');
        launchOptions.executablePath = '/usr/bin/google-chrome-stable';
        try {
          browser = await puppeteer.launch(launchOptions);
        } catch (systemChromeError) {
          console.log('⚠️ System Chrome not found, using fallback pricing');
          return this.getFallbackPrices(productName, storeIds);
        }
      }

      // Process stores in parallel with rate limiting
      const batchSize = 2; // Limit concurrent requests
      for (let i = 0; i < targetStores.length; i += batchSize) {
        const batch = targetStores.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (storeId) => {
          try {
            const storeResults = await this.scrapeStorePrice(browser, storeId, productName);
            return storeResults;
          } catch (error) {
            console.error(`❌ Price scraping failed for ${storeId}:`, error.message);
            return [];
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(result => 
          result.status === 'fulfilled' ? result.value : []
        ).flat());

        // Rate limiting between batches
        if (i + batchSize < targetStores.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } catch (error) {
      console.error('❌ Price scraping failed:', error.message);
      return this.getFallbackPrices(productName, storeIds);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    console.log(`💰 Found ${results.length} price results for ${productName}`);
    return results;
  }

  // Get fallback prices when scraping is not available
  getFallbackPrices(productName, storeIds = []) {
    console.log(`📋 Using fallback pricing for: ${productName}`);
    
    const targetStores = storeIds.length > 0 ? storeIds : Object.keys(this.searchPatterns);
    const fallbackPrices = [];
    
    // Generate realistic fallback prices based on product name
    const basePrice = this.estimateBasePrice(productName);
    
    targetStores.forEach(storeId => {
      // Add some variation between stores
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const storePrice = basePrice * (1 + variation);
      
      fallbackPrices.push({
        storeId: storeId,
        productName: productName,
        price: Math.round(storePrice * 100) / 100, // Round to 2 decimal places
        inStock: Math.random() > 0.1, // 90% chance of being in stock
        currency: 'NZD',
        lastUpdated: new Date().toISOString(),
        source: 'estimated-fallback'
      });
    });
    
    return fallbackPrices;
  }

  // Estimate base price based on product name
  estimateBasePrice(productName) {
    const name = productName.toLowerCase();
    
    // Price estimation based on product categories
    if (name.includes('drill') || name.includes('saw') || name.includes('grinder')) {
      return 150 + Math.random() * 300; // $150-450
    } else if (name.includes('hammer') || name.includes('wrench') || name.includes('screwdriver')) {
      return 20 + Math.random() * 80; // $20-100
    } else if (name.includes('pipe') || name.includes('fitting') || name.includes('tap')) {
      return 15 + Math.random() * 85; // $15-100
    } else if (name.includes('oil') || name.includes('filter') || name.includes('battery')) {
      return 25 + Math.random() * 75; // $25-100
    } else if (name.includes('cable') || name.includes('switch') || name.includes('outlet')) {
      return 10 + Math.random() * 40; // $10-50
    } else {
      return 30 + Math.random() * 120; // Default $30-150
    }
  }

  // Scrape prices from a specific store
  async scrapeStorePrice(browser, storeId, productName) {
    const pattern = this.searchPatterns[storeId];
    if (!pattern) {
      throw new Error(`No search pattern defined for store: ${storeId}`);
    }

    const page = await browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      // Navigate to search page
      const searchUrl = `${pattern.searchUrl}?${pattern.searchParam}=${encodeURIComponent(productName)}`;
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await page.waitForTimeout(2000);

      // Extract product prices
      const prices = await page.evaluate((selectors, storeId) => {
        const products = document.querySelectorAll(selectors.productSelector);
        const results = [];

        products.forEach((product, index) => {
          if (index >= 10) return; // Limit to first 10 results

          const priceElement = product.querySelector(selectors.priceSelector);
          const stockElement = product.querySelector(selectors.stockSelector);
          const nameElement = product.querySelector('h3, h4, .product-name, .title');

          if (priceElement) {
            const priceText = priceElement.textContent.trim();
            const priceMatch = priceText.match(/[\d,]+\.?\d*/);
            
            if (priceMatch) {
              const price = parseFloat(priceMatch[0].replace(',', ''));
              const inStock = stockElement ? 
                !stockElement.textContent.toLowerCase().includes('out of stock') : true;
              
              results.push({
                storeId: storeId,
                productName: nameElement ? nameElement.textContent.trim() : 'Unknown Product',
                price: price,
                inStock: inStock,
                currency: 'NZD',
                lastUpdated: new Date().toISOString(),
                source: 'scraped'
              });
            }
          }
        });

        return results;
      }, pattern, storeId);

      console.log(`✅ ${storeId}: Found ${prices.length} price results`);
      return prices;

    } catch (error) {
      console.error(`Error scraping ${storeId} prices:`, error);
      return [];
    } finally {
      await page.close();
    }
  }

  // Get cached prices
  getCachedPrices(productName) {
    return this.priceCache.get(productName) || [];
  }

  // Cache prices with expiry
  cachePrices(productName, prices, expiryMinutes = 30) {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);
    this.priceCache.set(productName, {
      prices,
      expiryTime,
      lastUpdated: new Date().toISOString()
    });
  }

  // Check if cached prices are still valid
  isCacheValid(productName) {
    const cached = this.priceCache.get(productName);
    return cached && Date.now() < cached.expiryTime;
  }

  // Get live prices with caching
  async getLivePrices(productName, storeIds = [], useCache = true) {
    // Check cache first
    if (useCache && this.isCacheValid(productName)) {
      console.log(`📦 Using cached prices for: ${productName}`);
      return this.getCachedPrices(productName).prices;
    }

    // Scrape fresh prices
    const prices = await this.scrapeLivePrices(productName, storeIds);
    
    // Cache the results
    this.cachePrices(productName, prices);
    
    return prices;
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.priceCache.entries()) {
      if (now >= value.expiryTime) {
        this.priceCache.delete(key);
      }
    }
  }

  // Get cache statistics
  getCacheStats() {
    const totalEntries = this.priceCache.size;
    const validEntries = Array.from(this.priceCache.values())
      .filter(entry => Date.now() < entry.expiryTime).length;
    
    return {
      totalEntries,
      validEntries,
      expiredEntries: totalEntries - validEntries,
      cacheHitRate: validEntries / Math.max(totalEntries, 1)
    };
  }
}

module.exports = PriceScraperManager;