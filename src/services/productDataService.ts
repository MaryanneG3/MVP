// Product data service for fetching real scraped products
export interface ProductDataResponse {
  products: any[];
  totalCount: number;
  lastUpdated: string;
  categories: string[];
  scrapingStatus?: {
    isActive: boolean;
  };
}

export interface ProductSearchResponse {
  products: any[];
  totalCount: number;
  searchTerm: string;
  lastUpdated: string;
  success: boolean;
}

class ProductDataService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.apiKey = import.meta.env.VITE_API_KEY || '';
  }

  // Helper method to handle fetch with timeout
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
          throw new Error(`Request timeout after ${timeout}ms - product scraping may be in progress`);
        }
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error(`Backend server is not accessible at ${this.baseUrl}. Please ensure the backend server is running on port 3001.`);
        }
      }
      
      throw error;
    }
  }

  // Fetch all products from real web scraping
  async getAllProducts(category?: string, search?: string, limit?: number): Promise<ProductDataResponse> {
    try {
      console.log('🛍️ Fetching live product data from web scraping...');
      
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (limit) params.append('limit', limit.toString());
      
      const url = `${this.baseUrl}/products/all${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await this.fetchWithTimeout(url, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      }, 60000); // Increased timeout for product scraping

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Received ${data.totalCount} products from web scraping`);
      
      return data;
    } catch (error) {
      console.error('Error fetching live product data:', error);
      throw new Error(`Failed to fetch live product data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Search products using real web scraping
  async searchProducts(searchTerm: string, storeIds?: string[]): Promise<ProductSearchResponse> {
    try {
      console.log(`🔍 Searching live products for: ${searchTerm}`);
      
      const params = new URLSearchParams({ q: searchTerm });
      if (storeIds && storeIds.length > 0) {
        params.append('stores', storeIds.join(','));
      }

      const response = await this.fetchWithTimeout(`${this.baseUrl}/products/search?${params}`, {
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      }, 90000); // Extended timeout for live search

      if (!response.ok) {
        throw new Error(`Failed to search products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Found ${data.totalCount} live search results for "${searchTerm}"`);
      
      return data;
    } catch (error) {
      console.error('Error searching live products:', error);
      throw new Error(`Failed to search live products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Trigger manual product data refresh
  async refreshProductData(): Promise<{ success: boolean; message: string; totalProducts?: number }> {
    try {
      console.log('🔄 Triggering manual product data refresh (web scraping)...');
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/products/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey ? `Bearer ${this.apiKey}` : '',
          'Content-Type': 'application/json'
        }
      }, 600000); // 10 minutes timeout for comprehensive product scraping

      if (!response.ok) {
        throw new Error(`Failed to refresh product data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Product data refresh completed: ${data.totalProducts} products`);
      
      return data;
    } catch (error) {
      console.error('Error refreshing product data:', error);
      throw new Error(`Failed to refresh product data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const productDataService = new ProductDataService();