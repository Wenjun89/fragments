const http = require('http');
const app = require('./app');
const logger = require('pino')();

const port = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(port, () => {
  logger.info(`Server started on port ${port}`);
});