const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const logger = require('./logger'); 

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request intercepted');
  next();
});

app.use('/', require('./routes'));

app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 404,
      message: `Not Found: ${req.method} ${req.url}`,
    },
  });
});

app.use((err, req, res, next) => {
  console.error('==================== 捕获到 500 错误 ====================');
  console.error(err.stack || err);
  console.error('======================================================');

  logger.error({ err, method: req.method, url: req.url }, 'Global error handler caught an exception');

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: 'error',
    error: {
      code: status,
      message: message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    },
  });
});

module.exports = app;