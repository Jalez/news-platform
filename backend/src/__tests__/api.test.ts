import request from 'supertest';
import app from '../index';

describe('API Server', () => {
  describe('Health Check Endpoints', () => {
    it('should return health status on /api/v1/health', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });

    it('should redirect legacy health endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(302);

      expect(response.headers.location).toBe('/api/v1/health');
    });
  });

  describe('API v1 Endpoints', () => {
    it('should return API information on /api/v1', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'AI News Platform API v1');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'active');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'API endpoint not found');
    });

    it('should return 404 for undefined API routes', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Security Middleware', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      // Helmet adds various security headers
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
    });

    it('should handle CORS', async () => {
      const response = await request(app)
        .options('/api/v1/health')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});