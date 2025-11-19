import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Alert, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api, { purchaseAPI } from '../api';
import { ownerReports, ownerDummyData } from '../data/dummyReports';
import styles from './OwnerDashboard.module.css';

const HouseOwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [propertyRequests, setPropertyRequests] = useState([]);

  // Statistics state
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0
  });

  // Dummy data for reports
  const [reports] = useState(ownerReports);
  const [recentInquiries] = useState(ownerDummyData.recentInquiries);
  const [topProperties] = useState(ownerDummyData.topPerformingProperties);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load owner's listings, bookings, sales, and property requests
      const [listingsRes, bookingsRes, salesRes, requestsRes] = await Promise.all([
        api.get('/listings'),
        api.get('/bookings'),
        purchaseAPI.getSellerSales().catch(() => ({ data: [] })),
        api.get('/property-requests/owner-requests').catch((err) => {
          console.error('Error fetching property requests:', err);
          // Fallback to localStorage if API fails
          const allRequests = JSON.parse(localStorage.getItem('propertyRequests') || '[]');
          const ownerRequests = allRequests.filter(request => request.ownerEmail === user?.email);
          return { data: { requests: ownerRequests } };
        })
      ]);
      
      // Set property requests from API or localStorage fallback
      const requests = requestsRes.data?.requests || requestsRes.data || [];
      console.log('📥 Property requests loaded:', {
        count: requests.length,
        ownerEmail: user?.email,
        requests: requests.map(r => ({
          id: r._id || r.id,
          listingTitle: r.listing?.title || r.propertyTitle,
          userName: r.user?.name || r.userName,
          userEmail: r.user?.email || r.userEmail,
          status: r.status,
          message: r.message?.substring(0, 50) + '...'
        }))
      });
      setPropertyRequests(Array.isArray(requests) ? requests : []);

      // Filter listings by owner
      const ownerListings = listingsRes.data?.filter(listing => 
        listing.ownerEmail === user?.email
      ) || [];
      
      // Filter bookings for owner's listings
      const ownerBookings = bookingsRes.data?.filter(booking => 
        ownerListings.some(listing => listing.id === booking.listingId)
      ) || [];

      setListings(ownerListings);
      setBookings(ownerBookings);
      setSales(salesRes.data || []);
      
      // Calculate statistics
      const activeListings = ownerListings.filter(l => l.verified).length;
      const pendingBookings = ownerBookings.filter(b => b.status === 'pending').length;
      const totalRevenue = ownerBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
      const totalRequests = Array.isArray(requests) ? requests.length : 0;

      setStats({
        totalListings: ownerListings.length,
        activeListings,
        totalBookings: ownerBookings.length,
        pendingBookings,
        totalRevenue,
        totalRequests
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showAlert('Error loading dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'owner') {
      loadDashboardData();
    } else {
      navigate('/owner-login');
    }
  }, [user, navigate, loadDashboardData]);

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
  };

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  // Handle request status update
  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      console.log('📤 Updating request status:', { requestId, status });
      const response = await api.patch(`/property-requests/${requestId}`, { status });
      console.log('✅ Request status updated:', response.data);
      showAlert(`Request ${status} successfully!`, 'success');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('❌ Error updating request status:', error.response?.data || error.message);
      showAlert(error.response?.data?.message || 'Failed to update request status', 'danger');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteListing = (listingId) => {
    setListingToDelete(listingId);
    setShowDeleteModal(true);
  };

  const confirmDeleteListing = async () => {
    if (!listingToDelete) return;

    try {
      await api.delete(`/listings/${listingToDelete}`);
      showAlert('Listing deleted successfully!', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      showAlert('Error deleting listing', 'danger');
    } finally {
      setShowDeleteModal(false);
      setListingToDelete(null);
    }
  };

  const renderListingsTable = () => {
    if (listings.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-home fa-3x mb-3 d-block"></i>
              <p>No properties listed yet</p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/owner-add-listing')}
              >
                <i className="fas fa-plus me-2"></i>
                Add Your First Property
              </Button>
            </div>
          </td>
        </tr>
      );
    }

    return listings.map(listing => (
      <tr key={listing.id}>
        <td>#{listing.id}</td>
        <td>
          <div>
            <strong>{listing.title}</strong>
            <br />
            <small className="text-muted">{listing.address}</small>
          </div>
        </td>
        <td>${listing.rent?.toLocaleString() || listing.price?.toLocaleString() || 'N/A'}</td>
        <td>
          <Badge bg={listing.verified ? 'success' : 'warning'}>
            {listing.verified ? 'Verified' : 'Pending'}
          </Badge>
        </td>
        <td>{listing.bedrooms || 'N/A'} bed / {listing.bathrooms || 'N/A'} bath</td>
        <td>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" size="sm">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => navigate(`/listings/${listing.id}`)}>
                <i className="fas fa-eye me-2"></i>View Details
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate(`/listings/${listing.id}/edit`)}>
                <i className="fas fa-edit me-2"></i>Edit Property
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                className="text-danger" 
                onClick={() => handleDeleteListing(listing.id)}
              >
                <i className="fas fa-trash me-2"></i>Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    ));
  };

  const renderBookingsTable = () => {
    if (bookings.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-calendar-check fa-3x mb-3 d-block"></i>
              <p>No bookings yet</p>
            </div>
          </td>
        </tr>
      );
    }

    return bookings.map(booking => (
      <tr key={booking.id}>
        <td>#{booking.id}</td>
        <td>{booking.userEmail}</td>
        <td>Listing #{booking.listingId}</td>
        <td>${booking.amount?.toLocaleString() || '0'}</td>
        <td>
          <Badge bg={booking.status === 'confirmed' ? 'success' : 'warning'}>
            {booking.status}
          </Badge>
        </td>
      </tr>
    ));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Alert */}
      {alert.show && (
        <Alert 
          variant={alert.type} 
          dismissible 
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
          className="position-fixed"
          style={{ top: '20px', right: '20px', zIndex: 9999, minWidth: '300px' }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Header */}
      <div className={styles.header}>
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="mb-0">
                <i className="fas fa-home me-3"></i>Property Owner Dashboard
              </h1>
              <p className="mb-0 opacity-75">Welcome back, {user?.name || 'Owner'}!</p>
            </Col>
            <Col md={4} className="text-end">
              <Button 
                variant="success" 
                className="me-2"
                onClick={() => navigate('/owner-add-listing')}
              >
                <i className="fas fa-plus me-2"></i>Add New Property
              </Button>
              <Button 
                variant="outline-light"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt me-2"></i>Logout
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col xl={3} lg={6} md={6} className="mb-3">
            <Card className={`${styles.statsCard} h-100`}>
              <Card.Body className="text-center">
                <div className={styles.statsIcon}>
                  <i className="fas fa-home"></i>
                </div>
                <h3>{stats.totalListings || 8}</h3>
                <p className="mb-1">Total Properties</p>
                <small className="text-muted">{stats.activeListings || 6} active</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} md={6} className="mb-3">
            <Card className={`${styles.statsCard} h-100`}>
              <Card.Body className="text-center">
                <div className={styles.statsIcon}>
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3>{stats.totalBookings || 4}</h3>
                <p className="mb-1">Total Bookings</p>
                <small className="text-muted">{stats.pendingBookings || 1} pending</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} md={6} className="mb-3">
            <Card className={`${styles.statsCard} h-100`}>
              <Card.Body className="text-center">
                <div className={styles.statsIcon}>
                  <i className="fas fa-dollar-sign"></i>
                </div>
                <h3>₹{(stats.totalRevenue || 240000).toLocaleString()}</h3>
                <p className="mb-1">Total Revenue</p>
                <small className="text-muted">From bookings</small>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={3} lg={6} md={6} className="mb-3">
            <Card className={`${styles.statsCard} h-100`}>
              <Card.Body className="text-center">
                <div className={styles.statsIcon}>
                  <i className="fas fa-envelope"></i>
                </div>
                <h3>{stats.totalRequests || propertyRequests.length || 12}</h3>
                <p className="mb-1">Property Inquiries</p>
                <small className="text-muted">From interested users</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col md={12}>
            <Card>
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0"><i className="fas fa-bolt me-2"></i>Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2 d-md-flex">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/owner-add-listing')}
                    className="me-2"
                  >
                    <i className="fas fa-plus me-2"></i>Add New Property
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    onClick={loadDashboardData}
                    className="me-2"
                  >
                    <i className="fas fa-refresh me-2"></i>Refresh Data
                  </Button>
                  <Button 
                    variant="outline-info" 
                    onClick={() => navigate('/')}
                  >
                    <i className="fas fa-search me-2"></i>Browse All Properties
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* My Properties */}
        <Card className="table-container mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
            <h5 className="mb-0"><i className="fas fa-list me-2"></i>My Properties</h5>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => navigate('/owner-add-listing')}
            >
              <i className="fas fa-plus me-1"></i>Add Property
            </Button>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Property Details</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {renderListingsTable()}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Sales History */}
        <Card className="table-container mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center bg-success text-white">
            <h5 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>Property Sales</h5>
            <Badge bg="light" text="dark" className="fs-6">
              {sales.length} Sales
            </Badge>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Sale ID</th>
                    <th>Property Details</th>
                    <th>Buyer</th>
                    <th>Sale Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <i className="fas fa-shopping-cart fa-3x mb-3 d-block"></i>
                          <p>No sales yet</p>
                          <p className="small">When users purchase your properties for free, they'll appear here</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sales.map(sale => (
                      <tr key={sale.purchaseId}>
                        <td>#{sale.purchaseId}</td>
                        <td>
                          <div>
                            <strong>{sale.property.title}</strong>
                            <br />
                            <small className="text-muted">{sale.property.address}</small>
                            <br />
                            <small className="text-muted">
                              {sale.property.bedrooms} bed • {sale.property.bathrooms} bath • {sale.property.areaSqft} sqft
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{sale.buyer.name}</strong>
                            <br />
                            <small className="text-muted">{sale.buyer.email}</small>
                          </div>
                        </td>
                        <td>
                          {new Date(sale.purchaseDate).toLocaleDateString()}
                        </td>
                        <td>
                          <Badge bg={sale.status === 'completed' ? 'success' : sale.status === 'pending' ? 'warning' : 'danger'}>
                            {sale.status}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => navigate(`/show/${sale.property.listingId}`)}
                          >
                            <i className="fas fa-eye me-1"></i>View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Property Requests */}
        <Card className="table-container mb-4 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center bg-info text-white py-3">
            <div>
              <h5 className="mb-0">
                <i className="fas fa-envelope me-2"></i>
                Property Inquiries
              </h5>
              <small className="opacity-75">Requests from potential tenants</small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="light"
                size="sm"
                onClick={loadDashboardData}
                title="Refresh Requests"
                disabled={loading}
              >
                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              </Button>
              {propertyRequests.filter(r => r.status === 'pending' || !r.status).length > 0 && (
                <Badge bg="warning" text="dark">
                  {propertyRequests.filter(r => r.status === 'pending' || !r.status).length} New
                </Badge>
              )}
              <Badge bg="light" text="dark" className="fs-6">
                {propertyRequests.length} Total
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {propertyRequests.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted">
                  <i className="fas fa-inbox fa-4x mb-3 d-block opacity-50"></i>
                  <h5>No property inquiries yet</h5>
                  <p className="small mb-0">When users request information about your properties, they'll appear here</p>
                </div>
              </div>
            ) : (
            <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                  <tr>
                      <th style={{ width: '15%' }}>Date & Time</th>
                      <th style={{ width: '20%' }}>Property</th>
                      <th style={{ width: '20%' }}>Inquirer Details</th>
                      <th style={{ width: '30%' }}>Message</th>
                      <th style={{ width: '10%' }}>Status</th>
                      <th style={{ width: '15%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {propertyRequests.map((request, index) => {
                      // Handle both API format (populated) and localStorage format
                      const userInfo = request.user || { name: request.userName, email: request.userEmail };
                      const listingInfo = request.listing || { title: request.propertyTitle, _id: request.listingId };
                      const timestamp = request.created_at || request.timestamp;
                      const requestId = request._id?.toString() || request.id?.toString() || index;
                      const status = request.status || 'pending';
                      const isNew = status === 'pending' || !request.status;
                      const timeAgo = timestamp ? getTimeAgo(timestamp) : 'Recently';
                      
                      return (
                        <tr 
                          key={requestId}
                          className={isNew ? 'table-warning' : ''}
                          style={{ backgroundColor: isNew ? 'rgba(255, 193, 7, 0.1)' : 'transparent' }}
                        >
                        <td>
                            <div>
                              <small className="text-muted d-block">{new Date(timestamp).toLocaleDateString()}</small>
                              <small className="text-muted">{new Date(timestamp).toLocaleTimeString()}</small>
                              <br />
                              <Badge bg="secondary" className="mt-1" style={{ fontSize: '0.7em' }}>
                                {timeAgo}
                              </Badge>
                            </div>
                        </td>
                        <td>
                          <div>
                              <strong className="text-primary">{listingInfo.title || request.propertyTitle || 'Unknown Property'}</strong>
                            <br />
                              {listingInfo.locationText && (
                                <small className="text-muted">
                                  <i className="fas fa-map-marker-alt me-1"></i>
                                  {listingInfo.locationText}
                                </small>
                              )}
                              {listingInfo.price && (
                                <div className="mt-1">
                                  <Badge bg="info" style={{ fontSize: '0.75em' }}>
                                    ₹{listingInfo.price.toLocaleString()}/month
                                  </Badge>
                                </div>
                              )}
                          </div>
                        </td>
                        <td>
                          <div>
                              <div className="d-flex align-items-center mb-1">
                                <i className="fas fa-user-circle text-primary me-2"></i>
                                <strong>{userInfo.name || request.userName || 'Unknown User'}</strong>
                              </div>
                              <small className="text-muted d-block">
                                <i className="fas fa-envelope me-1"></i>
                                {userInfo.email || request.userEmail}
                              </small>
                              {userInfo.verified && (
                                <Badge bg="success" className="mt-1" style={{ fontSize: '0.7em' }}>
                                  <i className="fas fa-check-circle me-1"></i>Verified
                                </Badge>
                              )}
                          </div>
                        </td>
                        <td>
                            <div style={{ maxWidth: '100%' }}>
                              <p 
                                className="mb-0" 
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                                title={request.message}
                              >
                                {request.message || 'No message provided'}
                            </p>
                          </div>
                        </td>
                        <td>
                            <Badge 
                              bg={
                                status === 'approved' ? 'success' : 
                                status === 'rejected' ? 'danger' : 
                                'warning'
                              }
                            >
                              {status === 'approved' ? (
                                <><i className="fas fa-check me-1"></i>Approved</>
                              ) : status === 'rejected' ? (
                                <><i className="fas fa-times me-1"></i>Rejected</>
                              ) : (
                                <><i className="fas fa-clock me-1"></i>Pending</>
                              )}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1">
                            <Button 
                              as="a"
                                href={`mailto:${userInfo.email || request.userEmail}?subject=Re: ${listingInfo.title || request.propertyTitle}&body=Hi ${userInfo.name || request.userName},%0D%0A%0D%0AThank you for your inquiry about ${listingInfo.title || request.propertyTitle}.%0D%0A%0D%0A`}
                              variant="outline-primary" 
                              size="sm"
                              title="Reply via Email"
                                className="w-100"
                            >
                                <i className="fas fa-reply me-1"></i>Reply
                            </Button>
                              {isNew && (
                                <div className="d-flex gap-1">
                            <Button 
                              variant="outline-success" 
                              size="sm"
                                    title="Approve Request"
                                    onClick={() => handleUpdateRequestStatus(requestId, 'approved')}
                                    className="flex-fill"
                                  >
                                    <i className="fas fa-check"></i>
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    title="Reject Request"
                                    onClick={() => handleUpdateRequestStatus(requestId, 'rejected')}
                                    className="flex-fill"
                            >
                                    <i className="fas fa-times"></i>
                            </Button>
                                </div>
                              )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                </tbody>
              </Table>
            </div>
            )}
          </Card.Body>
        </Card>

        {/* Recent Bookings */}
        <Card className="table-container">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0"><i className="fas fa-calendar-check me-2"></i>Recent Bookings</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Tenant Email</th>
                    <th>Property</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {renderBookingsTable()}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this property listing? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteListing}>
            Delete Property
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reports Section */}
      <Container>
        <Card className={`${styles.sectionCard} mb-4`}>
          <Card.Header className={styles.sectionHeader}>
            <h5 className={styles.sectionTitle}>
              <i className="fas fa-chart-line me-2"></i>
              Business Reports & Analytics
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              {reports.map(report => (
                <Col md={6} lg={4} key={report.id} className="mb-3">
                  <div className={styles.reportCard}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className={styles.reportTitle}>{report.title}</h6>
                        <p className={styles.reportDate}>
                          <i className="fas fa-calendar me-1"></i>
                          {new Date(report.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge bg={report.status === 'active' ? 'success' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-3">{report.description}</p>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(report.data).slice(0, 3).map(([key, value]) => (
                        <Badge key={key} bg="success" className="px-2 py-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      className={`mt-3 ${styles.actionButton}`}
                      onClick={() => showAlert(`Viewing ${report.title}`, 'success')}
                    >
                      <i className="fas fa-eye me-1"></i>View Report
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        {/* Top Performing Properties */}
        <Card className={`${styles.sectionCard} mb-4`}>
          <Card.Header className={styles.sectionHeader}>
            <h5 className={styles.sectionTitle}>
              <i className="fas fa-trophy me-2"></i>
              Top Performing Properties
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover className={styles.table}>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Views</th>
                    <th>Inquiries</th>
                    <th>Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topProperties.map(property => (
                    <tr key={property.id}>
                      <td><strong>{property.property}</strong></td>
                      <td>{property.views}</td>
                      <td>{property.inquiries}</td>
                      <td>
                        <Badge bg="success">{property.conversion}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default HouseOwnerDashboard;
