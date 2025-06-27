// Advanced real-time price scraper for NZ trade stores with accurate product matching
const axios = require('axios');

class RealTimePriceScraper {
  constructor() {
    this.stores = {
      bunnings: {
        name: 'Bunnings Warehouse',
        baseUrl: 'https://www.bunnings.co.nz',
        searchUrl: 'https://www.bunnings.co.nz/search/products',
        searchParam: 'q',
        selectors: {
          productContainer: '.product-tile, .search-result-item, [data-locator="product-tile"]',
          name: '.product-title, .product-name, h3, [data-locator="product-title"]',
          price: '.price, .product-price, [data-testid="price"], .price-value, .current-price',
          originalPrice: '.was-price, .original-price, .strike-through',
          brand: '.brand, .product-brand, .manufacturer',
          availability: '.stock-status, .availability, .in-stock',
          productUrl: 'a[href*="/p/"]',
          image: '.product-image img, img[alt*="product"]'
        },
        pricePattern: /\$?([0-9,]+\.?[0-9]*)/,
        currency: 'NZD'
      },
      mitre10: {
        name: 'Mitre 10',
        baseUrl: 'https://www.mitre10.co.nz',
        searchUrl: 'https://www.mitre10.co.nz/search',
        searchParam: 'q',
        selectors: {
          productContainer: '.product-tile, .product-card, .search-result',
          name: '.product-title, .product-name, h3, .title',
          price: '.price, .product-price, .price-current',
          originalPrice: '.was-price, .original-price',
          brand: '.brand, .manufacturer, .product-brand',
          availability: '.stock-status, .availability',
          productUrl: 'a[href*="/product/"]',
          image: '.product-image img, img[src*="product"]'
        },
        pricePattern: /\$?([0-9,]+\.?[0-9]*)/,
        currency: 'NZD'
      },
      placemakers: {
        name: 'PlaceMakers',
        baseUrl: 'https://www.placemakers.co.nz',
        searchUrl: 'https://www.placemakers.co.nz/search',
        searchParam: 'q',
        selectors: {
          productContainer: '.product-item, .product-card, .search-item',
          name: '.product-name, .title, h3, h4',
          price: '.price, .product-price, .current-price',
          originalPrice: '.was-price, .original-price',
          brand: '.brand, .manufacturer',
          availability: '.stock-status, .availability',
          productUrl: 'a[href*="/product/"]',
          image: '.product-image img, img[alt*="product"]'
        },
        pricePattern: /\$?([0-9,]+\.?[0-9]*)/,
        currency: 'NZD'
      },
      repco: {
        name: 'Repco',
        baseUrl: 'https://www.repco.co.nz',
        searchUrl: 'https://www.repco.co.nz/search',
        searchParam: 'q',
        selectors: {
          productContainer: '.product-tile, .product-card, .search-result',
          name: '.product-title, .product-name, h3',
          price: '.price, .product-price, .current-price',
          originalPrice: '.was-price, .original-price',
          brand: '.brand, .manufacturer',
          availability: '.stock-status, .availability',
          productUrl: 'a[href*="/product/"]',
          image: '.product-image img, .product-photo img'
        },
        pricePattern: /\$?([0-9,]+\.?[0-9]*)/,
        currency: 'NZD'
      },
      supercheapAuto: {
        name: 'Supercheap Auto',
        baseUrl: 'https://www.supercheapauto.co.nz',
        searchUrl: 'https://www.supercheapauto.co.nz/search',
        searchParam: 'q',
        selectors: {
          productContainer: '.product-tile, .product-card, .search-result',
          name: '.product-title, .product-name, h3',
          price: '.price, .product-price, .current-price',
          originalPrice: '.was-price, .original-price',
          brand: '.brand, .manufacturer',
          availability: '.stock-status, .availability',
          productUrl: 'a[href*="/product/"]',
          image: '.product-image img, .product-photo img'
        },
        pricePattern: /\$?([0-9,]+\.?[0-9]*)/,
        currency: 'NZD'
      }
    };
    
    this.requestDelay = 2000; // 2 seconds between requests
    this.maxRetries = 3;
    this.timeout = 30000; // 30 seconds timeout
  }

  // Helper function to wait between requests
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced product name matching with fuzzy logic
  calculateProductMatch(searchProduct, foundProduct) {
    const searchName = this.normalizeProductName(searchProduct.name);
    const foundName = this.normalizeProductName(foundProduct.name);
    const searchBrand = this.normalizeProductName(searchProduct.brand || '');
    const foundBrand = this.normalizeProductName(foundProduct.brand || '');

    let score = 0;
    
    // Exact name match (highest score)
    if (searchName === foundName) score += 100;
    
    // Partial name matches
    const searchWords = searchName.split(' ');
    const foundWords = foundName.split(' ');
    
    let matchingWords = 0;
    searchWords.forEach(word => {
      if (word.length > 2 && foundWords.some(fw => fw.includes(word) || word.includes(fw))) {
        matchingWords++;
      }
    });
    
    score += (matchingWords / searchWords.length) * 60;
    
    // Brand matching
    if (searchBrand && foundBrand) {
      if (searchBrand === foundBrand) score += 30;
      else if (searchBrand.includes(foundBrand) || foundBrand.includes(searchBrand)) score += 15;
    }
    
    // Model number/SKU matching (if present)
    const searchModel = this.extractModelNumber(searchProduct.name);
    const foundModel = this.extractModelNumber(foundProduct.name);
    if (searchModel && foundModel && searchModel === foundModel) {
      score += 40;
    }
    
    return score;
  }

