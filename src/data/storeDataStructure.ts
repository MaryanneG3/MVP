// Comprehensive store data structure for all major NZ trade stores
// This file defines the structure for storing complete store information

export interface ComprehensiveStoreData {
  // Store chain information
  chain: {
    id: string;
    name: string;
    logo: string;
    category: 'hardware' | 'automotive' | 'electrical' | 'plumbing' | 'gardening' | 'welding';
    website: string;
    phone: string;
    description: string;
  };
  
  // All store locations across New Zealand
  locations: {
    id: string;
    storeNumber?: string;
    name: string;
    address: {
      street: string;
      suburb: string;
      city: string;
      region: string;
      postcode: string;
      country: 'New Zealand';
    };
    coordinates: {
      latitude: number;
      longitude: number;
      accuracy: number; // meters
      verified: boolean;
      lastUpdated: string;
    };
    contact: {
      phone: string;
      email?: string;
      fax?: string;
    };
    hours: {
      monday: { open: string; close: string; closed?: boolean };
      tuesday: { open: string; close: string; closed?: boolean };
      wednesday: { open: string; close: string; closed?: boolean };
      thursday: { open: string; close: string; closed?: boolean };
      friday: { open: string; close: string; closed?: boolean };
      saturday: { open: string; close: string; closed?: boolean };
      sunday: { open: string; close: string; closed?: boolean };
      publicHolidays?: string;
    };
    services: string[]; // e.g., ['Click & Collect', 'Delivery', 'Trade Desk', 'Timber Cutting']
    features: string[]; // e.g., ['Drive Through', 'Forklift Access', 'Trade Entrance']
    size: 'small' | 'medium' | 'large' | 'mega' | 'warehouse';
    isActive: boolean;
    lastVerified: string;
  }[];
}

// Template for data collection from official sources
export const storeDataSources = {
  bunnings: {
    storeLocator: 'https://www.bunnings.co.nz/store-finder',
    api: null, // No public API
    notes: 'Use store locator page, check for JSON data in network requests'
  },
  mitre10: {
    storeLocator: 'https://www.mitre10.co.nz/store-locator',
    api: null,
    notes: 'Store locator with regional filtering'
  },
  placemakers: {
    storeLocator: 'https://www.placemakers.co.nz/store-locator',
    api: null,
    notes: 'Fletcher Building network, comprehensive coverage'
  },
  repco: {
    storeLocator: 'https://www.repco.co.nz/stores',
    api: null,
    notes: 'Automotive parts, nationwide coverage'
  },
  supercheapAuto: {
    storeLocator: 'https://www.supercheapauto.co.nz/stores',
    api: null,
    notes: 'Automotive retail chain'
  },
  corysElectrical: {
    storeLocator: 'https://www.corys.co.nz/store-locator',
    api: null,
    notes: 'Electrical wholesale and retail'
  },
  pdl: {
    storeLocator: 'https://www.pdl.co.nz/where-to-buy',
    api: null,
    notes: 'Schneider Electric brand, electrical products'
  },
  plumbingWorld: {
    storeLocator: 'https://www.plumbingworld.co.nz/store-locator',
    api: null,
    notes: 'Plumbing supplies nationwide'
  },
  mico: {
    storeLocator: 'https://www.mico.co.nz/store-locator',
    api: null,
    notes: 'Plumbing and bathroom supplies'
  },
  kingsPlantBarn: {
    storeLocator: 'https://www.kings.co.nz/garden-centres',
    api: null,
    notes: 'Garden centres and landscaping supplies'
  },
  oderings: {
    storeLocator: 'https://www.oderings.co.nz/garden-centres',
    api: null,
    notes: 'Garden centres, mainly South Island'
  },
  boc: {
    storeLocator: 'https://www.boc.co.nz/shop/en/nz/where-to-buy',
    api: null,
    notes: 'Welding and industrial gases'
  }
};

// Data collection checklist for each store chain
export const dataCollectionChecklist = {
  requiredFields: [
    'Store name and number',
    'Complete street address',
    'Suburb/City/Region',
    'Postcode',
    'Phone number',
    'GPS coordinates (if available)',
    'Store hours (all days)',
    'Store size/type'
  ],
  optionalFields: [
    'Email address',
    'Fax number',
    'Special services offered',
    'Drive-through availability',
    'Trade desk hours',
    'Delivery areas',
    'Click & collect availability'
  ],
  verificationSteps: [
    'Cross-reference with Google Maps',
    'Verify phone numbers',
    'Check store hours accuracy',
    'Confirm GPS coordinates',
    'Validate postal addresses'
  ]
};

// Regional groupings for New Zealand
export const nzRegions = {
  northland: 'Northland',
  auckland: 'Auckland',
  waikato: 'Waikato',
  bayOfPlenty: 'Bay of Plenty',
  gisborne: 'Gisborne',
  hawkesBay: "Hawke's Bay",
  taranaki: 'Taranaki',
  manawatu: 'Manawatu-Whanganui',
  wellington: 'Wellington',
  tasman: 'Tasman',
  nelson: 'Nelson',
  marlborough: 'Marlborough',
  westCoast: 'West Coast',
  canterbury: 'Canterbury',
  timaru: 'Timaru',
  otago: 'Otago',
  southland: 'Southland'
};

// Expected store counts (approximate) for major chains
export const expectedStoreCounts = {
  bunnings: 45, // Estimated NZ store count
  mitre10: 85, // Including Mega and regular stores
  placemakers: 60, // Fletcher Building network
  repco: 35, // Automotive focus
  supercheapAuto: 25,
  corysElectrical: 20,
  plumbingWorld: 30,
  mico: 15,
  kingsPlantBarn: 12,
  oderings: 8,
  boc: 25
};