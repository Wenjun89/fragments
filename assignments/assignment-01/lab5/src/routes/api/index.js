const express = require('express');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

const router = express.Router();

/**
 * GET /v1/fragments
 * Retrieves a list of fragments belonging to the authenticated user.
 */
router.get('/fragments', async (req, res) => {
  try {
    // 1. Verify user authentication
    if (!req.user) {
      return res.status(401).json(createErrorResponse(401, 'Unauthorized: User not authenticated'));
    }

    // 2. Handle optional expand query parameter
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user, expand);
    
    // 3. Return success response
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    console.error('Error retrieving fragments:', err);
    res.status(500).json(createErrorResponse(500, err.message || 'Unable to retrieve fragments'));
  }
});

/**
 * POST /v1/fragments
 * Creates a new fragment metadata instance and stores the associated binary data.
 */
router.post('/fragments', async (req, res) => {
  // 1. Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json(createErrorResponse(401, 'Unauthorized: User not authenticated'));
  }

  // 2. Validate the incoming Content-Type
  const type = req.get('Content-Type');
  if (!Fragment.isSupportedType(type)) {
    return res.status(415).json(createErrorResponse(415, `Unsupported Content-Type: ${type}`));
  }

  try {
    // 3. Initialize Fragment metadata
    const fragment = new Fragment({
      ownerId: req.user,
      type: type,
      size: req.body.length || 0,
    });

    // 4. Persist binary data and metadata
    // Note: Ensure express.raw() is configured in app.js/index.js
    await fragment.setData(req.body);

    // 5. Provide the location of the newly created resource
    const apiUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    res.setHeader('Location', `${apiUrl}/v1/fragments/${fragment.id}`);

    // 6. Respond with 201 Created and the metadata
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    console.error('SERVER ERROR:', err);
    res.status(500).json(createErrorResponse(500, err.message || 'Unable to create fragment'));
  }
});

module.exports = router;