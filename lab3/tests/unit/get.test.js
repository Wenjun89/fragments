const request = require('supertest');
const app = require('../../src/app');

jest.mock('../../src/auth', () => ({
  authenticate: () => (req, res, next) => {

    req.user = { id: 'test-user1@fragments-testing.com' };
    next();
  }
}));

describe('GET /v1/fragments', () => {

  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });
});