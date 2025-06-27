// React hook for managing real scraped product data with comprehensive fallback and slow loading suggestions
import { useState, useEffect, useCallback, useRef } from 'react';
import { productDataService } from '../services/productDataService';
import { Product } from '../types';

interface UseProductDataReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refreshData: () => Promise<void>;
  searchProducts: (searchTerm: string, storeIds?: string[]) => Promise<Product[]>;
  categories: string[];
  productsByCategory: Record<string, Product[]>;
  totalProducts: number;
  isSlowLoading: boolean;
  suggestMockData: boolean;
  useMockData: () => void;
  loadingTime: number;
}

export function useProductData(): UseProductDataReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [suggestMockData, setSuggestMockData] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);
  
  const loadingStartTime = useRef<number>(0);
  const slowLoadingTimer = useRef<NodeJS.Timeout | null>(null);
  const mockDataSuggestionTimer = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeInterval = useRef<NodeJS.Timeout | null>(null);

  // Load real product data from web scraping with comprehensive fallback
  const loadProductData = useCallback(async (forceMockData = false) => {
    try {
      setLoading(true);
      setError(null);
      setIsSlowLoading(false);
      setSuggestMockData(false);
      loadingStartTime.current = Date.now();
      setLoadingTime(0);
      
      // Clear any existing timers
      if (slowLoadingTimer.current) clearTimeout(slowLoadingTimer.current);
      if (mockDataSuggestionTimer.current) clearTimeout(mockDataSuggestionTimer.current);
      if (loadingTimeInterval.current) clearInterval(loadingTimeInterval.current);
      
      // Start loading time counter
      loadingTimeInterval.current = setInterval(() => {
        setLoadingTime(Math.round((Date.now() - loadingStartTime.current) / 1000));
      }, 1000);
      
      // Set slow loading indicator after 10 seconds (products take longer)
      slowLoadingTimer.current = setTimeout(() => {
        setIsSlowLoading(true);
        console.log('⏳ Product data loading is taking longer than expected...');
      }, 10000);
      
      // Suggest mock data after 20 seconds (products are more complex to scrape)
      mockDataSuggestionTimer.current = setTimeout(() => {
        setSuggestMockData(true);
        console.log('💡 Suggesting mock data due to slow product loading...');
      }, 20000);
      
      if (forceMockData) {
        console.log('📋 Using comprehensive mock product data as requested...');
        const fallbackProducts = getComprehensiveFallbackProducts();
        const categorizedProducts = categorizeProducts(fallbackProducts);
        const uniqueCategories = Object.keys(categorizedProducts);
        
        setProducts(fallbackProducts);
        setProductsByCategory(categorizedProducts);
        setCategories(uniqueCategories);
        setLastUpdated(new Date().toISOString());
        setUsingMockData(true);
        
        console.log(`📋 Loaded ${fallbackProducts.length} mock products with comprehensive real data`);
        return;
      }
      
      console.log('🛍️ Loading live product data...');
      const response = await productDataService.getAllProducts();
      
      // Convert API response to our Product format with proper categorization
      const formattedProducts: Product[] = response.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        brand: product.brand || 'Unknown',
        category: mapCategory(product.category),
        subcategory: formatSubcategory(product.subcategory || product.category),
        image: product.image || getDefaultImage(product.category),
        description: product.description || `${product.brand} ${product.name}`,
        price: product.price,
        store: product.store,
        inStock: product.inStock !== false,
        source: product.source || 'scraped',
        lastUpdated: product.lastUpdated
      }));
      
      // Categorize products
      const categorizedProducts = categorizeProducts(formattedProducts);
      const uniqueCategories = Object.keys(categorizedProducts);
      
      setProducts(formattedProducts);
      setProductsByCategory(categorizedProducts);
      setCategories(uniqueCategories);
      setLastUpdated(response.lastUpdated);
      setUsingMockData(false);
      
      console.log(`✅ Loaded ${formattedProducts.length} real products from web scraping`);
      console.log(`📂 Categories found: ${uniqueCategories.join(', ')}`);
      
    } catch (err) {
      console.error('Failed to load live product data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load product data');
      
      // Load comprehensive fallback products when API fails
      console.log('🔄 Loading comprehensive fallback product data...');
      const fallbackProducts = getComprehensiveFallbackProducts();
      const categorizedProducts = categorizeProducts(fallbackProducts);
      const uniqueCategories = Object.keys(categorizedProducts);
      
      setProducts(fallbackProducts);
      setProductsByCategory(categorizedProducts);
      setCategories(uniqueCategories);
      setLastUpdated(new Date().toISOString());
      setUsingMockData(true);
      
      console.log(`📋 Loaded ${fallbackProducts.length} fallback products with comprehensive real data`);
    } finally {
      setLoading(false);
      setIsSlowLoading(false);
      setSuggestMockData(false);
      
      // Clear timers
      if (slowLoadingTimer.current) clearTimeout(slowLoadingTimer.current);
      if (mockDataSuggestionTimer.current) clearTimeout(mockDataSuggestionTimer.current);
      if (loadingTimeInterval.current) clearInterval(loadingTimeInterval.current);
      
      // Final loading time
      setLoadingTime(Math.round((Date.now() - loadingStartTime.current) / 1000));
    }
  }, []);

  // Function to use mock data immediately
  const useMockData = useCallback(() => {
    loadProductData(true);
  }, [loadProductData]);

  // Search products using live web scraping
  const searchProducts = useCallback(async (searchTerm: string, storeIds?: string[]): Promise<Product[]> => {
    try {
      console.log(`🔍 Live product search for: ${searchTerm}`);
      const response = await productDataService.searchProducts(searchTerm, storeIds);
      
      const searchResults: Product[] = response.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        brand: product.brand || 'Unknown',
        category: mapCategory(product.category),
        subcategory: formatSubcategory(product.subcategory || 'search-result'),
        image: product.image || getDefaultImage(product.category),
        description: product.description || `${product.brand} ${product.name}`,
        price: product.price,
        store: product.store,
        inStock: product.inStock !== false,
        source: product.source || 'search',
        lastUpdated: product.lastUpdated
      }));
      
      console.log(`✅ Found ${searchResults.length} live search results`);
      return searchResults;
    } catch (err) {
      console.error('Failed to search live products:', err);
      
      // Fallback to searching within loaded products
      const fallbackResults = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      console.log(`📋 Using fallback search: ${fallbackResults.length} results`);
      return fallbackResults;
    }
  }, [products]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Triggering manual product data refresh...');
      
      await productDataService.refreshProductData();
      await loadProductData();
      
      console.log('✅ Manual product data refresh completed');
    } catch (err) {
      console.error('Manual product refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh product data');
    }
  }, [loadProductData]);

  // Load data on mount
  useEffect(() => {
    loadProductData();
  }, [loadProductData]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (slowLoadingTimer.current) clearTimeout(slowLoadingTimer.current);
      if (mockDataSuggestionTimer.current) clearTimeout(mockDataSuggestionTimer.current);
      if (loadingTimeInterval.current) clearInterval(loadingTimeInterval.current);
    };
  }, []);

  return {
    products,
    loading,
    error,
    lastUpdated,
    refreshData,
    searchProducts,
    categories,
    productsByCategory,
    totalProducts: products.length,
    isSlowLoading,
    suggestMockData,
    useMockData,
    loadingTime
  };
}

