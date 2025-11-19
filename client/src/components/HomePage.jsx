import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Dropdown, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// Dummy owner data mapping (constant, defined outside component)
const dummyOwners = {
  'ramesh.property@gmail.com': {
    name: 'Ramesh Reddy',
    email: 'ramesh.property@gmail.com',
    phone: '+91 9876543216',
    verified: true
  },
  'lakshmi.homes@gmail.com': {
    name: 'Lakshmi Venkatesh',
    email: 'lakshmi.homes@gmail.com',
    phone: '+91 9876543217',
    verified: true
  },
  'david.estates@gmail.com': {
    name: 'David Wilson',
    email: 'david.estates@gmail.com',
    phone: '+91 9876543218',
    verified: false
  },
  'meera.rentals@gmail.com': {
    name: 'Meera Krishnan',
    email: 'meera.rentals@gmail.com',
    phone: '+91 9876543219',
    verified: true
  },
  'sunil.properties@gmail.com': {
    name: 'Sunil Agarwal',
    email: 'sunil.properties@gmail.com',
    phone: '+91 9876543220',
    verified: true
  }
};

const HomePage = () => {
  const { user } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeaturedProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/listings');
      const listings = response.data?.items || response.data || [];
      
      // Take first 4 listings and add owner details
      const properties = listings.slice(0, 4).map(listing => {
        const ownerEmail = listing.ownerEmail || listing.owner?.email;
        const owner = listing.owner || dummyOwners[ownerEmail] || {
          name: 'Property Owner',
          email: ownerEmail || 'owner@example.com',
          phone: '+91 9876543210',
          verified: listing.verified || false
        };

        return {
          id: listing._id || listing.id,
          title: listing.title,
          location: listing.location,
          price: `₹${listing.price?.toLocaleString() || 0}/month`,
          deposit: `₹${listing.depositAmount?.toLocaleString() || listing.price * 2 || 0}`,
          area: `${listing.area || 0} sqft`,
          bedrooms: listing.bedrooms || 1,
          bathrooms: listing.bathrooms || 1,
          image: listing.images?.[0] || '/images/rooms/BedRoom.jpg',
          verified: listing.verified || false,
          owner: owner,
          postedTime: listing.created_at ? 
            `${Math.floor((Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 
            'Recently',
          highlights: listing.amenities || []
        };
      });

      // If no listings from API, use sample data with owner details
      if (properties.length === 0) {
        setFeaturedProperties([
          {
            id: 1,
            title: "Modern 3 BHK Apartment",
            location: "Chennai, Tamil Nadu",
            price: "₹25,000/month",
            deposit: "₹50,000",
            area: "1,200 sqft",
            bedrooms: 3,
            bathrooms: 2,
            image: "/images/rooms/BedRoom.jpg",
            verified: true,
            owner: dummyOwners['ramesh.property@gmail.com'],
            postedTime: "2 days ago",
            highlights: ["Furnished", "Parking", "Security"]
          },
          {
            id: 2,
            title: "Luxury Villa with Garden",
            location: "Coimbatore, Tamil Nadu", 
            price: "₹45,000/month",
            deposit: "₹90,000",
            area: "2,500 sqft",
            bedrooms: 4,
            bathrooms: 3,
            image: "/images/properties/Front_View.jpg",
            verified: true,
            owner: dummyOwners['lakshmi.homes@gmail.com'],
            postedTime: "1 week ago",
            highlights: ["Private Garden", "Full Power Backup", "Servant Quarters"]
          },
          {
            id: 3,
            title: "Cozy Studio Apartment",
            location: "Madurai, Tamil Nadu",
            price: "₹15,000/month",
            deposit: "₹30,000",
            area: "800 sqft",
            bedrooms: 1,
            bathrooms: 1,
            image: "/images/rooms/Kitchen.jpg",
            verified: false,
            owner: dummyOwners['david.estates@gmail.com'],
            postedTime: "3 days ago",
            highlights: ["Furnished", "Kitchen", "Balcony"]
          },
          {
            id: 4,
            title: "Family House with Balcony",
            location: "Salem, Tamil Nadu",
            price: "₹35,000/month",
            deposit: "₹70,000",
            area: "1,800 sqft",
            bedrooms: 3,
            bathrooms: 2,
            image: "/images/rooms/Balcony.jpg",
            verified: true,
            owner: dummyOwners['meera.rentals@gmail.com'],
            postedTime: "5 days ago",
            highlights: ["Balcony", "Parking", "Children's Play Area"]
          }
        ]);
      } else {
        setFeaturedProperties(properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Use sample data with owner details as fallback
      setFeaturedProperties([
    {
      id: 1,
      title: "Modern 3 BHK Apartment",
      location: "Chennai, Tamil Nadu",
      price: "₹25,000/month",
      deposit: "₹50,000",
      area: "1,200 sqft",
      bedrooms: 3,
      bathrooms: 2,
      image: "/sample-properties/BedRoom.jpg",
      verified: true,
          owner: dummyOwners['ramesh.property@gmail.com'],
      postedTime: "2 days ago",
      highlights: ["Furnished", "Parking", "Security"]
    },
    {
      id: 2,
      title: "Luxury Villa with Garden",
      location: "Coimbatore, Tamil Nadu", 
      price: "₹45,000/month",
      deposit: "₹90,000",
      area: "2,500 sqft",
      bedrooms: 4,
      bathrooms: 3,
      image: "/sample-properties/Front_View.jpg",
      verified: true,
          owner: dummyOwners['lakshmi.homes@gmail.com'],
      postedTime: "1 week ago",
      highlights: ["Private Garden", "Full Power Backup", "Servant Quarters"]
    },
    {
      id: 3,
      title: "Cozy Studio Apartment",
      location: "Madurai, Tamil Nadu",
      price: "₹15,000/month",
      deposit: "₹30,000",
      area: "800 sqft",
      bedrooms: 1,
      bathrooms: 1,
      image: "/sample-properties/Kitchen.jpg",
      verified: false,
          owner: dummyOwners['david.estates@gmail.com'],
      postedTime: "3 days ago",
      highlights: ["Furnished", "Kitchen", "Balcony"]
    },
    {
      id: 4,
      title: "Family House with Balcony",
      location: "Salem, Tamil Nadu",
      price: "₹35,000/month",
      deposit: "₹70,000",
      area: "1,800 sqft",
      bedrooms: 3,
      bathrooms: 2,
      image: "/sample-properties/Balcony.jpg",
      verified: true,
          owner: dummyOwners['meera.rentals@gmail.com'],
      postedTime: "5 days ago",
      highlights: ["Balcony", "Parking", "Children's Play Area"]
    }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  const features = [
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Advanced location-based search with geocoding'
    },
    {
      icon: '🏠',
      title: 'Nearby Listings',
      description: 'Find houses within 5km radius using GPS location'
    },
    {
      icon: '✅',
      title: 'Verified Properties',
      description: 'All listings are verified by our admin team'
    },
    {
      icon: '📱',
      title: 'Direct Contact',
      description: 'Contact owners directly through the app'
    },
    {
      icon: '🗺️',
      title: 'Instant Navigation',
      description: 'Get directions to properties after confirmation'
    },
    {
      icon: '⭐',
      title: 'User Ratings',
      description: 'Rate and review properties you visit'
    },
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'Safe and reliable rental platform'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section text-center py-5 mb-5">
        <Container>
          <h1 className="display-4 mb-4">Find Your Perfect Rental Home</h1>
          <p className="lead mb-4">
            Discover verified rental properties near you with instant navigation and secure booking
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Dropdown as={ButtonGroup} size="lg" className="me-3">
                  <Button variant="primary" as={Link} to="/user-register">
                    Create Account
                  </Button>
                  <Dropdown.Toggle split variant="primary" id="signup-dropdown-split" />
                  <Dropdown.Menu>
                    <Dropdown.Header>Choose Account Type</Dropdown.Header>
                    <Dropdown.Item as={Link} to="/user-register">
                      👤 User Account (Find Rentals)
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/owner-register">
                      🏠 Owner Account (List Properties)
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin-register">
                      🛡️ Admin Account (Manage Platform)
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                
                <Dropdown as={ButtonGroup} size="lg" className="me-3">
                  <Button variant="outline-primary" as={Link} to="/user-login">
                    Login
                  </Button>
                  <Dropdown.Toggle split variant="outline-primary" id="login-dropdown-split" />
                  <Dropdown.Menu>
                    <Dropdown.Header>Choose Login Type</Dropdown.Header>
                    <Dropdown.Item as={Link} to="/user-login">
                      👤 User Login
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/owner-login">
                      🏠 Owner Login
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin-login">
                      🛡️ Admin Login
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                
                <Button as={Link} to="/listings" variant="outline-light" size="lg">
                  Browse Listings
                </Button>
              </>
            ) : (
              <Button as={Link} to="/listings" variant="primary" size="lg">
                Browse Properties
              </Button>
            )}
          </div>
        </Container>
      </div>

      {/* Search and Filter Section */}
      <Container className="mb-5">
        <Card className="search-filter-card">
          <Card.Body className="p-4">
            <h4 className="mb-3">Search Properties</h4>
            <Row>
              <Col md={3} className="mb-3">
                <label className="form-label">Location</label>
                <select className="form-select">
                  <option>Select Location</option>
                  <option>Chennai</option>
                  <option>Coimbatore</option>
                  <option>Madurai</option>
                  <option>Salem</option>
                  <option>Trichy</option>
                </select>
              </Col>
              <Col md={3} className="mb-3">
                <label className="form-label">Property Type</label>
                <select className="form-select">
                  <option>All Types</option>
                  <option>Independent House/Villa</option>
                  <option>Residential Apartment</option>
                  <option>Independent/Builder Floor</option>
                  <option>1 RK/Studio Apartment</option>
                </select>
              </Col>
              <Col md={3} className="mb-3">
                <label className="form-label">Budget</label>
                <select className="form-select">
                  <option>Any Budget</option>
                  <option>₹10,000 - ₹25,000</option>
                  <option>₹25,000 - ₹50,000</option>
                  <option>₹50,000 - ₹1 Lac</option>
                  <option>₹1 Lac+</option>
                </select>
              </Col>
              <Col md={3} className="mb-3">
                <label className="form-label">Bedrooms</label>
                <select className="form-select">
                  <option>Any</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4+ BHK</option>
                </select>
              </Col>
            </Row>
            <Row>
              <Col md={3} className="mb-3">
                <label className="form-label">Furnishing</label>
                <select className="form-select">
                  <option>Any</option>
                  <option>Furnished</option>
                  <option>Semi-Furnished</option>
                  <option>Unfurnished</option>
                </select>
              </Col>
              <Col md={3} className="mb-3">
                <label className="form-label">Posted By</label>
                <select className="form-select">
                  <option>Any</option>
                  <option>Owner</option>
                  <option>Builder</option>
                  <option>Dealer</option>
                </select>
              </Col>
              <Col md={3} className="mb-3">
                <label className="form-label">Available For</label>
                <select className="form-select">
                  <option>Any</option>
                  <option>Family</option>
                  <option>Single Men</option>
                  <option>Single Women</option>
                  <option>Company Lease</option>
                </select>
              </Col>
              <Col md={3} className="mb-3 d-flex align-items-end">
                <Button as={Link} to="/enhanced-search" variant="primary" className="w-100">
                  🔍 Smart Search
                </Button>
              </Col>
            </Row>
            <div className="text-center mt-3">
              <Button variant="outline-secondary" size="sm">
                Advanced Filters
              </Button>
              <Button variant="link" size="sm" className="ms-2">
                Clear All Filters
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Sample Properties Gallery */}
      <Container className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Featured Properties</h2>
          <Button as={Link} to="/listings" variant="outline-primary">
            View All Properties
          </Button>
        </div>
        <Row>
          {loading ? (
            <Col className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </Col>
          ) : featuredProperties.length === 0 ? (
            <Col className="text-center py-5">
              <p>No properties available at the moment.</p>
            </Col>
          ) : (
            featuredProperties.map((property) => (
            <Col key={property.id} lg={3} md={6} className="mb-4">
              <Card className="property-card h-100">
                <div className="property-image-container">
                  <Card.Img 
                    variant="top" 
                    src={property.image} 
                    alt={property.title}
                    className="property-image"
                  />
                  {property.verified && (
                    <Badge bg="success" className="verified-badge">
                      ✓ VERIFIED
                    </Badge>
                  )}
                  <div className="property-overlay">
                    <Button variant="light" size="sm" className="heart-btn">
                      ❤️
                    </Button>
                  </div>
                </div>
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                      <small className="text-muted">
                        {property.owner?.name || 'Owner'} • {property.postedTime}
                      </small>
                  </div>
                  <Card.Title className="property-title">{property.title}</Card.Title>
                  <Card.Text className="property-location text-muted mb-2">
                    {property.bedrooms} BHK • {property.bathrooms} Bath • {property.area}
                  </Card.Text>
                  <Card.Text className="property-location text-muted mb-2">
                    {property.location}
                  </Card.Text>
                    
                    {/* Owner Details Section */}
                    {property.owner && (
                      <div className="owner-info bg-light rounded p-2 mb-2">
                        <small className="text-muted d-block mb-1">
                          <i className="fas fa-user me-1"></i>
                          <strong>Owner:</strong> {property.owner.name}
                          {property.owner.verified && (
                            <Badge bg="success" className="ms-1" style={{ fontSize: '0.65em' }}>
                              ✓ Verified
                            </Badge>
                          )}
                        </small>
                        <small className="text-muted d-block mb-1">
                          <i className="fas fa-envelope me-1"></i>
                          {property.owner.email}
                        </small>
                        <small className="text-muted d-block">
                          <i className="fas fa-phone me-1"></i>
                          {property.owner.phone}
                        </small>
                      </div>
                    )}

                  <div className="property-highlights mb-3">
                    {property.highlights.map((highlight, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <div className="property-price mb-2">
                      <strong className="text-primary fs-5">{property.price}</strong>
                      <br />
                      <small className="text-muted">+ Deposit {property.deposit}</small>
                    </div>
                    <div className="d-grid gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          as={Link}
                          to={`/show/${property.id}`}
                        >
                        View Details
                      </Button>
                        <Button 
                          variant="primary" 
                          size="sm"
                          as={Link}
                          to={`/show/${property.id}`}
                        >
                        Contact Owner
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            ))
          )}
        </Row>
      </Container>

      {/* Features Section */}
      <Container className="mb-5">
        <h2 className="text-center mb-5">Why Choose House Rental Finder?</h2>
        <Row>
          {features.map((feature, index) => (
            <Col key={index} lg={4} md={6} className="mb-4">
              <Card className="h-100 feature-card text-center">
                <Card.Body>
                  <div className="feature-icon mb-3">{feature.icon}</div>
                  <Card.Title>{feature.title}</Card.Title>
                  <Card.Text>{feature.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* How It Works */}
      <div className="how-it-works bg-light py-5 mb-5">
        <Container>
          <h2 className="text-center mb-5">How It Works</h2>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <div className="step-number mb-3">1</div>
              <h4>Search & Filter</h4>
              <p>Find properties by location, price, bedrooms, and more</p>
            </Col>
            <Col md={4} className="mb-4">
              <div className="step-number mb-3">2</div>
              <h4>View Details</h4>
              <p>See photos, descriptions, and contact information</p>
            </Col>
            <Col md={4} className="mb-4">
              <div className="step-number mb-3">3</div>
              <h4>Contact & Visit</h4>
              <p>Get directions and schedule a visit with the owner</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="text-center mb-5">
        <Card className="cta-card">
          <Card.Body className="py-5">
            <h3 className="mb-3">Ready to Find Your Home?</h3>
            <p className="mb-4">
              Join thousands of users who have found their perfect rental through our platform
            </p>
            {!user ? (
              <>
                <Dropdown as={ButtonGroup} size="lg" className="me-3">
                  <Button variant="primary" as={Link} to="/user-register">
                    Create Account
                  </Button>
                  <Dropdown.Toggle split variant="primary" id="cta-signup-dropdown-split" />
                  <Dropdown.Menu>
                    <Dropdown.Header>Choose Account Type</Dropdown.Header>
                    <Dropdown.Item as={Link} to="/user-register">
                      👤 User Account (Find Rentals)
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/owner-register">
                      🏠 Owner Account (List Properties)
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin-register">
                      🛡️ Admin Account (Manage Platform)
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                
                <Dropdown as={ButtonGroup} size="lg">
                  <Button variant="outline-light" as={Link} to="/user-login">
                    Login
                  </Button>
                  <Dropdown.Toggle split variant="outline-light" id="cta-login-dropdown-split" />
                  <Dropdown.Menu>
                    <Dropdown.Header>Choose Login Type</Dropdown.Header>
                    <Dropdown.Item as={Link} to="/user-login">
                      👤 User Login
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/owner-login">
                      🏠 Owner Login
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin-login">
                      🛡️ Admin Login
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <Button as={Link} to="/listings" variant="primary" size="lg">
                Browse Properties
              </Button>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default HomePage;
