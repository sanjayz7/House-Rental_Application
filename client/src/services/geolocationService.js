import api from '../api';

class GeolocationService {
  constructor() {
    this.userLocation = null;
    this.watchId = null;
  }

  /**
   * Get user's current location using browser geolocation
   */
  async getUserLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(this.userLocation);
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown location error';
              break;
          }
          reject(new Error(errorMessage));
        },
        mergedOptions
      );
    });
  }

  /**
   * Watch user's location changes
   */
  watchUserLocation(callback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    const mergedOptions = { ...defaultOptions, ...options };

    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        callback(this.userLocation);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      mergedOptions
    );

    return this.watchId;
  }

  /**
   * Stop watching location
   */
  stopWatchingLocation() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address, provider = 'smart') {
    try {
      const response = await api.post('/geolocation/geocode', {
        address,
        provider
      });
      return response.data;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(latitude, longitude, provider = 'nominatim') {
    try {
      const response = await api.post('/geolocation/reverse-geocode', {
        latitude,
        longitude,
        provider
      });
      return response.data;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  /**
   * Find nearby amenities
   */
  async findNearbyAmenities(latitude, longitude, radius = 1000, type = 'lodging') {
    try {
      const response = await api.get('/geolocation/nearby-amenities', {
        params: { latitude, longitude, radius, type }
      });
      return response.data;
    } catch (error) {
      console.error('Nearby amenities error:', error);
      throw error;
    }
  }

  /**
   * Get directions between two points
   */
  async getDirections(origin, destination, mode = 'driving') {
    try {
      const response = await api.post('/geolocation/directions', {
        origin,
        destination,
        mode
      });
      return response.data;
    } catch (error) {
      console.error('Directions error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two points
   */
  async calculateDistance(lat1, lon1, lat2, lon2) {
    try {
      const response = await api.post('/geolocation/calculate-distance', {
        lat1, lon1, lat2, lon2
      });
      return response.data;
    } catch (error) {
      console.error('Distance calculation error:', error);
      throw error;
    }
  }

  /**
   * Find properties nearby
   */
  async findPropertiesNearby(latitude, longitude, radius = 5, limit = 20) {
    try {
      const response = await api.get('/geolocation/nearby-properties', {
        params: { latitude, longitude, radius, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Nearby properties error:', error);
      throw error;
    }
  }

  /**
   * Autocomplete addresses
   */
  async autocompleteAddress(query, provider = 'nominatim') {
    try {
      const response = await api.get('/geolocation/autocomplete-address', {
        params: { query, provider }
      });
      return response.data;
    } catch (error) {
      console.error('Address autocomplete error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance using Haversine formula (client-side)
   */
  calculateDistanceClient(lat1, lon1, lat2, lon2) {
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
   * Open Google Maps with directions
   */
  openGoogleMapsDirections(origin, destination) {
    const originStr = typeof origin === 'object' ? `${origin.lat},${origin.lng}` : origin;
    const destinationStr = typeof destination === 'object' ? `${destination.lat},${destination.lng}` : destination;
    
    const url = `https://www.google.com/maps/dir/${originStr}/${destinationStr}`;
    window.open(url, '_blank');
  }

  /**
   * Open Google Maps to view a location
   */
  openGoogleMapsView(latitude, longitude, label = '') {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}${label ? `&query_place_id=${label}` : ''}`;
    window.open(url, '_blank');
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }

  /**
   * Get estimated travel time
   */
  getEstimatedTravelTime(distanceKm, mode = 'driving') {
    const speeds = {
      driving: 30, // km/h average city speed
      walking: 5,  // km/h
      cycling: 15, // km/h
      transit: 20  // km/h
    };

    const speed = speeds[mode] || speeds.driving;
    const timeHours = distanceKm / speed;
    const timeMinutes = Math.round(timeHours * 60);

    if (timeMinutes < 60) {
      return `${timeMinutes} min`;
    } else {
      const hours = Math.floor(timeMinutes / 60);
      const minutes = timeMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }
}

const geolocationServiceInstance = new GeolocationService();
export default geolocationServiceInstance;
