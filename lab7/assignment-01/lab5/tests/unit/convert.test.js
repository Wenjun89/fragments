const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments/:id.:ext (Markdown to HTML)', () => {
  it('should convert markdown to html', async () => {
    // 1. Create a markdown fragment
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer mock-user-token-email-hash')
      .set('Content-Type', 'text/markdown')
      .send('# Hello World');

    const fragmentId = res.body.fragment.id;

    // 2. Request conversion to .html
    const htmlRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .set('Authorization', 'Bearer mock-user-token-email-hash');

    expect(htmlRes.status).toBe(200);
    expect(htmlRes.header['content-type']).toContain('text/html');
    expect(htmlRes.text).toBe('<h1>Hello World</h1>\n');
  });

  it('should return 415 if extension is not supported', async () => {
    // Create a markdown fragment
    const res = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Bearer mock-user-token-email-hash')
      .set('Content-Type', 'text/markdown')
      .send('# Hello World');

    const fragmentId = res.body.fragment.id;

    // Request an unsupported extension (e.g., .xml)
    const errorRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.xml`)
      .set('Authorization', 'Bearer mock-user-token-email-hash');
    
    expect(errorRes.status).toBe(415);
  });
});