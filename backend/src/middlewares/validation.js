// middleware/validation.js
const { AppError } = require('../middlewares/errorHandler.js');

// Validate login request
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  if (!password || !password.trim()) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors
      }
    });
  }

  next();
};

// Validate travel listing
const validateTravelListing = (req, res, next) => {
  const {
    title,
    description,
    country,
    travelPeriod,
    price,
    dateInserted
  } = req.body;

  const errors = [];

  if (!title || !title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!description || !description.trim()) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  if (!country || !country.trim()) {
    errors.push({ field: 'country', message: 'Country is required' });
  }

  if (!travelPeriod || travelPeriod <= 0) {
    errors.push({ field: 'travelPeriod', message: 'Travel period must be a positive number' });
  }

  if (!price || price <= 0) {
    errors.push({ field: 'price', message: 'Price must be a positive number' });
  }
  if (!dateInserted || isNaN(Date.parse(dateInserted))) {
    errors.push({ field: 'dateInserted', message: 'Valid dateInserted is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors
      }
    });
  }

  next();
};

// Validate itinerary
const validateItinerary = (req, res, next) => {
  const { day, activity } = req.body;
  const errors = [];

  if (!day || day <= 0) {
    errors.push({ field: 'day', message: 'Day must be a positive number' });
  }

  if (!activity || !Array.isArray(activity) || activity.length === 0) {
    errors.push({ field: 'activity', message: 'At least one activity is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors
      }
    });
  }

  next();
};

// Validate UUID
const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(uuid)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_UUID',
          message: `Invalid ${paramName} format`
        }
      });
    }

    next();
  };
};

// Validate integer ID
const validateIntID = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^\d+$/.test(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: `Invalid ${paramName} format. Must be a positive integer.`
        }
      });
    }
    
    // Convert to number
    req.params[paramName] = parseInt(id);
    next();
  };
};


module.exports = {
  validateLogin,
  validateTravelListing,
  validateItinerary,
  validateUUID,
  validateIntID
};