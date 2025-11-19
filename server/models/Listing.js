const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  locationText: { type: String, default: '' }, // human-readable address
  // GeoJSON Point: coordinates [lng, lat]
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 2;
        },
        message: 'location.coordinates must be [lng, lat]'
      }
    }
  },
  propertyType: { type: String },
  bedrooms: { type: Number },
  bathrooms: { type: Number },
  area: { type: Number },
  furnished: { type: String },
  furnishing: { type: String, required: true }, // e.g., 'Furnished', 'Semi-furnished', 'Unfurnished'
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  ownerEmail: { type: String, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: { type: Boolean, default: false },
  status: { type: String, default: 'available' }, // e.g., 'available', 'rented', 'sold'
  depositAmount: { type: Number, required: true },
  availableFor: { type: String, required: true }, // e.g., 'Family', 'Bachelors', 'Any'
  availableUnits: { type: Number, default: 1 }
}, { timestamps: true });

// 2dsphere index for geospatial queries
ListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', ListingSchema);
