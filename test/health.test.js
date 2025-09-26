// test/health.test.js
const request = require('supertest');
const app = require('../app'); // path from test file to your app.js

describe('Health', () => {
  it('GET /health -> 200 & { ok: true }', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });
});