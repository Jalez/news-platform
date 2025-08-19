import { PreferenceMigrationUtilities } from '../utils/preferenceMigrationUtilities';
import { 
  PoliticalPerspective, 
  WritingTone, 
  AIModel 
} from '@ai-news-platform/shared';
import { v4 as uuidv4 } from 'uuid';

// Mock the dependencies
jest.mock('../repositories/userPreferencesRepository', () => ({
  userPreferencesRepository: {
    getUsersByPreference: jest.fn(),
    bulkUpdatePreferences: jest.fn()
  }
}));

jest.mock('../config/database', () => ({
  query: jest.fn()
}));

describe('PreferenceMigrationUtilities', () => {
  let migrationUtils: PreferenceMigrationUtilities;
  let mockRepository: any;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    migrationUtils = new PreferenceMigrationUtilities();
    mockRepository = require('../repositories/userPreferencesRepository').userPreferencesRepository;
    mockQuery = require('../config/database').query;
  });

  describe('migratePerspective', () => {
    it('should perform dry run migration', async () => {
      const mockUsers = [
        {
          id: uuidv4(),
          user_id: uuidv4(),
          perspective: PoliticalPerspective.CONSERVATIVE,
          tone: WritingTone.FORMAL,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          user_id: uuidv4(),
          perspective: PoliticalPerspective.CONSERVATIVE,
          tone: WritingTone.PROFESSIONAL,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockRepository.getUsersByPreference.mockResolvedValue(mockUsers);

      const result = await migrationUtils.migratePerspective(
        PoliticalPerspective.CONSERVATIVE,
        PoliticalPerspective.NEUTRAL,
        { dryRun: true }
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.details).toHaveLength(2);
      expect(result.details![0]).toMatchObject({
        userId: mockUsers[0].user_id,
        currentPerspective: PoliticalPerspective.CONSERVATIVE,
        newPerspective: PoliticalPerspective.NEUTRAL
      });
      expect(mockRepository.bulkUpdatePreferences).not.toHaveBeenCalled();
    });

    it('should perform actual migration successfully', async () => {
      const mockUsers = [
        {
          id: uuidv4(),
          user_id: uuidv4(),
          perspective: PoliticalPerspective.CONSERVATIVE,
          tone: WritingTone.FORMAL,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockRepository.getUsersByPreference.mockResolvedValue(mockUsers);
      mockRepository.bulkUpdatePreferences.mockResolvedValue(mockUsers);

      const result = await migrationUtils.migratePerspective(
        PoliticalPerspective.CONSERVATIVE,
        PoliticalPerspective.NEUTRAL,
        { dryRun: false, batchSize: 100 }
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(1);
      expect(result.errors).toEqual([]);
      expect(mockRepository.bulkUpdatePreferences).toHaveBeenCalledWith([
        {
          userId: mockUsers[0].user_id,
          preferences: { perspective: PoliticalPerspective.NEUTRAL }
        }
      ]);
    });

    it('should handle migration errors gracefully', async () => {
      const mockUsers = [
        {
          id: uuidv4(),
          user_id: uuidv4(),
          perspective: PoliticalPerspective.CONSERVATIVE,
          tone: WritingTone.FORMAL,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockRepository.getUsersByPreference.mockResolvedValue(mockUsers);
      mockRepository.bulkUpdatePreferences.mockRejectedValue(new Error('Database error'));

      const result = await migrationUtils.migratePerspective(
        PoliticalPerspective.CONSERVATIVE,
        PoliticalPerspective.NEUTRAL,
        { dryRun: false }
      );

      expect(result.success).toBe(false);
      expect(result.affectedUsers).toBe(0);
      expect(result.errors).toContain('Failed to migrate batch 1: Error: Database error');
    });

    it('should process migrations in batches', async () => {
      const mockUsers = Array.from({ length: 250 }, () => ({
        id: uuidv4(),
        user_id: uuidv4(),
        perspective: PoliticalPerspective.CONSERVATIVE,
        tone: WritingTone.FORMAL,
        created_at: new Date(),
        updated_at: new Date()
      }));

      mockRepository.getUsersByPreference.mockResolvedValue(mockUsers);
      mockRepository.bulkUpdatePreferences.mockResolvedValue([]);

      const result = await migrationUtils.migratePerspective(
        PoliticalPerspective.CONSERVATIVE,
        PoliticalPerspective.NEUTRAL,
        { dryRun: false, batchSize: 100 }
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(250);
      expect(mockRepository.bulkUpdatePreferences).toHaveBeenCalledTimes(3); // 3 batches of 100, 100, 50
    });
  });

  describe('migrateTone', () => {
    it('should migrate users from one tone to another', async () => {
      const mockUsers = [
        {
          id: uuidv4(),
          user_id: uuidv4(),
          perspective: PoliticalPerspective.NEUTRAL,
          tone: WritingTone.FORMAL,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockRepository.getUsersByPreference.mockResolvedValue(mockUsers);
      mockRepository.bulkUpdatePreferences.mockResolvedValue(mockUsers);

      const result = await migrationUtils.migrateTone(
        WritingTone.FORMAL,
        WritingTone.PROFESSIONAL,
        { dryRun: false }
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(1);
      expect(mockRepository.bulkUpdatePreferences).toHaveBeenCalledWith([
        {
          userId: mockUsers[0].user_id,
          preferences: { tone: WritingTone.PROFESSIONAL }
        }
      ]);
    });
  });

  describe('migrateAIModel', () => {
    it('should migrate users from one AI model to another', async () => {
      const mockUsers = [
        {
          id: uuidv4(),
          user_id: uuidv4(),
          perspective: PoliticalPerspective.NEUTRAL,
          tone: WritingTone.PROFESSIONAL,
          ai_model: AIModel.OPENAI,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockRepository.getUsersByPreference.mockResolvedValue(mockUsers);
      mockRepository.bulkUpdatePreferences.mockResolvedValue(mockUsers);

      const result = await migrationUtils.migrateAIModel(
        AIModel.OPENAI,
        AIModel.ANTHROPIC,
        { dryRun: false }
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(1);
      expect(mockRepository.bulkUpdatePreferences).toHaveBeenCalledWith([
        {
          userId: mockUsers[0].user_id,
          preferences: { ai_model: AIModel.ANTHROPIC }
        }
      ]);
    });
  });

  describe('migrateFactChecking', () => {
    it('should enable fact checking for users who have it disabled', async () => {
      const mockUsers = [
        {
          id: uuidv4(),
          user_id: uuidv4(),
          fact_checking_enabled: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockRepository.getUsersByPreference.mockResolvedValue(mockUsers);
      mockRepository.bulkUpdatePreferences.mockResolvedValue(mockUsers);

      const result = await migrationUtils.migrateFactChecking(true, { dryRun: false });

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(1);
      expect(mockRepository.bulkUpdatePreferences).toHaveBeenCalledWith([
        {
          userId: mockUsers[0].user_id,
          preferences: { fact_checking_enabled: true }
        }
      ]);
    });

    it('should work with specific target users', async () => {
      const targetUsers = [uuidv4(), uuidv4()];
      const mockUsers = targetUsers.map(userId => ({
        id: uuidv4(),
        user_id: userId,
        fact_checking_enabled: false,
        created_at: new Date(),
        updated_at: new Date()
      }));

      mockQuery.mockResolvedValue({ rows: mockUsers });
      mockRepository.bulkUpdatePreferences.mockResolvedValue(mockUsers);

      const result = await migrationUtils.migrateFactChecking(
        true, 
        { dryRun: false, targetUsers }
      );

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(2);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM user_preferences WHERE user_id = ANY($1)',
        [targetUsers]
      );
    });
  });

  describe('resetToDefaults', () => {
    it('should reset user preferences to default values', async () => {
      const userIds = [uuidv4(), uuidv4()];
      mockRepository.bulkUpdatePreferences.mockResolvedValue([]);

      const result = await migrationUtils.resetToDefaults(userIds, { dryRun: false });

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(2);
      expect(mockRepository.bulkUpdatePreferences).toHaveBeenCalledWith([
        {
          userId: userIds[0],
          preferences: {
            perspective: PoliticalPerspective.NEUTRAL,
            tone: WritingTone.PROFESSIONAL,
            language: 'en',
            ai_model: AIModel.OPENAI,
            fact_checking_enabled: true,
            propaganda_detection_enabled: true,
            propaganda_sensitivity: 'medium'
          }
        },
        {
          userId: userIds[1],
          preferences: {
            perspective: PoliticalPerspective.NEUTRAL,
            tone: WritingTone.PROFESSIONAL,
            language: 'en',
            ai_model: AIModel.OPENAI,
            fact_checking_enabled: true,
            propaganda_detection_enabled: true,
            propaganda_sensitivity: 'medium'
          }
        }
      ]);
    });

    it('should provide dry run details', async () => {
      const userIds = [uuidv4(), uuidv4()];

      const result = await migrationUtils.resetToDefaults(userIds, { dryRun: true });

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(2);
      expect(result.details).toHaveLength(2);
      expect(result.details![0]).toMatchObject({
        userId: userIds[0],
        newPreferences: {
          perspective: PoliticalPerspective.NEUTRAL,
          tone: WritingTone.PROFESSIONAL,
          language: 'en',
          ai_model: AIModel.OPENAI,
          fact_checking_enabled: true,
          propaganda_detection_enabled: true,
          propaganda_sensitivity: 'medium'
        }
      });
      expect(mockRepository.bulkUpdatePreferences).not.toHaveBeenCalled();
    });
  });

  describe('createMissingPreferences', () => {
    it('should create preferences for users without them', async () => {
      const usersWithoutPreferences = [
        { user_id: uuidv4() },
        { user_id: uuidv4() }
      ];

      mockQuery.mockResolvedValue({ rows: usersWithoutPreferences });
      mockRepository.createCompleteUserPreferences = jest.fn().mockResolvedValue({});

      const result = await migrationUtils.createMissingPreferences({ dryRun: false });

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT u.id as user_id'),
        undefined
      );
    });

    it('should provide dry run information', async () => {
      const usersWithoutPreferences = [
        { user_id: uuidv4() },
        { user_id: uuidv4() }
      ];

      mockQuery.mockResolvedValue({ rows: usersWithoutPreferences });

      const result = await migrationUtils.createMissingPreferences({ dryRun: true });

      expect(result.success).toBe(true);
      expect(result.affectedUsers).toBe(2);
      expect(result.details).toHaveLength(2);
      expect(result.details![0]).toMatchObject({
        userId: usersWithoutPreferences[0].user_id,
        action: 'create_default_preferences'
      });
    });
  });

  describe('generateMigrationReport', () => {
    it('should generate comprehensive migration report', async () => {
      // Mock all the database queries
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '1000' }] }) // total users
        .mockResolvedValueOnce({ rows: [{ count: '800' }] }) // users with preferences
        .mockResolvedValueOnce({ rows: [ // perspective distribution
          { perspective: 'neutral', count: '400' },
          { perspective: 'conservative', count: '200' },
          { perspective: 'liberal', count: '200' }
        ]})
        .mockResolvedValueOnce({ rows: [ // tone distribution
          { tone: 'professional', count: '500' },
          { tone: 'formal', count: '200' },
          { tone: 'casual', count: '100' }
        ]})
        .mockResolvedValueOnce({ rows: [ // language distribution
          { language: 'en', count: '700' },
          { language: 'es', count: '100' }
        ]})
        .mockResolvedValueOnce({ rows: [ // AI model distribution
          { ai_model: 'openai', count: '600' },
          { ai_model: 'anthropic', count: '200' }
        ]})
        .mockResolvedValueOnce({ rows: [{ count: '750' }] }) // fact checking enabled
        .mockResolvedValueOnce({ rows: [{ count: '700' }] }); // propaganda detection enabled

      const report = await migrationUtils.generateMigrationReport();

      expect(report).toEqual({
        totalUsers: 1000,
        usersWithPreferences: 800,
        usersWithoutPreferences: 200,
        perspectiveDistribution: {
          neutral: 400,
          conservative: 200,
          liberal: 200
        },
        toneDistribution: {
          professional: 500,
          formal: 200,
          casual: 100
        },
        languageDistribution: {
          en: 700,
          es: 100
        },
        aiModelDistribution: {
          openai: 600,
          anthropic: 200
        },
        factCheckingEnabled: 750,
        propagandaDetectionEnabled: 700
      });
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      await expect(migrationUtils.generateMigrationReport()).rejects.toThrow(
        'Failed to generate migration report: Error: Database connection failed'
      );
    });
  });
});