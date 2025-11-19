import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Card, Button, Badge, Form, Pagination, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';
import EnhancedPropertySearch from './EnhancedPropertySearch';

const ShowList99Acres = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [availableFor, setAvailableFor] = useState('');
  const [postedBy, setPostedBy] = useState('owner');
  const [furnishingStatus, setFurnishingStatus] = useState('');
  
  // Top filter states
  const [showOwnerOnly, setShowOwnerOnly] = useState(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showFurnishedOnly, setShowFurnishedOnly] = useState(false);
  const [showWithPhotosOnly, setShowWithPhotosOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Fetch listings
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/listings');
      const data = response.data?.items || response.data || [];
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          listing.title?.toLowerCase().includes(query) ||
          listing.locationText?.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Price range
      const price = listing.price || 0;
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;

      // Bedrooms
      if (minBedrooms && (listing.bedrooms || 0) < parseInt(minBedrooms)) return false;

      // Property type
      if (propertyType && listing.propertyType !== propertyType) return false;

      // Available for
      if (availableFor && listing.availableFor !== availableFor) return false;

      // Posted by (owner only for now)
      if (postedBy === 'owner' && listing.ownerEmail) {
        // All listings are from owners in our system
      }

      // Furnishing status
      if (furnishingStatus) {
        const furnished = listing.furnished?.toLowerCase() || '';
        if (furnishingStatus === 'furnished' && !furnished.includes('furnished')) return false;
        if (furnishingStatus === 'semifurnished' && !furnished.includes('semi')) return false;
        if (furnishingStatus === 'unfurnished' && furnished.includes('furnished')) return false;
      }

      // Top filters
      if (showOwnerOnly && !listing.ownerEmail) return false;
      if (showVerifiedOnly && !listing.verified) return false;
      if (showFurnishedOnly && !listing.furnished?.toLowerCase().includes('furnished')) return false;
      if (showWithPhotosOnly && (!listing.images || listing.images.length === 0)) return false;

      return true;
    });
  }, [listings, searchQuery, minPrice, maxPrice, minBedrooms, propertyType, availableFor, postedBy, furnishingStatus, showOwnerOnly, showVerifiedOnly, showFurnishedOnly, showWithPhotosOnly]);

  // Sort listings
  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      default:
        // Relevance (default)
        break;
    }
    return sorted;
  }, [filteredListings, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedListings.length / pageSize);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedListings.slice(start, start + pageSize);
  }, [sortedListings, currentPage]);

  // Get unique property types
  const propertyTypes = useMemo(() => {
    const types = new Set();
    listings.forEach(l => {
      if (l.propertyType) types.add(l.propertyType);
    });
    return Array.from(types);
  }, [listings]);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h3>Loading properties...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Enhanced Property Search with Map */}
      <div className="mb-4">
        <EnhancedPropertySearch onResults={setListings} />
      </div>

      <Row>
        {/* Left Sidebar - Filters */}
        <Col lg={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Filters</h5>
            </Card.Header>
            <Card.Body>
              {/* Budget */}
              <div className="mb-4">
                <h6 className="mb-3">Budget</h6>
                <Row>
                  <Col xs={6}>
                    <Form.Control
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="mb-2"
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </Col>
                </Row>
              </div>

              {/* No. of Bedrooms */}
              <div className="mb-4">
                <h6 className="mb-3">No. of Bedrooms</h6>
                <Form.Select
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </Form.Select>
              </div>

              {/* Type of Property */}
              <div className="mb-4">
                <h6 className="mb-3">Type of Property</h6>
                <Form.Select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Select>
              </div>

              {/* Available For */}
              <div className="mb-4">
                <h6 className="mb-3">Available For</h6>
                <Form.Select
                  value={availableFor}
                  onChange={(e) => setAvailableFor(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="Family">Family</option>
                  <option value="Bachelors">Single Men</option>
                  <option value="Any">Single Women</option>
                  <option value="Any">Tenants with Company Lease</option>
                </Form.Select>
              </div>

              {/* Posted By */}
              <div className="mb-4">
                <h6 className="mb-3">Posted By</h6>
                <Form.Select
                  value={postedBy}
                  onChange={(e) => setPostedBy(e.target.value)}
                >
                  <option value="owner">Owner</option>
                  <option value="builder">Builder</option>
                  <option value="dealer">Dealer</option>
                </Form.Select>
              </div>

              {/* Furnishing Status */}
              <div className="mb-4">
                <h6 className="mb-3">Furnishing Status</h6>
                <Form.Select
                  value={furnishingStatus}
                  onChange={(e) => setFurnishingStatus(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="furnished">Furnished</option>
                  <option value="semifurnished">Semifurnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </Form.Select>
              </div>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setMinBedrooms('');
                  setPropertyType('');
                  setAvailableFor('');
                  setPostedBy('owner');
                  setFurnishingStatus('');
                }}
                className="w-100"
              >
                Clear All Filters
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content Area */}
        <Col lg={9}>
          {/* Results Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-0">
                {sortedListings.length} results | House for Rent
              </h4>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="relevance">Sort By: Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </Form.Select>
            </div>
          </div>

          {/* Top Filter Bar */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            <Button
              variant={showOwnerOnly ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setShowOwnerOnly(!showOwnerOnly)}
            >
              Owner
            </Button>
            <Button
              variant={showVerifiedOnly ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            >
              Verified
            </Button>
            <Button
              variant={showFurnishedOnly ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setShowFurnishedOnly(!showFurnishedOnly)}
            >
              Furnished
            </Button>
            <Button
              variant={showWithPhotosOnly ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setShowWithPhotosOnly(!showWithPhotosOnly)}
            >
              With Photos
            </Button>
          </div>

          {/* Property Listings */}
          {paginatedListings.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <h5>No properties found</h5>
                <p className="text-muted">Try adjusting your filters</p>
              </Card.Body>
            </Card>
          ) : (
            <>
              {paginatedListings.map((listing) => (
                <Card key={listing._id || listing.id} className="mb-4 shadow-sm">
                  <Row className="g-0">
                    {/* Property Image */}
                    <Col md={4}>
                      <div style={{ position: 'relative', height: '100%', minHeight: '250px' }}>
                        {listing.images && listing.images.length > 0 ? (
                          <>
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '0.375rem 0 0 0.375rem'
                              }}
                              onError={(e) => {
                                e.target.src = '/images/properties/House2.jpg';
                              }}
                            />
                            {listing.images.length > 1 && (
                              <Badge
                                bg="dark"
                                style={{
                                  position: 'absolute',
                                  bottom: '10px',
                                  right: '10px'
                                }}
                              >
                                {listing.images.length} photos
                              </Badge>
                            )}
                          </>
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '0.375rem 0 0 0.375rem'
                            }}
                          >
                            <div className="text-center">
                              <i className="fas fa-home fa-3x text-muted mb-2"></i>
                              <Button variant="outline-secondary" size="sm">
                                Request Photos
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Col>

                    {/* Property Details */}
                    <Col md={8}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            {listing.verified && (
                              <Badge bg="success" className="me-2">✓ VERIFIED</Badge>
                            )}
                            <h5 className="mb-1">
                              {listing.bedrooms || 0} Bedroom {listing.propertyType || 'House'} for rent in {listing.locationText || 'Location'}
                            </h5>
                          </div>
                        </div>

                        <div className="mb-2">
                          <h4 className="text-primary mb-1">
                            ₹{listing.price?.toLocaleString() || 0}/month
                          </h4>
                          {listing.depositAmount && (
                            <small className="text-muted">
                              + Deposit {Math.ceil(listing.depositAmount / listing.price)} months rent
                            </small>
                          )}
                        </div>

                        <div className="mb-2">
                          {listing.area && (
                            <span className="me-3">
                              <strong>{listing.area.toLocaleString()} sqft</strong> ({Math.round(listing.area * 0.0929)} sqm) {listing.area > 2000 ? 'Plot Area' : 'Built-up Area'}
                            </span>
                          )}
                          {listing.bedrooms && (
                            <span className="me-3">
                              <strong>{listing.bedrooms} BHK</strong>
                            </span>
                          )}
                          {listing.bathrooms && (
                            <span>
                              <strong>{listing.bathrooms} Baths</strong>
                            </span>
                          )}
                        </div>

                        {/* Highlights */}
                        {listing.amenities && listing.amenities.length > 0 && (
                          <div className="mb-2">
                            {listing.amenities.slice(0, 3).map((amenity, idx) => (
                              <Badge key={idx} bg="light" text="dark" className="me-1">
                                {amenity.replace('_', ' ')}
                              </Badge>
                            ))}
                            {listing.amenities.length > 3 && (
                              <Badge bg="light" text="dark">
                                +{listing.amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {listing.description && (
                          <p className="text-muted small mb-2" style={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {listing.description}
                          </p>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <small className="text-muted">
                              {getTimeAgo(listing.createdAt)} by <strong>Owner</strong>
                            </small>
                          </div>
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              as={Link}
                              to={`/property/${listing._id || listing.id}`}
                            >
                              View Number
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              as={Link}
                              to={`/property/${listing._id || listing.id}`}
                            >
                              Contact
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, idx) => {
                      const page = idx + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Pagination.Item>
                        );
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return <Pagination.Ellipsis key={page} />;
                      }
                      return null;
                    })}
                    <Pagination.Next
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ShowList99Acres;

