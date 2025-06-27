// Component to display real-time scraped prices with confidence indicators
import React, { useState, useEffect } from 'react';
import { Clock, TrendingDown, ExternalLink, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { realTimePriceService } from '../services/realTimePriceService';

interface RealTimePriceDisplayProps {
  productId: string;
  productName: string;
  onPricesLoaded?: (prices: any[]) => void;
}

export const RealTimePriceDisplay: React.FC<RealTimePriceDisplayProps> = ({
  productId,
  productName,
  onPricesLoaded
}) => {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [priceComparison, setPriceComparison] = useState<any>(null);

  // Load real-time prices
  const loadPrices = async (forceRefresh = false) => {
    try {
      setLoading(!forceRefresh);
      setRefreshing(forceRefresh);
      setError(null);

      console.log(`💰 Loading real-time prices for: ${productName}`);
      
      const response = await realTimePriceService.getRealTimePrices([productId], forceRefresh);
      const productData = response.products.find(p => p.productId === productId);
      
      if (productData) {
        const formattedPrices = realTimePriceService.formatPriceData(productData.prices);
        setPrices(formattedPrices);
        setLastUpdated(productData.lastUpdated);
        setPriceComparison(realTimePriceService.getPriceComparison(formattedPrices));
        
        if (onPricesLoaded) {
          onPricesLoaded(formattedPrices);
        }
        
        console.log(`✅ Loaded ${formattedPrices.length} real-time prices`);
      } else {
        setPrices([]);
        setPriceComparison(null);
        console.log('❌ No price data found for product');
      }
      
    } catch (err) {
      console.error('Failed to load real-time prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load prices on mount
  useEffect(() => {
    loadPrices();
  }, [productId]);

  // Format last updated time
  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just updated';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Get confidence badge
  const getConfidenceBadge = (confidence: string, matchScore: number) => {
    const badges = {
      high: { color: 'bg-green-100 text-green-800', text: 'High Match', icon: CheckCircle },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Good Match', icon: AlertCircle },
      low: { color: 'bg-red-100 text-red-800', text: 'Partial Match', icon: AlertCircle }
    };
    
    const badge = badges[confidence as keyof typeof badges] || badges.low;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.text} ({matchScore}%)
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Scraping live prices from store websites...</span>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          This may take 30-60 seconds as we check multiple stores
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-800 mb-3">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Failed to Load Real-Time Prices</span>
        </div>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => loadPrices(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No prices found
  if (prices.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-yellow-800 mb-3">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">No Live Prices Found</span>
        </div>
        <p className="text-yellow-700 text-sm mb-4">
          This product may not be available at major NZ trade stores, or the product name may not match exactly.
        </p>
        <button
          onClick={() => loadPrices(true)}
          disabled={refreshing}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm disabled:opacity-50"
        >
          {refreshing ? 'Searching...' : 'Search Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Summary */}
      {priceComparison && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-900 flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Live Price Summary</span>
            </h3>
            <button
              onClick={() => loadPrices(true)}
              disabled={refreshing}
              className="flex items-center space-x-1 text-green-700 hover:text-green-800 text-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-green-700">Best Price:</span>
              <span className="font-bold text-green-900 ml-2">${priceComparison.lowestPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-green-700">Highest Price:</span>
              <span className="font-bold text-green-900 ml-2">${priceComparison.highestPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-green-700">Potential Savings:</span>
              <span className="font-bold text-green-900 ml-2">${priceComparison.potentialSavings.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-green-700">Stores Found:</span>
              <span className="font-bold text-green-900 ml-2">{priceComparison.totalStores}</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Prices */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Live Prices from Store Websites</h3>
            {lastUpdated && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{formatLastUpdated(lastUpdated)}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Scraped directly from {prices.length} store website{prices.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {prices.map((price, index) => (
            <div key={`${price.storeId}-${index}`} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{price.storeName}</h4>
                    {getConfidenceBadge(price.confidence, price.matchScore)}
                    {price.onSale && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        On Sale
                      </span>
                    )}
                    {!price.inStock && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{price.productName}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Brand: {price.brand || 'Unknown'}</span>
                    <span>Source: {price.source}</span>
                    {price.url && (
                      <a
                        href={price.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View on Store</span>
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  {price.originalPrice && price.originalPrice > price.price && (
                    <div className="text-sm text-gray-500 line-through">
                      ${price.originalPrice.toFixed(2)}
                    </div>
                  )}
                  <div className={`text-xl font-bold ${price.onSale ? 'text-red-600' : 'text-gray-900'}`}>
                    ${price.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">{price.currency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Real-Time Data</h4>
            <p className="text-sm text-blue-700">
              Prices are scraped directly from store websites using advanced product matching algorithms. 
              Match confidence indicates how closely the found product matches your search.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};