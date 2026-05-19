const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');

const app = express();

app.use(helmet());

app.use(cors());

app.use(passport.initialize());

app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 404,
      message: 'Not Found',
    },
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    status: 'error',
    error: {
      code: 500,
      message: err.message || 'Internal Server Error',
    },
  });
});

module.exports = app;
