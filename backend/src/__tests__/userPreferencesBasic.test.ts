import { 
  PoliticalPerspective, 
  WritingTone, 
  Language, 
  AIModel, 
  PropagandaSensitivity 
} from '@ai-news-platform/shared';

describe('User Preferences Basic Validation', () => {
  describe('Enum Values', () => {
    it('should have all political perspectives', () => {
      const perspectives = Object.values(PoliticalPerspective);
      expect(perspectives).toContain('conservative');
      expect(perspectives).toContain('liberal');
      expect(perspectives).toContain('democratic');
      expect(perspectives).toContain('progressive');
      expect(perspectives).toContain('neutral');
    });

    it('should have all writing tones', () => {
      const tones = Object.values(WritingTone);
      expect(tones).toContain('formal');
      expect(tones).toContain('casual');
      expect(tones).toContain('analytical');
      expect(tones).toContain('conversational');
      expect(tones).toContain('professional');
    });

    it('should have all languages', () => {
      const languages = Object.values(Language);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
      expect(languages).toContain('de');
      expect(languages).toContain('it');
      expect(languages).toContain('pt');
    });

    it('should have all AI models', () => {
      const models = Object.values(AIModel);
      expect(models).toContain('openai');
      expect(models).toContain('anthropic');
      expect(models).toContain('google');
      expect(models).toContain('grok');
      expect(models).toContain('local');
    });

    it('should have all propaganda sensitivities', () => {
      const sensitivities = Object.values(PropagandaSensitivity);
      expect(sensitivities).toContain('low');
      expect(sensitivities).toContain('medium');
      expect(sensitivities).toContain('high');
    });
  });

  describe('Service and Repository Classes', () => {
    it('should be able to import UserPreferencesService', () => {
      const { UserPreferencesService } = require('../services/userPreferencesService');
      expect(UserPreferencesService).toBeDefined();
      expect(typeof UserPreferencesService).toBe('function');
    });

    it('should be able to import UserPreferencesRepository', () => {
      const { UserPreferencesRepository } = require('../repositories/userPreferencesRepository');
      expect(UserPreferencesRepository).toBeDefined();
      expect(typeof UserPreferencesRepository).toBe('function');
    });

    it('should be able to import PreferenceMigrationUtilities', () => {
      const { PreferenceMigrationUtilities } = require('../utils/preferenceMigrationUtilities');
      expect(PreferenceMigrationUtilities).toBeDefined();
      expect(typeof PreferenceMigrationUtilities).toBe('function');
    });

    it('should be able to import user preferences routes', () => {
      const userPreferencesRoutes = require('../routes/userPreferences');
      expect(userPreferencesRoutes).toBeDefined();
      expect(userPreferencesRoutes.default).toBeDefined();
    });
  });

  describe('Basic Service Validation', () => {
    it('should create service instance', () => {
      const { UserPreferencesService } = require('../services/userPreferencesService');
      const service = new UserPreferencesService();
      expect(service).toBeDefined();
      expect(typeof service.getUserPreferences).toBe('function');
      expect(typeof service.updateUserPreferences).toBe('function');
      expect(typeof service.storeSessionPreferences).toBe('function');
    });

    it('should validate invalid user ID', async () => {
      const { UserPreferencesService } = require('../services/userPreferencesService');
      const service = new UserPreferencesService();
      
      const result = await service.getUserPreferences('');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors[0]).toEqual({
        field: 'userId',
        message: 'Valid user ID is required'
      });
    });

    it('should validate invalid preference values', async () => {
      const { UserPreferencesService } = require('../services/userPreferencesService');
      const service = new UserPreferencesService();
      
      const result = await service.updateUserPreferences('550e8400-e29b-41d4-a716-446655440000', {
        perspective: 'invalid' as any,
        tone: 'invalid' as any
      });
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Session Preferences', () => {
    it('should store and retrieve session preferences', () => {
      const { UserPreferencesService } = require('../services/userPreferencesService');
      const service = new UserPreferencesService();
      
      const sessionId = 'test-session-123';
      const preferences = {
        perspective: PoliticalPerspective.LIBERAL,
        tone: WritingTone.CASUAL
      };

      service.storeSessionPreferences(sessionId, preferences);
      const stored = service.getSessionPreferences(sessionId);
      
      expect(stored).toMatchObject(preferences);
      expect(stored).toHaveProperty('timestamp');
    });

    it('should return null for non-existent session', () => {
      const { UserPreferencesService } = require('../services/userPreferencesService');
      const service = new UserPreferencesService();
      
      const result = service.getSessionPreferences('non-existent-session');
      expect(result).toBeNull();
    });
  });
});