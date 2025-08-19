import request from 'supertest';
import app from '../index';
import { 
  PoliticalPerspective, 
  WritingTone, 
  Language 
} from '@ai-news-platform/shared';

describe('User Preferences API Integration', () => {
  describe('API Routes Validation', () => {
    it('should validate invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid-uuid/preferences');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate perspective update payload', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/perspective`)
        .send({ perspective: 'invalid-perspective' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate tone update payload', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/tone`)
        .send({ tone: 'invalid-tone' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate language update payload', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/language`)
        .send({ language: 'invalid-language' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should accept valid preference values in validation', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      // Test valid perspective
      const perspectiveResponse = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/perspective`)
        .send({ perspective: PoliticalPerspective.CONSERVATIVE });
      
      // Should not fail due to validation (may fail due to missing user, but validation should pass)
      expect(perspectiveResponse.status).not.toBe(400);
      
      // Test valid tone
      const toneResponse = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/tone`)
        .send({ tone: WritingTone.FORMAL });
      
      expect(toneResponse.status).not.toBe(400);
      
      // Test valid language
      const languageResponse = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/language`)
        .send({ language: Language.ES });
      
      expect(languageResponse.status).not.toBe(400);
    });

    it('should validate content filters array fields', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/filters`)
        .send({ 
          includedTopics: 'not-an-array',
          excludedPeople: ['valid', 123] // invalid array item
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should accept valid content filters', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/filters`)
        .send({ 
          includedTopics: ['politics', 'technology'],
          excludedTopics: ['sports'],
          includedPeople: ['John Doe'],
          excludedPeople: ['Jane Smith'],
          includedOrganizations: ['NASA'],
          excludedOrganizations: ['Example Corp']
        });
      
      // Should not fail due to validation (may fail due to missing user, but validation should pass)
      expect(response.status).not.toBe(400);
    });

    it('should require session ID for session preferences', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .post(`/api/v1/users/${validUserId}/preferences/session`)
        .send({ perspective: PoliticalPerspective.LIBERAL });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Session ID required');
    });

    it('should accept session preferences with session ID', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .post(`/api/v1/users/${validUserId}/preferences/session`)
        .set('Session-ID', 'test-session-123')
        .send({ perspective: PoliticalPerspective.LIBERAL });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stored).toBe(true);
    });
  });

  describe('Route Structure', () => {
    it('should have all required preference routes', async () => {
      const validUserId = '550e8400-e29b-41d4-a716-446655440000';
      
      // Test GET preferences
      const getResponse = await request(app)
        .get(`/api/v1/users/${validUserId}/preferences`);
      expect(getResponse.status).not.toBe(404);
      
      // Test PUT preferences
      const putResponse = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences`)
        .send({});
      expect(putResponse.status).not.toBe(404);
      
      // Test DELETE preferences
      const deleteResponse = await request(app)
        .delete(`/api/v1/users/${validUserId}/preferences`);
      expect(deleteResponse.status).not.toBe(404);
      
      // Test PUT filters
      const filtersResponse = await request(app)
        .put(`/api/v1/users/${validUserId}/preferences/filters`)
        .send({});
      expect(filtersResponse.status).not.toBe(404);
    });
  });
});