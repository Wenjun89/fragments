const express = require('express');
const path = require('path');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

const router = express.Router();

router.get('/fragments', async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user, expand);
    res.status(200).json(
      createSuccessResponse({
        fragments,
      })
    );
  } catch (err) {
    console.error('Error getting fragments:', err);
    res.status(500).json(createErrorResponse(500, err.message));
  }
});

router.get('/fragments/:id', async (req, res) => {
  try {
    const parsedId = path.parse(req.params.id);
    const id = parsedId.name;
    const ext = parsedId.ext;

    const fragment = await Fragment.byId(req.user, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    let data = await fragment.getData();

    if (ext) {
      const supportedExts = {
        '.html': 'text/html',
        '.htm': 'text/html',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.json': 'application/json',
      };

      const targetContentType = supportedExts[ext];
      if (!targetContentType || !fragment.formats.includes(targetContentType)) {
        return res.status(415).json(createErrorResponse(415, `Unsupported conversion format: ${ext}`));
      }

      if (fragment.type === 'text/markdown' && targetContentType === 'text/html') {
        const markdownIt = require('markdown-it')();
        data = markdownIt.render(data.toString());
        res.setHeader('Content-Type', 'text/html');
        return res.status(200).send(data);
      }

      res.setHeader('Content-Type', targetContentType);
      return res.status(200).send(data);
    }

    res.status(200).json(
      createSuccessResponse({
        fragment,
      })
    );
  } catch (err) {
    console.error('Error getting fragment by id:', err);
    if (err.message && err.message.includes('Fragment not found')) {
      return res.status(404).json(createErrorResponse(404, err.message));
    }
    res.status(500).json(createErrorResponse(500, err.message));
  }
});

router.delete('/fragments/:id', async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    await Fragment.delete(req.user, req.params.id);
    res.status(200).json(createSuccessResponse());
  } catch (err) {
    console.error('Error deleting fragment:', err);
    res.status(500).json(createErrorResponse(500, err.message));
  }
});

router.post('/fragments', async (req, res) => {
  console.log('====== POST /fragments ROUTE REACHED ======');
  
  const type = req.get('Content-Type');
  console.log('Request Content-Type:', type);

  if (!Fragment.isSupportedType(type)) {
    return res.status(415).json(createErrorResponse(415, `Unsupported Content-Type: ${type}`));
  }

  try {
    let data;

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

    if (type && type.includes('application/json')) {
      try {
        JSON.parse(data.toString());
      } catch (jsonErr) {
        return res.status(400).json(createErrorResponse(400, 'Invalid JSON format'));
      }
    }

    const fragment = new Fragment({ ownerId: req.user, type });
    await fragment.setData(data);
    await fragment.save(); 

    res.setHeader('Location', `http://${req.headers.host}/v1/fragments/${fragment.id}`);
    
    res.status(201).json(
      createSuccessResponse({
        fragment,
      })
    );
  } catch (err) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('ERROR IN POST /fragments:', err.message);
    console.error('STACK TRACE:', err.stack);
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    res.status(500).json(createErrorResponse(500, err.message));
  }
});

module.exports = router;