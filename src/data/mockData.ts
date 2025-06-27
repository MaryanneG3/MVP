import { Store, Product, ProductPrice } from '../types';

export const mockStores: Store[] = [
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
        phone: '(09) 274 4100',
        distance: 2.1
      },
      {
        id: 'bunnings-lynn-mall',
        address: '3058 Great North Road',
        suburb: 'New Lynn',
        state: 'Auckland',
        postcode: '0600',
        phone: '(09) 827 4020',
        distance: 8.5
      },
      {
        id: 'bunnings-glenfield',
        address: '477 Glenfield Road',
        suburb: 'Glenfield',
        state: 'Auckland',
        postcode: '0629',
        phone: '(09) 444 3060',
        distance: 12.3
      },
      {
        id: 'bunnings-manukau',
        address: '39 Cavendish Drive',
        suburb: 'Manukau',
        state: 'Auckland',
        postcode: '2104',
        phone: '(09) 263 4200',
        distance: 5.7
      },
      {
        id: 'bunnings-albany',
        address: '219 Don McKinnon Drive',
        suburb: 'Albany',
        state: 'Auckland',
        postcode: '0632',
        phone: '(09) 415 2850',
        distance: 15.2
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
        id: 'mitre10-mega-lincoln-road',
        address: '314 Lincoln Road',
        suburb: 'Henderson',
        state: 'Auckland',
        postcode: '0610',
        phone: '(09) 836 0969',
        distance: 9.8
      },
      {
        id: 'mitre10-mega-wairau-park',
        address: '29 Wairau Road',
        suburb: 'Wairau Valley',
        state: 'Auckland',
        postcode: '0627',
        phone: '(09) 443 9045',
        distance: 11.4
      },
      {
        id: 'mitre10-sylvia-park',
        address: '286 Mount Wellington Highway',
        suburb: 'Mount Wellington',
        state: 'Auckland',
        postcode: '1060',
        phone: '(09) 570 2666',
        distance: 4.2
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
        phone: '(09) 579 0600',
        distance: 3.8
      },
      {
        id: 'placemakers-east-tamaki',
        address: '213 Harris Road',
        suburb: 'East Tamaki',
        state: 'Auckland',
        postcode: '2013',
        phone: '(09) 274 8150',
        distance: 6.1
      }
    ]
  }
];

export const productCategories = [
  {
    id: 'hardware',
    name: 'Hardware & Tools',
    subcategories: ['Power Tools', 'Hand Tools', 'Fasteners', 'Safety Equipment', 'Measuring Tools', 'Storage Solutions']
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    subcategories: ['Pipes & Fittings', 'Taps & Mixers', 'Drainage', 'Hot Water Systems', 'Valves', 'Bathroom Fixtures']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    subcategories: ['Cable & Wire', 'Switches & Outlets', 'Lighting', 'Circuit Protection', 'Conduit & Trunking', 'Test Equipment']
  },
  {
    id: 'automotive',
    name: 'Automotive',
    subcategories: ['Engine Parts', 'Filters', 'Oils & Fluids', 'Tools', 'Batteries', 'Brake Components']
  }
];

