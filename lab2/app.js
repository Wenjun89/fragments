const express = require('express');

const cors = require('cors');

const helmet = require('helmet');

const pino = require('pino-http');



const logger = require('./logger');

const routes = require('./routes');



const app = express();



app.use(pino({ logger }));



app.use(helmet({ contentSecurityPolicy: false }));



app.use(cors());



app.use(express.json());



app.get('/health', (req, res) => {

  res.status(200).json({

    status: 'ok',

    message: 'Fragments Backend is active and healthy',

  });

});



app.use('/', routes);



app.use((req, res) => {

  res.status(404).json({

    status: 'error',

    error: {

      message: 'The requested resource was not found',

      code: 404,

    },

  });

});



app.use((err, req, res, next) => {

  logger.error({ err }, 'Unexpected server error occurred');

  res.status(err.status || 500).json({

    status: 'error',

    error: {

      message: err.message || 'Internal Server Error',

      code: err.status || 500,

    },

  });

});



module.exports = app;