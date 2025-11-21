# 🏠 Home Rental Application - Production Ready

This application is now configured and optimized for production deployment.

## What's New in Production Setup

### Security Enhancements ✅
- **Helmet.js**: Adds security headers to prevent common attacks
- **Rate Limiting**: Prevents brute force and DDoS attacks
- **Input Validation**: Sanitizes all user inputs
- **CORS Protection**: Restricts API access to authorized domains
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds

### Logging & Monitoring ✅
- **Structured Logging**: All requests and errors logged with timestamps
- **Log Rotation**: Separate logs for info, errors, and warnings
- **Request Tracking**: Response times and status codes logged
- **Error Tracking**: Stack traces and error details captured
- **Health Check**: `/health` endpoint for monitoring

### Performance Optimization ✅
- **Gzip Compression**: Reduces response sizes
- **Request Timeout**: Prevents hanging requests
- **Connection Pooling**: Optimized database connections
- **Code Minification**: Optimized frontend bundles
- **Database Indexes**: Fast query execution

### Deployment Options ✅
- **Docker Support**: Containerized deployment
- **Docker Compose**: Multi-container orchestration
- **Nginx Reverse Proxy**: Load balancing and SSL termination
- **PM2 Support**: Process management
- **Graceful Shutdown**: Clean server shutdown

## Quick Start - Production

### Option 1: Docker Compose (Recommended)

```bash
# 1. Copy environment template
cp server/.env.example server/.env

# 2. Edit .env with production values
nano server/.env

# 3. Start services
docker-compose up -d

# 4. Check health
curl http://localhost:5001/health

# 5. View logs
docker-compose logs -f api
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install

# 2. Setup environment
cp server/.env.example server/.env
# Edit server/.env with your values

# 3. Build frontend
cd client && npm run build

# 4. Start server
cd ../server && npm run prod

# 5. In another terminal, check health
curl http://localhost:5001/health
```

### Option 3: PM2 Process Manager

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/server.js --name "home-rental-api"

# Enable auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs home-rental-api
```

## Configuration

### Environment Variables

Create `server/.env` with:

```env
# Environment
NODE_ENV=production
PORT=5001

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/home-rental

# Security
JWT_SECRET=your_super_secret_key_min_32_chars

# CORS
CORS_ORIGIN=https://yourdomain.com

# Google Maps (optional)
GOOGLE_MAPS_API_KEY=your_api_key

# Logging
LOG_LEVEL=info
```

## File Structure

```
├── server/
│   ├── helpers/
│   │   ├── logger.js          # Logging utility
│   │   └── validation.js      # Input validation
│   ├── logs/                  # Application logs
│   ├── public/uploads/        # User uploaded files
│   ├── server.js              # Main server file
│   └── package.json           # Dependencies
├── client/
│   ├── build/                 # Production build
│   ├── src/
│   └── package.json
├── Dockerfile                 # Docker image configuration
├── docker-compose.yml         # Multi-container setup
└── PRODUCTION_DEPLOYMENT.md   # Detailed deployment guide
```

## API Endpoints

### Health & Status
- `GET /health` - Server health check
- `GET /` - API status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get specific listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth required)
- `DELETE /api/listings/:id` - Delete listing (auth required)

### More endpoints documented in API_KEY_VERIFICATION.md

## Monitoring

### Logs Location

```bash
# View logs
tail -f server/logs/info-*.log
tail -f server/logs/error-*.log

# Or with Docker
docker-compose logs -f api
```

### Health Check

```bash
# Check server health
curl http://localhost:5001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-11-20T...",
  "uptime": 3600
}
```

### Performance Metrics

Monitor these metrics:
- Response time (should be < 200ms for p95)
- Error rate (should be < 1%)
- CPU usage (should be < 70%)
- Memory usage (should be < 500MB)
- Database query time (should be < 100ms)

## Backup & Recovery

### Backup Database

```bash
# Using Docker
docker exec home-rental-mongodb mongodump --out=/data/backup

