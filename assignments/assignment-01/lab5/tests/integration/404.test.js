const request = require('supertest');
const app = require('../../src/app');

describe('API 404 Catch-All Handler', () => {
  test('should return a structured 404 error response for unrecognized routes', async () => {
    const res = await request(app).get('/an-invalid-route-that-does-not-exist');
    
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toContain('Resource not found');
  });
});