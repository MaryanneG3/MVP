// Utility functions for processing comprehensive store data
// These functions will help structure and validate the collected data

import { ComprehensiveStoreData } from '../data/storeDataStructure';
import { Store, StoreLocation } from '../types';

// Convert comprehensive store data to our app format
export function convertComprehensiveDataToAppFormat(
  comprehensiveData: ComprehensiveStoreData[]
): Store[] {
  return comprehensiveData.map(storeData => ({
    id: storeData.chain.id,
    name: storeData.chain.name,
    logo: storeData.chain.logo,
    category: storeData.chain.category,
    locations: storeData.locations
      .filter(location => location.isActive)
      .map(location => ({
        id: location.id,
        address: `${location.address.street}`,
        suburb: location.address.suburb,
        state: location.address.region,
        postcode: location.address.postcode,
        phone: location.contact.phone,
        coordinates: {
          lat: location.coordinates.latitude,
          lng: location.coordinates.longitude,
          accuracy: location.coordinates.accuracy,
          verified: location.coordinates.verified
        },
        hours: location.hours,
        services: location.services,
        features: location.features,
        size: location.size
      }))
  }));
}

// Validate store data completeness
export function validateStoreData(storeData: ComprehensiveStoreData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate chain information
  if (!storeData.chain.id) errors.push('Chain ID is required');
  if (!storeData.chain.name) errors.push('Chain name is required');
  if (!storeData.chain.category) errors.push('Chain category is required');

  // Validate locations
  if (!storeData.locations || storeData.locations.length === 0) {
    errors.push('At least one location is required');
  } else {
    storeData.locations.forEach((location, index) => {
      const prefix = `Location ${index + 1}`;
      
      if (!location.id) errors.push(`${prefix}: ID is required`);
      if (!location.address.street) errors.push(`${prefix}: Street address is required`);
      if (!location.address.suburb) errors.push(`${prefix}: Suburb is required`);
      if (!location.address.city) errors.push(`${prefix}: City is required`);
      if (!location.address.region) errors.push(`${prefix}: Region is required`);
      if (!location.address.postcode) errors.push(`${prefix}: Postcode is required`);
      if (!location.contact.phone) errors.push(`${prefix}: Phone number is required`);
      
      // Validate coordinates
      if (!location.coordinates.latitude || !location.coordinates.longitude) {
        warnings.push(`${prefix}: GPS coordinates missing`);
      } else {
        // Check if coordinates are within New Zealand bounds
        const lat = location.coordinates.latitude;
        const lng = location.coordinates.longitude;
        if (lat < -47.5 || lat > -34 || lng < 166 || lng > 179) {
          errors.push(`${prefix}: Coordinates appear to be outside New Zealand`);
        }
      }
      
      // Validate hours
      const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      requiredDays.forEach(day => {
        if (!location.hours[day as keyof typeof location.hours]) {
          warnings.push(`${prefix}: ${day} hours not specified`);
        }
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Generate data collection report
export function generateDataCollectionReport(
  collectedData: ComprehensiveStoreData[]
): {
  totalStores: number;
  storesByChain: Record<string, number>;
  storesByRegion: Record<string, number>;
  completenessScore: number;
  missingData: string[];
} {
  const totalStores = collectedData.reduce((sum, chain) => sum + chain.locations.length, 0);
  
  const storesByChain: Record<string, number> = {};
  const storesByRegion: Record<string, number> = {};
  const missingData: string[] = [];
  
  let totalCompleteness = 0;
  let totalFields = 0;
  
  collectedData.forEach(chain => {
    storesByChain[chain.chain.name] = chain.locations.length;
    
    chain.locations.forEach(location => {
      // Count by region
      const region = location.address.region;
      storesByRegion[region] = (storesByRegion[region] || 0) + 1;
      
      // Calculate completeness
      const requiredFields = [
        location.id,
        location.address.street,
        location.address.suburb,
        location.address.city,
        location.address.region,
        location.address.postcode,
        location.contact.phone,
        location.coordinates.latitude,
        location.coordinates.longitude
      ];
      
      const completedFields = requiredFields.filter(field => field).length;
      totalCompleteness += completedFields;
      totalFields += requiredFields.length;
      
      // Track missing data
      if (!location.coordinates.latitude || !location.coordinates.longitude) {
        missingData.push(`${chain.chain.name} - ${location.address.suburb}: GPS coordinates`);
      }
      if (!location.hours.monday) {
        missingData.push(`${chain.chain.name} - ${location.address.suburb}: Store hours`);
      }
    });
  });
  
  return {
    totalStores,
    storesByChain,
    storesByRegion,
    completenessScore: Math.round((totalCompleteness / totalFields) * 100),
    missingData: missingData.slice(0, 20) // Limit to first 20 items
  };
}

// Helper function to geocode addresses (placeholder for external service)
export async function geocodeAddress(address: string): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
} | null> {
  // This would integrate with a geocoding service like Google Maps API
  // For now, return null to indicate manual coordinate entry needed
  console.log(`Geocoding needed for: ${address}`);
  return null;
}

// Validate New Zealand phone numbers
export function validateNZPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check for valid NZ phone number patterns
  const patterns = [
    /^64[0-9]{8,9}$/, // International format
    /^0[0-9]{8,9}$/, // National format
    /^[0-9]{7,8}$/ // Local format
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

// Validate New Zealand postcodes
export function validateNZPostcode(postcode: string): boolean {
  // NZ postcodes are 4 digits
  return /^[0-9]{4}$/.test(postcode);
}