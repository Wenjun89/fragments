const request = require('supertest');
const app = require('../../src/app');

describe('Authenticated Fragments API Routes Integration', () => {
  // A mock email hash token that our custom passport-bearer middleware expects
  const mockToken = 'mock-user-token-email-hash';
  const validTokenHeader = `Bearer ${mockToken}`;

  describe('GET /v1/fragments', () => {
    test('should reject unauthorized cross-origin requests with 401', async () => {
      const res = await request(app).get('/v1/fragments');
      expect(res.statusCode).toBe(401);
    });

    test('should allow authorized users to safely retrieve their blank fragment array', async () => {
      const res = await request(app)
        .get('/v1/fragments')
        .set('Authorization', validTokenHeader);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(Array.isArray(res.body.fragments)).toBe(true);
    });
  });

  describe('POST /v1/fragments', () => {
    test('should block fragment creation if Authorization header is missing', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .send('Hello Integration Test');

      expect(res.statusCode).toBe(401);
    });

    test('should successfully ingest raw text data and yield 201 Created metadata', async () => {
      const textPayload = 'Seneca Cloud Computing Assignment 1 - Integration Success';
      
      const res = await request(app)
        .post('/v1/fragments')
        .set('Authorization', validTokenHeader)
        .set('Content-Type', 'text/plain')
        .send(textPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('ok');
      expect(res.body.fragment).toBeDefined();
      expect(res.body.fragment.type).toBe('text/plain');
      expect(res.body.fragment.size).toBe(Buffer.byteLength(textPayload));
      expect(res.headers.location).toContain(`/v1/fragments/${res.body.fragment.id}`);
    });

    test('should fail with 415 error status code if incoming content type format is invalid', async () => {
      const res = await request(app)
        .post('/v1/fragments')
        .set('Authorization', validTokenHeader)
        .set('Content-Type', 'application/unsupported-format-type')
        .send('Invalid Data');

      expect(res.statusCode).toBe(415);
      expect(res.body.status).toBe('error');
    });
  });
});