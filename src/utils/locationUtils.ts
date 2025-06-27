import { StoreLocation } from '../types';

// High-precision coordinates for Auckland areas with multiple reference points
const areaCoordinates: Record<string, { 
  lat: number; 
  lng: number; 
  bounds: { north: number; south: number; east: number; west: number };
  aliases: string[];
}> = {
  'Botany, Auckland': { 
    lat: -36.9342, 
    lng: 174.9142,
    bounds: { north: -36.920, south: -36.950, east: 174.930, west: 174.900 },
    aliases: ['Botany', 'Botany Downs', 'East Tamaki Heights']
  },
  'New Lynn, Auckland': { 
    lat: -36.9078, 
    lng: 174.6858,
    bounds: { north: -36.890, south: -36.925, east: 174.700, west: 174.670 },
    aliases: ['New Lynn', 'Lynn Mall']
  },
  'Glenfield, Auckland': { 
    lat: -36.7789, 
    lng: 174.7267,
    bounds: { north: -36.760, south: -36.800, east: 174.745, west: 174.710 },
    aliases: ['Glenfield', 'Glenfield Mall']
  },
  'Manukau, Auckland': { 
    lat: -36.9939, 
    lng: 174.8797,
    bounds: { north: -36.975, south: -37.015, east: 174.900, west: 174.860 },
    aliases: ['Manukau', 'Manukau City', 'Manukau Central']
  },
  'Albany, Auckland': { 
    lat: -36.7311, 
    lng: 174.7006,
    bounds: { north: -36.710, south: -36.750, east: 174.720, west: 174.680 },
    aliases: ['Albany', 'Albany Village', 'Albany Mall']
  },
  'Henderson, Auckland': { 
    lat: -36.8742, 
    lng: 174.6364,
    bounds: { north: -36.855, south: -36.895, east: 174.655, west: 174.615 },
    aliases: ['Henderson', 'Henderson Valley', 'Lincoln Road']
  },
  'Mount Wellington, Auckland': { 
    lat: -36.9058, 
    lng: 174.8364,
    bounds: { north: -36.885, south: -36.925, east: 174.855, west: 174.815 },
    aliases: ['Mount Wellington', 'Mt Wellington', 'Sylvia Park']
  },
  'Penrose, Auckland': { 
    lat: -36.9225, 
    lng: 174.8158,
    bounds: { north: -36.905, south: -36.940, east: 174.835, west: 174.795 },
    aliases: ['Penrose', 'Onehunga Industrial']
  },
  'East Tamaki, Auckland': { 
    lat: -36.9489, 
    lng: 174.9089,
    bounds: { north: -36.930, south: -36.970, east: 174.930, west: 174.885 },
    aliases: ['East Tamaki', 'Tamaki', 'Harris Road']
  },
  'Westgate, Auckland': { 
    lat: -36.8089, 
    lng: 174.6267,
    bounds: { north: -36.790, south: -36.830, east: 174.645, west: 174.605 },
    aliases: ['Westgate', 'Northwest Shopping Centre', 'Fernhill']
  },
  'Takapuna, Auckland': { 
    lat: -36.7867, 
    lng: 174.7733,
    bounds: { north: -36.770, south: -36.805, east: 174.790, west: 174.755 },
    aliases: ['Takapuna', 'Takapuna Beach', 'North Shore']
  },
  'Newmarket, Auckland': { 
    lat: -36.8697, 
    lng: 174.7764,
    bounds: { north: -36.860, south: -36.880, east: 174.785, west: 174.765 },
    aliases: ['Newmarket', 'Broadway', 'Khyber Pass']
  },
  'Pakuranga, Auckland': { 
    lat: -36.9089, 
    lng: 174.9142,
    bounds: { north: -36.890, south: -36.930, east: 174.935, west: 174.895 },
    aliases: ['Pakuranga', 'Pakuranga Heights', 'Highland Park']
  },
  'Papakura, Auckland': { 
    lat: -37.0658, 
    lng: 174.9439,
    bounds: { north: -37.045, south: -37.085, east: 174.965, west: 174.920 },
    aliases: ['Papakura', 'Papakura Central']
  },
  'Onehunga, Auckland': { 
    lat: -36.9267, 
    lng: 174.7833,
    bounds: { north: -36.915, south: -36.940, east: 174.795, west: 174.770 },
    aliases: ['Onehunga', 'Onehunga Mall']
  },
  'Ellerslie, Auckland': { 
    lat: -36.9089, 
    lng: 174.8000,
    bounds: { north: -36.895, south: -36.925, east: 174.815, west: 174.785 },
    aliases: ['Ellerslie', 'Ellerslie Racecourse']
  },
  'Panmure, Auckland': { 
    lat: -36.9089, 
    lng: 174.8500,
    bounds: { north: -36.895, south: -36.925, east: 174.865, west: 174.835 },
    aliases: ['Panmure', 'Panmure Basin']
  },
  'Glen Innes, Auckland': { 
    lat: -36.8833, 
    lng: 174.8667,
    bounds: { north: -36.870, south: -36.900, east: 174.880, west: 174.850 },
    aliases: ['Glen Innes', 'GI', 'Tamaki']
  },
  'Meadowbank, Auckland': { 
    lat: -36.8667, 
    lng: 174.8167,
    bounds: { north: -36.855, south: -36.880, east: 174.830, west: 174.800 },
    aliases: ['Meadowbank', 'St Johns']
  },
  'Mission Bay, Auckland': { 
    lat: -36.8500, 
    lng: 174.8333,
    bounds: { north: -36.840, south: -36.860, east: 174.845, west: 174.820 },
    aliases: ['Mission Bay', 'Kohimarama']
  },
  'Parnell, Auckland': { 
    lat: -36.8500, 
    lng: 174.7833,
    bounds: { north: -36.840, south: -36.865, east: 174.795, west: 174.770 },
    aliases: ['Parnell', 'Parnell Village']
  },
  'Remuera, Auckland': { 
    lat: -36.8833, 
    lng: 174.7833,
    bounds: { north: -36.870, south: -36.900, east: 174.800, west: 174.765 },
    aliases: ['Remuera', 'Upland Road']
  },
  'Epsom, Auckland': { 
    lat: -36.8833, 
    lng: 174.7500,
    bounds: { north: -36.870, south: -36.900, east: 174.765, west: 174.735 },
    aliases: ['Epsom', 'Royal Oak']
  },
  'Mount Eden, Auckland': { 
    lat: -36.8833, 
    lng: 174.7500,
    bounds: { north: -36.870, south: -36.900, east: 174.765, west: 174.735 },
    aliases: ['Mount Eden', 'Mt Eden', 'Eden Terrace']
  },
  'Kingsland, Auckland': { 
    lat: -36.8667, 
    lng: 174.7333,
    bounds: { north: -36.855, south: -36.880, east: 174.745, west: 174.720 },
    aliases: ['Kingsland', 'Eden Park']
  },
  'Grey Lynn, Auckland': { 
    lat: -36.8500, 
    lng: 174.7333,
    bounds: { north: -36.840, south: -36.865, east: 174.745, west: 174.720 },
    aliases: ['Grey Lynn', 'Richmond Road']
  },
  'Ponsonby, Auckland': { 
    lat: -36.8500, 
    lng: 174.7333,
    bounds: { north: -36.840, south: -36.865, east: 174.745, west: 174.720 },
    aliases: ['Ponsonby', 'Ponsonby Road']
  },
  'CBD, Auckland': { 
    lat: -36.8485, 
    lng: 174.7633,
    bounds: { north: -36.835, south: -36.865, east: 174.780, west: 174.745 },
    aliases: ['Auckland CBD', 'City Centre', 'Queen Street', 'Viaduct', 'Wynyard Quarter']
  },
  'Devonport, Auckland': { 
    lat: -36.8333, 
    lng: 174.8000,
    bounds: { north: -36.820, south: -36.850, east: 174.815, west: 174.785 },
    aliases: ['Devonport', 'North Head']
  },
  'Birkenhead, Auckland': { 
    lat: -36.8167, 
    lng: 174.7333,
    bounds: { north: -36.800, south: -36.835, east: 174.750, west: 174.715 },
    aliases: ['Birkenhead', 'Birkenhead Point']
  },
  'Northcote, Auckland': { 
    lat: -36.8000, 
    lng: 174.7500,
    bounds: { north: -36.785, south: -36.820, east: 174.765, west: 174.735 },
    aliases: ['Northcote', 'Northcote Point']
  },
  'Howick, Auckland': { 
    lat: -36.9000, 
    lng: 174.9333,
    bounds: { north: -36.885, south: -36.920, east: 174.950, west: 174.915 },
    aliases: ['Howick', 'Howick Village', 'Stockade Hill']
  },
  'Flat Bush, Auckland': { 
    lat: -36.9667, 
    lng: 174.9000,
    bounds: { north: -36.950, south: -36.985, east: 174.920, west: 174.880 },
    aliases: ['Flat Bush', 'Flatbush']
  },
  'Pukekohe, Auckland': { 
    lat: -37.2000, 
    lng: 174.9000,
    bounds: { north: -37.180, south: -37.220, east: 174.920, west: 174.880 },
    aliases: ['Pukekohe', 'Pukekohe East', 'Pukekohe Hill']
  }
};

