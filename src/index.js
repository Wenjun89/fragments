require('dotenv').config();

const logger = require('./logger');
const server = require('./server');

const port = parseInt(process.env.PORT || '8080', 10);

server.listen(port, () => {
  
  logger.info(`Server started on port ${port}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, 'Unhandled Rejection at Promise');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught Exception thrown');
  process.exit(1);
});