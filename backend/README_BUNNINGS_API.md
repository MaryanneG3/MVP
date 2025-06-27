# Bunnings Official Location API Integration

## Overview

Bunnings provides an official OAuth2-protected Location API for partners. This API is **not publicly accessible** and requires special partner credentials.

## API Endpoints

### Environments
- **Sandbox**: `https://location.sandbox.api.bunnings.com.au/location`
- **Test**: `https://location.stg.api.bunnings.com.au/location`
- **Live**: `https://location.api.bunnings.com.au/location`

### Developer Portals
- **Live**: `developer.live.bunnings.com.au`
- **Sandbox**: `developer.sandbox.bunnings.com.au`

## Authentication

The API uses **OAuth2 Client Credentials Flow**:

1. **Register as Partner**: Apply at `developer.live.bunnings.com.au`
2. **Get Credentials**: Obtain `client_id` and `client_secret`
3. **Request Token**: POST to OAuth2 token endpoint
4. **Use Bearer Token**: Include in API requests

### Example Token Request
```bash
curl -X POST https://auth.api.bunnings.com.au/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&scope=location:read"
```

### Example API Request
```bash
curl -X GET https://location.api.bunnings.com.au/location \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Accept: application/json"
```

## Current Implementation

Our scraper includes:

1. **OAuth2 Integration**: Ready to use official API when credentials are available
2. **Fallback Scraping**: Web scraping when API access is not available
3. **Verified Data**: Manually verified store locations as fallback

## Configuration

Add to your `.env` file:
```env
BUNNINGS_CLIENT_ID=your_client_id_here
BUNNINGS_CLIENT_SECRET=your_client_secret_here
```

## Data Quality

- **Official API**: 100% accurate, real-time data
- **Web Scraping**: Limited by website structure changes
- **Fallback Data**: Manually verified, but may become outdated

## Partner Application Process

To access the official API:

1. Visit `developer.live.bunnings.com.au`
2. Apply for partner access
3. Provide business justification
4. Complete technical integration requirements
5. Receive OAuth2 credentials

## Legal Compliance

- **Respect robots.txt**: Always check website scraping policies
- **Rate Limiting**: Implement appropriate delays
- **Terms of Service**: Review and comply with Bunnings ToS
- **Data Usage**: Use data only for intended purposes

## Alternative Approaches

If official API access is not available:

1. **Manual Data Collection**: Verify store locations manually
2. **Third-party Services**: Use services like Google Places API
3. **Public Datasets**: Check for open government data
4. **Partnership**: Explore data partnership opportunities

## Support

For API access issues:
- Contact Bunnings developer support
- Review documentation at developer portals
- Check OAuth2 implementation requirements