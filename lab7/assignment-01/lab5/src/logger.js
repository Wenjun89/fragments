// Use pino for fast and structured logging
const pino = require('pino');

// Determine log level from environment variables, fallback to 'info'
const options = {
  level: process.env.LOG_LEVEL || 'info',
};

// If running in development mode, use pino-pretty for readable formatting
if (process.env.NODE_ENV !== 'production') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

// Create and export the pino logger instance
module.exports = pino(options);