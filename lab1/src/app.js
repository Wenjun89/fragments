const express = require('express');
const cors = require('cors');
const pino = require('pino-http')();

const app = express();

app.use(pino);

app.use(cors());

app.get('/', (req, res) => {

  res.setHeader('Cache-Control', 'no-cache');
  
  res.status(200).json({
    status: 'ok',
    author: 'Wenjun Wei',
    githubUrl: 'https://github.com/your-username/fragments',
    version: '1.0.0',
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      message: 'not found',
      code: 404,
    },
  });
});

module.exports = app;