// Comprehensive fallback product data matching backend structure
function getComprehensiveFallbackProducts(): Product[] {
  return [
    // BUNNINGS PRODUCTS (Real products from bunnings.co.nz)
    {
      id: 'bunnings-makita-dhp484z',
      name: 'Makita 18V LXT Brushless Hammer Driver Drill - Tool Only',
      brand: 'Makita',
      category: 'hardware',
      subcategory: 'Power Tools',
      description: 'DHP484Z 18V LXT Brushless 13mm Hammer Driver Drill with variable speed control',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'bunnings-dewalt-dcd796n',
      name: 'DeWalt 18V XR Li-Ion Brushless Compact Combi Drill - Bare Unit',
      brand: 'DeWalt',
      category: 'hardware',
      subcategory: 'Power Tools',
      description: 'DCD796N 18V XR Brushless Combi Drill with LED work light and belt clip',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'bunnings-stanley-hammer',
      name: 'Stanley FatMax Anti-Vibe Claw Hammer 450g',
      brand: 'Stanley',
      category: 'hardware',
      subcategory: 'Hand Tools',
      description: 'Steel handle claw hammer with anti-vibration technology and comfortable grip',
      image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'bunnings-holman-pvc-pipe',
      name: 'Holman 20mm Class 12 PVC Pressure Pipe - 6m',
      brand: 'Holman',
      category: 'plumbing',
      subcategory: 'Pipes & Fittings',
      description: '20mm Class 12 PVC pressure pipe suitable for cold water applications',
      image: 'https://images.pexels.com/photos/8486916/pexels-photo-8486916.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'bunnings-olex-tps-cable',
      name: 'Olex 2.5mm² Twin & Earth TPS Cable - 100m',
      brand: 'Olex',
      category: 'electrical',
      subcategory: 'Cable & Wire',
      description: '2.5mm² Twin & Earth TPS electrical cable for domestic wiring',
      image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400'
    },

    // MITRE 10 PRODUCTS (Real products from mitre10.co.nz)
    {
      id: 'mitre10-milwaukee-m18fpd',
      name: 'Milwaukee M18 FUEL 13mm Percussion Drill - Tool Only',
      brand: 'Milwaukee',
      category: 'hardware',
      subcategory: 'Power Tools',
      description: 'M18 FUEL brushless percussion drill with REDLINK PLUS intelligence',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'mitre10-bahco-adjustable-wrench',
      name: 'Bahco 250mm Adjustable Wrench Chrome Vanadium',
      brand: 'Bahco',
      category: 'hardware',
      subcategory: 'Hand Tools',
      description: '250mm adjustable wrench with chrome vanadium steel construction',
      image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'mitre10-caroma-basin-mixer',
      name: 'Caroma Liano Nexus Basin Mixer Chrome',
      brand: 'Caroma',
      category: 'plumbing',
      subcategory: 'Taps & Mixers',
      description: 'Liano Nexus basin mixer with pop-up waste in chrome finish',
      image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'mitre10-clipsal-switch',
      name: 'Clipsal Iconic 1 Gang 2 Way Switch 10A White',
      brand: 'Clipsal',
      category: 'electrical',
      subcategory: 'Switches & Outlets',
      description: 'Iconic series 1 gang 2 way switch in white with modern design',
      image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400'
    },

    // PLACEMAKERS PRODUCTS (Real products from placemakers.co.nz)
    {
      id: 'placemakers-gib-plasterboard',
      name: 'GIB Standard Plasterboard 10mm x 1200 x 2400mm',
      brand: 'GIB',
      category: 'hardware',
      subcategory: 'Building Materials',
      description: 'Standard plasterboard sheet for interior wall and ceiling linings',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'placemakers-james-hardie-weatherboard',
      name: 'James Hardie Linea Weatherboard 180mm x 3600mm',
      brand: 'James Hardie',
      category: 'hardware',
      subcategory: 'Cladding',
      description: 'Linea weatherboard cladding with smooth finish for modern homes',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'placemakers-carter-holt-h3-framing',
      name: 'Carter Holt Harvey H3 Treated Pine 90x45mm x 2.4m',
      brand: 'Carter Holt Harvey',
      category: 'hardware',
      subcategory: 'Timber',
      description: 'H3 treated pine framing timber for structural applications',
      image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
    },

    // REPCO PRODUCTS (Real products from repco.co.nz)
    {
      id: 'repco-castrol-gtx-5w30',
      name: 'Castrol GTX High Mileage 5W-30 Engine Oil - 5L',
      brand: 'Castrol',
      category: 'automotive',
      subcategory: 'Oils & Fluids',
      description: 'High mileage engine oil for vehicles with over 75,000km',
      image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'repco-ryco-oil-filter',
      name: 'Ryco Oil Filter Z516 - Suits Toyota, Mazda, Subaru',
      brand: 'Ryco',
      category: 'automotive',
      subcategory: 'Filters',
      description: 'Premium oil filter for Toyota, Mazda and Subaru vehicles',
      image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'repco-century-battery-ns70',
      name: 'Century NS70 Automotive Battery 65Ah',
      brand: 'Century',
      category: 'automotive',
      subcategory: 'Batteries',
      description: 'NS70 automotive battery with 24 month warranty and 65Ah capacity',
      image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'repco-bendix-brake-pads',
      name: 'Bendix General CT Brake Pads - Front Set',
      brand: 'Bendix',
      category: 'automotive',
      subcategory: 'Brakes',
      description: 'General CT brake pads for reliable everyday braking performance',
      image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=400'
    },

    // SUPERCHEAP AUTO PRODUCTS (Real products from supercheapauto.co.nz)
    {
      id: 'supercheap-sca-engine-oil',
      name: 'SCA 10W-40 Semi Synthetic Engine Oil - 5L',
      brand: 'SCA',
      category: 'automotive',
      subcategory: 'Oils & Fluids',
      description: 'Semi synthetic engine oil suitable for most petrol engines',
      image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'supercheap-sca-socket-set',
      name: 'SCA Socket Set - 72 Piece Metric & Imperial',
      brand: 'SCA',
      category: 'hardware',
      subcategory: 'Hand Tools',
      description: '72 piece socket set with metric and imperial sockets in carry case',
      image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'supercheap-armor-all-protectant',
      name: 'Armor All Original Protectant - 500ml',
      brand: 'Armor All',
      category: 'automotive',
      subcategory: 'Care Products',
      description: 'Original protectant for vinyl, rubber and plastic surfaces',
      image: 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=400'
    },

    // GARDENING PRODUCTS
    {
      id: 'bunnings-fiskars-pruning-shears',
      name: 'Fiskars PowerGear Bypass Pruning Shears 20mm',
      brand: 'Fiskars',
      category: 'gardening',
      subcategory: 'Garden Tools',
      description: 'PowerGear bypass pruning shears with 20mm cutting capacity',
      image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'mitre10-husqvarna-chainsaw',
      name: 'Husqvarna 120 Mark II Chainsaw 35cm Bar',
      brand: 'Husqvarna',
      category: 'gardening',
      subcategory: 'Power Equipment',
      description: '120 Mark II chainsaw with 35cm bar and 38.2cc engine',
      image: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400'
    },

    // ELECTRICAL PRODUCTS
    {
      id: 'bunnings-pdl-iconic-outlet',
      name: 'PDL Iconic 10A Power Outlet White',
      brand: 'PDL',
      category: 'electrical',
      subcategory: 'Switches & Outlets',
      description: 'Iconic series 10A power outlet in white with modern design',
      image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'mitre10-clipsal-rcbo',
      name: 'Clipsal RCBO 20A Single Pole 30mA Type C',
      brand: 'Clipsal',
      category: 'electrical',
      subcategory: 'Circuit Protection',
      description: 'RCBO 20A single pole with 30mA earth leakage protection',
      image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400'
    },

    // PLUMBING PRODUCTS
    {
      id: 'bunnings-methven-shower-head',
      name: 'Methven Satinjet Twin Shower Head Chrome 100mm',
      brand: 'Methven',
      category: 'plumbing',
      subcategory: 'Shower Fittings',
      description: 'Satinjet twin shower head in chrome with 100mm diameter',
      image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'placemakers-marley-spouting',
      name: 'Marley Stratus Design Series Spouting 150mm x 3m',
      brand: 'Marley',
      category: 'plumbing',
      subcategory: 'Drainage',
      description: 'Stratus design series spouting in Colorsteel finish',
      image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];
}

// Helper function to categorize products
function categorizeProducts(products: Product[]): Record<string, Product[]> {
  const categorized: Record<string, Product[]> = {};
  
  products.forEach(product => {
    const category = product.category;
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(product);
  });
  
  return categorized;
}

// Helper function to map categories to our standard format
function mapCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'power-tools': 'hardware',
    'hand-tools': 'hardware',
    'plumbing': 'plumbing',
    'electrical': 'electrical',
    'automotive': 'automotive',
    'gardening': 'gardening',
    'search-result': 'hardware'
  };
  
  return categoryMap[category] || 'hardware';
}

// Helper function to format subcategories
function formatSubcategory(subcategory: string): string {
  return subcategory
    .replace('-', ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to get default images
function getDefaultImage(category: string): string {
  const imageMap: Record<string, string> = {
    'power-tools': 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400',
    'hand-tools': 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=400',
    'plumbing': 'https://images.pexels.com/photos/8486916/pexels-photo-8486916.jpeg?auto=compress&cs=tinysrgb&w=400',
    'electrical': 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
    'automotive': 'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=400',
    'gardening': 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=400',
    'hardware': 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=400'
  };
  
  return imageMap[category] || imageMap['hardware'];
}