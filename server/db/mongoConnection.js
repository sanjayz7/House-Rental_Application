// db/mongoConnection.js
const mongoose = require('mongoose');

let connected = false;

async function initialize() {
  const MONGO_URI = process.env.MONGODB_URI;

  if (!MONGO_URI) {
    throw new Error("❌ MONGODB_URI is NOT set in Render environment variables!");
  }

  console.log('Attempting to connect to MongoDB Atlas...');
  console.log('Using URI:', MONGO_URI.replace(/:\/\/[^@]*@/, '://****@'));

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    connected = true;

    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('Database:', mongoose.connection.db.databaseName);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      connected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      connected = true;
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

async function close() {
  if (connected) {
    await mongoose.connection.close();
    connected = false;
    console.log('MongoDB connection closed');
  }
}

module.exports = { initialize, close };
