const { expect } = require('chai'); 
const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('should return 200 OK and valid JSON data', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).to.equal(200); 
    expect(res.body.status).to.equal('ok');
    expect(res.body.author).to.equal('Wenjun Wei');
  });
});