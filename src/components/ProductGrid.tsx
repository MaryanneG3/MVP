import React, { useState } from 'react';
import { Search, Filter, Grid, List, Star, Clock, TrendingDown, Package, CheckCircle } from 'lucide-react';
import { Product, SelectedStore } from '../types';
import { mockPrices } from '../data/mockData';

interface ProductGridProps {
  products: Product[];
  categories: Array<{
    id: string;
    name: string;
    subcategories: string[];
  }>;
  onProductSelect: (product: Product) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStores: SelectedStore[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  onProductSelect,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStores
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');

  const getProductPriceRange = (productId: string) => {
    // Get all prices for this specific product
    let productPrices: any[] = [];
    
    if (productId.includes('makita-dhp484z')) {
      productPrices = mockPrices.filter(p => p.price >= 275 && p.price <= 300);
    } else if (productId.includes('dewalt-dcd796n')) {
      productPrices = mockPrices.filter(p => p.price >= 309 && p.price <= 325);
    } else if (productId.includes('milwaukee-m18fpd')) {
      productPrices = mockPrices.filter(p => p.price >= 389 && p.price <= 415);
    } else if (productId.includes('bosch-gsb18v-55')) {
      productPrices = mockPrices.filter(p => p.price >= 239 && p.price <= 259);
    } else if (productId.includes('ryobi-r18pd7-0')) {
      productPrices = mockPrices.filter(p => p.price >= 179 && p.price <= 185);
    } else if (productId.includes('makita-dga504z')) {
      productPrices = mockPrices.filter(p => p.price >= 189 && p.price <= 205);
    } else if (productId.includes('dewalt-dcs391n')) {
      productPrices = mockPrices.filter(p => p.price >= 259 && p.price <= 279);
    } else if (productId.includes('stanley-hammer-450g')) {
      productPrices = mockPrices.filter(p => p.price >= 38 && p.price <= 45);
    } else if (productId.includes('bahco-adjustable-250mm')) {
      productPrices = mockPrices.filter(p => p.price >= 43 && p.price <= 48);
    } else if (productId.includes('stanley-screwdriver-set')) {
      productPrices = mockPrices.filter(p => p.price >= 22 && p.price <= 28);
    } else if (productId.includes('irwin-pliers-set')) {
      productPrices = mockPrices.filter(p => p.price >= 84 && p.price <= 95);
    } else if (productId.includes('stanley-tape-measure')) {
      productPrices = mockPrices.filter(p => p.price >= 19 && p.price <= 23);
    } else if (productId.includes('milwaukee-utility-knife')) {
      productPrices = mockPrices.filter(p => p.price >= 32 && p.price <= 38);
    } else if (productId.includes('holman-pvc-20mm')) {
      productPrices = mockPrices.filter(p => p.price >= 32 && p.price <= 37);
    } else if (productId.includes('caroma-basin-mixer')) {
      productPrices = mockPrices.filter(p => p.price >= 175 && p.price <= 195);
    } else if (productId.includes('methven-shower-head')) {
      productPrices = mockPrices.filter(p => p.price >= 119 && p.price <= 135);
    } else if (productId.includes('holman-pvc-fittings')) {
      productPrices = mockPrices.filter(p => p.price >= 17 && p.price <= 22);
    } else if (productId.includes('caroma-toilet-suite')) {
      productPrices = mockPrices.filter(p => p.price >= 429 && p.price <= 465);
    } else if (productId.includes('olex-tps-2.5mm')) {
      productPrices = mockPrices.filter(p => p.price >= 178 && p.price <= 192);
    } else if (productId.includes('pdl-iconic-switch')) {
      productPrices = mockPrices.filter(p => p.price >= 11 && p.price <= 15);
    } else if (productId.includes('clipsal-power-outlet')) {
      productPrices = mockPrices.filter(p => p.price >= 8 && p.price <= 10);
    } else if (productId.includes('hpm-led-downlight')) {
      productPrices = mockPrices.filter(p => p.price >= 22 && p.price <= 28);
    } else if (productId.includes('olex-single-core')) {
      productPrices = mockPrices.filter(p => p.price >= 84 && p.price <= 95);
    } else if (productId.includes('clipsal-safety-switch')) {
      productPrices = mockPrices.filter(p => p.price >= 84 && p.price <= 95);
    } else if (productId.includes('ramset-dynabolt')) {
      productPrices = mockPrices.filter(p => p.price >= 42 && p.price <= 50);
    } else if (productId.includes('buildex-screws')) {
      productPrices = mockPrices.filter(p => p.price >= 84 && p.price <= 95);
    } else if (productId.includes('zenith-bolts')) {
      productPrices = mockPrices.filter(p => p.price >= 22 && p.price <= 28);
    } else if (productId.includes('protector-safety-glasses')) {
      productPrices = mockPrices.filter(p => p.price >= 12 && p.price <= 15);
    } else if (productId.includes('force360-hard-hat')) {
      productPrices = mockPrices.filter(p => p.price >= 32 && p.price <= 38);
    } else if (productId.includes('prochoice-work-gloves')) {
      productPrices = mockPrices.filter(p => p.price >= 17 && p.price <= 22);
    }

    // If selected stores are available, filter by them
    if (selectedStores.length > 0) {
      productPrices = productPrices.filter(price => 
        selectedStores.some(store => 
          store.store.id === price.storeId && store.location.id === price.locationId
        )
      );
    }

    if (productPrices.length === 0) return null;

    const prices = productPrices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return { min: minPrice, max: maxPrice, count: productPrices.length };
  };

  // Enhanced sorting function with proper comparisons
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
      
      case 'brand':
        const brandComparison = a.brand.localeCompare(b.brand, 'en', { sensitivity: 'base' });
        if (brandComparison !== 0) return brandComparison;
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
      
      case 'category':
        const categoryComparison = a.category.localeCompare(b.category, 'en', { sensitivity: 'base' });
        if (categoryComparison !== 0) return categoryComparison;
        
        const subcategoryComparison = a.subcategory.localeCompare(b.subcategory, 'en', { sensitivity: 'base' });
        if (subcategoryComparison !== 0) return subcategoryComparison;
        
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
      
      case 'price-low':
        const priceRangeA = getProductPriceRange(a.id);
        const priceRangeB = getProductPriceRange(b.id);
        const priceA = priceRangeA ? priceRangeA.min : 999999;
        const priceB = priceRangeB ? priceRangeB.min : 999999;
        if (priceA !== priceB) return priceA - priceB;
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
      
      case 'price-high':
        const priceRangeHighA = getProductPriceRange(a.id);
        const priceRangeHighB = getProductPriceRange(b.id);
        const priceHighA = priceRangeHighA ? priceRangeHighA.max : 0;
        const priceHighB = priceRangeHighB ? priceRangeHighB.max : 0;
        if (priceHighA !== priceHighB) return priceHighB - priceHighA;
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
      
      default:
        return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    }
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products, brands, or descriptions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 lg:pl-10 pr-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Enhanced Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base"
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="brand">Sort by Brand</option>
              <option value="category">Sort by Category</option>
              <option value="price-low">Sort by Price (Low to High)</option>
              <option value="price-high">Sort by Price (High to Low)</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 self-start">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
            {sortedProducts.length} Products Found
          </h2>
          {sortBy !== 'name' && (
            <p className="text-sm text-gray-600 mt-1">
              Sorted by {sortBy.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          )}
        </div>
        {selectedStores.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 lg:px-4 py-2">
            <p className="text-xs lg:text-sm text-blue-800">
              💡 Click any product to see prices from all available stores
            </p>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 lg:p-12 text-center">
          <Package className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
          <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-sm lg:text-base text-gray-600">Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6">
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6' 
              : 'space-y-3 lg:space-y-4'
          }>
            {sortedProducts.map(product => {
              const priceRange = getProductPriceRange(product.id);
              
              return (
                <div
                  key={product.id}
                  onClick={() => onProductSelect(product)}
                  className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-green-300 group"
                >
                  <div className="flex items-stretch min-h-[120px] lg:min-h-[140px]">
                    {/* Product Information - Left Side */}
                    <div className="flex-1 p-4 lg:p-5 min-w-0 flex flex-col justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-sm lg:text-base leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-600 mb-3">{product.brand}</p>
                        
                        <div className="flex flex-wrap items-center gap-1 mb-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {product.subcategory}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                          {selectedStores.length === 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              All Stores
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        {priceRange ? (
                          <div>
                            <div className="text-sm lg:text-base font-semibold text-gray-900">
                              {priceRange.min === priceRange.max 
                                ? `$${priceRange.min.toFixed(2)}`
                                : `$${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)}`
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {selectedStores.length > 0 
                                ? `${priceRange.count} selected store${priceRange.count > 1 ? 's' : ''}`
                                : `${priceRange.count} store${priceRange.count > 1 ? 's' : ''}`
                              }
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm lg:text-base text-green-600 font-medium">
                            {selectedStores.length === 0 ? 'View All Prices →' : 'Compare Prices →'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Product Image - Right Side */}
                    <div className="w-20 lg:w-24 flex-shrink-0 p-3 lg:p-4 flex items-center justify-center">
                      <div className="w-full h-16 lg:h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};