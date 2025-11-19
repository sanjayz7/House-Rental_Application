const express = require('express');
const router = express.Router();
const geolocationController = require('../controllers/geolocationController');
const { authenticate } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/geocode', geolocationController.geocodeAddress);
router.post('/reverse-geocode', geolocationController.reverseGeocode);
router.get('/nearby-amenities', geolocationController.findNearbyAmenities);
router.post('/directions', geolocationController.getDirections);
router.post('/calculate-distance', geolocationController.calculateDistance);
router.get('/nearby-properties', geolocationController.findPropertiesNearby);
router.get('/autocomplete-address', geolocationController.autocompleteAddress);

module.exports = router;
