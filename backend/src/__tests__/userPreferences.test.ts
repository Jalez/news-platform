import { UserPreferencesService } from '../services/userPreferencesService';
import { 
  PoliticalPerspective, 
  WritingTone, 
  Language, 
  AIModel, 
  PropagandaSensitivity 
} from '@ai-news-platform/shared';
import { v4 as uuidv4 } from 'uuid';

// Mock the database dependencies
jest.mock('../config/database', () => ({
  query: jest.fn(),
  transaction: jest.fn()
}));

// Mock the repository
jest.mock('../repositories/userPreferencesRepository', () => ({
  userPreferencesRepository: {
    getUserPreferences: jest.fn(),
    getUserContentFilters: jest.fn(),
    getCompleteUserPreferences: jest.fn(),
    createUserPreferences: jest.fn(),
    createUserContentFilters: jest.fn(),
    createCompleteUserPreferences: jest.fn(),
    updateUserPreferences: jest.fn(),
    updateUserContentFilters: jest.fn(),
    updateUserPerspective: jest.fn(),
    updateUserTone: jest.fn(),
    updateUserLanguage: jest.fn(),
    updateUserAIModel: jest.fn(),
    deleteUserPreferences: jest.fn(),
    hasUserPreferences: jest.fn(),
    getUsersByPreference: jest.fn(),
    bulkUpdatePreferences: jest.fn()
  },
  UserPreferencesRepository: jest.fn()
}));

