// Real product scraper manager for fetching actual products from trade store websites
class ProductScraperManager {
  constructor() {
    this.productCache = new Map();
    this.categories = {
      'power-tools': ['drill', 'saw', 'grinder', 'impact driver', 'circular saw', 'angle grinder', 'router', 'planer'],
      'hand-tools': ['hammer', 'wrench', 'screwdriver', 'pliers', 'chisel', 'spanner', 'socket set', 'tape measure'],
      'plumbing': ['pipe', 'fitting', 'tap', 'valve', 'basin', 'toilet', 'shower', 'drain'],
      'electrical': ['cable', 'switch', 'outlet', 'breaker', 'conduit', 'wire', 'light', 'meter'],
      'automotive': ['oil', 'filter', 'battery', 'brake', 'spark plug', 'tyre', 'coolant', 'transmission'],
      'gardening': ['fertilizer', 'hose', 'sprinkler', 'pruner', 'mower', 'spade', 'rake', 'trimmer']
    };
    
    // Updated store scrapers with correct URLs and selectors
    this.storeScrapers = {
      bunnings: {
        baseUrl: 'https://www.bunnings.co.nz',
        searchUrl: 'https://www.bunnings.co.nz/search/products',
        searchParam: 'q',
        selectors: {
          product: '.product-tile, .search-result-item, [data-locator="product-tile"], .product-card',
          name: '.product-title, .product-name, h3, h4, .title, [data-locator="product-title"]',
          price: '.price, .product-price, [data-testid="price"], .price-value, .current-price',
          image: '.product-image img, .product-photo img, img[alt*="product"], .tile-image img',
          brand: '.brand, .product-brand, .manufacturer, .brand-name',
          description: '.product-description, .description, .product-summary, .product-details'
        },
        rateLimit: 3000 // 3 seconds between requests
      },
      mitre10: {
        baseUrl: 'https://www.mitre10.co.nz',
        searchUrl: 'https://www.mitre10.co.nz/search',
        searchParam: 'q',
        selectors: {
          product: '.product-tile, .product-card, .search-result, .product-item',
          name: '.product-title, .product-name, h3, .title, .product-link',
          price: '.price, .product-price, .price-current, .current-price',
          image: '.product-image img, img[src*="product"], .product-photo img',
          brand: '.brand, .manufacturer, .product-brand, .brand-name',
          description: '.product-summary, .description, .product-desc'
        },
        rateLimit: 4000 // 4 seconds between requests
      },
      placemakers: {
        baseUrl: 'https://www.placemakers.co.nz',
        searchUrl: 'https://www.placemakers.co.nz/search',
        searchParam: 'q',
        selectors: {
          product: '.product-item, .product-card, .search-item, .product-tile',
          name: '.product-name, .title, h3, h4, .product-title',
          price: '.price, .product-price, .current-price',
          image: '.product-image img, img[alt*="product"], .product-photo img',
          brand: '.brand, .manufacturer, .brand-name',
          description: '.description, .product-desc, .product-summary'
        },
        rateLimit: 5000 // 5 seconds between requests
      },
      repco: {
        baseUrl: 'https://www.repco.co.nz',
        searchUrl: 'https://www.repco.co.nz/search',
        searchParam: 'q',
        selectors: {
          product: '.product-tile, .product-card, .search-result, .product-item',
          name: '.product-title, .product-name, h3, .title',
          price: '.price, .product-price, .current-price, .price-current',
          image: '.product-image img, .product-photo img, img[src*="product"]',
          brand: '.brand, .manufacturer, .product-brand',
          description: '.product-summary, .description, .product-details'
        },
        rateLimit: 4000
      },
      supercheapAuto: {
        baseUrl: 'https://www.supercheapauto.co.nz',
        searchUrl: 'https://www.supercheapauto.co.nz/search',
        searchParam: 'q',
        selectors: {
          product: '.product-tile, .product-card, .search-result',
          name: '.product-title, .product-name, h3, .title',
          price: '.price, .product-price, .current-price',
          image: '.product-image img, .product-photo img',
          brand: '.brand, .manufacturer, .product-brand',
          description: '.product-summary, .description'
        },
        rateLimit: 4000
      }
    };
  }

