#!/bin/bash

# ========================================
# Production Setup Script
# Home Rental Application
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header() {
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if running as root for some operations
if [[ $EUID -ne 0 ]]; then
   print_warning "Some operations may require sudo. Script will prompt for password if needed."
fi

# Start setup
print_header "🚀 HOME RENTAL APPLICATION - PRODUCTION SETUP"

# 1. Check Node.js version
print_header "Step 1: Checking Node.js Installation"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# 2. Check npm version
print_header "Step 2: Checking npm Installation"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm is not installed."
    exit 1
fi

# 3. Check Docker installation
print_header "Step 3: Checking Docker Installation"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "$DOCKER_VERSION"
else
    print_warning "Docker is not installed. You can install it from https://docs.docker.com/get-docker/"
fi

# 4. Create environment files
print_header "Step 4: Setting up Environment Variables"
if [ -f "server/.env" ]; then
    print_warning "server/.env already exists. Skipping creation."
else
    if [ -f "server/.env.example" ]; then
        cp server/.env.example server/.env
        print_success "Created server/.env from template"
        print_warning "Please update server/.env with your production values"
    else
        print_error "server/.env.example not found"
    fi
fi

if [ -f "client/.env" ]; then
    print_warning "client/.env already exists. Skipping creation."
else
    cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5001
REACT_APP_GOOGLE_MAPS_KEY=your_api_key_here
EOF
    print_success "Created client/.env"
    print_warning "Please update client/.env with your production values"
fi

# 5. Install server dependencies
print_header "Step 5: Installing Server Dependencies"
cd server
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Server dependencies installed"
else
    print_warning "Server node_modules already exists"
fi
cd ..

# 6. Install client dependencies
print_header "Step 6: Installing Client Dependencies"
cd client
if [ ! -d "node_modules" ]; then
    npm install
    print_success "Client dependencies installed"
else
    print_warning "Client node_modules already exists"
fi
cd ..

# 7. Security check
print_header "Step 7: Security Audit"
cd server
print_warning "Running npm audit..."
npm audit --audit-level=high || print_warning "Some security issues found. Review and fix them."
cd ..

# 8. Create logs directory
print_header "Step 8: Setting up Logging"
mkdir -p server/logs
mkdir -p server/public/uploads
chmod 755 server/logs
chmod 755 server/public/uploads
print_success "Log directories created"

# 9. Build frontend
print_header "Step 9: Building Frontend"
cd client
npm run build
print_success "Frontend build complete"
cd ..

# 10. MongoDB setup instructions
print_header "Step 10: Database Setup"
print_warning "MongoDB Setup Instructions:"
echo "1. Make sure MongoDB is running:"
echo "   - Local: mongod"
echo "   - Docker: docker run -d -p 27017:27017 --name mongodb mongo"
echo "   - Atlas: Get connection string from https://cloud.mongodb.com"
echo ""
echo "2. Update MONGODB_URI in server/.env with your connection string"
echo ""
print_warning "Create indexes in MongoDB (run once):"
cat > /tmp/mongo-indexes.js << 'MONGO_EOF'
db.listings.createIndex({ location: "text", title: "text" });
db.listings.createIndex({ owner_email: 1 });
db.listings.createIndex({ created_at: -1 });
db.users.createIndex({ email: 1 }, { unique: true });
db.property_requests.createIndex({ listing_id: 1, user_email: 1 });
MONGO_EOF
echo "mongosh mongodb://localhost:27017/home-rental < /tmp/mongo-indexes.js"

# 11. Docker setup
print_header "Step 11: Docker Setup"
if command -v docker &> /dev/null; then
    print_success "Building Docker image..."
    docker build -t home-rental-api:latest .
    print_success "Docker image built"
    print_warning "To run with Docker Compose: docker-compose up -d"
else
    print_warning "Docker not installed. Skipping Docker setup."
fi

# 12. Production checklist
print_header "Step 12: Pre-Production Tasks"
print_warning "Please complete the following before deploying to production:"
echo "1. ✓ Update all environment variables in server/.env"
echo "2. ✓ Set strong JWT_SECRET (min 32 characters)"
echo "3. ✓ Configure CORS_ORIGIN for your domain"
echo "4. ✓ Set up SSL/HTTPS certificates"
echo "5. ✓ Configure database backups"
echo "6. ✓ Set up monitoring and logging"
echo "7. ✓ Run security audit: npm audit"
echo "8. ✓ Test in staging environment"
echo "9. ✓ Create deployment runbook"
echo "10. ✓ Set up CI/CD pipeline"

# 13. Quick start commands
print_header "Step 13: Quick Start Commands"
echo -e "${GREEN}Development:${NC}"
echo "  cd server && npm run dev"
echo "  cd client && npm start"
echo ""
echo -e "${GREEN}Production:${NC}"
echo "  docker-compose up -d"
echo ""
echo -e "${GREEN}Check Health:${NC}"
echo "  curl http://localhost:5001/health"
echo ""
echo -e "${GREEN}View Logs:${NC}"
echo "  docker-compose logs -f api"

# Final message
print_header "✅ SETUP COMPLETE"
print_success "Production setup completed successfully!"
print_warning "Don't forget to:"
echo "1. Review and update server/.env with production values"
echo "2. Set up MongoDB and create indexes"
echo "3. Configure SSL/HTTPS"
echo "4. Set up monitoring and alerting"
echo "5. Test thoroughly in staging"
echo "6. Review PRODUCTION_DEPLOYMENT.md for detailed guide"
echo ""
print_success "Happy deploying! 🚀"
