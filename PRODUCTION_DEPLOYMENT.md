# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backed up and tested
- [ ] SSL/TLS certificates obtained
- [ ] Secrets stored securely
- [ ] Rate limiting configured
- [ ] Logging enabled
- [ ] Error monitoring set up
- [ ] CDN configured for static assets

## Environment Setup

### 1. Production Environment Variables

Create `.env` file in the server directory with production values:

```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://prod_user:prod_password@cluster.mongodb.net/home-rental
JWT_SECRET=your_super_secret_key_with_min_32_characters_change_this
CORS_ORIGIN=https://yourdomain.com
GOOGLE_MAPS_API_KEY=your_production_api_key
```

### 2. Frontend Configuration

Update frontend API endpoints in `.env`:

```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_GOOGLE_MAPS_KEY=your_production_maps_key
```

## Database Optimization

### Create Indexes

```javascript
// Run this once in production
db.listings.createIndex({ location: "text", title: "text" });
db.listings.createIndex({ owner_email: 1 });
db.listings.createIndex({ created_at: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.property_requests.createIndex({ listing_id: 1, user_email: 1 });
```

### Connection Pooling

MongoDB connection pooling is automatically handled by Mongoose with:
- `maxPoolSize: 10` (production default)
- Connection timeout: 30 seconds
- Socket timeout: 45 seconds

## Deployment Options

### Option 1: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t home-rental-api:latest .
docker run -d --name home-rental-api -p 5001:5001 --env-file .env home-rental-api:latest
```

### Option 2: Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create home-rental-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Option 3: AWS/DigitalOcean VM

1. SSH into server
2. Install Node.js v18+
3. Clone repository
4. Install dependencies: `npm install`
5. Set environment variables: `export NODE_ENV=production`
6. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name "home-rental-api"
pm2 startup
pm2 save
```

### Option 4: Render.com Deployment

1. Connect GitHub repository
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add environment variables in dashboard
6. Deploy

## Nginx Reverse Proxy Setup

Create `/etc/nginx/sites-available/home-rental`:

```nginx
upstream home_rental_api {
    server localhost:5001;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/ssl/certs/your_cert.crt;
    ssl_certificate_key /etc/ssl/private/your_key.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        proxy_pass http://home_rental_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/home-rental /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Frontend Build & Deployment

### Build Frontend

```bash
cd client
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

## Monitoring & Logging

### Server Logs

Logs are stored in `./logs/` directory:
- `info-YYYY-MM-DD.log` - Info messages
- `error-YYYY-MM-DD.log` - Error messages
- `warn-YYYY-MM-DD.log` - Warning messages

### PM2 Monitoring

```bash
pm2 monit
pm2 log home-rental-api
```

### Set Up Error Monitoring

Use services like:
- Sentry
- New Relic
- DataDog
- LogRocket

Example Sentry integration:

```bash
npm install @sentry/node
```

In server.js:

```javascript
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
app.use(Sentry.Handlers.errorHandler());
```

## Performance Optimization

### 1. Enable Gzip Compression

```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Set Up CDN for Static Assets

- Upload images to AWS S3 or Cloudinary
- Use CloudFlare for CDN

### 3. Database Query Optimization

- Add indexes on frequently queried fields
- Use pagination for large datasets
- Cache frequently accessed data

### 4. API Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```

## Security Hardening

### 1. Update Dependencies

```bash
npm audit
npm audit fix
```

### 2. Enable HTTPS

- Install SSL certificate
- Redirect HTTP to HTTPS
- Set HSTS headers

### 3. Secure Cookies

```javascript
app.use(session({
  secure: true,
  httpOnly: true,
  sameSite: 'strict'
}));
```

### 4. CORS Configuration

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

## Backup & Recovery

### Database Backups

```bash
# MongoDB backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/home-rental" --out=./backups

# Schedule daily backups (crontab)
0 2 * * * mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/home-rental" --out=/backups/db_$(date +\%Y\%m\%d)
```

### Restore from Backup

```bash
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/home-rental" ./backups/db_folder_name
```

## Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Load Testing

```bash
npm install -g artillery
artillery quick --count 300 --num 10 https://api.yourdomain.com
```

## Monitoring Checklist

- [ ] Server uptime monitoring (UptimeRobot)
- [ ] Application error tracking (Sentry)
- [ ] Performance monitoring (DataDog/New Relic)
- [ ] Database backups verified
- [ ] SSL certificate valid
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Logging enabled

## Troubleshooting

### High Memory Usage
- Check for memory leaks in code
- Increase Node.js heap: `node --max-old-space-size=4096 server.js`

### Database Connection Issues
- Verify connection string
- Check MongoDB whitelist IPs
- Review connection pooling settings

### CORS Errors
- Verify CORS_ORIGIN environment variable
- Check request headers
- Ensure credentials flag is set

### Slow API Responses
- Check database indexes
- Review query performance
- Implement caching layer

## Support & Documentation

- API Documentation: `/api/docs`
- Health Check: `/health`
- Logs Directory: `./logs/`
- Environment Template: `.env.example`