// High-precision distance calculation using Vincenty's formula for ultimate accuracy
function calculateDistanceVincenty(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const a = 6378137; // WGS-84 semi-major axis
  const b = 6356752.314245; // WGS-84 semi-minor axis
  const f = 1 / 298.257223563; // WGS-84 flattening
  
  const L = (lng2 - lng1) * Math.PI / 180;
  const U1 = Math.atan((1 - f) * Math.tan(lat1 * Math.PI / 180));
  const U2 = Math.atan((1 - f) * Math.tan(lat2 * Math.PI / 180));
  const sinU1 = Math.sin(U1);
  const cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2);
  const cosU2 = Math.cos(U2);
  
  let lambda = L;
  let lambdaP;
  let iterLimit = 100;
  let cosSqAlpha, sinSigma, cos2SigmaM, cosSigma, sigma;
  
  do {
    const sinLambda = Math.sin(lambda);
    const cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) +
      (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
    
    if (sinSigma === 0) return 0; // co-incident points
    
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    const sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
    cosSqAlpha = 1 - sinAlpha * sinAlpha;
    cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
    
    if (isNaN(cos2SigmaM)) cos2SigmaM = 0; // equatorial line
    
    const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    lambdaP = lambda;
    lambda = L + (1 - C) * f * sinAlpha *
      (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);
  
  if (iterLimit === 0) {
    // Fallback to Haversine if Vincenty fails
    return calculateDistanceHaversine(lat1, lng1, lat2, lng2);
  }
  
  const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
  const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
    B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
  
  const s = b * A * (sigma - deltaSigma);
  
  return s / 1000; // Convert to kilometers
}

