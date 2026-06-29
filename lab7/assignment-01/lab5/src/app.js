const express = require('express');
const cors = require('cors');
const pino = require('pino-http');
const passport = require('passport');
const logger = require('./logger');

// Register Passport strategies for authentication
require('./auth');

const app = express();

// Use pino-http middleware for structured, production-ready request logging
app.use(pino({ logger }));

// Enable Cross-Origin Resource Sharing (CORS) for API accessibility
app.use(cors());

// Express middleware to parse incoming JSON payloads
app.use(express.json());

// Express middleware to parse raw binary data buffers
// We specify the 'type' to ensure it only intercepts relevant text-based content-types,
// preventing it from interfering with JSON parsing.
app.use(express.raw({
  limit: '10mb',
  type: ['text/plain', 'text/markdown', 'text/html']
}));

// Initialize Passport middleware for user authentication
app.use(passport.initialize());

// Route handling: delegate all requests to the modular routes index
app.use('/', require('./routes'));

// Catch-all route handler for 404 (Not Found) errors
app.use((req, res) => {
  const { createErrorResponse } = require('./response');
  res.status(404).json(createErrorResponse(404, 'Resource not found'));
});

// Global error handling middleware for 500 (Internal Server Error)
app.use((err, req, res, next) => {
  const { createErrorResponse } = require('./response');
  
  // Log the error for internal debugging
  console.error('====== INTERNAL SERVER ERROR ======', err);
  logger.error({ err }, 'An unhandled exception occurred');
  
  // Return a structured error response to the client
  res.status(err.status || 500).json(
    createErrorResponse(err.status || 500, err.message || 'Unable to handle request')
  );
});

module.exports = app;