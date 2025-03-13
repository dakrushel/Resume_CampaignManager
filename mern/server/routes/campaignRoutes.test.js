import request from 'supertest';
import app from './server.js';

describe('GET /api/campaigns', () => {
  it('should return a list of campaigns', async () => {
    const response = await request(app).get('/api/campaigns');
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});