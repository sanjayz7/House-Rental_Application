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
      icon: '📬',
      title: 'Direct Owner Requests',
      description: 'Send rental requests directly to specific property owners'
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

  const statistics = [
    {
      number: '5,000+',
      label: 'Active Listings',
      icon: '🏘️'
    },
    {
      number: '50,000+',
      label: 'Happy Renters',
      icon: '👥'
    },
    {
      number: '1,000+',
      label: 'Verified Owners',
      icon: '✓'
    },
    {
      number: '98%',
      label: 'Success Rate',
      icon: '⭐'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Kumar',
      role: 'Tenant',
      message: 'Found my dream apartment in just 2 days! The interface is so easy to use and the owner verification gives me peace of mind.',
      rating: 5,
      image: '👩'
    },
    {
      name: 'Raj Patel',
      role: 'Property Owner',
      message: 'Best platform for renting out properties. Got verified tenants quickly and the entire process was hassle-free.',
      rating: 5,
      image: '👨'
    },
    {
      name: 'Anjali Singh',
      role: 'Tenant',
      message: 'Transparent pricing and direct contact with owners made my search stress-free. Highly recommended!',
      rating: 5,
      image: '👩‍🦰'
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section-enhanced text-center py-md-5 mb-5">
        <Container>
          <div className="hero-content">
            <h1 className="hero-title mb-4">
              🏠 Find Your Perfect Rental Home
            </h1>
            <p className="hero-subtitle mb-5">
              Discover verified rental properties in your area with instant navigation, secure booking, and transparent pricing
            </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Dropdown as={ButtonGroup} size="lg" className="me-3">
                  <Button variant="outline-light" as={Link} to="/user-register" className="btn-browse-listings">
                    Create Account
                  </Button>
                  <Dropdown.Toggle split variant="outline-light" id="signup-dropdown-split" />
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
                  <Button variant="outline-light" as={Link} to="/user-login" className="btn-browse-listings">
                    Login
                  </Button>
                  <Dropdown.Toggle split variant="outline-light" id="login-dropdown-split" />
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
                
                <Button as={Link} to="/listings" variant="outline-light" size="lg" className="btn-browse-listings">
                  Browse Listings
                </Button>
              </>
            ) : (
              <Button as={Link} to="/listings" variant="primary" size="lg" className="btn-browse-listings" style={{background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', color: 'white'}}>
                Browse Properties
              </Button>
            )}
          </div>
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
      <Container className="my-5 py-5">
        <div className="text-center mb-5">
          <h2 className="section-title fw-bold mb-3">Featured Properties</h2>
          <p className="section-subtitle fs-5 mb-4">Handpicked rental properties verified by our team</p>
          <div className="d-flex justify-content-center gap-3">
            <Button as={Link} to="/listings" variant="primary" size="lg" className="fw-bold" style={{ borderRadius: '50px' }}>
              🔍 View All Properties
            </Button>
          </div>
        </div>
        <div className="my-3"></div>
        <Row>
          {loading ? (
            <Col className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading amazing properties...</p>
            </Col>
          ) : featuredProperties.length === 0 ? (
            <Col className="text-center py-5">
              <p className="fs-5">No properties available at the moment.</p>
            </Col>
          ) : (
            featuredProperties.map((property) => (
            <Col key={property.id} lg={3} md={6} className="mb-4">
              <Card className="property-card h-100 shadow-sm">
                <div className="property-image-container position-relative overflow-hidden" style={{ height: '250px', backgroundColor: '#f0f9ff' }}>
                  <Card.Img 
                    variant="top" 
                    src={property.image} 
                    alt={property.title}
                    className="property-image h-100"
                    style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  />
                  {property.verified && (
                    <Badge bg="success" className="position-absolute top-3 end-3 shadow">
                      ✓ VERIFIED
                    </Badge>
                  )}
                  <div className="property-overlay position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0)', transition: 'backgroundColor 0.3s ease' }}>
                    <Button 
                      variant="light" 
                      size="sm" 
                      className="heart-btn position-absolute bottom-3 end-3 rounded-circle"
                      style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                    >
                      ❤️
                    </Button>
                  </div>
                  <div className="position-absolute bottom-0 start-0 end-0 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                    <small className="text-white fw-bold d-block">
                      {property.postedTime}
                    </small>
                  </div>
                </div>
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3 pb-3" style={{ borderBottom: '1px solid #f0f4f8' }}>
                    <Card.Title className="property-title mb-2 fs-6" style={{ fontWeight: '700', color: '#1e293b' }}>
                      {property.title}
                    </Card.Title>
                    <Card.Text className="property-location text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                      <i className="fas fa-map-marker-alt me-2" style={{ color: '#0d9488' }}></i>
                      {property.location}
                    </Card.Text>
                    <Card.Text className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                      <i className="fas fa-door-open me-2" style={{ color: '#0d9488' }}></i>
                      {property.bedrooms} BHK • {property.bathrooms} Bath • {property.area}
                    </Card.Text>
                  </div>
                    
                  {property.owner && (
                    <div className="owner-info mb-3 p-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px' }}>
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-2 fs-5">👤</div>
                        <div>
                          <small className="d-block fw-bold text-dark">{property.owner.name}</small>
                          {property.owner.verified && (
                            <Badge bg="success" pill style={{ fontSize: '0.65rem' }}>
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <small className="text-muted d-block mb-1">
                        <i className="fas fa-envelope me-1"></i>{property.owner.email}
                      </small>
                      <small className="text-muted d-block">
                        <i className="fas fa-phone me-1"></i>{property.owner.phone}
                      </small>
                    </div>
                  )}

                  <div className="property-highlights mb-3">
                    {property.highlights.slice(0, 3).map((highlight, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1 mb-1" style={{ fontSize: '0.75rem', padding: '0.4rem 0.7rem' }}>
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <div className="property-price mb-3 p-3 rounded-3" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #0d9488' }}>
                      <strong className="fs-5" style={{ color: '#0d9488' }}>{property.price}</strong>
                      <br />
                      <small className="text-muted">Deposit {property.deposit}</small>
                    </div>
                    <div className="d-grid gap-2">
                        <Button 
                          variant="primary" 
                          size="sm"
                          as={Link}
                          to={`/show/${property.id}`}
                          className="fw-bold"
                          title="Send rental request directly to this property owner"
                          style={{ borderRadius: '8px', padding: '0.6rem', background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', border: 'none' }}
                        >
                          📬 Send Request
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          as={Link}
                          to={`/show/${property.id}`}
                          style={{ borderRadius: '8px', padding: '0.6rem', borderColor: '#0d9488', color: '#0d9488' }}
                        >
                          View Details
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

      {/* Statistics Section */}
      <section className="stats-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold mb-3">Our Impact</h2>
            <p className="section-subtitle fs-5">Trusted by thousands across the region</p>
          </div>
          <Row className="text-center">
            {statistics.map((stat, index) => (
              <Col key={index} lg={3} md={6} className="mb-4">
                <div className="stat-card p-4 h-100">
                  <div className="stat-icon fs-1 mb-3 animate-bounce">{stat.icon}</div>
                  <h3 className="stat-number fw-bold mb-2">{stat.number}</h3>
                  <p className="stat-label text-muted">{stat.label}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold mb-3">What Our Users Say</h2>
            <p className="section-subtitle fs-5">Real experiences from renters and property owners</p>
          </div>
          <Row>
            {testimonials.map((testimonial, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="testimonial-card h-100 border-0 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="testimonial-rating mb-3">
                      {Array(testimonial.rating).fill('⭐').join('')}
                    </div>
                    <p className="testimonial-message text-muted mb-4 flex-grow-1">"{testimonial.message}"</p>
                    <div className="testimonial-header d-flex align-items-center pt-3" style={{ borderTop: '1px solid #f0f4f8' }}>
                      <div className="testimonial-avatar me-3 fs-1" style={{ minWidth: '50px', textAlign: 'center' }}>{testimonial.image}</div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark">{testimonial.name}</h6>
                        <small className="text-muted">{testimonial.role}</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <Container className="mb-5">
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold mb-3">Why Choose House Rental Finder?</h2>
            <p className="section-subtitle fs-5">Trusted by thousands of renters and property owners across the region</p>
          </div>
          <Row>
          {features.map((feature, index) => (
            <Col key={index} lg={4} md={6} className="mb-4">
              <Card className="h-100 feature-card text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="feature-icon mb-3" style={{ fontSize: '3.5rem' }}>{feature.icon}</div>
                  <Card.Title className="fw-bold mb-3" style={{ color: '#1e293b' }}>{feature.title}</Card.Title>
                  <Card.Text className="text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{feature.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        </Container>
      </section>

      {/* Send Request to Owner Section */}
      <section className="request-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="pe-lg-4">
                <Badge className="feature-badge mb-3">🎯 NEW FEATURE</Badge>
                <h2 className="fw-bold mb-3" style={{ color: '#1e293b', fontSize: '2rem' }}>Direct Request to Property Owners</h2>
                <p className="fs-5 mb-4" style={{ color: '#64748b', lineHeight: '1.7' }}>
                  Connect directly with property owners without intermediaries. Send personalized rental requests to specific house owners and get responses from verified owners.
                </p>
                <ul className="list-unstyled">
                  <li className="mb-3">
                    <i className="fas fa-check-circle" style={{ color: '#0d9488', marginRight: '0.75rem', fontSize: '1.1rem' }}></i>
                    <strong style={{ color: '#1e293b' }}>Send to Specific Owners</strong>
                    <p className="text-muted ms-4 mb-0" style={{ fontSize: '0.95rem' }}>Target your requests to the exact property owners you're interested in</p>
                  </li>
                  <li className="mb-3">
                    <i className="fas fa-check-circle" style={{ color: '#0d9488', marginRight: '0.75rem', fontSize: '1.1rem' }}></i>
                    <strong style={{ color: '#1e293b' }}>Verified Owner Details</strong>
                    <p className="text-muted ms-4 mb-0" style={{ fontSize: '0.95rem' }}>View verified contact information and owner credentials</p>
                  </li>
                  <li className="mb-3">
                    <i className="fas fa-check-circle" style={{ color: '#0d9488', marginRight: '0.75rem', fontSize: '1.1rem' }}></i>
                    <strong style={{ color: '#1e293b' }}>Instant Communication</strong>
                    <p className="text-muted ms-4 mb-0" style={{ fontSize: '0.95rem' }}>Get quick responses from property owners</p>
                  </li>
                  <li className="mb-3">
                    <i className="fas fa-check-circle" style={{ color: '#0d9488', marginRight: '0.75rem', fontSize: '1.1rem' }}></i>
                    <strong style={{ color: '#1e293b' }}>Safe & Secure</strong>
                    <p className="text-muted ms-4 mb-0" style={{ fontSize: '0.95rem' }}>All requests are tracked and monitored for your protection</p>
                  </li>
                </ul>
                <Button as={Link} to="/listings" variant="primary" size="lg" className="fw-bold mt-4" style={{ borderRadius: '50px', padding: '0.7rem 2rem', background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', border: 'none' }}>
                  Start Sending Requests →
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <Card className="border-0 shadow-lg h-100" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #0d9488' }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4 text-center" style={{ color: '#1e293b' }}>How to Request an Owner</h5>
                  <div className="request-steps">
                    <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #dcfce7' }}>
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3 fw-bold" style={{ width: '45px', height: '45px', flexShrink: 0, background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', fontSize: '1.2rem' }}>
                          1
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>🔍 Find Properties</h6>
                          <p className="text-muted small mb-0">Browse and filter properties that match your requirements</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #dcfce7' }}>
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3 fw-bold" style={{ width: '45px', height: '45px', flexShrink: 0, background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', fontSize: '1.2rem' }}>
                          2
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>👤 View Owner Details</h6>
                          <p className="text-muted small mb-0">Check verified owner information and credentials</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-0">
                      <div className="d-flex align-items-start">
                        <div className="rounded-circle text-white d-flex align-items-center justify-content-center me-3 fw-bold" style={{ width: '45px', height: '45px', flexShrink: 0, background: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)', fontSize: '1.2rem' }}>
                          3
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1" style={{ color: '#1e293b' }}>📬 Send Request</h6>
                          <p className="text-muted small mb-0">Click "Send Request to Owner" to connect directly with them</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section className="how-it-works py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title fw-bold mb-3">How It Works</h2>
            <p className="section-subtitle fs-5">Get started in just 3 simple steps</p>
          </div>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <div className="mb-4">
                <div className="step-number mb-3" style={{ fontSize: '3rem', fontWeight: '800' }}>1</div>
                <div className="p-4 rounded-3" style={{ backgroundColor: 'white', marginTop: '1rem' }}>
                  <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>🔍 Search & Filter</h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>Find properties by location, price, bedrooms, amenities, and more using our smart filters</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="mb-4">
                <div className="step-number mb-3" style={{ fontSize: '3rem', fontWeight: '800' }}>2</div>
                <div className="p-4 rounded-3" style={{ backgroundColor: 'white', marginTop: '1rem' }}>
                  <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>📋 View Details</h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>Explore detailed listings with photos, descriptions, amenities, and verified owner information</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="mb-4">
              <div className="mb-4">
                <div className="step-number mb-3" style={{ fontSize: '3rem', fontWeight: '800' }}>3</div>
                <div className="p-4 rounded-3" style={{ backgroundColor: 'white', marginTop: '1rem' }}>
                  <h5 className="fw-bold mb-3" style={{ color: '#1e293b' }}>📬 Send Request</h5>
                  <p className="text-muted" style={{ fontSize: '0.95rem' }}>Send rental requests directly to specific property owners, schedule visits, and connect instantly</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <div className="text-center">
            <Card className="cta-card border-0 shadow-lg">
              <Card.Body className="py-5 px-4">
                <h2 className="cta-title fw-bold mb-2">🏡 Ready to Find Your Home?</h2>
                <p className="cta-subtitle fs-5 mb-5">
                  Join thousands of renters and property owners who have already found success on our platform
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-3">
            {!user ? (
              <>
                <Dropdown as={ButtonGroup} size="lg">
                  <Button 
                    variant="outline-light" 
                    as={Link} 
                    to="/user-register" 
                    className="btn-browse-listings fw-bold"
                    style={{ borderRadius: '50px 0 0 50px', padding: '0.7rem 1.5rem' }}
                  >
                    ✍️ Create Account
                  </Button>
                  <Dropdown.Toggle split variant="outline-light" id="cta-signup-dropdown-split" style={{ borderRadius: '0 50px 50px 0' }} />
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
                  <Button 
                    variant="outline-light" 
                    as={Link} 
                    to="/user-login" 
                    className="btn-browse-listings fw-bold"
                    style={{ borderRadius: '50px 0 0 50px', padding: '0.7rem 1.5rem' }}
                  >
                    🔐 Login
                  </Button>
                  <Dropdown.Toggle split variant="outline-light" id="cta-login-dropdown-split" style={{ borderRadius: '0 50px 50px 0' }} />
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
              <Button 
                as={Link} 
                to="/listings" 
                variant="outline-light" 
                size="lg" 
                className="btn-browse-listings fw-bold"
                style={{ borderRadius: '50px' }}
              >
                🔍 Browse Properties
              </Button>
            )}
                </div>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
