import React from 'react';
import { Modal, Card, Button, Badge, Form } from 'react-bootstrap';
import { theme } from '../config/theme';

/**
 * Modular Property Inquiry Modal Component
 * Reusable component for sending property inquiries
 */
const PropertyInquiryModal = ({
  show,
  onHide,
  property,
  owner,
  user,
  requestMessage,
  onMessageChange,
  onSubmit,
  loading = false
}) => {
  if (!property) return null;

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      centered
      className="property-inquiry-modal"
    >
      <Modal.Header 
        closeButton 
        className="text-white"
        style={{
          background: theme.primary.gradient,
          borderBottom: 'none',
          padding: '1.5rem'
        }}
      >
        <Modal.Title className="d-flex align-items-center">
          <div 
            className="me-3 d-flex align-items-center justify-content-center"
            style={{
              width: '45px',
              height: '45px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: theme.borderRadius.round,
              backdropFilter: 'blur(10px)'
            }}
          >
            <i className="fas fa-paper-plane" style={{ fontSize: '1.2rem' }}></i>
          </div>
          <div>
            <h4 className="mb-0">Send Property Inquiry</h4>
            <small className="opacity-75">Connect with the property owner</small>
          </div>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ padding: '2rem' }}>
        {/* Property Details Card */}
        <div className="mb-4">
          <h6 className="mb-3 fw-bold" style={{ color: theme.primary.main }}>
            <i className="fas fa-home me-2"></i>Property Details
          </h6>
          <Card 
            className="border-0 shadow-sm"
            style={{
              background: theme.background.gradient,
              borderRadius: theme.borderRadius.md
            }}
          >
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h5 className="mb-2 fw-bold text-dark">
                    {property.title || property.TITLE}
                  </h5>
                  <p className="text-muted mb-2">
                    <i className="fas fa-map-marker-alt me-2" style={{ color: theme.primary.main }}></i>
                    {property.locationText || property.ADDRESS || 'Address not available'}
                  </p>
                  <div className="d-flex align-items-center gap-3">
                    <span className="fw-bold" style={{ fontSize: '1.2rem', color: theme.primary.main }}>
                      ₹{(property.price || property.PRICE || 0).toLocaleString()}/month
                    </span>
                  </div>
                </div>
                <div>
                  <Badge 
                    bg="success" 
                    className="px-3 py-2"
                    style={{ fontSize: '0.9rem', borderRadius: theme.borderRadius.xl }}
                  >
                    <i className="fas fa-check-circle me-1"></i>Available
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        
        {/* Owner Information Card */}
        <div className="mb-4">
          <h6 className="mb-3 fw-bold" style={{ color: theme.primary.main }}>
            <i className="fas fa-user-tie me-2"></i>Owner Information
          </h6>
          <Card className="border-0 shadow-sm" style={{ borderRadius: theme.borderRadius.md }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div 
                  className="me-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    background: theme.primary.gradient,
                    borderRadius: theme.borderRadius.round,
                    color: 'white',
                    fontSize: '1.8rem'
                  }}
                >
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-1 fw-bold">
                    {owner?.name || property.ownerEmail || 'Property Owner'}
                  </h6>
                  <p className="text-muted mb-2 small">
                    <i className="fas fa-envelope me-1"></i>
                    {owner?.email || property.ownerEmail || 'owner@example.com'}
                  </p>
                  {owner?.verified && (
                    <Badge 
                      bg="success" 
                      className="px-2 py-1"
                      style={{ fontSize: '0.75rem', borderRadius: '15px' }}
                    >
                      <i className="fas fa-shield-check me-1"></i>
                      Verified Owner
                    </Badge>
                  )}
                </div>
              </div>
              <div 
                className="mt-3 p-3 rounded"
                style={{ 
                  background: `linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)`,
                  borderLeft: `3px solid ${theme.primary.main}`
                }}
              >
                <p className="mb-0 small text-muted">
                  <i className="fas fa-info-circle me-2" style={{ color: theme.info.main }}></i>
                  Your inquiry will be sent directly to <strong>{owner?.name || 'the property owner'}</strong>. 
                  They will contact you with more details and schedule a viewing if you're both interested.
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
        
        {/* Message Form */}
        <Form>
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold mb-2 d-flex align-items-center">
              <i className="fas fa-comment-alt me-2" style={{ color: theme.primary.main }}></i>
              Your Message to the Owner
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              value={requestMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={`Hi ${owner?.name || 'there'},\n\nI'm interested in your property "${property.title || property.TITLE}" listed at ₹${(property.price || property.PRICE || 0).toLocaleString()}/month.\n\nCould you please provide more information about:\n- Available move-in dates\n- Lease terms and conditions\n- Security deposit requirements\n- Any additional amenities or features\n\nI would also like to schedule a viewing at your convenience.\n\nThank you!`}
              style={{
                borderRadius: theme.borderRadius.md,
                border: `2px solid ${theme.neutral.gray}`,
                fontSize: '0.95rem',
                transition: theme.transitions.normal
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.primary.main;
                e.target.style.boxShadow = `0 0 0 0.2rem rgba(102, 126, 234, 0.15)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.neutral.gray;
                e.target.style.boxShadow = 'none';
              }}
            />
            <Form.Text className="text-muted mt-2 d-block">
              <i className="fas fa-lightbulb me-1" style={{ color: theme.warning.main }}></i>
              Be specific about your requirements and questions to get a better response.
            </Form.Text>
          </Form.Group>
          
          {/* Contact Information Card */}
          {user && (
            <Card 
              className="border-0 mb-3"
              style={{
                background: theme.background.gradient,
                borderRadius: theme.borderRadius.md,
                border: `2px solid ${theme.neutral.gray}`
              }}
            >
              <Card.Body className="p-3">
                <h6 className="mb-3 fw-bold d-flex align-items-center">
                  <i className="fas fa-id-card me-2" style={{ color: theme.primary.main }}></i>
                  Your Contact Information
                </h6>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <small className="text-muted d-block">Name</small>
                    <strong>{user.name}</strong>
                  </div>
                  <div className="col-md-6 mb-2">
                    <small className="text-muted d-block">Email</small>
                    <strong>{user.email}</strong>
                  </div>
                </div>
                <small className="text-muted mt-2 d-block">
                  <i className="fas fa-lock me-1"></i>
                  This information will be shared with the property owner.
                </small>
              </Card.Body>
            </Card>
          )}
        </Form>
      </Modal.Body>
      
      <Modal.Footer 
        className="border-top-0"
        style={{ 
          padding: '1.5rem 2rem',
          background: theme.background.secondary
        }}
      >
        <Button 
          variant="outline-secondary" 
          onClick={onHide}
          style={{
            borderRadius: theme.borderRadius.sm,
            padding: '0.6rem 1.5rem',
            fontWeight: '600'
          }}
        >
          <i className="fas fa-times me-2"></i>Cancel
        </Button>
        <Button 
          variant="success" 
          onClick={onSubmit}
          disabled={loading || !requestMessage?.trim()}
          className="send-inquiry-btn"
          style={{
            borderRadius: theme.borderRadius.sm,
            padding: '0.6rem 2rem',
            fontWeight: '600',
            background: theme.success.gradient,
            border: 'none',
            boxShadow: theme.shadows.md,
            transition: theme.transitions.normal
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Sending...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i>
              Send to {owner?.name || 'Owner'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PropertyInquiryModal;

