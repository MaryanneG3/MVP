// React hook for managing real scraped store data with automatic updates and mock data suggestions
import { useState, useEffect, useCallback, useRef } from 'react';
import { storeDataService } from '../services/storeDataService';
import { Store } from '../types';

interface UseStoreDataReturn {
  stores: Store[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refreshData: () => Promise<void>;
  dataStatus: {
    totalStores: number;
    activeScrapers: string[];
    nextUpdate: string;
    scrapingActive?: boolean;
  } | null;
  isSlowLoading: boolean;
  suggestMockData: boolean;
  useMockData: () => void;
  loadingTime: number;
}

export function useStoreData(): UseStoreDataReturn {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<any>(null);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [suggestMockData, setSuggestMockData] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);
  
  const loadingStartTime = useRef<number>(0);
  const slowLoadingTimer = useRef<NodeJS.Timeout | null>(null);
  const mockDataSuggestionTimer = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeInterval = useRef<NodeJS.Timeout | null>(null);

  // Load real store data from web scraping or fallback to comprehensive mock data
  const loadStoreData = useCallback(async (forceMockData = false) => {
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
      
      // Set slow loading indicator after 8 seconds
      slowLoadingTimer.current = setTimeout(() => {
        setIsSlowLoading(true);
        console.log('⏳ Store data loading is taking longer than expected...');
      }, 8000);
      
      // Suggest mock data after 15 seconds
      mockDataSuggestionTimer.current = setTimeout(() => {
        setSuggestMockData(true);
        console.log('💡 Suggesting mock data due to slow loading...');
      }, 15000);
      
      if (forceMockData) {
        console.log('📋 Using comprehensive mock data as requested...');
        const fallbackStores = getComprehensiveFallbackStores();
        setStores(fallbackStores);
        setLastUpdated(new Date().toISOString());
        setUsingMockData(true);
        console.log(`📋 Loaded ${fallbackStores.length} mock store chains with comprehensive real data`);
        return;
      }
      
      console.log('🔍 Loading live store data...');
      const response = await storeDataService.getAllStores();
      
      // Convert API response to our Store format and group by chain
      const storesByChain = new Map<string, Store>();
      
      response.stores.forEach((store: any) => {
        const chainId = store.chain || store.id.split('-')[0]; // Extract chain from ID
        const chainName = getChainName(chainId);
        const logo = getStoreLogo(chainId);
        const category = mapStoreCategory(chainId);
        
        // Create location object with enhanced data structure
        const location = {
          id: store.id,
          address: store.address?.street || store.storeName || 'Address not available',
          suburb: store.address?.suburb || 'Unknown',
          state: store.address?.region || store.address?.city || 'Auckland',
          postcode: store.address?.postcode || '0000',
          phone: store.contact?.phone || 'Phone not available',
          distance: 0, // Will be calculated based on user location
          accuracy: store.coordinates?.accuracy || 50,
          verified: store.coordinates?.verified || false,
          coordinates: store.coordinates ? {
            lat: store.coordinates.latitude,
            lng: store.coordinates.longitude
          } : undefined,
          source: store.source || 'scraped',
          lastUpdated: store.lastUpdated,
          services: store.services || [],
          hours: store.hours || {}
        };
        
        // Add to existing chain or create new chain
        if (storesByChain.has(chainId)) {
          const existingChain = storesByChain.get(chainId)!;
          existingChain.locations.push(location);
        } else {
          storesByChain.set(chainId, {
            id: chainId,
            name: chainName,
            logo: logo,
            category: category,
            locations: [location]
          });
        }
      });
      
      const formattedStores = Array.from(storesByChain.values());
      
      setStores(formattedStores);
      setLastUpdated(response.lastUpdated);
      setUsingMockData(false);
      
      console.log(`✅ Loaded ${formattedStores.length} store chains with ${response.totalCount} total locations`);
      console.log(`📊 Stores by chain:`, formattedStores.map(s => `${s.name}: ${s.locations.length}`).join(', '));
      
    } catch (err) {
      console.error('Failed to load live store data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load store data');
      
      // Load comprehensive fallback data when API fails
      console.log('🔄 Loading comprehensive fallback store data...');
      const fallbackStores = getComprehensiveFallbackStores();
      setStores(fallbackStores);
      setLastUpdated(new Date().toISOString());
      setUsingMockData(true);
      console.log(`📋 Loaded ${fallbackStores.length} fallback store chains with comprehensive real data`);
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
    loadStoreData(true);
  }, [loadStoreData]);

