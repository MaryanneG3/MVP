import { useState, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { SelectedStore, Product, Store } from "./types";
import {
  productCategories,
  mockStores,
  mockProducts,
  mockPrices,
} from "./data/mockData";
import { StoreSelector } from "./components/StoreSelector";
import { ProductGrid } from "./components/ProductGrid";
import { PriceComparison } from "./components/PriceComparison";
import { Header } from "./components/Header";
import { LocationPrompt } from "./components/LocationPrompt";
import { getClosestStoreLocations } from "./utils/locationUtils";

type AppView = "home" | "stores" | "products" | "comparison";

function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [selectedStores, setSelectedStores] = useState<SelectedStore[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userLocation, setUserLocation] = useState<string>("");
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [storesWithClosestLocations, setStoresWithClosestLocations] = useState<
    Store[]
  >([]);
  const [isScrolling, setIsScrolling] = useState(false);

  // Update stores to show only closest 5 locations when user location changes
  useEffect(() => {
    // Handle updating closest stores when userLocation changes
    if (userLocation && mockStores.length > 0) {
      const updatedStores = mockStores.map((store) => ({
        ...store,
        locations: getClosestStoreLocations(userLocation, store.locations, 5),
      }));
      setStoresWithClosestLocations(updatedStores);
    } else {
      setStoresWithClosestLocations(mockStores);
    }

    // Scroll tracking logic
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      setIsScrolling(true);

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 200); // 200ms delay after scroll stops
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup on unmount or effect re-run
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [userLocation]);

  const handleLocationSelect = (location: string) => {
    setUserLocation(location);
    setShowLocationPrompt(false);
  };

  const handleSkipLocation = () => {
    setUserLocation("Botany, Auckland"); // Default location
    setShowLocationPrompt(false);
  };

  const handleStoreSelect = (store: any, location: any) => {
    if (selectedStores.length < 3) {
      setSelectedStores([...selectedStores, { store, location }]);
    }
  };

  const handleStoreRemove = (storeId: string, locationId: string) => {
    setSelectedStores(
      selectedStores.filter(
        (s) => !(s.store.id === storeId && s.location.id === locationId)
      )
    );
  };

  // Enhanced product selection handler that creates virtual selected stores for all available stores
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);

    // If no stores are selected, automatically create virtual selections for all stores that have this product
    if (selectedStores.length === 0) {
      const productPrices = getProductPrices(product.id);
      const storesWithProduct: SelectedStore[] = [];

      // Find all stores that have prices for this product
      productPrices.forEach((price) => {
        const store = storesWithClosestLocations.find(
          (s) => s.id === price.storeId
        );
        const location = store?.locations.find(
          (l) => l.id === price.locationId
        );

        if (store && location) {
          // Check if this store is already added
          const alreadyAdded = storesWithProduct.some(
            (s) => s.store.id === store.id && s.location.id === location.id
          );

          if (!alreadyAdded) {
            storesWithProduct.push({ store, location });
          }
        }
      });

      // Set these as selected stores for comparison
      setSelectedStores(storesWithProduct);
    }

    setCurrentView("comparison");
  };

  // Helper function to get all prices for a product
  const getProductPrices = (productId: string) => {
    // Get all prices for this specific product based on product ID patterns
    let productPrices: any[] = [];

    if (productId.includes("makita-dhp484z")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 275 && p.price <= 300
      );
    } else if (productId.includes("dewalt-dcd796n")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 309 && p.price <= 325
      );
    } else if (productId.includes("milwaukee-m18fpd")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 389 && p.price <= 415
      );
    } else if (productId.includes("bosch-gsb18v-55")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 239 && p.price <= 259
      );
    } else if (productId.includes("ryobi-r18pd7-0")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 179 && p.price <= 185
      );
    } else if (productId.includes("makita-dga504z")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 189 && p.price <= 205
      );
    } else if (productId.includes("dewalt-dcs391n")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 259 && p.price <= 279
      );
    } else if (productId.includes("stanley-hammer-450g")) {
      productPrices = mockPrices.filter((p) => p.price >= 38 && p.price <= 45);
    } else if (productId.includes("bahco-adjustable-250mm")) {
      productPrices = mockPrices.filter((p) => p.price >= 43 && p.price <= 48);
    } else if (productId.includes("stanley-screwdriver-set")) {
      productPrices = mockPrices.filter((p) => p.price >= 22 && p.price <= 28);
    } else if (productId.includes("irwin-pliers-set")) {
      productPrices = mockPrices.filter((p) => p.price >= 84 && p.price <= 95);
    } else if (productId.includes("stanley-tape-measure")) {
      productPrices = mockPrices.filter((p) => p.price >= 19 && p.price <= 23);
    } else if (productId.includes("milwaukee-utility-knife")) {
      productPrices = mockPrices.filter((p) => p.price >= 32 && p.price <= 38);
    } else if (productId.includes("holman-pvc-20mm")) {
      productPrices = mockPrices.filter((p) => p.price >= 32 && p.price <= 37);
    } else if (productId.includes("caroma-basin-mixer")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 175 && p.price <= 195
      );
    } else if (productId.includes("methven-shower-head")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 119 && p.price <= 135
      );
    } else if (productId.includes("holman-pvc-fittings")) {
      productPrices = mockPrices.filter((p) => p.price >= 17 && p.price <= 22);
    } else if (productId.includes("caroma-toilet-suite")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 429 && p.price <= 465
      );
    } else if (productId.includes("olex-tps-2.5mm")) {
      productPrices = mockPrices.filter(
        (p) => p.price >= 178 && p.price <= 192
      );
    } else if (productId.includes("pdl-iconic-switch")) {
      productPrices = mockPrices.filter((p) => p.price >= 11 && p.price <= 15);
    } else if (productId.includes("clipsal-power-outlet")) {
      productPrices = mockPrices.filter((p) => p.price >= 8 && p.price <= 10);
    } else if (productId.includes("hpm-led-downlight")) {
      productPrices = mockPrices.filter((p) => p.price >= 22 && p.price <= 28);
    } else if (productId.includes("olex-single-core")) {
      productPrices = mockPrices.filter((p) => p.price >= 84 && p.price <= 95);
    } else if (productId.includes("clipsal-safety-switch")) {
      productPrices = mockPrices.filter((p) => p.price >= 84 && p.price <= 95);
    } else if (productId.includes("ramset-dynabolt")) {
      productPrices = mockPrices.filter((p) => p.price >= 42 && p.price <= 50);
    } else if (productId.includes("buildex-screws")) {
      productPrices = mockPrices.filter((p) => p.price >= 84 && p.price <= 95);
    } else if (productId.includes("zenith-bolts")) {
      productPrices = mockPrices.filter((p) => p.price >= 22 && p.price <= 28);
    } else if (productId.includes("protector-safety-glasses")) {
      productPrices = mockPrices.filter((p) => p.price >= 12 && p.price <= 15);
    } else if (productId.includes("force360-hard-hat")) {
      productPrices = mockPrices.filter((p) => p.price >= 32 && p.price <= 38);
    } else if (productId.includes("prochoice-work-gloves")) {
      productPrices = mockPrices.filter((p) => p.price >= 17 && p.price <= 22);
    }

    return productPrices;
  };

  // Filter products based on search and category
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredProducts = mockProducts.slice(0, 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Location Prompt Modal */}
      {showLocationPrompt && (
        <LocationPrompt
          onLocationSelect={handleLocationSelect}
          onSkip={handleSkipLocation}
        />
      )}

      <Header
        selectedStores={selectedStores}
        onViewChange={setCurrentView}
        currentView={currentView}
        userLocation={userLocation}
        onLocationChange={setUserLocation}
      />

      {/* Home View */}
      {currentView === "home" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Bolt badge */}
          <div
            className={`fixed bottom-0 right-5 p-4 z-50 transition-opacity duration-500 hover:opacity-100 ${
              isScrolling ? "opacity-100" : "opacity-50"
            } `}
          >
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/bolt-badge.png"
                alt="Bolt.new badge"
                className="h-14 lg:h-16 w-auto max-w-[240px] lg:max-w-[280px] rounded-full shadow-2xl shadow-green-400 object-contain"
                style={{
                  maxHeight: "56px",
                }}
              />
            </a>
          </div>

          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl lg:rounded-2xl text-white p-6 lg:p-8 mb-6 lg:mb-8">
            <div className="max-w-4xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 lg:mb-4">
                Live Trade Store Price Comparison Across New Zealand
              </h1>
              <p className="text-lg lg:text-xl text-green-100 mb-4 lg:mb-6">
                Get live prices on real products from major trade stores. Live
                Prices, Smarter Buys, Bigger Savings!
              </p>
              {userLocation && (
                <div className="flex items-center space-x-2 mb-4 lg:mb-6 text-green-100">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm lg:text-base">
                    Showing closest stores near {userLocation}
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <button
                  onClick={() => setCurrentView("stores")}
                  className="bg-white text-green-600 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors text-center"
                >
                  Select Stores to Compare
                </button>
                <button
                  onClick={() => setCurrentView("products")}
                  className="bg-yellow-400 text-green-800 px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors border border-yellow-300 text-center"
                >
                  Browse Products
                </button>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6 lg:mb-8">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4">
              Product Search
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for tools, materials, or supplies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 lg:pl-10 pr-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm lg:text-base"
                />
              </div>
              <button
                onClick={() => setCurrentView("products")}
                className="bg-green-600 text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm lg:text-base"
              >
                Search
              </button>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">
              Product Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {productCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setCurrentView("products");
                  }}
                  className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4 hover:border-green-300 hover:shadow-md transition-all duration-200 text-center group"
                >
                  <div className="text-xl lg:text-2xl mb-2">
                    {category.id === "hardware" && "🔨"}
                    {category.id === "plumbing" && "🚿"}
                    {category.id === "electrical" && "⚡"}
                    {category.id === "automotive" && "🚗"}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors text-sm lg:text-base">
                    {category.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-500 mt-1">
                    Browse products
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Products */}
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                Featured Products
              </h2>
              <button
                onClick={() => setCurrentView("products")}
                className="text-green-600 hover:text-green-700 font-medium text-sm lg:text-base"
              >
                View All Products →
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                >
                  <div className="flex items-stretch min-h-[120px] lg:min-h-[140px]">
                    {/* Product Information - Left Side */}
                    <div className="flex-1 p-4 lg:p-5 min-w-0 flex flex-col justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-sm lg:text-base leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-600 mb-3">
                          {product.brand}
                        </p>

                        <div className="flex flex-wrap items-center gap-1 mb-3">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Compare All Stores
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {product.subcategory}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm lg:text-base text-green-600 font-medium">
                          View All Prices →
                        </span>
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
              ))}
            </div>
          </div>

          {/* Store Network */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4">
              Our Store Network
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
              {storesWithClosestLocations.map((store) => (
                <div
                  key={store.id}
                  className="text-center p-2 lg:p-3 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <div className="text-xl lg:text-2xl mb-1 lg:mb-2">
                    {store.logo}
                  </div>
                  <h3 className="text-xs lg:text-sm font-medium text-gray-900">
                    {store.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {store.locations.length} location
                    {store.locations.length > 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* Store Selection View */}
      {currentView === "stores" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Select Stores to Compare
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Choose up to 3 trade stores from the closest locations near{" "}
              {userLocation}
            </p>
          </div>

          <StoreSelector
            stores={storesWithClosestLocations}
            selectedStores={selectedStores}
            onStoreSelect={handleStoreSelect}
            onStoreRemove={handleStoreRemove}
            maxStores={3}
          />

          {selectedStores.length > 0 && (
            <div className="mt-6 lg:mt-8 flex justify-center">
              <button
                onClick={() => setCurrentView("products")}
                className="bg-green-600 text-white px-6 lg:px-8 py-2.5 lg:py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm lg:text-base"
              >
                Continue to Products ({selectedStores.length} stores selected)
              </button>
            </div>
          )}
        </main>
      )}

      {/* Products View */}
      {currentView === "products" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Browse Products
            </h1>
            <p className="text-gray-600 text-sm lg:text-base">
              {selectedStores.length > 0
                ? `Comparing prices across ${selectedStores.length} selected stores near ${userLocation}`
                : `Click any product to see prices from all available stores near ${userLocation}`}
            </p>
          </div>

          <ProductGrid
            products={filteredProducts}
            categories={productCategories}
            onProductSelect={handleProductSelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStores={selectedStores}
          />
        </main>
      )}

      {/* Price Comparison View */}
      {currentView === "comparison" && selectedProduct && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <PriceComparison
            product={selectedProduct}
            selectedStores={selectedStores}
            prices={mockPrices}
            onBack={() => setCurrentView("products")}
          />
        </main>
      )}
    </div>
  );
}

export default App;
