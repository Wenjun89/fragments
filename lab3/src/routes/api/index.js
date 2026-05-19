const express = require('express');

const { authenticate } = require('../../auth');

const router = express.Router();

router.get('/fragments', authenticate(), require('./get'));

module.exports = router;