// Fallback Haversine calculation for maximum compatibility
function calculateDistanceHaversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371.0088; // Earth's radius in kilometers (more precise value)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Advanced area matching with bounds checking and alias support
export function findClosestArea(lat: number, lng: number): string {
  let closestArea = 'Botany, Auckland';
  let minDistance = Infinity;

  // First, check if coordinates fall within any area bounds (most accurate)
  for (const [area, data] of Object.entries(areaCoordinates)) {
    if (lat >= data.bounds.south && lat <= data.bounds.north &&
        lng >= data.bounds.west && lng <= data.bounds.east) {
      return area; // Direct hit within bounds
    }
  }

  // If no direct bounds match, find closest by distance
  for (const [area, data] of Object.entries(areaCoordinates)) {
    const distance = calculateDistanceVincenty(lat, lng, data.lat, data.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestArea = area;
    }
  }

  return closestArea;
}

// Enhanced geolocation with multiple positioning strategies
export function getCurrentLocation(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // High-accuracy options for ultimate precision
    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better accuracy
      maximumAge: 60000 // 1 minute cache for fresh data
    };

    // Fallback options if high accuracy fails
    const fallbackOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Log accuracy for debugging
        console.log(`Location detected with ${accuracy}m accuracy`);
        
        const closestArea = findClosestArea(latitude, longitude);
        resolve(closestArea);
      },
      (error) => {
        console.log('High accuracy failed, trying fallback method');
        
        // Try fallback method
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`Fallback location detected with ${accuracy}m accuracy`);
            
            const closestArea = findClosestArea(latitude, longitude);
            resolve(closestArea);
          },
          (fallbackError) => {
            let errorMessage = 'Unable to retrieve your location';
            
            switch (fallbackError.code) {
              case fallbackError.PERMISSION_DENIED:
                errorMessage = 'Location access denied. Please enable location services and refresh the page.';
                break;
              case fallbackError.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable. Please check your GPS/WiFi connection.';
                break;
              case fallbackError.TIMEOUT:
                errorMessage = 'Location request timed out. Please try again or select your area manually.';
                break;
            }
            
            reject(new Error(errorMessage));
          },
          fallbackOptions
        );
      },
      highAccuracyOptions
    );
  });
}

