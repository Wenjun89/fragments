const express = require('express');
const markdown = require('markdown-it')();
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

const router = express.Router();

/**
 * GET /v1/fragments
 * Retrieves a list of fragments belonging to the authenticated user.
 */
router.get('/fragments', async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user, expand);
    res.status(200).json(createSuccessResponse({ fragments }));
  } catch (err) {
    console.error('Error retrieving fragments:', err);
    res.status(500).json(createErrorResponse(500, 'Unable to retrieve fragments'));
  }
});

/**
 * GET /v1/fragments/:id
 * Retrieves a specific fragment. Supports conversion via extension (e.g., .html).
 */
router.get('/fragments/:id', async (req, res) => {
  try {
    // Split the id and extension if present (e.g., 'abc.html' -> id='abc', ext='html')
    const [id, ext] = req.params.id.split('.');
    const fragment = await Fragment.byId(req.user, id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Explicitly handle unsupported extensions by returning 415
    if (ext && ext !== 'html') {
      return res.status(415).json(createErrorResponse(415, `Unsupported extension: ${ext}`));
    }

    const data = await fragment.getData();

    // Handle Markdown to HTML conversion
    if (ext === 'html' && fragment.type === 'text/markdown') {
      const html = markdown.render(data.toString());
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    // Default: return raw data
    res.setHeader('Content-Type', fragment.type);
    res.status(200).send(data);
  } catch (err) {
    console.error('Error retrieving fragment:', err);
    res.status(500).json(createErrorResponse(500, 'Unable to retrieve fragment'));
  }
});

/**
 * GET /v1/fragments/:id/info
 * Retrieves metadata for a specific fragment.
 */
router.get('/fragments/:id/info', async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    console.error('Error retrieving fragment info:', err);
    res.status(500).json(createErrorResponse(500, 'Unable to retrieve fragment info'));
  }
});

/**
 * POST /v1/fragments
 * Creates a new fragment and stores the binary data.
 */
router.post('/fragments', async (req, res) => {
  const type = req.get('Content-Type');

  if (!Fragment.isSupportedType(type)) {
    return res.status(415).json(createErrorResponse(415, `Unsupported Content-Type: ${type}`));
  }

  try {
    const data = Buffer.isBuffer(req.body) 
      ? req.body 
      : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    const fragment = new Fragment({
      ownerId: req.user,
      type: type,
      size: Buffer.byteLength(data),
    });

    await fragment.setData(data);

    const apiUrl = process.env.API_URL || `${req.protocol}://${req.headers.host}`;
    res.setHeader('Location', `${apiUrl}/v1/fragments/${fragment.id}`);
    res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    console.error('SERVER ERROR:', err);
    res.status(500).json(createErrorResponse(500, 'Unable to create fragment'));
  }
});

module.exports = router;