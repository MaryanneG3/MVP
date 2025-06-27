// Specialized scraper for Supercheap Auto stores
const puppeteer = require('puppeteer');

class SupercheapAutoScraper {
  constructor() {
    this.baseUrl = 'https://www.supercheapauto.co.nz';
    this.storeLocatorUrl = `${this.baseUrl}/stores`;
  }

  async scrapeAllStores() {
    console.log('Starting Supercheap Auto store scraping...');
    
    const browser = await puppeteer.launch({
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

    try {
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await page.goto(this.storeLocatorUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await page.waitForTimeout(3000);

      const stores = await this.extractStoreData(page);
      
      console.log(`Found ${stores.length} Supercheap Auto stores`);
      return stores;
      
    } catch (error) {
      console.error('Error scraping Supercheap Auto stores:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  async extractStoreData(page) {
    const stores = [];
    
    try {
      // Look for JSON data
      const jsonStores = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        for (let script of scripts) {
          const content = script.textContent;
          if (content && content.includes('stores') && content.includes('latitude')) {
            try {
              const matches = content.match(/stores["\']?\s*:\s*(\[.*?\])/);
              if (matches) {
                return JSON.parse(matches[1]);
              }
            } catch (e) {
              continue;
            }
          }
        }
        return [];
      });
      
      if (jsonStores.length > 0) {
        stores.push(...this.formatStoreData(jsonStores, 'json'));
      }

      // Scrape DOM elements
      const domStores = await page.evaluate(() => {
        const storeElements = document.querySelectorAll('.store-card, .store-item, .location-card, [data-store]');
        return Array.from(storeElements).map(element => {
          const name = element.querySelector('.store-name, .name, h3, h4')?.textContent?.trim();
          const address = element.querySelector('.address, .store-address')?.textContent?.trim();
          const phone = element.querySelector('.phone, .store-phone')?.textContent?.trim();
          const hours = element.querySelector('.hours, .store-hours')?.textContent?.trim();
          
          return { name, address, phone, hours };
        }).filter(store => store.name && store.address);
      });
      
      if (domStores.length > 0) {
        stores.push(...this.formatStoreData(domStores, 'dom'));
      }

    } catch (error) {
      console.error('Error extracting Supercheap Auto store data:', error);
    }
    
    return this.deduplicateStores(stores);
  }

  formatStoreData(rawStores, source) {
    return rawStores.map(store => ({
      id: `supercheap-auto-${this.generateStoreId(store)}`,
      chain: 'supercheap-auto',
      name: 'Supercheap Auto',
      storeName: store.name || store.storeName,
      address: {
        street: this.extractStreetAddress(store.address),
        suburb: this.extractSuburb(store.address),
        city: this.extractCity(store.address),
        region: this.extractRegion(store.address),
        postcode: this.extractPostcode(store.address)
      },
      contact: {
        phone: this.formatPhoneNumber(store.phone)
      },
      coordinates: {
        latitude: store.latitude || store.lat,
        longitude: store.longitude || store.lng,
        accuracy: 50,
        verified: source === 'json'
      },
      hours: this.parseStoreHours(store.hours),
      source: source,
      lastUpdated: new Date().toISOString()
    })).filter(store => store.storeName && store.address.street);
  }

  generateStoreId(store) {
    const name = (store.name || store.storeName || '').toLowerCase();
    const address = (store.address || '').toLowerCase();
    return name.replace(/[^a-z0-9]/g, '-') + '-' + 
           address.split(',')[0].replace(/[^a-z0-9]/g, '-');
  }

  extractStreetAddress(fullAddress) {
    if (!fullAddress) return '';
    return fullAddress.split(',')[0]?.trim() || '';
  }

  extractSuburb(fullAddress) {
    if (!fullAddress) return '';
    const parts = fullAddress.split(',');
    return parts[1]?.trim() || '';
  }

  extractCity(fullAddress) {
    if (!fullAddress) return '';
    const parts = fullAddress.split(',');
    return parts[parts.length - 2]?.trim() || '';
  }

  extractRegion(fullAddress) {
    const regionMap = {
      'auckland': 'Auckland',
      'wellington': 'Wellington',
      'christchurch': 'Canterbury',
      'hamilton': 'Waikato',
      'tauranga': 'Bay of Plenty',
      'dunedin': 'Otago',
      'palmerston north': 'Manawatu-Whanganui',
      'nelson': 'Nelson',
      'rotorua': 'Bay of Plenty',
      'new plymouth': 'Taranaki',
      'whangarei': 'Northland',
      'invercargill': 'Southland'
    };
    
    const city = this.extractCity(fullAddress).toLowerCase();
    return regionMap[city] || 'Auckland';
  }

  extractPostcode(fullAddress) {
    if (!fullAddress) return '';
    const postcodeMatch = fullAddress.match(/\b\d{4}\b/);
    return postcodeMatch ? postcodeMatch[0] : '';
  }

  formatPhoneNumber(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('64')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+64${digits.substring(1)}`;
    }
    return phone;
  }

  parseStoreHours(hoursText) {
    const defaultHours = {
      monday: { open: '08:00', close: '17:30' },
      tuesday: { open: '08:00', close: '17:30' },
      wednesday: { open: '08:00', close: '17:30' },
      thursday: { open: '08:00', close: '17:30' },
      friday: { open: '08:00', close: '17:30' },
      saturday: { open: '08:00', close: '17:00' },
      sunday: { open: '09:00', close: '16:00' }
    };
    
    return defaultHours;
  }

  deduplicateStores(stores) {
    const seen = new Set();
    return stores.filter(store => {
      const key = `${store.storeName}-${store.address.street}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

module.exports = SupercheapAutoScraper;