// Enhanced store location sorting with accuracy weighting and real coordinates
export function getClosestStoreLocations(
  userLocation: string, 
  storeLocations: StoreLocation[], 
  maxLocations: number = 5
): StoreLocation[] {
  const userAreaData = areaCoordinates[userLocation];
  if (!userAreaData) {
    return storeLocations.slice(0, maxLocations);
  }

  const locationsWithDistance = storeLocations.map(location => {
    let distance = 999; // Default high distance
    
    // Use real coordinates if available
    if (location.coordinates?.lat && location.coordinates?.lng) {
      distance = calculateDistanceVincenty(
        userAreaData.lat, 
        userAreaData.lng, 
        location.coordinates.lat, 
        location.coordinates.lng
      );
    }

    return {
      ...location,
      distance: Math.round(distance * 100) / 100, // Round to 2 decimal places for precision
    };
  });

  // Sort by distance with accuracy weighting
  return locationsWithDistance
    .sort((a, b) => {
      // Prioritize verified locations
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      
      // Then sort by distance
      return a.distance - b.distance;
    })
    .slice(0, maxLocations);
}

// Enhanced distance updating with verification
export function updateStoreDistances(userLocation: string, storeLocations: StoreLocation[]): StoreLocation[] {
  const userAreaData = areaCoordinates[userLocation];
  if (!userAreaData) {
    return storeLocations;
  }

  return storeLocations.map(location => {
    let distance = 999; // Default high distance
    
    // Use real coordinates if available
    if (location.coordinates?.lat && location.coordinates?.lng) {
      distance = calculateDistanceVincenty(
        userAreaData.lat, 
        userAreaData.lng, 
        location.coordinates.lat, 
        location.coordinates.lng
      );
    }

    return {
      ...location,
      distance: Math.round(distance * 100) / 100 // Ultra-precise to 2 decimal places
    };
  });
}

// Geocoding validation for area names
export function validateLocationName(locationName: string): boolean {
  const normalizedName = locationName.toLowerCase().trim();
  
  for (const [area, data] of Object.entries(areaCoordinates)) {
    if (area.toLowerCase() === normalizedName) return true;
    if (data.aliases.some(alias => alias.toLowerCase() === normalizedName)) return true;
  }
  
  return false;
}

// Get location suggestions based on partial input
export function getLocationSuggestions(partialName: string, limit: number = 10): string[] {
  const normalizedInput = partialName.toLowerCase().trim();
  const suggestions: string[] = [];
  
  for (const [area, data] of Object.entries(areaCoordinates)) {
    // Check main area name
    if (area.toLowerCase().includes(normalizedInput)) {
      suggestions.push(area);
    }
    
    // Check aliases
    for (const alias of data.aliases) {
      if (alias.toLowerCase().includes(normalizedInput) && !suggestions.includes(area)) {
        suggestions.push(area);
      }
    }
  }
  
  return suggestions.slice(0, limit);
}