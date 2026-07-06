const request = require('supertest');
const app = require('../../src/app');

describe('POST /fragments', () => {
  it('should return 401 if user is not authenticated', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('test data');
    
    expect(res.status).toBe(401);
  });

  it('should create a valid text/plain fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test-user-token') 
      .set('Content-Type', 'text/plain')
      .send('hello world');
    
    expect(res.status).toBe(201);
    expect(res.header.location).toBeDefined();
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
  });

  it('should create a valid application/json fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test-user-token')
      .set('Content-Type', 'application/json')
      .send({ message: 'hello json' });
    
    expect(res.status).toBe(201);
    expect(res.body.fragment.type).toBe('application/json');
  });

  it('should return 415 for unsupported media type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer test-user-token')
      .set('Content-Type', 'image/png')
      .send('fake image data');
    
    expect(res.status).toBe(415);
  });
});