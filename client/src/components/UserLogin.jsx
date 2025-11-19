import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import styles from './UserLogin.module.css';

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;
      
      // Check if user is a regular user (not owner or admin)
      if (user.role !== 'user') {
        setError('Access denied. This login is for regular users only.');
        setLoading(false);
        return;
      }
      
      saveSession(token, user);
      navigate('/user-dashboard');
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

  return (
    <div className={styles.loginContainer}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className={`mt-5 ${styles.authCard} shadow-lg`}>
              <Card.Header className={`text-center ${styles.cardHeader} text-white`}>
                <h3 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  User Login
                </h3>
                <p className="mb-0 mt-2 opacity-75">Find your perfect rental home</p>
              </Card.Header>
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit} className="auth-form">
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      className={`form-control-lg ${styles.formControl}`}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                        className={`form-control-lg ${styles.formControl}`}
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

                  <Button
                    type="submit"
                    size="lg"
                    className={`w-100 mb-3 ${styles.submitButton} text-white`}
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
                        Sign In
                      </>
                    )}
                  </Button>
                </Form>

                <div className={`${styles.authLinks} text-center`}>
                  <p className="mb-2">
                    Don't have an account? 
                    <Link to="/user-register" className="ms-1 fw-bold">
                      Register Here
                    </Link>
                  </p>
                  <hr className="my-3" />
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link to="/owner-login" className="text-warning text-decoration-none">
                      <i className="fas fa-home me-1"></i>
                      Owner Login
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
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserLogin;