describe('UserPreferencesRepository', () => {
  let mockQuery: jest.Mock;
  let mockTransaction: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = require('../config/database').query;
    mockTransaction = require('../config/database').transaction;
  });

  describe('getUserPreferences', () => {
    it('should return user preferences when found', async () => {
      const userId = uuidv4();
      const mockPreferences = {
        id: uuidv4(),
        user_id: userId,
        perspective: PoliticalPerspective.NEUTRAL,
        tone: WritingTone.PROFESSIONAL,
        language: Language.EN,
        ai_model: AIModel.OPENAI,
        fact_checking_enabled: true,
        propaganda_detection_enabled: true,
        propaganda_sensitivity: PropagandaSensitivity.MEDIUM,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValue({ rows: [mockPreferences] });

      const result = await repository.getUserPreferences(userId);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      );
      expect(result).toEqual(mockPreferences);
    });

    it('should return null when user preferences not found', async () => {
      const userId = uuidv4();
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await repository.getUserPreferences(userId);

      expect(result).toBeNull();
    });
  });

  describe('createUserPreferences', () => {
    it('should create user preferences with default values', async () => {
      const userId = uuidv4();
      const mockCreatedPreferences = {
        id: expect.any(String),
        user_id: userId,
        perspective: PoliticalPerspective.NEUTRAL,
        tone: WritingTone.PROFESSIONAL,
        language: Language.EN,
        ai_model: AIModel.OPENAI,
        fact_checking_enabled: true,
        propaganda_detection_enabled: true,
        propaganda_sensitivity: PropagandaSensitivity.MEDIUM,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValue({ rows: [mockCreatedPreferences] });

      const result = await repository.createUserPreferences({ user_id: userId });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences'),
        expect.arrayContaining([
          expect.any(String), // UUID
          userId,
          PoliticalPerspective.NEUTRAL,
          WritingTone.PROFESSIONAL,
          Language.EN,
          AIModel.OPENAI,
          true,
          true,
          PropagandaSensitivity.MEDIUM
        ])
      );
      expect(result).toEqual(mockCreatedPreferences);
    });

    it('should create user preferences with custom values', async () => {
      const userId = uuidv4();
      const customInput = {
        user_id: userId,
        perspective: PoliticalPerspective.CONSERVATIVE,
        tone: WritingTone.FORMAL,
        language: Language.ES,
        ai_model: AIModel.ANTHROPIC,
        fact_checking_enabled: false,
        propaganda_detection_enabled: false,
        propaganda_sensitivity: PropagandaSensitivity.LOW
      };

      const mockCreatedPreferences = {
        id: expect.any(String),
        ...customInput,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValue({ rows: [mockCreatedPreferences] });

      const result = await repository.createUserPreferences(customInput);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences'),
        expect.arrayContaining([
          expect.any(String), // UUID
          userId,
          PoliticalPerspective.CONSERVATIVE,
          WritingTone.FORMAL,
          Language.ES,
          AIModel.ANTHROPIC,
          false,
          false,
          PropagandaSensitivity.LOW
        ])
      );
      expect(result).toEqual(mockCreatedPreferences);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences with provided fields', async () => {
      const userId = uuidv4();
      const updates = {
        perspective: PoliticalPerspective.LIBERAL,
        tone: WritingTone.CASUAL
      };

      const mockUpdatedPreferences = {
        id: uuidv4(),
        user_id: userId,
        perspective: PoliticalPerspective.LIBERAL,
        tone: WritingTone.CASUAL,
        language: Language.EN,
        ai_model: AIModel.OPENAI,
        fact_checking_enabled: true,
        propaganda_detection_enabled: true,
        propaganda_sensitivity: PropagandaSensitivity.MEDIUM,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockQuery.mockResolvedValue({ rows: [mockUpdatedPreferences] });

      const result = await repository.updateUserPreferences(userId, updates);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_preferences'),
        expect.arrayContaining([
          PoliticalPerspective.LIBERAL,
          WritingTone.CASUAL,
          userId
        ])
      );
      expect(result).toEqual(mockUpdatedPreferences);
    });

    it('should return current preferences when no fields to update', async () => {
      const userId = uuidv4();
      const mockPreferences = {
        id: uuidv4(),
        user_id: userId,
        perspective: PoliticalPerspective.NEUTRAL,
        tone: WritingTone.PROFESSIONAL,
        language: Language.EN,
        ai_model: AIModel.OPENAI,
        fact_checking_enabled: true,
        propaganda_detection_enabled: true,
        propaganda_sensitivity: PropagandaSensitivity.MEDIUM,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock the getUserPreferences call that happens when no updates
      mockQuery.mockResolvedValue({ rows: [mockPreferences] });

      const result = await repository.updateUserPreferences(userId, {});

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      );
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('createCompleteUserPreferences', () => {
    it('should create both preferences and content filters in transaction', async () => {
      const userId = uuidv4();
      const mockPreferences = {
        id: uuidv4(),
        user_id: userId,
        perspective: PoliticalPerspective.NEUTRAL,
        tone: WritingTone.PROFESSIONAL,
        language: Language.EN,
        ai_model: AIModel.OPENAI,
        fact_checking_enabled: true,
        propaganda_detection_enabled: true,
        propaganda_sensitivity: PropagandaSensitivity.MEDIUM,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockContentFilters = {
        id: uuidv4(),
        user_id: userId,
        included_topics: [],
        excluded_topics: [],
        included_people: [],
        excluded_people: [],
        included_organizations: [],
        excluded_organizations: [],
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [mockPreferences] })
          .mockResolvedValueOnce({ rows: [mockContentFilters] })
      };

      mockTransaction.mockImplementation(async (callback) => {
        return callback(mockClient);
      });

      const result = await repository.createCompleteUserPreferences(userId);

      expect(mockTransaction).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        preferences: mockPreferences,
        contentFilters: mockContentFilters
      });
    });
  });

  describe('hasUserPreferences', () => {
    it('should return true when user has preferences', async () => {
      const userId = uuidv4();
      mockQuery.mockResolvedValue({ rows: [{ exists: true }] });

      const result = await repository.hasUserPreferences(userId);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT EXISTS(SELECT 1 FROM user_preferences WHERE user_id = $1)',
        [userId]
      );
      expect(result).toBe(true);
    });

    it('should return false when user has no preferences', async () => {
      const userId = uuidv4();
      mockQuery.mockResolvedValue({ rows: [{ exists: false }] });

      const result = await repository.hasUserPreferences(userId);

      expect(result).toBe(false);
    });
  });
});

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let mockRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserPreferencesService();
    mockRepository = require('../repositories/userPreferencesRepository').userPreferencesRepository;
  });

  describe('validation', () => {
    it('should validate perspective values', async () => {
      const userId = uuidv4();
      const invalidUpdates = { perspective: 'invalid' as any };

      const result = await service.updateUserPreferences(userId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'perspective',
        message: 'Invalid political perspective',
        value: 'invalid'
      });
    });

    it('should validate tone values', async () => {
      const userId = uuidv4();
      const invalidUpdates = { tone: 'invalid' as any };

      const result = await service.updateUserPreferences(userId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'tone',
        message: 'Invalid writing tone',
        value: 'invalid'
      });
    });

    it('should validate language values', async () => {
      const userId = uuidv4();
      const invalidUpdates = { language: 'invalid' as any };

      const result = await service.updateUserPreferences(userId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'language',
        message: 'Invalid language',
        value: 'invalid'
      });
    });

    it('should validate AI model values', async () => {
      const userId = uuidv4();
      const invalidUpdates = { ai_model: 'invalid' as any };

      const result = await service.updateUserPreferences(userId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'ai_model',
        message: 'Invalid AI model',
        value: 'invalid'
      });
    });

    it('should validate boolean fields', async () => {
      const userId = uuidv4();
      const invalidUpdates = { 
        fact_checking_enabled: 'not_boolean' as any,
        propaganda_detection_enabled: 123 as any
      };

      const result = await service.updateUserPreferences(userId, invalidUpdates);

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'fact_checking_enabled',
        message: 'fact_checking_enabled must be a boolean',
        value: 'not_boolean'
      });
      expect(result.errors).toContainEqual({
        field: 'propaganda_detection_enabled',
        message: 'propaganda_detection_enabled must be a boolean',
        value: 123
      });
    });

    it('should validate user ID', async () => {
      const result = await service.getUserPreferences('');

      expect(result.success).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'userId',
        message: 'Valid user ID is required'
      });
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences in API format', async () => {
      const userId = uuidv4();
      const mockPreferences = {
        id: uuidv4(),
        user_id: userId,
        perspective: PoliticalPerspective.NEUTRAL,
        tone: WritingTone.PROFESSIONAL,
        language: Language.EN,
        ai_model: AIModel.OPENAI,
        fact_checking_enabled: true,
        propaganda_detection_enabled: true,
        propaganda_sensitivity: PropagandaSensitivity.MEDIUM,
        created_at: new Date(),
        updated_at: new Date()
      };

      const mockContentFilters = {
        id: uuidv4(),
        user_id: userId,
        included_topics: ['politics'],
        excluded_topics: ['sports'],
        included_people: ['John Doe'],
        excluded_people: ['Jane Smith'],
        included_organizations: ['NASA'],
        excluded_organizations: ['Example Corp'],
        created_at: new Date(),
        updated_at: new Date()
      };

      mockRepository.getCompleteUserPreferences.mockResolvedValue({
        preferences: mockPreferences,
        contentFilters: mockContentFilters
      });

      const result = await service.getUserPreferences(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        perspective: PoliticalPerspective.NEUTRAL,
        tone: WritingTone.PROFESSIONAL,
        language: Language.EN,
        aiModel: AIModel.OPENAI,
        factCheckingEnabled: true,
        propagandaDetectionEnabled: true,
        propagandaSensitivity: PropagandaSensitivity.MEDIUM,
        contentFilters: {
          includedTopics: ['politics'],
          excludedTopics: ['sports'],
          includedPeople: ['John Doe'],
          excludedPeople: ['Jane Smith'],
          includedOrganizations: ['NASA'],
          excludedOrganizations: ['Example Corp']
        }
      });
    });

    it('should return success with undefined data when no preferences found', async () => {
      const userId = uuidv4();
      mockRepository.getCompleteUserPreferences.mockResolvedValue({
        preferences: null,
        contentFilters: null
      });

      const result = await service.getUserPreferences(userId);

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.message).toBe('No preferences found for user');
    });
  });

  describe('session-based preferences', () => {
    it('should store session preferences', () => {
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
      const result = service.getSessionPreferences('non-existent-session');
      expect(result).toBeNull();
    });

    it('should expire old session preferences', () => {
      const sessionId = 'test-session-expired';
      const preferences = { perspective: PoliticalPerspective.LIBERAL };

      // Store preferences
      service.storeSessionPreferences(sessionId, preferences);

      // Mock old timestamp (more than 1 hour ago)
      const sessionStore = (service as any).sessionStore;
      const stored = sessionStore.get(sessionId);
      stored.timestamp = Date.now() - (61 * 60 * 1000); // 61 minutes ago
      sessionStore.set(sessionId, stored);

      const result = service.getSessionPreferences(sessionId);
      expect(result).toBeNull();
    });
  });

  describe('getOrCreateUserPreferences', () => {
    it('should return existing preferences if they exist', async () => {
      const userId = uuidv4();
      const existingPreferences = {
        perspective: PoliticalPerspective.CONSERVATIVE,
        tone: WritingTone.FORMAL,
        language: Language.ES,
        aiModel: AIModel.ANTHROPIC,
        factCheckingEnabled: true,
        propagandaDetectionEnabled: true,
        propagandaSensitivity: PropagandaSensitivity.HIGH,
        contentFilters: {
          includedTopics: [],
          excludedTopics: [],
          includedPeople: [],
          excludedPeople: [],
          includedOrganizations: [],
          excludedOrganizations: []
        }
      };

      mockRepository.getCompleteUserPreferences.mockResolvedValue({
        preferences: {
          id: uuidv4(),
          user_id: userId,
          perspective: PoliticalPerspective.CONSERVATIVE,
          tone: WritingTone.FORMAL,
          language: Language.ES,
          ai_model: AIModel.ANTHROPIC,
          fact_checking_enabled: true,
          propaganda_detection_enabled: true,
          propaganda_sensitivity: PropagandaSensitivity.HIGH,
          created_at: new Date(),
          updated_at: new Date()
        },
        contentFilters: {
          id: uuidv4(),
          user_id: userId,
          included_topics: [],
          excluded_topics: [],
          included_people: [],
          excluded_people: [],
          included_organizations: [],
          excluded_organizations: [],
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const result = await service.getOrCreateUserPreferences(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(existingPreferences);
      expect(mockRepository.getCompleteUserPreferences).toHaveBeenCalledWith(userId);
    });

    it('should create default preferences if none exist', async () => {
      const userId = uuidv4();
      
      // First call returns no preferences
      mockRepository.getCompleteUserPreferences.mockResolvedValue({
        preferences: null,
        contentFilters: null
      });

      // Second call (after creation) returns created preferences
      mockRepository.hasUserPreferences.mockResolvedValue(false);
      mockRepository.createCompleteUserPreferences.mockResolvedValue({
        preferences: {
          id: uuidv4(),
          user_id: userId,
          perspective: PoliticalPerspective.NEUTRAL,
          tone: WritingTone.PROFESSIONAL,
          language: Language.EN,
          ai_model: AIModel.OPENAI,
          fact_checking_enabled: true,
          propaganda_detection_enabled: true,
          propaganda_sensitivity: PropagandaSensitivity.MEDIUM,
          created_at: new Date(),
          updated_at: new Date()
        },
        contentFilters: {
          id: uuidv4(),
          user_id: userId,
          included_topics: [],
          excluded_topics: [],
          included_people: [],
          excluded_people: [],
          included_organizations: [],
          excluded_organizations: [],
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const result = await service.getOrCreateUserPreferences(userId);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        perspective: PoliticalPerspective.NEUTRAL,
        tone: WritingTone.PROFESSIONAL,
        language: Language.EN,
        aiModel: AIModel.OPENAI,
        factCheckingEnabled: true,
        propagandaDetectionEnabled: true,
        propagandaSensitivity: PropagandaSensitivity.MEDIUM
      });
    });
  });
});