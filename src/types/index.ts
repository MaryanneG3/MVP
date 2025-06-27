export interface Store {
  id: string;
  name: string;
  logo: string;
  locations: StoreLocation[];
  category: 'hardware' | 'automotive' | 'electrical' | 'plumbing' | 'gardening' | 'welding';
}

export interface StoreLocation {
  id: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  phone: string;
  distance?: number;
  accuracy?: number;
  verified?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed?: boolean;
    };
  };
  services?: string[];
  source?: string;
  lastUpdated?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  image: string;
  description: string;
  price?: number;
  store?: string;
  inStock?: boolean;
  source?: string;
  lastUpdated?: string;
}

export interface ProductPrice {
  storeId: string;
  locationId: string;
  price: number;
  inStock: boolean;
  onSale?: boolean;
  originalPrice?: number;
  lastUpdated: string;
}

export interface SelectedStore {
  store: Store;
  location: StoreLocation;
}