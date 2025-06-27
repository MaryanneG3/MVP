# Comprehensive Store Data Collection Guide

This guide outlines how to collect complete store location data for all major New Zealand trade stores.

## Required Data Sources

### 1. Bunnings Warehouse
- **Store Locator**: https://www.bunnings.co.nz/store-finder
- **Expected Stores**: ~45 locations
- **Data Collection Method**: 
  - Use browser developer tools to inspect network requests
  - Look for JSON responses containing store data
  - Extract coordinates, addresses, phone numbers, and hours

### 2. Mitre 10 (Including Mega stores)
- **Store Locator**: https://www.mitre10.co.nz/store-locator
- **Expected Stores**: ~85 locations
- **Notes**: Includes both regular Mitre 10 and Mitre 10 MEGA stores

### 3. PlaceMakers
- **Store Locator**: https://www.placemakers.co.nz/store-locator
- **Expected Stores**: ~60 locations
- **Notes**: Part of Fletcher Building network

### 4. Repco
- **Store Locator**: https://www.repco.co.nz/stores
- **Expected Stores**: ~35 locations
- **Focus**: Automotive parts and accessories

### 5. Supercheap Auto
- **Store Locator**: https://www.supercheapauto.co.nz/stores
- **Expected Stores**: ~25 locations
- **Focus**: Automotive retail

### 6. Cory's Electrical
- **Store Locator**: https://www.corys.co.nz/store-locator
- **Expected Stores**: ~20 locations
- **Focus**: Electrical wholesale and retail

### 7. PDL (Schneider Electric)
- **Store Locator**: https://www.pdl.co.nz/where-to-buy
- **Expected Stores**: ~15 locations
- **Focus**: Electrical products and switches

### 8. Plumbing World
- **Store Locator**: https://www.plumbingworld.co.nz/store-locator
- **Expected Stores**: ~30 locations
- **Focus**: Plumbing supplies

### 9. Mico Plumbing
- **Store Locator**: https://www.mico.co.nz/store-locator
- **Expected Stores**: ~15 locations
- **Focus**: Plumbing and bathroom supplies

### 10. Kings Plant Barn
- **Store Locator**: https://www.kings.co.nz/garden-centres
- **Expected Stores**: ~12 locations
- **Focus**: Garden centres and landscaping

### 11. Oderings Garden Centres
- **Store Locator**: https://www.oderings.co.nz/garden-centres
- **Expected Stores**: ~8 locations
- **Focus**: Garden centres (mainly South Island)

### 12. BOC (Welding Supplies)
- **Store Locator**: https://www.boc.co.nz/shop/en/nz/where-to-buy
- **Expected Stores**: ~25 locations
- **Focus**: Welding and industrial gases

## Data Collection Process

### Step 1: Automated Data Extraction
1. Use web scraping tools like:
   - **ScrapeHero.com** (professional service)
   - **Scrapy** (Python framework)
   - **Puppeteer** (JavaScript automation)
   - **Beautiful Soup** (Python library)

### Step 2: Manual Verification
1. Cross-reference with **Google Maps**
2. Verify phone numbers by calling stores
3. Check store hours on official websites
4. Validate addresses with **New Zealand Post**

### Step 3: Data Standardization
1. Format all addresses consistently
2. Standardize phone numbers to NZ format
3. Convert coordinates to decimal degrees
4. Normalize store hours format

## Required Data Fields

### Essential Fields
- Store chain name and ID
- Store number (if applicable)
- Complete street address
- Suburb/City
- Region
- Postcode (4 digits)
- Phone number (NZ format)
- GPS coordinates (latitude/longitude)
- Store hours (all 7 days)

### Optional Fields
- Email address
- Fax number
- Store size/type
- Special services (Click & Collect, Delivery, etc.)
- Drive-through availability
- Trade desk hours
- Parking information

## Data Validation Checklist

### Address Validation
- [ ] Street address is complete and accurate
- [ ] Suburb matches official NZ locality names
- [ ] Region is one of the 16 official NZ regions
- [ ] Postcode is 4 digits and valid for the area

### Contact Validation
- [ ] Phone number follows NZ format
- [ ] Phone number is reachable
- [ ] Store hours are current and accurate

### Coordinate Validation
- [ ] Latitude is between -47.5 and -34 (NZ bounds)
- [ ] Longitude is between 166 and 179 (NZ bounds)
- [ ] Coordinates match the street address
- [ ] Accuracy is within 50 meters

## Implementation Steps

1. **Collect Raw Data**: Use the sources above to gather all store information
2. **Structure Data**: Format according to `ComprehensiveStoreData` interface
3. **Validate Data**: Run through validation functions
4. **Import Data**: Replace mock data with real comprehensive data
5. **Test System**: Verify location filtering works correctly
6. **Deploy**: Update production with complete store network

## Expected Outcome

After completing this data collection:
- **Total Stores**: ~350+ locations across New Zealand
- **Coverage**: All major regions from Northland to Southland
- **Accuracy**: GPS coordinates within 10-50 meters
- **Completeness**: 95%+ data completeness for essential fields
- **Freshness**: All data verified within last 30 days

## Tools and Resources

### Recommended Tools
- **ScrapeHero.com**: Professional web scraping service
- **Google Maps API**: For geocoding and verification
- **Yellow.co.nz**: Local business directory verification
- **New Zealand Post**: Address validation
- **Postman**: API testing and data extraction

### Data Formats
- Export data as JSON following the `ComprehensiveStoreData` structure
- Include validation reports
- Provide data collection timestamps
- Document any limitations or missing information

Once you have collected this comprehensive data using the tools and methods outlined above, I can help you integrate it into the application to provide accurate, complete store coverage across all of New Zealand.