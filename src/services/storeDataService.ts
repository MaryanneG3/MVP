// Store data service for fetching real scraped store information
export interface StoreDataResponse {
  stores: any[];
  lastUpdated: string;
  totalCount: number;
  regions: string[];
  scrapingStatus?: {
    isActive: boolean;
    lastErrors: any[];
  };
}

export interface PriceUpdateResponse {
  productId: string;
  productName: string;
  prices: any[];
  lastUpdated: string;
  success: boolean;
  cacheStats?: any;
}

class StoreDataService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
  }

  // Helper method to handle fetch with timeout and better error handling
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 30000): Promise<Response> {
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
          throw new Error(`Request timeout after ${timeout}ms - web scraping may be in progress`);
        }
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error(`Backend server is not accessible at ${this.baseUrl}. Please ensure the backend server is running on port 3001.`);
        }
        
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          throw new Error(`Network error: Unable to connect to backend server at ${this.baseUrl}. Check if the server is running and accessible.`);
        }
      }
      
      throw error;
    }
  }

  // Test backend connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl.replace('/api', '')}/health`, {}, 5000);
      return response.ok;
    } catch (error) {
      console.warn('Backend connectivity test failed:', error);
      return false;
    }
  }

  // Fetch all store locations from real web scraping
  async getAllStores(): Promise<StoreDataResponse> {
    try {
      console.log('🔍 Fetching live store data from web scraping...');
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/stores/all`, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      }, 60000); // Increased timeout for scraping operations

      if (!response.ok) {
        throw new Error(`Failed to fetch stores: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Received ${data.totalCount} stores from web scraping`);
      
      return data;
    } catch (error) {
      console.error('Error fetching live store data:', error);
      throw new Error(`Failed to fetch live store data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch stores by region
  async getStoresByRegion(region: string): Promise<StoreDataResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/stores/region/${encodeURIComponent(region)}`, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stores for region: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching regional store data:', error);
      throw new Error(`Failed to fetch regional store data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Fetch live prices for a specific product using real web scraping
  async getLivePrices(productName: string, storeIds?: string[]): Promise<PriceUpdateResponse> {
    try {
      console.log(`💰 Fetching live prices for: ${productName}`);
      
      const params = new URLSearchParams({ 
        productName,
        productId: productName // Fallback
      });
      
      if (storeIds && storeIds.length > 0) {
        params.append('stores', storeIds.join(','));
      }

      const response = await this.fetchWithTimeout(`${this.baseUrl}/prices/live?${params}`, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      }, 90000); // Extended timeout for price scraping

      if (!response.ok) {
        throw new Error(`Failed to fetch live prices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Received ${data.prices.length} live prices for ${productName}`);
      
      return data;
    } catch (error) {
      console.error('Error fetching live prices:', error);
      throw new Error(`Failed to fetch live prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Trigger manual data refresh (web scraping)
  async refreshStoreData(): Promise<{ success: boolean; message: string; totalStores?: number }> {
    try {
      console.log('🔄 Triggering manual store data refresh (web scraping)...');
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/stores/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      }, 300000); // 5 minutes timeout for comprehensive scraping

      if (!response.ok) {
        throw new Error(`Failed to refresh store data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Store data refresh completed: ${data.totalStores} stores`);
      
      return data;
    } catch (error) {
      console.error('Error refreshing store data:', error);
      throw new Error(`Failed to refresh store data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Trigger manual price refresh
  async refreshPriceData(productName: string, storeIds?: string[]): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 Triggering manual price refresh for: ${productName}`);
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/prices/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName,
          storeIds: storeIds || []
        })
      }, 120000); // 2 minutes timeout for price scraping

      if (!response.ok) {
        throw new Error(`Failed to refresh price data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Price refresh completed: ${data.prices?.length || 0} prices`);
      
      return data;
    } catch (error) {
      console.error('Error refreshing price data:', error);
      throw new Error(`Failed to refresh price data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get data freshness status
  async getDataStatus(): Promise<{
    lastStoreUpdate: string;
    lastPriceUpdate: string;
    totalStores: number;
    activeScrapers: string[];
    nextScheduledUpdate: string;
    scrapingStatus?: any;
    priceCache?: any;
  }> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/status`, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data status: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching data status:', error);
      throw new Error(`Failed to fetch data status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const storeDataService = new StoreDataService();