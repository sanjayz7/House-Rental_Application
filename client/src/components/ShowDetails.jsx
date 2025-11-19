import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Row, Col, Form, Alert, Modal } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getHouseById } from '../data/sampleHouses';
import ToastNotification from './ToastNotification';
import PropertyInquiryModal from './PropertyInquiryModal';

const ShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingSaved, setRatingSaved] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseAlert, setPurchaseAlert] = useState({ show: false, message: '', variant: 'success' });

  // Format date to more readable format
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setNavigationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Calculate distance if we have both user location and property location
          if (show?.LATITUDE && show?.LONGITUDE) {
            const dist = calculateDistance(
              latitude, 
              longitude, 
              show.LATITUDE, 
              show.LONGITUDE
            );
            setDistance(dist);
          }
          setNavigationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setNavigationLoading(false);
          alert('Unable to get your location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Open Google Maps with directions
  const openGoogleMapsDirections = () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    if (show?.LATITUDE && show?.LONGITUDE) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${show.LATITUDE},${show.LONGITUDE}`;
      window.open(url, '_blank');
    } else if (show?.ADDRESS) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${encodeURIComponent(show.ADDRESS)}`;
      window.open(url, '_blank');
    }
  };

  // Fetch show data - prioritize API, fallback to sample data
  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        // First try API call (for real listings with MongoDB _id)
        try {
          const response = await api.get(`/listings/${id}`);
          if (response.data && response.data._id) {
            setShow(response.data);
            return;
          }
        } catch (apiErr) {
          console.log('API fetch failed, trying sample data:', apiErr.message);
        }
        
        // Fallback to sample data if API fails
        const sampleShow = getHouseById(id);
        if (sampleShow) {
          setShow(sampleShow);
        } else {
          setError('Listing not found');
        }
      } catch (err) {
        console.error('Error fetching show details:', err);
        setError('Failed to load show details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [id]);

  useEffect(() => {
    // Load existing rating from localStorage
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
    if (ratings[id]) setRating(ratings[id]);
  }, [id]);

  const saveRating = () => {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
    ratings[id] = rating;
    localStorage.setItem('ratings', JSON.stringify(ratings));
    setRatingSaved(true);
    setTimeout(() => setRatingSaved(false), 1500);
  };

  // Handle property request
  const handlePropertyRequest = async () => {
    if (!user) {
      setPurchaseAlert({
        show: true,
        message: 'Please login to request property details',
        variant: 'warning'
      });
      return;
    }

    if (user.role !== 'user') {
      setPurchaseAlert({
        show: true,
        message: 'Only regular users can request property details',
        variant: 'warning'
      });
      return;
    }

    if (!show) {
      setPurchaseAlert({
        show: true,
        message: 'Property not found',
        variant: 'warning'
      });
      return;
    }

    setPurchaseLoading(true);
    try {
      // Prioritize MongoDB _id (from API), fallback to SHOW_ID (from sample data)
      const listingId = show._id || show.id;
      const message = requestMessage || "I'm interested in viewing this property. Please provide more details.";
      
      // Validate listingId - must be a valid MongoDB ObjectId or we can't create request
      if (!listingId) {
        setPurchaseAlert({
          show: true,
          message: 'Property ID not found. This property may be from sample data. Please select a property from the listings page.',
          variant: 'warning'
        });
        setPurchaseLoading(false);
        return;
      }

      // Check if this is sample data (has SHOW_ID but no _id)
      if (show.SHOW_ID && !show._id) {
        setPurchaseAlert({
          show: true,
          message: 'This is a sample property. Please select a real property from the listings to send a request.',
          variant: 'warning'
        });
        setPurchaseLoading(false);
        return;
      }
      
      // Send request to backend API
      try {
        console.log('📤 Sending property request:', {
          listingId,
          listingIdType: typeof listingId,
          message: message.substring(0, 50) + '...',
          userEmail: user.email,
          userName: user.name,
          propertyTitle: show.title || show.TITLE,
          ownerEmail: show.ownerEmail || show.owner?.email,
          hasMongoId: !!show._id,
          hasShowId: !!show.SHOW_ID
        });
        
        const response = await api.post('/property-requests', {
          listingId: listingId.toString(), // Ensure it's a string
          message
        });
        
        console.log('✅ Request sent successfully:', response.data);
        
        // Get owner name for success message (handle both owner object and ownerEmail)
        const ownerName = show.owner?.name || show.ownerEmail || 'the property owner';
        
        setPurchaseAlert({
          show: true,
          message: `Your inquiry has been sent successfully to ${ownerName}! They will review your request and contact you at ${user.email} within 24-48 hours.`,
          variant: 'success'
        });
      } catch (apiError) {
        console.error('❌ API error creating request:', {
          error: apiError.response?.data || apiError.message,
          status: apiError.response?.status,
          listingId,
          userEmail: user.email
        });
        
        // Fallback: Store in localStorage if API fails
      const requestData = {
          listingId: listingId,
          ownerEmail: show.ownerEmail || show.owner?.email,
          ownerName: show.owner?.name || 'Property Owner',
          propertyTitle: show.title || show.TITLE,
        userEmail: user.email,
        userName: user.name,
          message: message,
        timestamp: new Date().toISOString()
      };
      
      const existingRequests = JSON.parse(localStorage.getItem('propertyRequests') || '[]');
      existingRequests.push(requestData);
      localStorage.setItem('propertyRequests', JSON.stringify(existingRequests));
      
      setPurchaseAlert({
        show: true,
        message: `Your inquiry has been saved locally! Please ensure you're connected to the internet for the owner to receive your request.`,
        variant: 'warning'
      });
      }

      setShowRequestModal(false);
      setRequestMessage('');
      
      // Hide alert after 5 seconds
      setTimeout(() => {
        setPurchaseAlert({ show: false, message: '', variant: 'success' });
      }, 5000);

    } catch (error) {
      console.error('Purchase error:', error);
        setPurchaseAlert({
          show: true,
          message: error.response?.data?.message || 'Unable to send your inquiry. Please check your internet connection and try again.',
          variant: 'danger'
        });
      
      // Hide alert after 5 seconds
      setTimeout(() => {
        setPurchaseAlert({ show: false, message: '', variant: 'success' });
      }, 5000);
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><h3>Loading listing details...</h3></div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <Button variant="link" onClick={() => navigate('/')}>Return to Listings</Button>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="text-center py-5">
        <h3>Listing not found</h3>
        <Button variant="primary" onClick={() => navigate('/')}>Return to Listings</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Toast Notification */}
      <ToastNotification
        show={purchaseAlert.show}
        message={purchaseAlert.message}
        variant={purchaseAlert.variant}
        onClose={() => setPurchaseAlert({ show: false, message: '', variant: 'success' })}
        duration={5000}
        position="top-right"
      />

      <div 
        className="d-flex justify-content-between align-items-center page-header mb-4"
        style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div>
          <h2 className="mb-1 fw-bold" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <i className="fas fa-home me-2"></i>Listing Details
          </h2>
          <small className="text-muted">View and manage property information</small>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(`/show/edit/${id}`)}
            style={{ borderRadius: '8px', fontWeight: '600' }}
          >
            <i className="fas fa-edit me-2"></i>Edit Listing
          </Button>
          <Button 
            variant="outline-warning" 
            onClick={() => {
              const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
              if (!favs.find(f => f.SHOW_ID === show.SHOW_ID)) {
                favs.push(show);
                localStorage.setItem('favorites', JSON.stringify(favs));
              }
              navigate('/favorites');
            }}
            style={{ borderRadius: '8px', fontWeight: '600' }}
          >
            <i className="fas fa-heart me-2"></i>Add to Favorites
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
            style={{ 
              borderRadius: '8px', 
              fontWeight: '600',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            <i className="fas fa-arrow-left me-2"></i>Back to Listings
          </Button>
        </div>
      </div>

      <Card 
        className="show-details mb-4 border-0 shadow-lg"
        style={{ borderRadius: '16px', overflow: 'hidden' }}
      >
        <Card.Header 
          className="d-flex justify-content-between align-items-center"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1.5rem',
            borderBottom: 'none'
          }}
        >
          <div>
            <h3 className="mb-1 fw-bold">{show.title || show.TITLE}</h3>
            <small className="opacity-75">
              <i className="fas fa-map-marker-alt me-1"></i>
              {show.locationText || show.ADDRESS || 'Location not specified'}
            </small>
          </div>
          <div className="d-flex gap-2">
            {show.propertyType && (
              <Badge 
                bg="light" 
                text="dark" 
                className="px-3 py-2"
                style={{ borderRadius: '20px', fontSize: '0.85rem' }}
              >
                <i className="fas fa-building me-1"></i>{show.propertyType}
              </Badge>
            )}
          {show.CATEGORY && (
              <Badge 
                bg="info" 
                className="px-3 py-2"
                style={{ borderRadius: '20px', fontSize: '0.85rem' }}
              >
                {show.CATEGORY}
              </Badge>
          )}
            {(show.verified || show.VERIFIED) && (
              <Badge 
                bg="success" 
                className="px-3 py-2"
                style={{ borderRadius: '20px', fontSize: '0.85rem' }}
              >
                <i className="fas fa-check-circle me-1"></i>Verified
              </Badge>
          )}
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              {(show.IMAGE_URL || show.images?.[0]) && (
                <div 
                  className="mb-4" 
                  style={{ 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <img 
                    src={show.images?.[0] || show.IMAGE_URL} 
                    alt={show.title || show.TITLE} 
                    style={{ 
                      width: '100%', 
                      height: '450px',
                      objectFit: 'cover',
                      display: 'block'
                    }} 
                  />
                </div>
              )}
              {show.DESCRIPTION && (
                <div className="mb-4">
                  <h5>Description</h5>
                  <p>{show.DESCRIPTION}</p>
                </div>
              )}

              <div className="mb-4">
                <h5>Rating</h5>
                <div className="d-flex align-items-center gap-2">
                  <Form.Range min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
                  <span>{rating || 0}/5</span>
                  {user?.role === 'user' && (
                    <Button size="sm" variant="outline-primary" onClick={saveRating}>Save Rating</Button>
                  )}
                </div>
                {ratingSaved && <small className="text-success">Rating saved</small>}
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h5>Availability</h5>
                  <p>
                    <strong>Available From:</strong> {formatDate(show.SHOW_DATE)}<br />
                    {show.PRICE && (<><strong>Rent:</strong> ${show.PRICE} / month</>)}<br />
                    {show.BEDROOMS ? <><strong>Bedrooms:</strong> {show.BEDROOMS}<br /></> : null}
                    {show.BATHROOMS ? <><strong>Bathrooms:</strong> {show.BATHROOMS}<br /></> : null}
                    {show.AREA_SQFT ? <><strong>Area:</strong> {show.AREA_SQFT} sqft<br /></> : null}
                    {show.FURNISHED ? <><strong>Furnishing:</strong> {show.FURNISHED}</> : null}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Address</h5>
                  <p>{show.ADDRESS || show.VENUE}</p>
                </Col>
              </Row>
            </Col>
            
            <Col md={4}>
              <Card className="bg-light">
                <Card.Body>
                  <h5 className="mb-3">
                    <i className="fas fa-user-circle me-2"></i>
                    Owner Details
                  </h5>
                  
                  {/* Owner Information */}
                  <div className="mb-3 border-bottom pb-3">
                    <div className="d-flex align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 text-primary">{show.owner?.name || 'John Smith'}</h6>
                        {show.owner?.verified && (
                          <Badge bg="success" className="mb-2">
                            <i className="fas fa-shield-check me-1"></i>
                            Verified Owner
                          </Badge>
                        )}
                        <p className="mb-1 text-muted small">
                          {show.owner?.bio || 'Professional property owner with experience in real estate.'}
                        </p>
                        <p className="mb-0 small">
                          <strong>Member since:</strong> {show.owner?.joinedDate ? new Date(show.owner.joinedDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="contact-info bg-white rounded p-2 mb-2">
                      <h6 className="mb-2 small text-uppercase text-muted">Contact Information</h6>
                      <p className="mb-1 small">
                        <i className="fas fa-envelope me-2 text-primary"></i>
                        <strong>Email:</strong> {show.owner?.email || 'john.smith@example.com'}
                      </p>
                      <p className="mb-1 small">
                        <i className="fas fa-phone me-2 text-success"></i>
                        <strong>Phone:</strong> {show.owner?.phone || '+1-555-0123'}
                      </p>
                      <p className="mb-0 small">
                        <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                        <strong>Address:</strong> {show.owner?.address || '456 Oak Avenue, Central City'}
                      </p>
                    </div>
                    
                    <div className="property-stats bg-white rounded p-2">
                      <h6 className="mb-2 small text-uppercase text-muted">Property Portfolio</h6>
                      <div className="d-flex justify-content-between">
                        <small>
                          <strong>Total Properties:</strong> {show.owner?.totalProperties || 1}
                        </small>
                        <Badge bg={show.status === 'available' ? 'success' : 'warning'}>
                          {show.status?.toUpperCase() || 'AVAILABLE'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3 border-bottom pb-3">
                    <h6>
                      <i className="fas fa-map-marked-alt me-2"></i>
                      Location Details
                    </h6>
                    <div className="location-info bg-white rounded p-2">
                      <p className="mb-2 small">
                        <strong>Full Address:</strong><br />
                        {show.ADDRESS || show.VENUE || 'N/A'}
                      </p>
                      <p className="mb-2 small">
                        <strong>Area Description:</strong><br />
                        {show.location || 'Prime location with easy access to amenities'}
                      </p>
                      {show.LATITUDE && show.LONGITUDE && (
                        <p className="mb-0 small text-muted">
                          <strong>Coordinates:</strong> {show.LATITUDE.toFixed(4)}, {show.LONGITUDE.toFixed(4)}
                        </p>
                      )}
                    </div>
                    
                    {/* Distance Information */}
                    {distance && (
                      <div className="bg-primary text-white rounded p-2 mt-2">
                        <small className="d-block opacity-75">Distance from your location:</small>
                        <strong className="h6 mb-0">{distance.toFixed(1)} km away</strong>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 d-grid gap-2">
                    {user?.role === 'user' && (
                      <>
                        <Button 
                          variant="success" 
                          size="lg"
                          onClick={() => setShowRequestModal(true)}
                          disabled={purchaseLoading}
                          className="fw-bold request-property-btn"
                          style={{
                            background: 'var(--success-gradient)',
                            border: 'none',
                            borderRadius: 'var(--border-radius-md)',
                            padding: '0.75rem 1.5rem',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'var(--transition-normal)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(67, 233, 123, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(67, 233, 123, 0.3)';
                          }}
                        >
                          <i className="fas fa-paper-plane me-2"></i>
                          Request Property Info
                        </Button>
                        <small className="text-muted text-center d-block mt-2">
                          <i className="fas fa-info-circle me-1"></i>
                          Send inquiry directly to {show.owner?.name || 'the owner'}
                        </small>
                      </>
                    )}

                    <Button
                      variant="outline-primary"
                      onClick={() => setShowNavigationModal(true)}
                      disabled={navigationLoading}
                    >
                      <i className="fas fa-map-marker-alt me-2"></i>
                      View Location & Directions
                    </Button>
                    
                    {!userLocation && (
                      <Button
                        variant="outline-info"
                        onClick={getUserLocation}
                        disabled={navigationLoading}
                        size="sm"
                      >
                        <i className="fas fa-location-arrow me-2"></i>
                        {navigationLoading ? 'Getting Location...' : 'Enable Location'}
                      </Button>
                    )}
                    
                    {show.owner?.phone && (
                      <Button 
                        as="a" 
                        href={`tel:${show.owner.phone}`} 
                        variant="outline-success"
                      >
                        <i className="fas fa-phone me-2"></i>
                        Call {show.owner.name}
                      </Button>
                    )}
                    
                    {show.owner?.email && (
                      <Button 
                        as="a" 
                        href={`mailto:${show.owner.email}?subject=Property Inquiry - ${show.TITLE}`} 
                        variant="outline-warning"
                      >
                        <i className="fas fa-envelope me-2"></i>
                        Email Owner
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>
            Created: {new Date(show.CREATED_AT).toLocaleString()}<br />
            Last Updated: {new Date(show.UPDATED_AT).toLocaleString()}
          </small>
        </Card.Footer>
      </Card>

      {/* Modular Property Inquiry Modal */}
      <PropertyInquiryModal
        show={showRequestModal}
        onHide={() => setShowRequestModal(false)}
        property={show}
        owner={show.owner}
        user={user}
        requestMessage={requestMessage}
        onMessageChange={setRequestMessage}
        onSubmit={handlePropertyRequest}
        loading={purchaseLoading}
      />

      {/* Navigation Modal */}
      <Modal show={showNavigationModal} onHide={() => setShowNavigationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Navigation to Property</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!userLocation ? (
            <div className="text-center py-4">
              <p>We need your current location to provide navigation directions.</p>
              <Button 
                variant="primary" 
                onClick={getUserLocation}
                disabled={navigationLoading}
              >
                {navigationLoading ? 'Getting Location...' : 'Get My Location'}
              </Button>
            </div>
          ) : (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Your Location</h6>
                  <p className="mb-1">
                    <strong>Latitude:</strong> {userLocation.lat.toFixed(6)}
                  </p>
                  <p className="mb-1">
                    <strong>Longitude:</strong> {userLocation.lng.toFixed(6)}
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Property Location</h6>
                  <p className="mb-1">
                    <strong>Address:</strong> {show.ADDRESS || show.VENUE || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Coordinates:</strong> {show.LATITUDE?.toFixed(6) || 'N/A'}, {show.LONGITUDE?.toFixed(6) || 'N/A'}
                  </p>
                </Col>
              </Row>
              
              {distance && (
                <div className="alert alert-info">
                  <h6 className="mb-2">Route Information</h6>
                  <p className="mb-1">
                    <strong>Distance:</strong> {distance.toFixed(1)} km
                  </p>
                  <p className="mb-1">
                    <strong>Estimated Travel Time:</strong> {Math.round(distance * 2)} minutes (by car)
                  </p>
                </div>
              )}
              
              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  size="lg"
                  onClick={openGoogleMapsDirections}
                >
                  🗺️ Open Google Maps Directions
                </Button>
                
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    if (show?.LATITUDE && show?.LONGITUDE) {
                      const url = `https://www.google.com/maps/search/?api=1&query=${show.LATITUDE},${show.LONGITUDE}`;
                      window.open(url, '_blank');
                    }
                  }}
                >
                  📍 View Property on Map
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNavigationModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShowDetails;