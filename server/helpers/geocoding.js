const axios = require('axios');

exports.geocodeAddress = async (address) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY not set in server .env');

  const url = 'https://maps.googleapis.com/maps/api/geocode/json';
  const resp = await axios.get(url, { params: { address, key } });

  if (resp.data.status !== 'OK' || !resp.data.results || resp.data.results.length === 0) {
    throw new Error('Geocode failed: ' + resp.data.status);
  }

  const loc = resp.data.results[0].geometry.location; // { lat, lng }
  return { lat: loc.lat, lng: loc.lng };
};

