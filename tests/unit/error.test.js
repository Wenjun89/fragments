const request = require('supertest');
const app = require('../../src/app');

test('should return 404 for unknown routes', async () => {
  const res = await request(app).get('/this-path-does-not-exist');
  expect(res.statusCode).toBe(404);
});