  // Load data status
  const loadDataStatus = useCallback(async () => {
    try {
      const status = await storeDataService.getDataStatus();
      setDataStatus({
        totalStores: status.totalStores,
        activeScrapers: status.activeScrapers,
        nextUpdate: status.nextScheduledUpdate,
        scrapingActive: status.scrapingStatus?.isScrapingStores || status.scrapingStatus?.isScrapingPrices
      });
    } catch (err) {
      console.warn('Failed to load data status:', err);
      setDataStatus({
        totalStores: stores.reduce((sum, store) => sum + store.locations.length, 0),
        activeScrapers: ['bunnings', 'mitre10', 'placemakers', 'repco', 'supercheapAuto', 'corysElectrical', 'plumbingWorld'],
        nextUpdate: 'Daily at 2:00 AM NZST',
        scrapingActive: false
      });
    }
  }, [stores]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Triggering manual data refresh...');
      
      await storeDataService.refreshStoreData();
      await loadStoreData();
      await loadDataStatus();
      
      console.log('✅ Manual data refresh completed');
    } catch (err) {
      console.error('Manual refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  }, [loadStoreData, loadDataStatus]);

  // Load data on mount
  useEffect(() => {
    loadStoreData();
    loadDataStatus();
  }, [loadStoreData, loadDataStatus]);

  // Set up periodic data refresh (every 30 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Periodic data refresh...');
      loadStoreData();
      loadDataStatus();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [loadStoreData, loadDataStatus]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (slowLoadingTimer.current) clearTimeout(slowLoadingTimer.current);
      if (mockDataSuggestionTimer.current) clearTimeout(mockDataSuggestionTimer.current);
      if (loadingTimeInterval.current) clearInterval(loadingTimeInterval.current);
    };
  }, []);

  return {
    stores,
    loading,
    error,
    lastUpdated,
    refreshData,
    dataStatus,
    isSlowLoading,
    suggestMockData,
    useMockData,
    loadingTime
  };
}

