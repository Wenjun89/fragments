const express = require('express');
const { version, author } = require('../../package.json');
const { createSuccessResponse } = require('../response');

const router = express.Router();

router.use('/v1', require('./api'));

router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  
  res.status(200).json(
    createSuccessResponse({
      author,
      version,
      githubUrl: 'https://github.com/Wenjun89/fragments', 
    })
  );
});

module.exports = router;