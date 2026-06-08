// Read environment variables from .env file if available
require('dotenv').config();

const logger = require('./logger');
const app = require('./app');

// Determine server port, defaulting to 8080 if not specified
const port = process.env.PORT || 8080;

// Start the server to listen for incoming connections
const server = app.listen(port, () => {
  logger.info(`Server successfully started on port ${port}`);
});

// Graceful shutdown handling for cloud environment signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed completely.');
  });
});