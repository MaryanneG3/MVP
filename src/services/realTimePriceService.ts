// Real-time price service for fetching live prices from actual store websites
export interface RealTimePriceResponse {
  products: Array<{
    productId: string;
    productName: string;
    prices: Array<{
      storeId: string;
      storeName: string;
      productName: string;
      brand: string;
      price: number;
      originalPrice?: number;
      onSale: boolean;
      currency: string;
      inStock: boolean;
      url: string;
      image: string;
      matchScore: number;
      lastUpdated: string;
      source: string;
    }>;
    totalPricesFound: number;
    lastUpdated: string;
  }>;
  totalProducts: number;
  cachedResults: number;
  freshResults: number;
  lastUpdated: string;
  success: boolean;
  scrapingStatus?: {
    isActive: boolean;
  };
}

export interface BulkPriceUpdateResponse {
  success: boolean;
  message: string;
  productsQueued: number;
  estimatedDuration: string;
}

class RealTimePriceService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
  }

  // Helper method to handle fetch with timeout
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 60000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms - real-time price scraping may be in progress`);
        }
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error(`Backend server is not accessible at ${this.baseUrl}. Please ensure the backend server is running on port 3001.`);
        }
      }
      
      throw error;
    }
  }

  // Fetch real-time prices for specific products
  async getRealTimePrices(productIds: string[], forceRefresh = false): Promise<RealTimePriceResponse> {
    try {
      console.log(`💰 Fetching real-time prices for ${productIds.length} products...`);
      
      const params = new URLSearchParams({
        productIds: productIds.join(','),
        forceRefresh: forceRefresh.toString()
      });

      const response = await this.fetchWithTimeout(`${this.baseUrl}/prices/real-time?${params}`, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      }, 120000); // 2 minutes timeout for real-time scraping

      if (!response.ok) {
        throw new Error(`Failed to fetch real-time prices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Received real-time prices for ${data.totalProducts} products (${data.freshResults} fresh, ${data.cachedResults} cached)`);
      
      return data;
    } catch (error) {
      console.error('Error fetching real-time prices:', error);
      throw new Error(`Failed to fetch real-time prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Trigger bulk price update for all products
  async updateAllPrices(limit = 50): Promise<BulkPriceUpdateResponse> {
    try {
      console.log(`🔄 Triggering bulk price update for up to ${limit} products...`);
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/prices/update-all`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ limit })
      }, 10000); // 10 seconds timeout for triggering (async operation)

      if (!response.ok) {
        throw new Error(`Failed to trigger bulk price update: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Bulk price update started: ${data.productsQueued} products queued`);
      
      return data;
    } catch (error) {
      console.error('Error triggering bulk price update:', error);
      throw new Error(`Failed to trigger bulk price update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get price update status
  async getPriceUpdateStatus(): Promise<{
    isScrapingRealTimePrices: boolean;
    totalRealTimePrices: number;
    lastPriceUpdate: string | null;
  }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/status`, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch price update status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        isScrapingRealTimePrices: data.scrapingStatus?.isScrapingRealTimePrices || false,
        totalRealTimePrices: data.totalRealTimePrices || 0,
        lastPriceUpdate: data.lastPriceUpdate
      };
    } catch (error) {
      console.error('Error fetching price update status:', error);
      throw new Error(`Failed to fetch price update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get cached price data for a product
  async getCachedPrices(productId: string): Promise<any> {
    try {
      const response = await this.getRealTimePrices([productId], false);
      const productData = response.products.find(p => p.productId === productId);
      return productData?.prices || [];
    } catch (error) {
      console.warn('Failed to get cached prices:', error);
      return [];
    }
  }

  // Format price data for display
  formatPriceData(priceData: any[]) {
    return priceData.map(price => ({
      storeId: price.storeId,
      storeName: price.storeName,
      productName: price.productName,
      brand: price.brand,
      price: price.price,
      originalPrice: price.originalPrice,
      onSale: price.onSale,
      currency: price.currency,
      inStock: price.inStock,
      url: price.url,
      image: price.image,
      matchScore: price.matchScore,
      lastUpdated: price.lastUpdated,
      source: price.source,
      confidence: this.getConfidenceLevel(price.matchScore)
    }));
  }

  // Get confidence level based on match score
  private getConfidenceLevel(matchScore: number): 'high' | 'medium' | 'low' {
    if (matchScore >= 90) return 'high';
    if (matchScore >= 70) return 'medium';
    return 'low';
  }

  // Check if prices are recent (within last hour)
  areRecentPrices(lastUpdated: string): boolean {
    const updateTime = new Date(lastUpdated);
    const now = new Date();
    const hoursDiff = (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 1;
  }

  // Get price comparison summary
  getPriceComparison(prices: any[]) {
    if (prices.length === 0) return null;

    const inStockPrices = prices.filter(p => p.inStock);
    const allPrices = prices.map(p => p.price);
    const inStockPricesOnly = inStockPrices.map(p => p.price);

    return {
      totalStores: prices.length,
      inStockStores: inStockPrices.length,
      lowestPrice: Math.min(...(inStockPricesOnly.length > 0 ? inStockPricesOnly : allPrices)),
      highestPrice: Math.max(...allPrices),
      averagePrice: allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length,
      potentialSavings: Math.max(...allPrices) - Math.min(...(inStockPricesOnly.length > 0 ? inStockPricesOnly : allPrices)),
      onSaleCount: prices.filter(p => p.onSale).length
    };
  }
}

export const realTimePriceService = new RealTimePriceService();