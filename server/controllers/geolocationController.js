const express = require('express');
const axios = require('axios');
const geolocationService = require('../services/geolocationService');
const { Listing } = require('../models');

/**
 * Geocode an address to get coordinates
 */
exports.geocodeAddress = async (req, res) => {
  try {
    const { address, provider = 'smart' } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    let result;
    switch (provider) {
      case 'google':
        result = await geolocationService.geocodeWithGoogle(address);
        break;
      case 'mapbox':
        result = await geolocationService.geocodeWithMapbox(address);
        break;
      case 'nominatim':
        result = await geolocationService.geocodeWithNominatim(address);
        break;
      case 'smart':
      default:
        result = await geolocationService.smartGeocode(address);
        break;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ 
      error: 'Geocoding failed', 
      message: error.message 
    });
  }
};

/**
 * Reverse geocode coordinates to get address
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude, provider = 'nominatim' } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const result = await geolocationService.reverseGeocode(
      parseFloat(latitude), 
      parseFloat(longitude), 
      provider
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ 
      error: 'Reverse geocoding failed', 
      message: error.message 
    });
  }
};

/**
 * Find nearby amenities for a property
 */
exports.findNearbyAmenities = async (req, res) => {
  try {
    const { latitude, longitude, radius = 1000, type = 'lodging' } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const amenities = await geolocationService.findNearbyAmenities(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(radius),
      type
    );

    res.json({
      success: true,
      data: amenities
    });
  } catch (error) {
    console.error('Nearby amenities error:', error);
    res.status(500).json({ 
      error: 'Failed to find nearby amenities', 
      message: error.message 
    });
  }
};

/**
 * Get directions between two points
 */
exports.getDirections = async (req, res) => {
  try {
    const { origin, destination, mode = 'driving' } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const directions = await geolocationService.getDirections(origin, destination, mode);

    res.json({
      success: true,
      data: directions
    });
  } catch (error) {
    console.error('Directions error:', error);
    res.status(500).json({ 
      error: 'Failed to get directions', 
      message: error.message 
    });
  }
};

/**
 * Calculate distance between two points
 */
exports.calculateDistance = async (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.body;

    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({ error: 'All coordinates are required' });
    }

    const distance = geolocationService.calculateDistance(
      parseFloat(lat1),
      parseFloat(lon1),
      parseFloat(lat2),
      parseFloat(lon2)
    );

    res.json({
      success: true,
      data: {
        distance: distance,
        distanceKm: distance.toFixed(2),
        distanceMiles: (distance * 0.621371).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Distance calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate distance', 
      message: error.message 
    });
  }
};

/**
 * Find properties within radius of a location
 */
exports.findPropertiesNearby = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Get all properties with coordinates
    const properties = await Listing.find({
      latitude: { $exists: true },
      longitude: { $exists: true }
    }).limit(parseInt(limit));

    // Filter properties within radius
    const nearbyProperties = properties.filter(property => {
      const distance = geolocationService.calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        property.latitude,
        property.longitude
      );
      return distance <= parseFloat(radius);
    });

    // Add distance to each property
    const propertiesWithDistance = nearbyProperties.map(property => {
      const distance = geolocationService.calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        property.latitude,
        property.longitude
      );
      return {
        ...property.toObject(),
        distance: distance,
        distanceKm: distance.toFixed(2)
      };
    });

    // Sort by distance
    propertiesWithDistance.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      data: {
        properties: propertiesWithDistance,
        count: propertiesWithDistance.length,
        center: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        radius: parseFloat(radius)
      }
    });
  } catch (error) {
    console.error('Nearby properties error:', error);
    res.status(500).json({ 
      error: 'Failed to find nearby properties', 
      message: error.message 
    });
  }
};

/**
 * Auto-complete addresses
 */
exports.autocompleteAddress = async (req, res) => {
  try {
    const { query, provider = 'nominatim' } = req.query;

    if (!query || query.length < 3) {
      return res.status(400).json({ error: 'Query must be at least 3 characters' });
    }

    let results = [];
    
    if (provider === 'nominatim') {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          countrycodes: 'in',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'HomeRentalApp/1.0'
        }
      });

      results = response.data.map(item => ({
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        placeId: item.place_id
      }));
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Address autocomplete error:', error);
    res.status(500).json({ 
      error: 'Failed to autocomplete address', 
      message: error.message 
    });
  }
};
