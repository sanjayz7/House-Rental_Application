import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, StandaloneSearchBox, Marker } from '@react-google-maps/api';
import { Alert } from 'react-bootstrap';
import api from '../api';

const containerStyle = { width: '100%', height: '400px' };

const defaultCenter = { lat: 13.0827, lng: 80.2707 }; // Chennai default

const EnhancedPropertySearch = ({ onResults }) => {
  const [center, setCenter] = useState(defaultCenter);
  const [marker, setMarker] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const searchBoxRef = useRef(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const handlePlacesChanged = async () => {
    const places = searchBoxRef.current.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setCenter({ lat, lng });
    setMarker({ lat, lng });

    try {
      const res = await api.get('/listings', { params: { lat, lng, radius: 5000 } });
      onResults?.(res.data);
    } catch (err) {
      console.error('Nearby fetch failed', err);
    }
  };

  const handleLoadError = (error) => {
    console.error('Google Maps API Error:', error);
    setMapError('Failed to load Google Maps. Please check your API key configuration.');
  };

  const handleLoadSuccess = () => {
    setScriptLoaded(true);
    setMapError(null);
  };

  // If no API key, show fallback UI
  if (!apiKey) {
    return (
      <Alert variant="warning" className="mb-3">
        <Alert.Heading>
          <i className="fas fa-exclamation-triangle me-2"></i>
          Google Maps API Key Not Configured
        </Alert.Heading>
        <p>
          To enable map functionality, please add your Google Maps API key to <code>client/.env</code>:
        </p>
        <pre className="bg-light p-2 rounded">
          REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
        </pre>
        <p className="mb-0 mt-2">
          <strong>Instructions:</strong>
        </p>
        <ol className="mb-0">
          <li>Get an API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
          <li>Enable "Maps JavaScript API" and "Places API"</li>
          <li>Add <code>localhost:3000</code> to allowed referrers</li>
          <li>Create <code>client/.env</code> file with the key</li>
          <li>Restart the development server</li>
        </ol>
      </Alert>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={['places']}
      onLoad={handleLoadSuccess}
      onError={handleLoadError}
    >
      {mapError && (
        <Alert variant="danger" dismissible onClose={() => setMapError(null)} className="mb-3">
          <i className="fas fa-exclamation-circle me-2"></i>
          {mapError}
        </Alert>
      )}
      <div style={{ marginBottom: 12 }}>
        <StandaloneSearchBox
          onLoad={ref => (searchBoxRef.current = ref)}
          onPlacesChanged={handlePlacesChanged}
        >
          <input
            type="text"
            placeholder="Search address or landmark"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px'
            }}
          />
        </StandaloneSearchBox>
      </div>
      {scriptLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={13}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      )}
      {!scriptLoaded && !mapError && (
        <div
          style={{
            width: '100%',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading map...</span>
            </div>
            <p className="text-muted">Loading Google Maps...</p>
          </div>
        </div>
      )}
    </LoadScript>
  );
};

export default EnhancedPropertySearch;
