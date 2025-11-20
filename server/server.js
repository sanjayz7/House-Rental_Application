// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

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

const app = express();
const PORT = process.env.PORT || 5001;

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

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ------------------------------------------------------
// MongoDB Initialization
// ------------------------------------------------------
mongoDb
  .initialize()
  .then(() => console.log("MongoDB initialized successfully"))
  .catch((err) => console.error("Failed to initialize MongoDB:", err));

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
// Global Error Handler
// ------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Server error",
    message: err.message,
  });
});

// ------------------------------------------------------
// Start Server
// ------------------------------------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// ------------------------------------------------------
// Graceful Shutdown
// ------------------------------------------------------
process.on("SIGINT", async () => {
  try {
    await mongoDb.close();
    console.log("Database connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});
