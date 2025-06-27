# Deployment Guide for Web Scraping Backend

## Deployment Options

### 1. Vercel (Recommended for Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Railway (Full Server)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 3. Render (Docker Support)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Install Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### 4. AWS Lambda (Serverless)
Use Serverless Framework:
```yaml
# serverless.yml
service: tradie-scraper

provider:
  name: aws
  runtime: nodejs18.x
  region: ap-southeast-2

functions:
  api:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    timeout: 30
    memorySize: 1024

plugins:
  - serverless-offline
```

## Environment Variables

Set these in your deployment platform:

```env
NODE_ENV=production
PORT=3001
API_KEY=your-secure-api-key
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
SCRAPING_INTERVAL=daily
PRICE_UPDATE_INTERVAL=4hours
```

## Monitoring and Logging

### Health Checks
- `/health` endpoint for monitoring
- Log scraping success/failure rates
- Monitor response times

### Error Handling
- Retry failed scraping attempts
- Fallback to cached data
- Alert on consecutive failures

## Legal Considerations

### Compliance
- Respect robots.txt files
- Implement rate limiting
- Add delays between requests
- Use proper User-Agent headers

### Terms of Service
- Review each website's ToS
- Consider reaching out for API access
- Implement ethical scraping practices

## Performance Optimization

### Caching
- Cache store data for 24 hours
- Cache prices for 4 hours
- Use Redis for production

### Rate Limiting
- Limit requests per minute
- Implement exponential backoff
- Respect server load

## Scaling Considerations

### Horizontal Scaling
- Use queue systems for large scraping jobs
- Distribute scraping across multiple workers
- Implement load balancing

### Database Integration
- Replace in-memory storage with PostgreSQL/MongoDB
- Implement proper indexing
- Add data archiving
```