export const mockProducts: Product[] = [
  // Power Tools
  {
    id: 'makita-dhp484z',
    name: 'Makita DHP484Z 18V Brushless Hammer Drill',
    brand: 'Makita',
    category: 'hardware',
    subcategory: 'Power Tools',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '18V LXT Brushless 13mm Hammer Driver Drill - Tool Only'
  },
  {
    id: 'dewalt-dcd796n',
    name: 'DeWalt DCD796N 18V XR Brushless Combi Drill',
    brand: 'DeWalt',
    category: 'hardware',
    subcategory: 'Power Tools',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '18V XR Li-Ion Brushless Compact Combi Drill - Bare Unit'
  },
  {
    id: 'milwaukee-m18fpd',
    name: 'Milwaukee M18 FPD-0 Fuel Percussion Drill',
    brand: 'Milwaukee',
    category: 'hardware',
    subcategory: 'Power Tools',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'M18 FUEL 13mm Percussion Drill - Tool Only'
  },
  {
    id: 'bosch-gsb18v-55',
    name: 'Bosch GSB 18V-55 Combi Drill',
    brand: 'Bosch',
    category: 'hardware',
    subcategory: 'Power Tools',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '18V Brushless Combi Drill with 2x 2.0Ah Batteries'
  },
  {
    id: 'ryobi-r18pd7-0',
    name: 'Ryobi R18PD7-0 ONE+ Percussion Drill',
    brand: 'Ryobi',
    category: 'hardware',
    subcategory: 'Power Tools',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '18V ONE+ Brushless Percussion Drill - Tool Only'
  },
  {
    id: 'makita-dga504z',
    name: 'Makita DGA504Z 18V Angle Grinder',
    brand: 'Makita',
    category: 'hardware',
    subcategory: 'Power Tools',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '18V LXT 125mm Brushless Angle Grinder - Tool Only'
  },
  {
    id: 'dewalt-dcs391n',
    name: 'DeWalt DCS391N 18V Circular Saw',
    brand: 'DeWalt',
    category: 'hardware',
    subcategory: 'Power Tools',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '18V XR 165mm Circular Saw - Bare Unit'
  },

  // Hand Tools
  {
    id: 'stanley-hammer-450g',
    name: 'Stanley 450g Claw Hammer',
    brand: 'Stanley',
    category: 'hardware',
    subcategory: 'Hand Tools',
    image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'FatMax Anti-Vibe Claw Hammer 450g Steel Handle'
  },
  {
    id: 'bahco-adjustable-250mm',
    name: 'Bahco 250mm Adjustable Wrench',
    brand: 'Bahco',
    category: 'hardware',
    subcategory: 'Hand Tools',
    image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '250mm Adjustable Wrench Chrome Vanadium Steel'
  },
  {
    id: 'stanley-screwdriver-set',
    name: 'Stanley 6-Piece Screwdriver Set',
    brand: 'Stanley',
    category: 'hardware',
    subcategory: 'Hand Tools',
    image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Essential Screwdriver Set with Phillips and Flathead'
  },
  {
    id: 'irwin-pliers-set',
    name: 'Irwin 3-Piece Pliers Set',
    brand: 'Irwin',
    category: 'hardware',
    subcategory: 'Hand Tools',
    image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Long Nose, Combination and Side Cutting Pliers'
  },
  {
    id: 'stanley-tape-measure',
    name: 'Stanley 5m PowerLock Tape Measure',
    brand: 'Stanley',
    category: 'hardware',
    subcategory: 'Measuring Tools',
    image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '5m PowerLock Tape Measure with Blade Armor Coating'
  },
  {
    id: 'milwaukee-utility-knife',
    name: 'Milwaukee Fastback Utility Knife',
    brand: 'Milwaukee',
    category: 'hardware',
    subcategory: 'Hand Tools',
    image: 'https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Fastback Folding Utility Knife with Wire Stripper'
  },

  // Plumbing
  {
    id: 'holman-pvc-20mm',
    name: 'Holman 20mm PVC Pressure Pipe',
    brand: 'Holman',
    category: 'plumbing',
    subcategory: 'Pipes & Fittings',
    image: 'https://images.pexels.com/photos/8486916/pexels-photo-8486916.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '20mm Class 12 PVC Pressure Pipe - 6 metre length'
  },
  {
    id: 'caroma-basin-mixer',
    name: 'Caroma Liano Basin Mixer',
    brand: 'Caroma',
    category: 'plumbing',
    subcategory: 'Taps & Mixers',
    image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Liano Nexus Basin Mixer Chrome with Pop-up Waste'
  },
  {
    id: 'methven-shower-head',
    name: 'Methven Kiri Satinjet Shower Head',
    brand: 'Methven',
    category: 'plumbing',
    subcategory: 'Bathroom Fixtures',
    image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Kiri Satinjet 3 Function Shower Head Chrome'
  },
  {
    id: 'holman-pvc-fittings',
    name: 'Holman PVC Elbow Fittings Pack',
    brand: 'Holman',
    category: 'plumbing',
    subcategory: 'Pipes & Fittings',
    image: 'https://images.pexels.com/photos/8486916/pexels-photo-8486916.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '20mm PVC 90° Elbow Fittings - Pack of 10'
  },
  {
    id: 'caroma-toilet-suite',
    name: 'Caroma Profile 4 Toilet Suite',
    brand: 'Caroma',
    category: 'plumbing',
    subcategory: 'Bathroom Fixtures',
    image: 'https://images.pexels.com/photos/6580242/pexels-photo-6580242.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Profile 4 Close Coupled Toilet Suite S-Trap'
  },

  // Electrical
  {
    id: 'olex-tps-2.5mm',
    name: 'Olex 2.5mm² TPS Cable',
    brand: 'Olex',
    category: 'electrical',
    subcategory: 'Cable & Wire',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '2.5mm² Twin & Earth TPS Cable - 100 metre coil'
  },
  {
    id: 'pdl-iconic-switch',
    name: 'PDL Iconic 1 Gang Switch',
    brand: 'PDL',
    category: 'electrical',
    subcategory: 'Switches & Outlets',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Iconic 1 Gang 2 Way Switch 10A White'
  },
  {
    id: 'clipsal-power-outlet',
    name: 'Clipsal Classic 10A Power Outlet',
    brand: 'Clipsal',
    category: 'electrical',
    subcategory: 'Switches & Outlets',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Classic Series 10A Single Power Outlet White'
  },
  {
    id: 'hpm-led-downlight',
    name: 'HPM 10W LED Downlight',
    brand: 'HPM',
    category: 'electrical',
    subcategory: 'Lighting',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '10W Dimmable LED Downlight Cool White 90mm'
  },
  {
    id: 'olex-single-core',
    name: 'Olex 4mm² Single Core Cable',
    brand: 'Olex',
    category: 'electrical',
    subcategory: 'Cable & Wire',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '4mm² Single Core Cable Red - 100m Roll'
  },
  {
    id: 'clipsal-safety-switch',
    name: 'Clipsal 25A Safety Switch',
    brand: 'Clipsal',
    category: 'electrical',
    subcategory: 'Circuit Protection',
    image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '25A 30mA Safety Switch Single Pole'
  },

  // Fasteners & Hardware
  {
    id: 'ramset-dynabolt',
    name: 'Ramset DynaBolt Anchors',
    brand: 'Ramset',
    category: 'hardware',
    subcategory: 'Fasteners',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'M10 x 80mm DynaBolt Anchors - Pack of 10'
  },
  {
    id: 'buildex-screws',
    name: 'Buildex Bugle Head Screws',
    brand: 'Buildex',
    category: 'hardware',
    subcategory: 'Fasteners',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: '8G x 50mm Bugle Head Screws - 500 Pack'
  },
  {
    id: 'zenith-bolts',
    name: 'Zenith Hex Head Bolts',
    brand: 'Zenith',
    category: 'hardware',
    subcategory: 'Fasteners',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'M8 x 50mm Galvanised Hex Head Bolts - Pack of 25'
  },

  // Safety Equipment
  {
    id: 'protector-safety-glasses',
    name: 'Protector Clear Safety Glasses',
    brand: 'Protector',
    category: 'hardware',
    subcategory: 'Safety Equipment',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Clear Lens Safety Glasses with Side Protection'
  },
  {
    id: 'force360-hard-hat',
    name: 'Force360 Hard Hat',
    brand: 'Force360',
    category: 'hardware',
    subcategory: 'Safety Equipment',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Type 1 Hard Hat with 6-Point Suspension White'
  },
  {
    id: 'prochoice-work-gloves',
    name: 'ProChoice Leather Work Gloves',
    brand: 'ProChoice',
    category: 'hardware',
    subcategory: 'Safety Equipment',
    image: 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Premium Leather Work Gloves Size Large'
  }
];

