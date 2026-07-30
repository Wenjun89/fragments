process.on('uncaughtException', (err) => {
  console.error('=== UNCAUGHT EXCEPTION ===', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('=== UNHANDLED REJECTION ===', reason);
  process.exit(1);
});

require('dotenv').config();

const logger = require('./logger');
const app = require('./app');

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  logger.info(`Server successfully started on port ${port}`);
});

setInterval(() => {

}, 1000);

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed completely.');
  });
});