  // Normalize product names for better matching
  normalizeProductName(name) {
    return name.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Extract model numbers from product names
  extractModelNumber(name) {
    const modelPatterns = [
      /\b([A-Z]{2,}\d{2,}[A-Z]*)\b/g, // e.g., DHP484Z, M18FPD
      /\b(\d{2,}[A-Z]{2,})\b/g,       // e.g., 18VXR
      /\b([A-Z]\d{3,})\b/g            // e.g., Z516
    ];
    
    for (const pattern of modelPatterns) {
      const match = name.match(pattern);
      if (match) return match[0];
    }
    return null;
  }

  // Scrape prices for a specific product from all stores
  async scrapeProductPrices(product) {
    console.log(`🔍 Scraping real prices for: ${product.name}`);
    
    const results = [];
    const storeIds = Object.keys(this.stores);
    
    for (const storeId of storeIds) {
      try {
        console.log(`   📊 Checking ${this.stores[storeId].name}...`);
        
        const storeResults = await this.scrapeStorePrice(storeId, product);
        if (storeResults.length > 0) {
          results.push(...storeResults);
          console.log(`   ✅ Found ${storeResults.length} price(s) at ${this.stores[storeId].name}`);
        } else {
          console.log(`   ❌ No matching products found at ${this.stores[storeId].name}`);
        }
        
        // Rate limiting between stores
        await this.wait(this.requestDelay);
        
      } catch (error) {
        console.error(`   ❌ Error scraping ${this.stores[storeId].name}:`, error.message);
      }
    }
    
    console.log(`💰 Total prices found for ${product.name}: ${results.length}`);
    return results;
  }

  // Scrape prices from a specific store
  async scrapeStorePrice(storeId, product) {
    const store = this.stores[storeId];
    if (!store) return [];

    // Check if Puppeteer is available
    try {
      const puppeteer = require('puppeteer');
      return await this.scrapeWithPuppeteer(storeId, product);
    } catch (error) {
      console.log(`⚠️ Puppeteer not available for ${store.name}, using HTTP requests`);
      return await this.scrapeWithHTTP(storeId, product);
    }
  }

  // Scrape using Puppeteer (more reliable)
  async scrapeWithPuppeteer(storeId, product) {
    const store = this.stores[storeId];
    const puppeteer = require('puppeteer');
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // Set realistic headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-NZ,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      });

      // Create search query
      const searchQuery = this.createSearchQuery(product);
      const searchUrl = `${store.searchUrl}?${store.searchParam}=${encodeURIComponent(searchQuery)}`;
      
      console.log(`      🔗 Searching: ${searchUrl}`);
      
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: this.timeout
      });

      await page.waitForTimeout(3000);

      // Extract product data
      const products = await page.evaluate((selectors) => {
        const containers = document.querySelectorAll(selectors.productContainer);
        const results = [];

        containers.forEach((container, index) => {
          if (index >= 20) return; // Limit to first 20 results

          try {
            const nameEl = container.querySelector(selectors.name);
            const priceEl = container.querySelector(selectors.price);
            const originalPriceEl = container.querySelector(selectors.originalPrice);
            const brandEl = container.querySelector(selectors.brand);
            const availabilityEl = container.querySelector(selectors.availability);
            const urlEl = container.querySelector(selectors.productUrl);
            const imageEl = container.querySelector(selectors.image);

            if (nameEl && priceEl) {
              results.push({
                name: nameEl.textContent.trim(),
                price: priceEl.textContent.trim(),
                originalPrice: originalPriceEl ? originalPriceEl.textContent.trim() : null,
                brand: brandEl ? brandEl.textContent.trim() : '',
                availability: availabilityEl ? availabilityEl.textContent.trim() : '',
                url: urlEl ? urlEl.href : '',
                image: imageEl ? imageEl.src : ''
              });
            }
          } catch (error) {
            console.error('Error processing product element:', error);
          }
        });

        return results;
      }, store.selectors);

