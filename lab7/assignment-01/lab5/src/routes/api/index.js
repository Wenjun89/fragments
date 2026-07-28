const express = require('express');
const { Fragment } = require('../../model/fragment');
const { createResponse, createErrorResponse } = require('../../response');

const router = express.Router();

/**
 * Get a list of fragments for the current user
 */
router.get('/fragments', async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user, expand);
    res.status(200).json(
      createResponse({
        fragments,
      })
    );
  } catch (err) {
    console.error('Error getting fragments:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
    });
  }
});

/**
 * Get a specific fragment by ID
 */
router.get('/fragments/:id', async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    res.status(200).json(
      createResponse({
        fragment,
      })
    );
  } catch (err) {
    console.error('Error getting fragment by id:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
    });
  }
});

/**
 * Delete a specific fragment by ID
 */
router.delete('/fragments/:id', async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    await Fragment.delete(req.user, req.params.id);
    res.status(200).json(createResponse());
  } catch (err) {
    console.error('Error deleting fragment:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
    });
  }
});

/**
 * Create a new fragment
 */
router.post('/fragments', async (req, res) => {
  console.log('====== POST /fragments ROUTE REACHED ======');
  
  const type = req.get('Content-Type');
  console.log('Request Content-Type:', type);

  if (!Fragment.isSupportedType(type)) {
    return res.status(415).json(createErrorResponse(415, `Unsupported Content-Type: ${type}`));
  }

  try {
    let data;

    // 直接从 express.raw() 解析出的 req.body 中获取 Buffer 或字符串
    if (Buffer.isBuffer(req.body)) {
      data = req.body;
    } else if (typeof req.body === 'string') {
      data = Buffer.from(req.body);
    } else if (req.body) {
      data = Buffer.from(JSON.stringify(req.body));
    } else {
      data = Buffer.alloc(0);
    }

    console.log('--- FINAL DATA DEBUG ---');
    console.log('Is Buffer?', Buffer.isBuffer(data));
    console.log('Buffer length:', data.length);
    console.log('Buffer content:', data.toString());

    const fragment = new Fragment({ ownerId: req.user, type });
    await fragment.setData(data);
    await fragment.save();

    // 设置 Location 响应头供 Hurl 捕获
    res.setHeader('Location', `http://${req.headers.host}/v1/fragments/${fragment.id}`);
    
    res.status(201).json(
      createResponse({
        fragment,
      })
    );
  } catch (err) {
    console.error('Error creating fragment - Full Error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack,
    });
  }
});

module.exports = router;