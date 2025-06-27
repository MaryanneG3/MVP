import React, { useMemo, useState, useEffect } from 'react';
import { MapPin, Clock, AlertCircle, TrendingDown, CheckCircle, XCircle, ArrowLeft, Share2, Heart, Zap, Store, Crown } from 'lucide-react';
import { Product, ProductPrice, SelectedStore } from '../types';
import { mockPrices } from '../data/mockData';

interface PriceComparisonProps {
  product: Product;
  selectedStores: SelectedStore[];
  prices: ProductPrice[];
  onBack: () => void;
}

export const PriceComparison: React.FC<PriceComparisonProps> = ({
  product,
  selectedStores,
  prices,
  onBack
}) => {
  const [mockProductPrices, setMockProductPrices] = useState<ProductPrice[]>([]);
  const [showingAllStores, setShowingAllStores] = useState(false);

  // Get mock prices for this specific product
  useEffect(() => {
    const getProductPrices = () => {
      // Map product to price ranges based on product ID
      let productPrices: ProductPrice[] = [];
      
      if (product.id.includes('makita-dhp484z')) {
        productPrices = mockPrices.filter(p => p.price >= 275 && p.price <= 300);
      } else if (product.id.includes('dewalt-dcd796n')) {
        productPrices = mockPrices.filter(p => p.price >= 309 && p.price <= 325);
      } else if (product.id.includes('milwaukee-m18fpd')) {
        productPrices = mockPrices.filter(p => p.price >= 389 && p.price <= 415);
      } else if (product.id.includes('bosch-gsb18v-55')) {
        productPrices = mockPrices.filter(p => p.price >= 239 && p.price <= 259);
      } else if (product.id.includes('ryobi-r18pd7-0')) {
        productPrices = mockPrices.filter(p => p.price >= 179 && p.price <= 185);
      } else if (product.id.includes('makita-dga504z')) {
        productPrices = mockPrices.filter(p => p.price >= 189 && p.price <= 205);
      } else if (product.id.includes('dewalt-dcs391n')) {
        productPrices = mockPrices.filter(p => p.price >= 259 && p.price <= 279);
      } else if (product.id.includes('stanley-hammer-450g')) {
        productPrices = mockPrices.filter(p => p.price >= 38 && p.price <= 45);
      } else if (product.id.includes('bahco-adjustable-250mm')) {
        productPrices = mockPrices.filter(p => p.price >= 43 && p.price <= 48);
      } else if (product.id.includes('stanley-screwdriver-set')) {
        productPrices = mockPrices.filter(p => p.price >= 22 && p.price <= 28);
      } else if (product.id.includes('irwin-pliers-set')) {
        productPrices = mockPrices.filter(p => p.price >= 84 && p.price <= 95);
      } else if (product.id.includes('stanley-tape-measure')) {
        productPrices = mockPrices.filter(p => p.price >= 19 && p.price <= 23);
      } else if (product.id.includes('milwaukee-utility-knife')) {
        productPrices = mockPrices.filter(p => p.price >= 32 && p.price <= 38);
      } else if (product.id.includes('holman-pvc-20mm')) {
        productPrices = mockPrices.filter(p => p.price >= 32 && p.price <= 37);
      } else if (product.id.includes('caroma-basin-mixer')) {
        productPrices = mockPrices.filter(p => p.price >= 175 && p.price <= 195);
      } else if (product.id.includes('methven-shower-head')) {
        productPrices = mockPrices.filter(p => p.price >= 119 && p.price <= 135);
      } else if (product.id.includes('holman-pvc-fittings')) {
        productPrices = mockPrices.filter(p => p.price >= 17 && p.price <= 22);
      } else if (product.id.includes('caroma-toilet-suite')) {
        productPrices = mockPrices.filter(p => p.price >= 429 && p.price <= 465);
      } else if (product.id.includes('olex-tps-2.5mm')) {
        productPrices = mockPrices.filter(p => p.price >= 178 && p.price <= 192);
      } else if (product.id.includes('pdl-iconic-switch')) {
        productPrices = mockPrices.filter(p => p.price >= 11 && p.price <= 15);
      } else if (product.id.includes('clipsal-power-outlet')) {
        productPrices = mockPrices.filter(p => p.price >= 8 && p.price <= 10);
      } else if (product.id.includes('hpm-led-downlight')) {
        productPrices = mockPrices.filter(p => p.price >= 22 && p.price <= 28);
      } else if (product.id.includes('olex-single-core')) {
        productPrices = mockPrices.filter(p => p.price >= 84 && p.price <= 95);
      } else if (product.id.includes('clipsal-safety-switch')) {
        productPrices = mockPrices.filter(p => p.price >= 84 && p.price <= 95);
      } else if (product.id.includes('ramset-dynabolt')) {
        productPrices = mockPrices.filter(p => p.price >= 42 && p.price <= 50);
      } else if (product.id.includes('buildex-screws')) {
        productPrices = mockPrices.filter(p => p.price >= 84 && p.price <= 95);
      } else if (product.id.includes('zenith-bolts')) {
        productPrices = mockPrices.filter(p => p.price >= 22 && p.price <= 28);
      } else if (product.id.includes('protector-safety-glasses')) {
        productPrices = mockPrices.filter(p => p.price >= 12 && p.price <= 15);
      } else if (product.id.includes('force360-hard-hat')) {
        productPrices = mockPrices.filter(p => p.price >= 32 && p.price <= 38);
      } else if (product.id.includes('prochoice-work-gloves')) {
        productPrices = mockPrices.filter(p => p.price >= 17 && p.price <= 22);
      }
      
      return productPrices;
    };

    const prices = getProductPrices();
    setMockProductPrices(prices);
    
    // Check if we're showing all stores (when no stores were pre-selected)
    setShowingAllStores(selectedStores.length > 1 && prices.length === selectedStores.length);
  }, [product.id, selectedStores.length]);

  const storesPrices = useMemo(() => {
    const pricesToUse = mockProductPrices.length > 0 ? mockProductPrices : prices;
    
    return selectedStores.map(selectedStore => {
      const storePrice = pricesToUse.find(
        price => price.storeId === selectedStore.store.id && 
                price.locationId === selectedStore.location.id
      );
      
      return {
        ...selectedStore,
        price: storePrice
      };
    }).filter(item => item.price);
  }, [selectedStores, prices, mockProductPrices]);

  const sortedPrices = useMemo(() => {
    return [...storesPrices].sort((a, b) => {
      if (!a.price?.inStock && b.price?.inStock) return 1;
      if (a.price?.inStock && !b.price?.inStock) return -1;
      return (a.price?.price || 0) - (b.price?.price || 0);
    });
  }, [storesPrices]);

  const lowestPrice = useMemo(() => {
    const inStockPrices = sortedPrices.filter(item => item.price?.inStock);
    return inStockPrices.length > 0 ? inStockPrices[0].price?.price : null;
  }, [sortedPrices]);

  const bestPriceStore = useMemo(() => {
    const inStockPrices = sortedPrices.filter(item => item.price?.inStock);
    return inStockPrices.length > 0 ? inStockPrices[0] : null;
  }, [sortedPrices]);

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just updated';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
        >
          <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />
          <span>Back to Products</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
        </div>
      </div>

      {/* Best Price Banner */}
      {bestPriceStore && lowestPrice && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl text-white p-4 lg:p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-2 lg:p-3">
                <Crown className="h-6 w-6 lg:h-8 lg:w-8" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold mb-1">Best Price Found!</h2>
                <p className="text-green-100 text-sm lg:text-base">
                  <span className="font-semibold">{bestPriceStore.store.name}</span> in {bestPriceStore.location.suburb} has the lowest price
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm text-green-100">
                    {bestPriceStore.location.address} • {bestPriceStore.location.distance && `${bestPriceStore.location.distance}km away`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl lg:text-4xl font-bold">
                ${lowestPrice.toFixed(2)}
              </div>
              {bestPriceStore.price?.onSale && bestPriceStore.price?.originalPrice && (
                <div className="text-sm lg:text-base text-green-200 line-through">
                  Was ${bestPriceStore.price.originalPrice.toFixed(2)}
                </div>
              )}
              <div className="text-xs lg:text-sm text-green-200 mt-1">
                {bestPriceStore.price?.inStock ? 'In Stock' : 'Check Availability'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Stores Indicator */}
      {showingAllStores && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Store className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Showing All Available Stores</h3>
              <p className="text-sm text-blue-700">
                Since you selected a product first, we're showing prices from all {sortedPrices.length} stores that carry this item.
                You can select specific stores first if you want to limit the comparison.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/3">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 sm:h-64 lg:h-full object-cover"
            />
          </div>
          <div className="lg:w-2/3 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
              <div className="flex-1 mb-4 lg:mb-0">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-base lg:text-lg text-gray-700 mb-2">{product.brand}</p>
                <p className="text-sm lg:text-base text-gray-600 mb-4">{product.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs lg:text-sm rounded-full">
                    {product.subcategory}
                  </span>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs lg:text-sm rounded-full">
                    {product.category}
                  </span>
                  {showingAllStores && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs lg:text-sm rounded-full">
                      All Stores
                    </span>
                  )}
                </div>
              </div>
              
              {lowestPrice && (
                <div className="text-center lg:text-right lg:ml-6">
                  <div className="text-xs lg:text-sm text-gray-600 mb-1">Starting from</div>
                  <div className="text-2xl lg:text-3xl font-bold text-green-600">
                    ${lowestPrice.toFixed(2)}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-500">
                    from {sortedPrices.length} store{sortedPrices.length > 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Price Comparison */}
      {sortedPrices.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:p-8 text-center">
          <AlertCircle className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">No Prices Available</h3>
          <p className="text-sm lg:text-base text-gray-600 mb-4">
            This product is not available at your selected stores or pricing data is not available.
          </p>
          <button
            onClick={onBack}
            className="bg-green-600 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg hover:bg-green-700 transition-colors text-sm lg:text-base"
          >
            Try Another Product
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">Price Comparison</h3>
            <p className="text-sm lg:text-base text-gray-600 mt-1">
              {showingAllStores 
                ? `Comparing prices across all ${sortedPrices.length} stores that carry this product`
                : `Comparing prices across ${sortedPrices.length} selected stores`
              }
            </p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {sortedPrices.map((item, index) => {
              const isLowest = item.price?.inStock && item.price.price === lowestPrice;
              const savings = lowestPrice && item.price?.inStock && item.price.price > lowestPrice 
                ? item.price.price - lowestPrice 
                : 0;

              return (
                <div
                  key={`${item.store.id}-${item.location.id}`}
                  className={`p-4 lg:p-6 transition-colors hover:bg-gray-50 ${
                    isLowest ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex items-start space-x-3 lg:space-x-4 flex-1 mb-4 lg:mb-0">
                      <div className="flex-shrink-0">
                        <span className="text-2xl lg:text-3xl">{item.store.logo}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-base lg:text-lg font-semibold text-gray-900">{item.store.name}</h3>
                          {isLowest && (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              <Crown className="h-3 w-3 mr-1" />
                              Best Price
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600 mb-1">
                          <MapPin className="h-3 w-3 lg:h-4 lg:w-4" />
                          <span>{item.location.suburb}, {item.location.state}</span>
                          {item.location.distance && (
                            <span>• {item.location.distance}km away</span>
                          )}
                        </div>
                        <p className="text-xs lg:text-sm text-gray-500 truncate">{item.location.address}</p>
                        <p className="text-xs lg:text-sm text-gray-500">{item.location.phone}</p>
                      </div>
                    </div>
                    
                    <div className="text-left lg:text-right lg:ml-6">
                      <div className="flex items-center lg:justify-end space-x-2 mb-2">
                        {item.price?.inStock ? (
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-600" />
                        )}
                        <span className={`text-xs lg:text-sm font-medium ${
                          item.price?.inStock ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.price?.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      {item.price && (
                        <>
                          <div className="text-left lg:text-right">
                            {item.price.onSale && item.price.originalPrice && (
                              <div className="text-xs lg:text-sm text-gray-500 line-through">
                                ${item.price.originalPrice.toFixed(2)}
                              </div>
                            )}
                            <div className={`text-xl lg:text-2xl font-bold ${
                              item.price.onSale ? 'text-red-600' : isLowest ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              ${item.price.price.toFixed(2)}
                            </div>
                            {item.price.onSale && (
                              <div className="text-xs lg:text-sm text-red-600 font-medium">
                                Sale Price
                              </div>
                            )}
                          </div>
                          
                          {savings > 0 && (
                            <div className="text-xs lg:text-sm text-red-600 mt-1">
                              +${savings.toFixed(2)} more
                            </div>
                          )}
                          
                          <div className="flex items-center lg:justify-end space-x-1 text-xs text-gray-500 mt-2">
                            <Clock className="h-3 w-3" />
                            <span>{formatLastUpdated(item.price.lastUpdated)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {lowestPrice && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6">
          <div className="flex items-start space-x-3">
            <TrendingDown className="h-5 w-5 lg:h-6 lg:w-6 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2 text-sm lg:text-base">Price Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 text-xs lg:text-sm">
                <div>
                  <span className="text-green-700">Best Price:</span>
                  <span className="font-bold text-green-900 ml-2">${lowestPrice.toFixed(2)}</span>
                  {bestPriceStore && (
                    <div className="text-green-600 text-xs mt-1">
                      at {bestPriceStore.store.name}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-green-700">Highest Price:</span>
                  <span className="font-bold text-green-900 ml-2">
                    ${Math.max(...sortedPrices.filter(p => p.price?.inStock).map(p => p.price!.price)).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-green-700">Potential Savings:</span>
                  <span className="font-bold text-green-900 ml-2">
                    ${(Math.max(...sortedPrices.filter(p => p.price?.inStock).map(p => p.price!.price)) - lowestPrice).toFixed(2)}
                  </span>
                </div>
              </div>
              {showingAllStores && (
                <p className="text-xs text-green-600 mt-2">
                  💡 Tip: You can select specific stores first to limit your comparison to preferred locations.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};