# Using MongoDB CLI
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/home-rental" --out=./backups
```

### Restore Database

```bash
# Using Docker
docker exec home-rental-mongodb mongorestore /data/backup

# Using MongoDB CLI
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/home-rental" ./backups
```

### Schedule Backups

```bash
# Add to crontab
0 2 * * * docker exec home-rental-mongodb mongodump --out=/data/backup_$(date +\%Y\%m\%d)
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` to git
- Use strong, random JWT_SECRET
- Rotate secrets regularly

### 2. HTTPS/SSL
- Always use HTTPS in production
- Get free SSL from Let's Encrypt
- Set HSTS header (enabled by default)

### 3. Database
- Use strong passwords
- Enable authentication
- Whitelist IP addresses
- Backup regularly

### 4. API Security
- Rate limiting enabled (100 req/15 min)
- CORS properly configured
- Input validation enabled
- NoSQL injection prevention

### 5. Updates
- Keep dependencies updated
- Run `npm audit` regularly
- Use `npm audit fix` for vulnerabilities

## Troubleshooting

### High Memory Usage

```bash
# Check for memory leaks
docker stats home-rental-api

# Restart container
docker-compose restart api
```

### Database Connection Issues

```bash
# Check MongoDB connection
docker exec home-rental-mongodb mongosh

# Verify connection string
echo $MONGODB_URI
```

### CORS Errors

```bash
# Check CORS configuration
echo $CORS_ORIGIN

# Update CORS_ORIGIN if needed
```

### Slow API Responses

```bash
# Check database indexes
docker exec home-rental-mongodb mongosh

# View slow logs
docker-compose logs api | grep "slow"
```

## Deployment Checklist

- [ ] Environment variables set
- [ ] Database running and accessible
- [ ] SSL/HTTPS configured
- [ ] Backups scheduled
- [ ] Monitoring configured
- [ ] Logging verified
- [ ] Health check working
- [ ] Rate limiting active
- [ ] CORS properly configured
- [ ] All secrets secure

## Support Resources

- **Deployment Guide**: See `PRODUCTION_DEPLOYMENT.md`
- **Pre-Launch Checklist**: See `PRODUCTION_CHECKLIST.md`
- **Setup Script**: Run `./PRODUCTION_SETUP.sh`
- **Documentation**: See API_KEY_VERIFICATION.md and other .md files

## Updates & Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update major versions (test thoroughly)
npm install <package>@latest
```

### Database Maintenance

```bash
# Check database stats
db.stats()

# Compact collections
db.collection.compact()

# Monitor replication
rs.status()
```

## Performance Tips

1. **Enable Caching**: Use Redis for frequent queries
2. **Use CDN**: Serve static assets from CloudFlare/S3
3. **Database Optimization**: Index frequently queried fields
4. **Code Splitting**: Lazy load components in React
5. **Image Optimization**: Compress and optimize images
6. **Monitoring**: Use New Relic or DataDog

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env or kill process |
| MongoDB connection timeout | Check connection string and network |
| CORS errors | Update CORS_ORIGIN in .env |
| High memory usage | Check for memory leaks, restart app |
| Slow queries | Add database indexes |
| SSL errors | Verify certificate and update .env |

## Next Steps

1. ✅ Review `PRODUCTION_DEPLOYMENT.md`
2. ✅ Run `PRODUCTION_SETUP.sh`
3. ✅ Complete `PRODUCTION_CHECKLIST.md`
4. ✅ Set up monitoring and alerting
5. ✅ Configure backups
6. ✅ Test failover procedures
7. ✅ Schedule team training
8. ✅ Plan launch day

## Production Support

For issues or questions:
1. Check logs: `docker-compose logs -f api`
2. Review documentation
3. Check health endpoint: `curl http://localhost:5001/health`
4. Verify environment variables
5. Test database connection

---

**Last Updated**: 2024-11-20  
**Version**: 1.0.0  
**Status**: Production Ready ✅