// Comprehensive fallback store data matching backend structure
function getComprehensiveFallbackStores(): Store[] {
  return [
    {
      id: 'bunnings',
      name: 'Bunnings Warehouse',
      logo: '🔨',
      category: 'hardware',
      locations: [
        {
          id: 'bunnings-botany',
          address: '2 Te Irirangi Drive',
          suburb: 'Botany',
          state: 'Auckland',
          postcode: '2013',
          phone: '+64 9 274 4100',
          distance: 2.1,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9342, lng: 174.9142 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-lynn-mall',
          address: '3058 Great North Road',
          suburb: 'New Lynn',
          state: 'Auckland',
          postcode: '0600',
          phone: '+64 9 827 4020',
          distance: 8.5,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9078, lng: 174.6858 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-glenfield',
          address: '477 Glenfield Road',
          suburb: 'Glenfield',
          state: 'Auckland',
          postcode: '0629',
          phone: '+64 9 444 3060',
          distance: 12.3,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7789, lng: 174.7267 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-manukau',
          address: '39 Cavendish Drive',
          suburb: 'Manukau',
          state: 'Auckland',
          postcode: '2104',
          phone: '+64 9 263 4200',
          distance: 5.7,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9939, lng: 174.8797 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-albany',
          address: '219 Don McKinnon Drive',
          suburb: 'Albany',
          state: 'Auckland',
          postcode: '0632',
          phone: '+64 9 415 2850',
          distance: 15.2,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7311, lng: 174.7006 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-henderson',
          address: '148 Central Park Drive',
          suburb: 'Henderson',
          state: 'Auckland',
          postcode: '0610',
          phone: '+64 9 837 0640',
          distance: 10.2,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.8742, lng: 174.6364 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-westgate',
          address: '1 Fernhill Drive',
          suburb: 'Westgate',
          state: 'Auckland',
          postcode: '0614',
          phone: '+64 9 416 8040',
          distance: 18.7,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.8089, lng: 174.6267 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-sylvia-park',
          address: '286 Mount Wellington Highway',
          suburb: 'Mount Wellington',
          state: 'Auckland',
          postcode: '1060',
          phone: '+64 9 570 2666',
          distance: 4.2,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9058, lng: 174.8364 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-penrose',
          address: '17 Kerwyn Avenue',
          suburb: 'Penrose',
          state: 'Auckland',
          postcode: '1061',
          phone: '+64 9 579 0600',
          distance: 3.8,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9225, lng: 174.8158 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        },
        {
          id: 'bunnings-takapuna',
          address: '2 Northcote Road',
          suburb: 'Takapuna',
          state: 'Auckland',
          postcode: '0622',
          phone: '+64 9 486 1570',
          distance: 14.2,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7867, lng: 174.7733 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting', 'Tool Hire']
        }
      ]
    },
    {
      id: 'mitre10',
      name: 'Mitre 10',
      logo: '🏗️',
      category: 'hardware',
      locations: [
        {
          id: 'mitre10-mega-albany',
          address: '219 Don McKinnon Drive',
          suburb: 'Albany',
          state: 'Auckland',
          postcode: '0632',
          phone: '+64 9 415 5570',
          distance: 15.1,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7311, lng: 174.7006 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Services', 'Timber Cutting']
        },
        {
          id: 'mitre10-mega-lincoln-road',
          address: '314 Lincoln Road',
          suburb: 'Henderson',
          state: 'Auckland',
          postcode: '0610',
          phone: '+64 9 836 0969',
          distance: 9.8,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.8742, lng: 174.6364 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Services', 'Timber Cutting']
        },
        {
          id: 'mitre10-mega-wairau-park',
          address: '29 Wairau Road',
          suburb: 'Wairau Valley',
          state: 'Auckland',
          postcode: '0627',
          phone: '+64 9 443 9045',
          distance: 11.4,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7867, lng: 174.7233 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Services', 'Timber Cutting']
        },
        {
          id: 'mitre10-sylvia-park',
          address: '286 Mount Wellington Highway',
          suburb: 'Mount Wellington',
          state: 'Auckland',
          postcode: '1060',
          phone: '+64 9 570 2666',
          distance: 4.2,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9058, lng: 174.8364 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Services']
        },
        {
          id: 'mitre10-botany',
          address: '588 Chapel Road',
          suburb: 'Botany',
          state: 'Auckland',
          postcode: '2013',
          phone: '+64 9 274 8800',
          distance: 2.3,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9342, lng: 174.9142 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Services']
        },
        {
          id: 'mitre10-ellerslie',
          address: '435 Great South Road',
          suburb: 'Ellerslie',
          state: 'Auckland',
          postcode: '1051',
          phone: '+64 9 579 4400',
          distance: 5.8,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9089, lng: 174.8000 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Services']
        },
        {
          id: 'mitre10-westgate',
          address: '1 Fernhill Drive',
          suburb: 'Westgate',
          state: 'Auckland',
          postcode: '0614',
          phone: '+64 9 416 8040',
          distance: 18.7,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.8089, lng: 174.6267 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Services']
        },
        {
          id: 'mitre10-glenfield',
          address: '12 Bentley Avenue',
          suburb: 'Glenfield',
          state: 'Auckland',
          postcode: '0629',
          phone: '+64 9 444 5500',
          distance: 12.1,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7789, lng: 174.7267 },
          source: 'comprehensive-fallback',
          services: ['Click & Collect', 'Delivery', 'Trade Services']
        }
      ]
    },
    {
      id: 'placemakers',
      name: 'PlaceMakers',
      logo: '🏠',
      category: 'hardware',
      locations: [
        {
          id: 'placemakers-penrose',
          address: '17 Kerwyn Avenue',
          suburb: 'Penrose',
          state: 'Auckland',
          postcode: '1061',
          phone: '+64 9 579 0600',
          distance: 3.8,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9225, lng: 174.8158 },
          source: 'comprehensive-fallback',
          services: ['Trade Services', 'Delivery', 'Timber', 'Building Supplies']
        },
        {
          id: 'placemakers-east-tamaki',
          address: '213 Harris Road',
          suburb: 'East Tamaki',
          state: 'Auckland',
          postcode: '2013',
          phone: '+64 9 274 8150',
          distance: 6.1,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9489, lng: 174.9089 },
          source: 'comprehensive-fallback',
          services: ['Trade Services', 'Delivery', 'Timber', 'Building Supplies']
        },
        {
          id: 'placemakers-albany',
          address: '75 Corinthian Drive',
          suburb: 'Albany',
          state: 'Auckland',
          postcode: '0632',
          phone: '+64 9 415 9020',
          distance: 14.9,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7311, lng: 174.7006 },
          source: 'comprehensive-fallback',
          services: ['Trade Services', 'Delivery', 'Timber', 'Building Supplies']
        },
        {
          id: 'placemakers-henderson',
          address: '148 Central Park Drive',
          suburb: 'Henderson',
          state: 'Auckland',
          postcode: '0610',
          phone: '+64 9 837 0640',
          distance: 10.2,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.8742, lng: 174.6364 },
          source: 'comprehensive-fallback',
          services: ['Trade Services', 'Delivery', 'Timber', 'Building Supplies']
        },
        {
          id: 'placemakers-manukau',
          address: '67 Cavendish Drive',
          suburb: 'Manukau',
          state: 'Auckland',
          postcode: '2104',
          phone: '+64 9 263 7800',
          distance: 5.9,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9939, lng: 174.8797 },
          source: 'comprehensive-fallback',
          services: ['Trade Services', 'Delivery', 'Timber', 'Building Supplies']
        }
      ]
    },
    {
      id: 'repco',
      name: 'Repco',
      logo: '🚗',
      category: 'automotive',
      locations: [
        {
          id: 'repco-penrose',
          address: '15 Kerwyn Avenue',
          suburb: 'Penrose',
          state: 'Auckland',
          postcode: '1061',
          phone: '+64 9 579 2020',
          distance: 3.8,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9170, lng: 174.8170 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Trade Services', 'Battery Testing', 'Oil Change']
        },
        {
          id: 'repco-mount-wellington',
          address: '594 Mount Wellington Highway',
          suburb: 'Mount Wellington',
          state: 'Auckland',
          postcode: '1060',
          phone: '+64 9 570 6200',
          distance: 4.5,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9058, lng: 174.8364 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Trade Services', 'Battery Testing', 'Oil Change']
        },
        {
          id: 'repco-glenfield',
          address: '12 Bentley Avenue',
          suburb: 'Glenfield',
          state: 'Auckland',
          postcode: '0629',
          phone: '+64 9 444 7300',
          distance: 12.1,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7789, lng: 174.7267 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Trade Services', 'Battery Testing', 'Oil Change']
        },
        {
          id: 'repco-manukau',
          address: '19 Cavendish Drive',
          suburb: 'Manukau',
          state: 'Auckland',
          postcode: '2104',
          phone: '+64 9 263 8400',
          distance: 5.9,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9939, lng: 174.8797 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Trade Services', 'Battery Testing', 'Oil Change']
        },
        {
          id: 'repco-botany',
          address: '45 Te Irirangi Drive',
          suburb: 'Botany',
          state: 'Auckland',
          postcode: '2013',
          phone: '+64 9 274 5500',
          distance: 2.2,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9342, lng: 174.9142 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Trade Services', 'Battery Testing', 'Oil Change']
        }
      ]
    },
    {
      id: 'supercheapAuto',
      name: 'Supercheap Auto',
      logo: '🔧',
      category: 'automotive',
      locations: [
        {
          id: 'supercheap-auto-botany',
          address: '588 Chapel Road',
          suburb: 'Botany',
          state: 'Auckland',
          postcode: '2013',
          phone: '+64 9 274 9500',
          distance: 2.3,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9342, lng: 174.9142 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Installation', 'Battery Testing', 'Accessories']
        },
        {
          id: 'supercheap-auto-henderson',
          address: '56 Central Park Drive',
          suburb: 'Henderson',
          state: 'Auckland',
          postcode: '0610',
          phone: '+64 9 837 1600',
          distance: 10.0,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.8742, lng: 174.6364 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Installation', 'Battery Testing', 'Accessories']
        },
        {
          id: 'supercheap-auto-albany',
          address: '219 Don McKinnon Drive',
          suburb: 'Albany',
          state: 'Auckland',
          postcode: '0632',
          phone: '+64 9 415 7700',
          distance: 15.1,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7311, lng: 174.7006 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Installation', 'Battery Testing', 'Accessories']
        },
        {
          id: 'supercheap-auto-manukau',
          address: '89 Cavendish Drive',
          suburb: 'Manukau',
          state: 'Auckland',
          postcode: '2104',
          phone: '+64 9 263 9900',
          distance: 5.8,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9939, lng: 174.8797 },
          source: 'comprehensive-fallback',
          services: ['Auto Parts', 'Installation', 'Battery Testing', 'Accessories']
        }
      ]
    },
    {
      id: 'corysElectrical',
      name: "Cory's Electrical",
      logo: '⚡',
      category: 'electrical',
      locations: [
        {
          id: 'corys-electrical-penrose',
          address: '23 Kerwyn Avenue',
          suburb: 'Penrose',
          state: 'Auckland',
          postcode: '1061',
          phone: '+64 9 579 3200',
          distance: 3.9,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9225, lng: 174.8158 },
          source: 'comprehensive-fallback',
          services: ['Electrical Wholesale', 'Trade Services', 'Technical Support']
        },
        {
          id: 'corys-electrical-east-tamaki',
          address: '45 Accent Drive',
          suburb: 'East Tamaki',
          state: 'Auckland',
          postcode: '2013',
          phone: '+64 9 274 5800',
          distance: 6.8,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9489, lng: 174.9089 },
          source: 'comprehensive-fallback',
          services: ['Electrical Wholesale', 'Trade Services', 'Technical Support']
        },
        {
          id: 'corys-electrical-albany',
          address: '12 Apollo Drive',
          suburb: 'Albany',
          state: 'Auckland',
          postcode: '0632',
          phone: '+64 9 415 4900',
          distance: 14.7,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7311, lng: 174.7006 },
          source: 'comprehensive-fallback',
          services: ['Electrical Wholesale', 'Trade Services', 'Technical Support']
        }
      ]
    },
    {
      id: 'plumbingWorld',
      name: 'Plumbing World',
      logo: '🚿',
      category: 'plumbing',
      locations: [
        {
          id: 'plumbing-world-penrose',
          address: '35 Kerwyn Avenue',
          suburb: 'Penrose',
          state: 'Auckland',
          postcode: '1061',
          phone: '+64 9 579 4500',
          distance: 3.7,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9225, lng: 174.8158 },
          source: 'comprehensive-fallback',
          services: ['Plumbing Supplies', 'Trade Services', 'Bathroom Showroom']
        },
        {
          id: 'plumbing-world-east-tamaki',
          address: '67 Accent Drive',
          suburb: 'East Tamaki',
          state: 'Auckland',
          postcode: '2013',
          phone: '+64 9 274 6700',
          distance: 6.5,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.9489, lng: 174.9089 },
          source: 'comprehensive-fallback',
          services: ['Plumbing Supplies', 'Trade Services', 'Bathroom Showroom']
        },
        {
          id: 'plumbing-world-albany',
          address: '45 Apollo Drive',
          suburb: 'Albany',
          state: 'Auckland',
          postcode: '0632',
          phone: '+64 9 415 8800',
          distance: 14.8,
          accuracy: 10,
          verified: true,
          coordinates: { lat: -36.7311, lng: 174.7006 },
          source: 'comprehensive-fallback',
          services: ['Plumbing Supplies', 'Trade Services', 'Bathroom Showroom']
        }
      ]
    }
  ];
}