export const mockPrices: ProductPrice[] = [
  // Makita Drill prices across different stores and locations
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 289.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'bunnings', locationId: 'bunnings-lynn-mall', price: 289.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'bunnings', locationId: 'bunnings-manukau', price: 289.00, inStock: false, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 295.50, inStock: true, onSale: true, originalPrice: 320.00, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 298.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 275.80, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },
  
  // DeWalt Drill prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 319.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 325.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 309.95, inStock: true, onSale: true, originalPrice: 339.00, lastUpdated: '2024-01-15T08:45:00Z' },
  
  // Milwaukee Drill prices
  { storeId: 'bunnings', locationId: 'bunnings-glenfield', price: 399.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 415.00, inStock: false, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 389.50, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },

  // Bosch Drill prices
  { storeId: 'bunnings', locationId: 'bunnings-albany', price: 245.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 259.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 239.95, inStock: true, onSale: true, originalPrice: 269.00, lastUpdated: '2024-01-15T08:45:00Z' },

  // Ryobi Drill prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 179.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'bunnings', locationId: 'bunnings-manukau', price: 179.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 185.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },

  // Makita Angle Grinder prices
  { storeId: 'bunnings', locationId: 'bunnings-lynn-mall', price: 199.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 205.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 189.95, inStock: true, onSale: true, originalPrice: 219.00, lastUpdated: '2024-01-15T08:45:00Z' },

  // DeWalt Circular Saw prices
  { storeId: 'bunnings', locationId: 'bunnings-glenfield', price: 269.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 279.00, inStock: false, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 259.95, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },
  
  // Stanley Hammer prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 38.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 41.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 39.75, inStock: true, onSale: true, originalPrice: 44.90, lastUpdated: '2024-01-15T10:45:00Z' },
  
  // Bahco Wrench prices
  { storeId: 'bunnings', locationId: 'bunnings-lynn-mall', price: 45.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 48.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 43.50, inStock: true, lastUpdated: '2024-01-15T10:45:00Z' },

  // Stanley Screwdriver Set prices
  { storeId: 'bunnings', locationId: 'bunnings-manukau', price: 24.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 27.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 22.95, inStock: true, onSale: true, originalPrice: 26.90, lastUpdated: '2024-01-15T08:45:00Z' },

  // Irwin Pliers Set prices
  { storeId: 'bunnings', locationId: 'bunnings-albany', price: 89.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 95.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 84.95, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },

  // Stanley Tape Measure prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 19.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'bunnings', locationId: 'bunnings-glenfield', price: 19.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 22.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },

  // Milwaukee Utility Knife prices
  { storeId: 'bunnings', locationId: 'bunnings-lynn-mall', price: 34.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 37.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 32.95, inStock: true, onSale: true, originalPrice: 36.90, lastUpdated: '2024-01-15T08:45:00Z' },
  
  // PVC Pipe prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 34.50, inStock: true, lastUpdated: '2024-01-15T11:00:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 32.80, inStock: true, lastUpdated: '2024-01-15T10:45:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 36.90, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  
  // Basin Mixer prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 189.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 195.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 175.50, inStock: true, onSale: true, originalPrice: 199.00, lastUpdated: '2024-01-15T10:45:00Z' },

  // Methven Shower Head prices
  { storeId: 'bunnings', locationId: 'bunnings-manukau', price: 129.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 135.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 119.95, inStock: true, onSale: true, originalPrice: 139.00, lastUpdated: '2024-01-15T08:45:00Z' },

  // PVC Fittings prices
  { storeId: 'bunnings', locationId: 'bunnings-albany', price: 18.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 21.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 17.95, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },

  // Caroma Toilet Suite prices
  { storeId: 'bunnings', locationId: 'bunnings-lynn-mall', price: 449.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 465.00, inStock: false, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 429.95, inStock: true, onSale: true, originalPrice: 479.00, lastUpdated: '2024-01-15T08:45:00Z' },
  
  // TPS Cable prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 185.00, inStock: true, lastUpdated: '2024-01-15T10:00:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 192.00, inStock: true, lastUpdated: '2024-01-15T10:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 178.95, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },
  
  // PDL Switch prices
  { storeId: 'bunnings', locationId: 'bunnings-glenfield', price: 12.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 14.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 11.95, inStock: true, onSale: true, originalPrice: 13.90, lastUpdated: '2024-01-15T10:45:00Z' },

  // Clipsal Power Outlet prices
  { storeId: 'bunnings', locationId: 'bunnings-manukau', price: 8.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 9.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 8.45, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },

  // HPM LED Downlight prices
  { storeId: 'bunnings', locationId: 'bunnings-albany', price: 24.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 27.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 22.95, inStock: true, onSale: true, originalPrice: 26.90, lastUpdated: '2024-01-15T08:45:00Z' },

  // Olex Single Core Cable prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 89.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 95.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 84.95, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },

  // Clipsal Safety Switch prices
  { storeId: 'bunnings', locationId: 'bunnings-lynn-mall', price: 89.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 95.00, inStock: false, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 84.95, inStock: true, onSale: true, originalPrice: 94.90, lastUpdated: '2024-01-15T08:45:00Z' },

  // Ramset DynaBolt prices
  { storeId: 'bunnings', locationId: 'bunnings-glenfield', price: 45.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 49.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 42.95, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },

  // Buildex Screws prices
  { storeId: 'bunnings', locationId: 'bunnings-manukau', price: 89.00, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 95.00, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 84.95, inStock: true, onSale: true, originalPrice: 94.90, lastUpdated: '2024-01-15T08:45:00Z' },

  // Zenith Bolts prices
  { storeId: 'bunnings', locationId: 'bunnings-albany', price: 24.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 27.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 22.95, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' },

  // Safety Glasses prices
  { storeId: 'bunnings', locationId: 'bunnings-botany', price: 12.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'bunnings', locationId: 'bunnings-lynn-mall', price: 12.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-sylvia-park', price: 14.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },

  // Hard Hat prices
  { storeId: 'bunnings', locationId: 'bunnings-glenfield', price: 34.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-wairau-park', price: 37.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-east-tamaki', price: 32.95, inStock: true, onSale: true, originalPrice: 36.90, lastUpdated: '2024-01-15T08:45:00Z' },

  // Work Gloves prices
  { storeId: 'bunnings', locationId: 'bunnings-manukau', price: 18.90, inStock: true, lastUpdated: '2024-01-15T10:30:00Z' },
  { storeId: 'mitre10', locationId: 'mitre10-mega-lincoln-road', price: 21.50, inStock: true, lastUpdated: '2024-01-15T09:15:00Z' },
  { storeId: 'placemakers', locationId: 'placemakers-penrose', price: 17.95, inStock: true, lastUpdated: '2024-01-15T08:45:00Z' }
];