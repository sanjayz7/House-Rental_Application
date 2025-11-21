// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// DB Connection
const mongoDb = require('./db/mongoConnection');

// Routes
const showRoutes = require('./routes/shows');
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const ratingsRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');
const imagesRoutes = require('./routes/images');
const purchaseRoutes = require('./routes/purchases');
const propertyRequestRoutes = require('./routes/propertyRequests');
const geolocationRoutes = require('./routes/geolocation');

// Logging utility
const logger = require('./helpers/logger');

const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ------------------------------------------------------
// ✅ CORS CONFIG (Required for Render + Vercel frontend)
// ------------------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://house-rental-application-yk8a.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ------------------------------------------------------
// Middleware
// ------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads"))
);

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.request(req.method, req.path, res.statusCode, responseTime);
  });
  
  next();
});

// Security middleware - Remove server info
app.disable('x-powered-by');

// ------------------------------------------------------
// MongoDB Initialization
// ------------------------------------------------------
mongoDb
  .initialize()
  .then(() => {
    logger.info("MongoDB initialized successfully");
    logger.info(`Environment: ${NODE_ENV}`);
    logger.info(`Server running on port ${PORT}`);
  })
  .catch((err) => {
    logger.error("Failed to initialize MongoDB", err);
    process.exit(1);
  });

// ------------------------------------------------------
// Routes
// ------------------------------------------------------
app.use("/api/shows", showRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/images", imagesRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/property-requests", propertyRequestRoutes);
app.use("/api/geolocation", geolocationRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Home Rental API is running");
});

// ------------------------------------------------------
// 404 Not Found Handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Global Error Handler
// ------------------------------------------------------
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.path}`, err);

  const statusCode = err.statusCode || 500;
  const message =
    NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
// ------------------------------------------------------
const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`✅ Server started successfully`);
  logger.info(`📍 Server running on http://localhost:${PORT}`);
  logger.info(`🔧 Environment: ${NODE_ENV}`);
});

// Graceful Shutdown
// ------------------------------------------------------
const gracefulShutdown = async (signal) => {
  logger.info(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    try {
      await mongoDb.close();
      logger.info("✅ Database connection closed");
      logger.info("✅ Server shutdown complete");
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown", err);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error("⚠️  Graceful shutdown timeout. Force shutting down...");
    process.exit(1);
  }, 30000);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", {
    promise: promise.toString(),
    reason: reason,
  });
});
