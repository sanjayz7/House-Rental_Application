const axios = require('axios');

class GeolocationService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.mapboxApiKey = process.env.MAPBOX_API_KEY;
    this.nominatimBaseUrl = 'https://nominatim.openstreetmap.org';
  }

  /**
   * Google Maps Geocoding API
   * Convert address to coordinates
   */
  async geocodeWithGoogle(address) {
    try {
      if (!this.googleMapsApiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id,
          provider: 'google'
        };
      } else {
        throw new Error(`Google Geocoding failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Google Geocoding error:', error.message);
      throw error;
    }
  }

  /**
   * OpenStreetMap/Nominatim Geocoding (Free)
   * Convert address to coordinates
   */
  async geocodeWithNominatim(address) {
    try {
      const response = await axios.get(`${this.nominatimBaseUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
          countrycodes: 'in', // Focus on India
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'HomeRentalApp/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name,
          placeId: result.place_id,
          provider: 'nominatim'
        };
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Nominatim Geocoding error:', error.message);
      throw error;
    }
  }

  /**
   * Reverse Geocoding - Convert coordinates to address
   */
  async reverseGeocode(latitude, longitude, provider = 'nominatim') {
    try {
      if (provider === 'google' && this.googleMapsApiKey) {
        return await this.reverseGeocodeWithGoogle(latitude, longitude);
      } else {
        return await this.reverseGeocodeWithNominatim(latitude, longitude);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      throw error;
    }
  }

  async reverseGeocodeWithGoogle(latitude, longitude) {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${latitude},${longitude}`,
        key: this.googleMapsApiKey
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        address: result.formatted_address,
        placeId: result.place_id,
        provider: 'google'
      };
    }
    throw new Error('Reverse geocoding failed');
  }

  async reverseGeocodeWithNominatim(latitude, longitude) {
    const response = await axios.get(`${this.nominatimBaseUrl}/reverse`, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'HomeRentalApp/1.0'
      }
    });

    if (response.data) {
      return {
        address: response.data.display_name,
        placeId: response.data.place_id,
        provider: 'nominatim'
      };
    }
    throw new Error('Reverse geocoding failed');
  }

  /**
   * Google Places API - Find nearby amenities
   */
  async findNearbyAmenities(latitude, longitude, radius = 1000, type = 'lodging') {
    try {
      if (!this.googleMapsApiKey) {
        console.warn('Google Maps API key not configured. Nearby amenities feature disabled.');
        return []; // Return empty array instead of throwing error
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
        params: {
          location: `${latitude},${longitude}`,
          radius: radius,
          type: type,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.results.map(place => ({
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          rating: place.rating,
          vicinity: place.vicinity,
          placeId: place.place_id,
          types: place.types
        }));
      } else if (response.data.status === 'REQUEST_DENIED') {
        console.warn('Google Places API access denied. Check API key permissions.');
        return []; // Return empty array for denied requests
      } else {
        console.warn(`Places API failed: ${response.data.status}`);
        return []; // Return empty array instead of throwing error
      }
    } catch (error) {
      console.error('Places API error:', error.message);
      return []; // Return empty array instead of throwing error
    }
  }

  /**
   * Mapbox Geocoding API
   */
  async geocodeWithMapbox(address) {
    try {
      if (!this.mapboxApiKey) {
        throw new Error('Mapbox API key not configured');
      }

      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
        params: {
          access_token: this.mapboxApiKey,
          country: 'IN', // Focus on India
          limit: 1
        }
      });

      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        return {
          latitude: feature.center[1],
          longitude: feature.center[0],
          formattedAddress: feature.place_name,
          placeId: feature.id,
          provider: 'mapbox'
        };
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Mapbox Geocoding error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Get directions between two points using Google Maps
   */
  async getDirections(origin, destination, mode = 'driving') {
    try {
      if (!this.googleMapsApiKey) {
        throw new Error('Google Maps API key not configured');
      }

      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: origin,
          destination: destination,
          mode: mode,
          key: this.googleMapsApiKey
        }
      });

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        return {
          distance: leg.distance.text,
          duration: leg.duration.text,
          distanceValue: leg.distance.value,
          durationValue: leg.duration.value,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance.text,
            duration: step.duration.text
          }))
        };
      } else {
        throw new Error(`Directions API failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Directions API error:', error.message);
      throw error;
    }
  }

  /**
   * Smart geocoding - tries multiple providers
   */
  async smartGeocode(address) {
    const providers = ['google', 'mapbox', 'nominatim'];
    
    for (const provider of providers) {
      try {
        switch (provider) {
          case 'google':
            return await this.geocodeWithGoogle(address);
          case 'mapbox':
            return await this.geocodeWithMapbox(address);
          case 'nominatim':
            return await this.geocodeWithNominatim(address);
        }
      } catch (error) {
        console.log(`Geocoding failed with ${provider}, trying next provider...`);
        continue;
      }
    }
    
    throw new Error('All geocoding providers failed');
  }
}

module.exports = new GeolocationService();