      // Process and match products
      return this.processScrapedProducts(storeId, product, products);

    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Fallback HTTP scraping method
  async scrapeWithHTTP(storeId, product) {
    const store = this.stores[storeId];
    
    try {
      const searchQuery = this.createSearchQuery(product);
      const searchUrl = `${store.searchUrl}?${store.searchParam}=${encodeURIComponent(searchQuery)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-NZ,en;q=0.9'
        },
        timeout: this.timeout
      });

      // Basic HTML parsing (limited without full DOM)
      const html = response.data;
      const products = this.parseHTMLForProducts(html, store);
      
      return this.processScrapedProducts(storeId, product, products);
      
    } catch (error) {
      console.error(`HTTP scraping failed for ${store.name}:`, error.message);
      return [];
    }
  }

  // Create optimized search query
  createSearchQuery(product) {
    const brand = product.brand || '';
    const name = product.name || '';
    
    // Extract key terms
    const modelNumber = this.extractModelNumber(name);
    const keyWords = name.split(' ')
      .filter(word => word.length > 2)
      .filter(word => !['the', 'and', 'for', 'with', 'tool', 'only'].includes(word.toLowerCase()))
      .slice(0, 4); // Limit to 4 key words
    
    // Build search query
    let query = '';
    if (brand) query += brand + ' ';
    if (modelNumber) query += modelNumber + ' ';
    else query += keyWords.join(' ');
    
    return query.trim();
  }

  // Process scraped products and match with search product
  processScrapedProducts(storeId, searchProduct, scrapedProducts) {
    const store = this.stores[storeId];
    const results = [];
    
    scrapedProducts.forEach(scraped => {
      // Calculate match score
      const matchScore = this.calculateProductMatch(searchProduct, scraped);
      
      // Only include products with good match scores
      if (matchScore >= 60) {
        const price = this.extractPrice(scraped.price, store.pricePattern);
        const originalPrice = scraped.originalPrice ? 
          this.extractPrice(scraped.originalPrice, store.pricePattern) : null;
        
        if (price > 0) {
          results.push({
            storeId: storeId,
            storeName: store.name,
            productName: scraped.name,
            brand: scraped.brand,
            price: price,
            originalPrice: originalPrice,
            onSale: originalPrice && originalPrice > price,
            currency: store.currency,
            inStock: this.parseAvailability(scraped.availability),
            url: scraped.url,
            image: scraped.image,
            matchScore: matchScore,
            lastUpdated: new Date().toISOString(),
            source: 'real-time-scraping'
          });
        }
      }
    });
    
    // Sort by match score and return best matches
    return results
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3); // Return top 3 matches per store
  }

  // Extract price from text
  extractPrice(priceText, pattern) {
    if (!priceText) return 0;
    
    const match = priceText.match(pattern);
    if (match) {
      const price = parseFloat(match[1].replace(',', ''));
      return isNaN(price) ? 0 : price;
    }
    return 0;
  }

  // Parse availability status
  parseAvailability(availabilityText) {
    if (!availabilityText) return true; // Assume in stock if no info
    
    const text = availabilityText.toLowerCase();
    const outOfStockTerms = ['out of stock', 'unavailable', 'sold out', 'not available'];
    
    return !outOfStockTerms.some(term => text.includes(term));
  }

  // Basic HTML parsing for HTTP fallback
  parseHTMLForProducts(html, store) {
    // This is a simplified parser - in production, you'd use a proper HTML parser
    const products = [];
    
    // Look for JSON data in script tags
    const jsonMatches = html.match(/<script[^>]*>.*?window\.__INITIAL_STATE__\s*=\s*({.*?});.*?<\/script>/s) ||
                       html.match(/<script[^>]*>.*?window\.productData\s*=\s*(\[.*?\]);.*?<\/script>/s);
    
    if (jsonMatches) {
      try {
        const data = JSON.parse(jsonMatches[1]);
        // Extract products from JSON data structure
        if (Array.isArray(data)) {
          return data.slice(0, 10).map(item => ({
            name: item.name || item.title || '',
            price: item.price || item.currentPrice || '',
            brand: item.brand || item.manufacturer || '',
            availability: item.availability || item.stock || ''
          }));
        }
      } catch (error) {
        console.log('Failed to parse JSON data from HTML');
      }
    }
    
    return products;
  }

  // Scrape prices for multiple products
  async scrapeMultipleProducts(products) {
    console.log(`🛍️ Starting real-time price scraping for ${products.length} products...`);
    
    const allResults = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n📦 Processing product ${i + 1}/${products.length}: ${product.name}`);
      
      try {
        const productPrices = await this.scrapeProductPrices(product);
        
        if (productPrices.length > 0) {
          allResults.push({
            productId: product.id,
            productName: product.name,
            prices: productPrices,
            totalPricesFound: productPrices.length,
            lastUpdated: new Date().toISOString()
          });
        }
        
        // Rate limiting between products
        if (i < products.length - 1) {
          console.log(`⏳ Waiting ${this.requestDelay}ms before next product...`);
          await this.wait(this.requestDelay);
        }
        
      } catch (error) {
        console.error(`❌ Failed to scrape prices for ${product.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Real-time price scraping completed!`);
    console.log(`📊 Successfully scraped prices for ${allResults.length}/${products.length} products`);
    
    return allResults;
  }

  // Get cached prices or scrape fresh ones
  async getPricesWithCache(products, useCache = true, cacheExpiryMinutes = 30) {
    // In a production environment, you'd implement Redis or database caching
    // For now, we'll always scrape fresh prices for accuracy
    return await this.scrapeMultipleProducts(products);
  }
}

module.exports = RealTimePriceScraper;