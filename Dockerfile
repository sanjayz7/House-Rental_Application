# Multi-stage build for optimized image

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY server/package*.json ./

RUN npm ci --only=production

# Stage 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Create directories for logs and uploads
RUN mkdir -p logs public/uploads

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY server/ .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 5001

# Start application
CMD ["node", "server.js"]
