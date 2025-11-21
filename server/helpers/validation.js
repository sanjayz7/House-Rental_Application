const logger = require('./logger');

// Sanitize string input
const sanitizeString = (str) => {
  if (!str) return '';
  return str
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000);
};

// Validate email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number
const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Validate price
const validatePrice = (price) => {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0;
};

// Validate bedrooms/bathrooms
const validateNumber = (num, min = 1, max = 100) => {
  const parsed = parseInt(num);
  return !isNaN(parsed) && parsed >= min && parsed <= max;
};

// Validate location coordinates
const validateCoordinates = (lat, lng) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// Validate MongoDB ObjectId
const validateObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Custom validation error
class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ValidationError';
  }
}

// Validate listing data
const validateListingData = (data) => {
  const errors = [];

  if (!data.title || !sanitizeString(data.title)) {
    errors.push('Title is required');
  } else if (data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!data.location || !sanitizeString(data.location)) {
    errors.push('Location is required');
  }

  if (!validatePrice(data.price)) {
    errors.push('Valid price is required');
  }

  if (!validateNumber(data.bedrooms, 1, 10)) {
    errors.push('Bedrooms must be between 1 and 10');
  }

  if (!validateNumber(data.bathrooms, 1, 10)) {
    errors.push('Bathrooms must be between 1 and 10');
  }

  if (!validateNumber(data.area, 100, 100000)) {
    errors.push('Area must be between 100 and 100000 sqft');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return true;
};

// Validate user registration data
const validateRegisterData = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!data.name || !sanitizeString(data.name)) {
    errors.push('Name is required');
  }

  if (!data.role || !['user', 'owner', 'admin'].includes(data.role)) {
    errors.push('Valid role is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return true;
};

// Validate login data
const validateLoginData = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.password || data.password.length < 6) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return true;
};

// Validate rating data
const validateRatingData = (data) => {
  const errors = [];

  if (!validateObjectId(data.listingId)) {
    errors.push('Valid listing ID is required');
  }

  if (!validateNumber(data.rating, 1, 5)) {
    errors.push('Rating must be between 1 and 5');
  }

  if (data.comment && data.comment.length > 500) {
    errors.push('Comment must be less than 500 characters');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  return true;
};

module.exports = {
  sanitizeString,
  validateEmail,
  validatePhone,
  validatePrice,
  validateNumber,
  validateCoordinates,
  validateObjectId,
  ValidationError,
  validateListingData,
  validateRegisterData,
  validateLoginData,
  validateRatingData,
};