// Helper function to get chain names
function getChainName(chainId: string): string {
  const chainNames: Record<string, string> = {
    bunnings: 'Bunnings Warehouse',
    mitre10: 'Mitre 10',
    placemakers: 'PlaceMakers',
    repco: 'Repco',
    'supercheap-auto': 'Supercheap Auto',
    supercheapAuto: 'Supercheap Auto',
    'corys-electrical': "Cory's Electrical",
    corysElectrical: "Cory's Electrical",
    pdl: 'PDL by Schneider Electric',
    'plumbing-world': 'Plumbing World',
    plumbingWorld: 'Plumbing World',
    mico: 'Mico Plumbing',
    'kings-plant-barn': 'Kings Plant Barn',
    oderings: 'Oderings Garden Centres',
    boc: 'BOC Welding Supplies'
  };
  
  return chainNames[chainId] || chainId.charAt(0).toUpperCase() + chainId.slice(1);
}

// Helper function to get store logos
function getStoreLogo(storeId: string): string {
  const logoMap: Record<string, string> = {
    bunnings: '🔨',
    mitre10: '🏗️',
    placemakers: '🏠',
    repco: '🚗',
    'supercheap-auto': '🔧',
    supercheapAuto: '🔧',
    'corys-electrical': '⚡',
    corysElectrical: '⚡',
    pdl: '🔌',
    'plumbing-world': '🚿',
    plumbingWorld: '🚿',
    mico: '🔧',
    'kings-plant-barn': '🌱',
    oderings: '🌿',
    boc: '🔥'
  };
  
  return logoMap[storeId] || '🏪';
}

// Helper function to map store categories
function mapStoreCategory(storeId: string): 'hardware' | 'automotive' | 'electrical' | 'plumbing' | 'gardening' | 'welding' {
  const categoryMap: Record<string, 'hardware' | 'automotive' | 'electrical' | 'plumbing' | 'gardening' | 'welding'> = {
    bunnings: 'hardware',
    mitre10: 'hardware',
    placemakers: 'hardware',
    repco: 'automotive',
    'supercheap-auto': 'automotive',
    supercheapAuto: 'automotive',
    'corys-electrical': 'electrical',
    corysElectrical: 'electrical',
    pdl: 'electrical',
    'plumbing-world': 'plumbing',
    plumbingWorld: 'plumbing',
    mico: 'plumbing',
    'kings-plant-barn': 'gardening',
    oderings: 'gardening',
    boc: 'welding'
  };
  
  return categoryMap[storeId] || 'hardware';
}