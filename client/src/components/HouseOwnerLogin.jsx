import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, InputGroup, Badge, Accordion } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import styles from './OwnerLogin.module.css';

const HouseOwnerLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  // Sample owner credentials for testing
  const sampleOwners = [
    { name: 'Sanjay K', email: 'sanjayk.1234@gmail.com', password: 'Sanjayk*1', note: 'Test Account - Sees all requests' },
    { name: 'Ramesh Reddy', email: 'ramesh.property@gmail.com', password: 'owner123' },
    { name: 'Lakshmi Venkatesh', email: 'lakshmi.homes@gmail.com', password: 'owner123' },
    { name: 'Meera Krishnan', email: 'meera.rentals@gmail.com', password: 'owner123' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleQuickLogin = async (email, password) => {
    setFormData({ email, password });
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (user.role !== 'owner') {
        setError('Access denied. This login is for property owners only.');
        setLoading(false);
        return;
      }
      
      saveSession(token, user);
      navigate('/owner-dashboard');
    } catch (err) {
      console.error('Quick login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;
      
      // Check if user is an owner
      if (user.role !== 'owner') {
        setError('Access denied. This login is for property owners only.');
        setLoading(false);
        return;
      }
      
      saveSession(token, user);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberOwnerEmail', formData.email);
      } else {
        localStorage.removeItem('rememberOwnerEmail');
      }
      
      navigate('/owner-dashboard');
    } catch (err) {
      console.error('Login error details:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Network error: Cannot connect to server. Please check if server is running.');
      } else if (err.response) {
        setError(`Server error: ${err.response.data?.message || 'Login failed'}`);
      } else if (err.request) {
        setError('No response from server. Please check server connection.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberOwnerEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className={styles.loginContainer}>
      <Container>
        <Row className="justify-content-center">
          <Col md={7} lg={6}>
            <Card className={`mt-4 ${styles.authCard} shadow-lg border-0`}>
              <Card.Header className={`text-center ${styles.cardHeader} text-white py-4`}>
                <h2 className="mb-2">
                  <i className="fas fa-home me-2"></i>
                  Property Owner Login
                </h2>
                <p className="mb-0 opacity-75">Manage your rental properties and view inquiries</p>
              </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <i className="fas fa-envelope me-2 text-primary"></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="owner@example.com"
                    className={`form-control-lg ${styles.formControl}`}
                    autoComplete="email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">
                    <i className="fas fa-lock me-2 text-primary"></i>
                    Password
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className={`form-control-lg ${styles.formControl}`}
                      autoComplete="current-password"
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={togglePasswordVisibility}
                      className={styles.passwordToggle}
                    >
                      {showPassword ? (
                        <i className="fas fa-eye-slash"></i>
                      ) : (
                        <i className="fas fa-eye"></i>
                      )}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    label="Remember email"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <Link to="#" className="text-primary text-decoration-none">
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className={`w-100 mb-3 py-2 ${styles.submitButton} text-white`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In to Dashboard
                    </>
                  )}
                </Button>
              </Form>

              {/* Quick Login for Testing */}
              <Accordion className="mt-4">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <small>
                      <i className="fas fa-flask me-2"></i>
                      Quick Login (Test Accounts)
                    </small>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="d-grid gap-2">
                      {sampleOwners.map((owner, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          onClick={() => handleQuickLogin(owner.email, owner.password)}
                          className={`text-start ${styles.quickLoginButton}`}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{owner.name}</strong>
                              <br />
                              <small className="text-muted">{owner.email}</small>
                              {owner.note && (
                                <Badge bg="info" className="ms-2" style={{ fontSize: '0.65em' }}>
                                  {owner.note}
                                </Badge>
                              )}
                            </div>
                            <i className="fas fa-arrow-right"></i>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>

              <div className="auth-links text-center mt-4">
                <p className="mb-2">
                  Don't have an owner account? 
                  <Link to="/owner-register" className="ms-1 fw-bold text-primary">
                    <i className="fas fa-user-plus me-1"></i>
                    Register as Owner
                  </Link>
                </p>
                <hr className="my-3" />
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <Link to="/user-login" className="text-info text-decoration-none">
                    <i className="fas fa-user me-1"></i>
                    User Login
                  </Link>
                  <span className="text-muted">|</span>
                  <Link to="/admin-login" className="text-danger text-decoration-none">
                    <i className="fas fa-cog me-1"></i>
                    Admin Login
                  </Link>
                  <span className="text-muted">|</span>
                  <Link to="/login" className="text-muted text-decoration-none">
                    <i className="fas fa-arrow-left me-1"></i>
                    General Login
                  </Link>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Info Card */}
          <Card className="mt-3 border-0 bg-light">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <i className="fas fa-info-circle text-primary me-3 fs-4"></i>
                <div>
                  <strong>Owner Dashboard Features:</strong>
                  <ul className="mb-0 small text-muted">
                    <li>Manage your property listings</li>
                    <li>View and respond to property inquiries</li>
                    <li>Track bookings and sales</li>
                    <li>Update property details</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HouseOwnerLogin;