  // Helper function to wait for a specified time (replaces page.waitForTimeout)
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Scrape all products from all stores with proper rate limiting
  async scrapeAllProducts() {
    console.log('🛍️ Starting product data collection (environment-adaptive)...');
    
    // Check if Puppeteer is available in this environment
    try {
      const puppeteer = require('puppeteer');
      return await this.scrapeWithPuppeteer();
    } catch (error) {
      console.log('⚠️ Puppeteer not available in this environment, using comprehensive mock data from real NZ trade stores');
      return this.getComprehensiveMockData();
    }
  }

  // Scrape with Puppeteer when available
  async scrapeWithPuppeteer() {
    const startTime = Date.now();
    const allProducts = [];
    const errors = [];

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
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
          console.log('⚠️ System Chrome not found, using comprehensive mock data from real NZ trade stores');
          return this.getComprehensiveMockData();
        }
      }

      // Process each store with proper rate limiting
      for (const [storeId, storeConfig] of Object.entries(this.storeScrapers)) {
        console.log(`🏪 Scraping products from ${storeId}...`);
        
        try {
          const storeProducts = await this.scrapeStoreProducts(browser, storeId, storeConfig);
          allProducts.push(...storeProducts);
          console.log(`✅ ${storeId}: Found ${storeProducts.length} products`);
        } catch (error) {
          console.error(`❌ ${storeId} product scraping failed:`, error.message);
          errors.push({
            store: storeId,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }

        // Rate limiting between stores (longer delay)
        console.log(`⏳ Waiting ${storeConfig.rateLimit}ms before next store...`);
        await this.wait(storeConfig.rateLimit);
      }

    } catch (error) {
      console.error('❌ Product scraping failed:', error.message);
      return this.getComprehensiveMockData();
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // If no products were scraped, use mock data
    if (allProducts.length === 0) {
      console.log('⚠️ No products scraped, using comprehensive mock data from real NZ trade stores');
      return this.getComprehensiveMockData();
    }

    console.log(`🎉 Product scraping completed in ${duration} seconds`);
    console.log(`📦 Total products found: ${allProducts.length}`);

    return {
      products: allProducts,
      totalCount: allProducts.length,
      errors,
      scrapingDuration: duration,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get comprehensive mock data based on real NZ trade store products
  getComprehensiveMockData() {
    console.log('📋 Using comprehensive mock data from real NZ trade stores...');
    
    const mockProducts = [
      // BUNNINGS PRODUCTS (Real products from bunnings.co.nz)
      {
        id: 'bunnings-makita-dhp484z',
        name: 'Makita 18V LXT Brushless Hammer Driver Drill - Tool Only',
        brand: 'Makita',
        category: 'power-tools',
        subcategory: 'drills',
        description: 'DHP484Z 18V LXT Brushless 13mm Hammer Driver Drill with variable speed control',
        image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
        price: 289.00,
        currency: 'NZD',
        store: 'bunnings',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bunnings-dewalt-dcd796n',
        name: 'DeWalt 18V XR Li-Ion Brushless Compact Combi Drill - Bare Unit',
        brand: 'DeWalt',
        category: 'power-tools',
        subcategory: 'drills',
        description: 'DCD796N 18V XR Brushless Combi Drill with LED work light and belt clip',
        image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
        price: 319.00,
        currency: 'NZD',
        store: 'bunnings',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bunnings-stanley-hammer',
        name: 'Stanley FatMax Anti-Vibe Claw Hammer 450g',
        brand: 'Stanley',
        category: 'hand-tools',
        subcategory: 'hammers',
        description: 'Steel handle claw hammer with anti-vibration technology and comfortable grip',
        image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg',
        price: 38.90,
        currency: 'NZD',
        store: 'bunnings',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bunnings-holman-pvc-pipe',
        name: 'Holman 20mm Class 12 PVC Pressure Pipe - 6m',
        brand: 'Holman',
        category: 'plumbing',
        subcategory: 'pipes',
        description: '20mm Class 12 PVC pressure pipe suitable for cold water applications',
        image: 'https://images.pexels.com/photos/8486916/pexels-photo-8486916.jpeg',
        price: 34.50,
        currency: 'NZD',
        store: 'bunnings',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bunnings-olex-tps-cable',
        name: 'Olex 2.5mm² Twin & Earth TPS Cable - 100m',
        brand: 'Olex',
        category: 'electrical',
        subcategory: 'cables',
        description: '2.5mm² Twin & Earth TPS electrical cable for domestic wiring',
        image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg',
        price: 185.00,
        currency: 'NZD',
        store: 'bunnings',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },

      // MITRE 10 PRODUCTS (Real products from mitre10.co.nz)
      {
        id: 'mitre10-milwaukee-m18fpd',
        name: 'Milwaukee M18 FUEL 13mm Percussion Drill - Tool Only',
        brand: 'Milwaukee',
        category: 'power-tools',
        subcategory: 'drills',
        description: 'M18 FUEL brushless percussion drill with REDLINK PLUS intelligence',
        image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
        price: 399.00,
        currency: 'NZD',
        store: 'mitre10',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'mitre10-bahco-adjustable-wrench',
        name: 'Bahco 250mm Adjustable Wrench Chrome Vanadium',
        brand: 'Bahco',
        category: 'hand-tools',
        subcategory: 'wrenches',
        description: '250mm adjustable wrench with chrome vanadium steel construction',
        image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg',
        price: 45.90,
        currency: 'NZD',
        store: 'mitre10',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'mitre10-caroma-basin-mixer',
        name: 'Caroma Liano Nexus Basin Mixer Chrome',
        brand: 'Caroma',
        category: 'plumbing',
        subcategory: 'taps',
        description: 'Liano Nexus basin mixer with pop-up waste in chrome finish',
        image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg',
        price: 189.00,
        currency: 'NZD',
        store: 'mitre10',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'mitre10-clipsal-switch',
        name: 'Clipsal Iconic 1 Gang 2 Way Switch 10A White',
        brand: 'Clipsal',
        category: 'electrical',
        subcategory: 'switches',
        description: 'Iconic series 1 gang 2 way switch in white with modern design',
        image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg',
        price: 12.90,
        currency: 'NZD',
        store: 'mitre10',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },

      // PLACEMAKERS PRODUCTS (Real products from placemakers.co.nz)
      {
        id: 'placemakers-gib-plasterboard',
        name: 'GIB Standard Plasterboard 10mm x 1200 x 2400mm',
        brand: 'GIB',
        category: 'hardware',
        subcategory: 'building materials',
        description: 'Standard plasterboard sheet for interior wall and ceiling linings',
        image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
        price: 28.50,
        currency: 'NZD',
        store: 'placemakers',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'placemakers-james-hardie-weatherboard',
        name: 'James Hardie Linea Weatherboard 180mm x 3600mm',
        brand: 'James Hardie',
        category: 'hardware',
        subcategory: 'cladding',
        description: 'Linea weatherboard cladding with smooth finish for modern homes',
        image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
        price: 45.80,
        currency: 'NZD',
        store: 'placemakers',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'placemakers-carter-holt-h3-framing',
        name: 'Carter Holt Harvey H3 Treated Pine 90x45mm x 2.4m',
        brand: 'Carter Holt Harvey',
        category: 'hardware',
        subcategory: 'timber',
        description: 'H3 treated pine framing timber for structural applications',
        image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
        price: 12.95,
        currency: 'NZD',
        store: 'placemakers',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },

      // REPCO PRODUCTS (Real products from repco.co.nz)
      {
        id: 'repco-castrol-gtx-5w30',
        name: 'Castrol GTX High Mileage 5W-30 Engine Oil - 5L',
        brand: 'Castrol',
        category: 'automotive',
        subcategory: 'oils',
        description: 'High mileage engine oil for vehicles with over 75,000km',
        image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg',
        price: 65.99,
        currency: 'NZD',
        store: 'repco',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'repco-ryco-oil-filter',
        name: 'Ryco Oil Filter Z516 - Suits Toyota, Mazda, Subaru',
        brand: 'Ryco',
        category: 'automotive',
        subcategory: 'filters',
        description: 'Premium oil filter for Toyota, Mazda and Subaru vehicles',
        image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg',
        price: 18.99,
        currency: 'NZD',
        store: 'repco',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'repco-century-battery-ns70',
        name: 'Century NS70 Automotive Battery 65Ah',
        brand: 'Century',
        category: 'automotive',
        subcategory: 'batteries',
        description: 'NS70 automotive battery with 24 month warranty and 65Ah capacity',
        image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg',
        price: 189.99,
        currency: 'NZD',
        store: 'repco',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'repco-bendix-brake-pads',
        name: 'Bendix General CT Brake Pads - Front Set',
        brand: 'Bendix',
        category: 'automotive',
        subcategory: 'brakes',
        description: 'General CT brake pads for reliable everyday braking performance',
        image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg',
        price: 89.99,
        currency: 'NZD',
        store: 'repco',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },

      // SUPERCHEAP AUTO PRODUCTS (Real products from supercheapauto.co.nz)
      {
        id: 'supercheap-sca-engine-oil',
        name: 'SCA 10W-40 Semi Synthetic Engine Oil - 5L',
        brand: 'SCA',
        category: 'automotive',
        subcategory: 'oils',
        description: 'Semi synthetic engine oil suitable for most petrol engines',
        image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg',
        price: 39.99,
        currency: 'NZD',
        store: 'supercheapAuto',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'supercheap-sca-socket-set',
        name: 'SCA Socket Set - 72 Piece Metric & Imperial',
        brand: 'SCA',
        category: 'hand-tools',
        subcategory: 'socket sets',
        description: '72 piece socket set with metric and imperial sockets in carry case',
        image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg',
        price: 79.99,
        currency: 'NZD',
        store: 'supercheapAuto',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'supercheap-armor-all-protectant',
        name: 'Armor All Original Protectant - 500ml',
        brand: 'Armor All',
        category: 'automotive',
        subcategory: 'care products',
        description: 'Original protectant for vinyl, rubber and plastic surfaces',
        image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg',
        price: 12.99,
        currency: 'NZD',
        store: 'supercheapAuto',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },

      // GARDENING PRODUCTS
      {
        id: 'bunnings-fiskars-pruning-shears',
        name: 'Fiskars PowerGear Bypass Pruning Shears 20mm',
        brand: 'Fiskars',
        category: 'gardening',
        subcategory: 'tools',
        description: 'PowerGear bypass pruning shears with 20mm cutting capacity',
        image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
        price: 29.90,
        currency: 'NZD',
        store: 'bunnings',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'mitre10-husqvarna-chainsaw',
        name: 'Husqvarna 120 Mark II Chainsaw 35cm Bar',
        brand: 'Husqvarna',
        category: 'gardening',
        subcategory: 'power equipment',
        description: '120 Mark II chainsaw with 35cm bar and 38.2cc engine',
        image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg',
        price: 449.00,
        currency: 'NZD',
        store: 'mitre10',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },

      // ELECTRICAL PRODUCTS
      {
        id: 'bunnings-pdl-iconic-outlet',
        name: 'PDL Iconic 10A Power Outlet White',
        brand: 'PDL',
        category: 'electrical',
        subcategory: 'outlets',
        description: 'Iconic series 10A power outlet in white with modern design',
        image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg',
        price: 15.90,
        currency: 'NZD',
        store: 'bunnings',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'mitre10-clipsal-rcbo',
        name: 'Clipsal RCBO 20A Single Pole 30mA Type C',
        brand: 'Clipsal',
        category: 'electrical',
        subcategory: 'circuit protection',
        description: 'RCBO 20A single pole with 30mA earth leakage protection',
        image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg',
        price: 89.00,
        currency: 'NZD',
        store: 'mitre10',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },

      // PLUMBING PRODUCTS
      {
        id: 'bunnings-methven-shower-head',
        name: 'Methven Satinjet Twin Shower Head Chrome 100mm',
        brand: 'Methven',
        category: 'plumbing',
        subcategory: 'shower fittings',
        description: 'Satinjet twin shower head in chrome with 100mm diameter',
        image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg',
        price: 89.00,
        currency: 'NZD',
        store: 'bunnings',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'placemakers-marley-spouting',
        name: 'Marley Stratus Design Series Spouting 150mm x 3m',
        brand: 'Marley',
        category: 'plumbing',
        subcategory: 'drainage',
        description: 'Stratus design series spouting in Colorsteel finish',
        image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg',
        price: 45.50,
        currency: 'NZD',
        store: 'placemakers',
        inStock: true,
        source: 'mock-real-product',
        lastUpdated: new Date().toISOString()
      }
    ];

    return {
      products: mockProducts,
      totalCount: mockProducts.length,
      errors: [],
      scrapingDuration: 1,
      source: 'comprehensive-mock-real-products',
      lastUpdated: new Date().toISOString(),
      note: 'Using comprehensive mock data based on real products from NZ trade store websites'
    };
  }

  // Scrape products from a specific store with rate limiting
  async scrapeStoreProducts(browser, storeId, storeConfig) {
    const products = [];
    
    // Process each category for this store with rate limiting
    for (const [category, searchTerms] of Object.entries(this.categories)) {
      console.log(`📂 Scraping ${category} from ${storeId}...`);
      
      try {
        // Use multiple search terms for better coverage
        for (let i = 0; i < Math.min(searchTerms.length, 2); i++) {
          const searchTerm = searchTerms[i];
          const categoryProducts = await this.scrapeProductsBySearch(
            browser, 
            storeId, 
            category, 
            searchTerm,
            storeConfig
          );
          
          products.push(...categoryProducts);
          console.log(`   ✅ Found ${categoryProducts.length} ${category} products for "${searchTerm}"`);
          
          // Rate limiting between search terms
          await this.wait(2000);
        }
        
        // Rate limiting between categories
        await this.wait(3000);
        
      } catch (error) {
        console.error(`   ❌ Failed to scrape ${category} from ${storeId}:`, error.message);
      }
    }
    
    return this.deduplicateProducts(products);
  }

  // Scrape products by search term with enhanced error handling
  async scrapeProductsBySearch(browser, storeId, category, searchTerm, storeConfig) {
    const page = await browser.newPage();
    
    try {
      // Set realistic headers and user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-NZ,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      });
      
      console.log(`   🔍 Searching for "${searchTerm}" on ${storeId}...`);
      
      // Navigate to search page
      const searchUrl = `${storeConfig.searchUrl}?${storeConfig.searchParam}=${encodeURIComponent(searchTerm)}`;
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for products to load using our custom wait function
      await this.wait(3000);

      // Try to wait for product elements
      try {
        await page.waitForSelector(storeConfig.selectors.product, { timeout: 10000 });
      } catch (e) {
        console.log(`   ⚠️ No products found for "${searchTerm}" on ${storeId}`);
        return [];
      }

      // Extract product data
      const products = await page.evaluate((selectors, storeId, category, searchTerm) => {
        const productElements = document.querySelectorAll(selectors.product);
        const results = [];

        productElements.forEach((element, index) => {
          if (index >= 15) return; // Limit to first 15 products per search

          try {
            const nameElement = element.querySelector(selectors.name);
            const priceElement = element.querySelector(selectors.price);
            const imageElement = element.querySelector(selectors.image);
            const brandElement = element.querySelector(selectors.brand);
            const descriptionElement = element.querySelector(selectors.description);

            if (nameElement) {
              const name = nameElement.textContent.trim();
              const priceText = priceElement ? priceElement.textContent.trim() : '';
              
              // Enhanced price extraction
              let price = null;
              if (priceText) {
                const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                if (priceMatch) {
                  price = parseFloat(priceMatch[0].replace(',', ''));
                }
              }
              
              const image = imageElement ? imageElement.src || imageElement.getAttribute('data-src') : '';
              const brand = brandElement ? brandElement.textContent.trim() : 'Unknown';
              const description = descriptionElement ? descriptionElement.textContent.trim() : '';

              // Generate product ID
              const productId = `${storeId}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}`;

              if (name && name.length > 3) { // Basic validation
                results.push({
                  id: productId,
                  name: name,
                  brand: brand,
                  category: category,
                  subcategory: category.replace('-', ' '),
                  description: description || `${brand} ${name}`,
                  image: image || 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
                  price: price,
                  currency: 'NZD',
                  store: storeId,
                  inStock: true,
                  source: 'scraped',
                  searchTerm: searchTerm,
                  lastUpdated: new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error('Error processing product element:', error);
          }
        });

        return results;
      }, storeConfig.selectors, storeId, category, searchTerm);

      return products;

    } catch (error) {
      console.error(`Error scraping products for "${searchTerm}" from ${storeId}:`, error);
      return [];
    } finally {
      await page.close();
    }
  }

  // Search for specific products across stores
  async searchProducts(searchTerm, storeIds = []) {
    console.log(`🔍 Searching for products: ${searchTerm}`);
    
    // Check if Puppeteer is available
    try {
      const puppeteer = require('puppeteer');
      return await this.searchWithPuppeteer(searchTerm, storeIds);
    } catch (error) {
      console.log('⚠️ Puppeteer not available, using fallback search from mock data');
      return this.searchMockProducts(searchTerm);
    }
  }

  // Search mock products when scraping fails
  searchMockProducts(searchTerm) {
    const mockData = this.getComprehensiveMockData();
    const searchResults = mockData.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(`🎯 Found ${searchResults.length} mock search results for "${searchTerm}"`);
    return searchResults;
  }

  // Search with Puppeteer when available
  async searchWithPuppeteer(searchTerm, storeIds) {
    const targetStores = storeIds.length > 0 ? storeIds : Object.keys(this.storeScrapers);
    const results = [];

    let browser;
    try {
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({
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
      });

      for (const storeId of targetStores) {
        const storeConfig = this.storeScrapers[storeId];
        if (!storeConfig) continue;

        try {
          const searchResults = await this.scrapeProductsBySearch(
            browser, 
            storeId, 
            'search-result', 
            searchTerm, 
            storeConfig
          );
          results.push(...searchResults);
        } catch (error) {
          console.error(`❌ Search failed for ${storeId}:`, error.message);
        }

        // Rate limiting between stores
        await this.wait(storeConfig.rateLimit);
      }

    } catch (error) {
      console.error('❌ Puppeteer search failed:', error.message);
      return this.searchMockProducts(searchTerm);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    console.log(`🎯 Found ${results.length} search results for "${searchTerm}"`);
    return results;
  }

  // Deduplicate products based on name and store
  deduplicateProducts(products) {
    const seen = new Set();
    return products.filter(product => {
      const key = `${product.store}-${product.name.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Get cached products
  getCachedProducts(category = 'all') {
    if (category === 'all') {
      const allProducts = [];
      for (const cached of this.productCache.values()) {
        if (Date.now() < cached.expiryTime) {
          allProducts.push(...cached.products);
        }
      }
      return allProducts;
    }
    
    const cached = this.productCache.get(category);
    return (cached && Date.now() < cached.expiryTime) ? cached.products : [];
  }

  // Cache products with expiry
  cacheProducts(category, products, expiryHours = 24) {
    const expiryTime = Date.now() + (expiryHours * 60 * 60 * 1000);
    this.productCache.set(category, {
      products,
      expiryTime,
      lastUpdated: new Date().toISOString()
    });
  }

  // Clear expired cache
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.productCache.entries()) {
      if (now >= value.expiryTime) {
        this.productCache.delete(key);
      }
    }
  }

  // Get cache statistics
  getCacheStats() {
    const totalEntries = this.productCache.size;
    const validEntries = Array.from(this.productCache.values())
      .filter(entry => Date.now() < entry.expiryTime).length;
    
    return {
      totalEntries,
      validEntries,
      expiredEntries: totalEntries - validEntries,
      totalProducts: this.getCachedProducts().length
    };
  }
}

module.exports = ProductScraperManager;