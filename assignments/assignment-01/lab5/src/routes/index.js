const express = require('express');

// Create a router for top-level routes
const router = express.Router();

// Present our API version and author on the root courtesy of package.json
const { version, author } = require('../../package.json');

// Import authentication middleware
const authenticate = require('../auth/auth-middleware');

/**
 * Expose all internal api routes under the /v1/ prefix.
 * Secure this entire subdomain using our passport authentication middleware.
 */
router.use('/v1', authenticate('bearer'), require('./api'));

/**
 * Health Check Endpoint
 * Defines the public root path to ensure the container or server is up and responsive.
 */
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author: author || 'Wenjun Wei',
    version,
  });
});

module.exports = router;