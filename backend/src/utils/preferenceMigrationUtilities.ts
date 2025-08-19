import { userPreferencesRepository } from '../repositories/userPreferencesRepository';
import { query } from '../config/database';
import { 
  PoliticalPerspective, 
  WritingTone, 
  Language, 
  AIModel, 
  PropagandaSensitivity 
} from '@ai-news-platform/shared';
import { UpdateUserPreferencesInput } from '../models';

export interface MigrationResult {
  success: boolean;
  affectedUsers: number;
  errors: string[];
  details?: any[];
}

export interface PreferenceMigrationOptions {
  dryRun?: boolean;
  batchSize?: number;
  targetUsers?: string[];
}

export class PreferenceMigrationUtilities {
  /**
   * Migrate users from one perspective to another
   */
  async migratePerspective(
    fromPerspective: PoliticalPerspective,
    toPerspective: PoliticalPerspective,
    options: PreferenceMigrationOptions = {}
  ): Promise<MigrationResult> {
    try {
      const { dryRun = false, batchSize = 100 } = options;
      
      // Get affected users
      const usersToMigrate = await userPreferencesRepository.getUsersByPreference('perspective', fromPerspective);
      
      if (dryRun) {
        return {
          success: true,
          affectedUsers: usersToMigrate.length,
          errors: [],
          details: usersToMigrate.map((user: any) => ({
            userId: user.user_id,
            currentPerspective: user.perspective,
            newPerspective: toPerspective
          }))
        };
      }

      // Perform migration in batches
      const errors: string[] = [];
      let migratedCount = 0;

      for (let i = 0; i < usersToMigrate.length; i += batchSize) {
        const batch = usersToMigrate.slice(i, i + batchSize);
        const updates = batch.map((user: any) => ({
          userId: user.user_id,
          preferences: { perspective: toPerspective }
        }));

        try {
          await userPreferencesRepository.bulkUpdatePreferences(updates);
          migratedCount += batch.length;
        } catch (error) {
          errors.push(`Failed to migrate batch ${i / batchSize + 1}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        affectedUsers: migratedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        affectedUsers: 0,
        errors: [`Migration failed: ${error}`]
      };
    }
  }

  /**
   * Migrate users from one tone to another
   */
  async migrateTone(
    fromTone: WritingTone,
    toTone: WritingTone,
    options: PreferenceMigrationOptions = {}
  ): Promise<MigrationResult> {
    try {
      const { dryRun = false, batchSize = 100 } = options;
      
      const usersToMigrate = await userPreferencesRepository.getUsersByPreference('tone', fromTone);
      
      if (dryRun) {
        return {
          success: true,
          affectedUsers: usersToMigrate.length,
          errors: [],
          details: usersToMigrate.map((user: any) => ({
            userId: user.user_id,
            currentTone: user.tone,
            newTone: toTone
          }))
        };
      }

      const errors: string[] = [];
      let migratedCount = 0;

      for (let i = 0; i < usersToMigrate.length; i += batchSize) {
        const batch = usersToMigrate.slice(i, i + batchSize);
        const updates = batch.map((user: any) => ({
          userId: user.user_id,
          preferences: { tone: toTone }
        }));

        try {
          await userPreferencesRepository.bulkUpdatePreferences(updates);
          migratedCount += batch.length;
        } catch (error) {
          errors.push(`Failed to migrate batch ${i / batchSize + 1}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        affectedUsers: migratedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        affectedUsers: 0,
        errors: [`Migration failed: ${error}`]
      };
    }
  }

  /**
   * Migrate AI model preferences
   */
  async migrateAIModel(
    fromModel: AIModel,
    toModel: AIModel,
    options: PreferenceMigrationOptions = {}
  ): Promise<MigrationResult> {
    try {
      const { dryRun = false, batchSize = 100 } = options;
      
      const usersToMigrate = await userPreferencesRepository.getUsersByPreference('ai_model', fromModel);
      
      if (dryRun) {
        return {
          success: true,
          affectedUsers: usersToMigrate.length,
          errors: [],
          details: usersToMigrate.map((user: any) => ({
            userId: user.user_id,
            currentModel: user.ai_model,
            newModel: toModel
          }))
        };
      }

      const errors: string[] = [];
      let migratedCount = 0;

      for (let i = 0; i < usersToMigrate.length; i += batchSize) {
        const batch = usersToMigrate.slice(i, i + batchSize);
        const updates = batch.map((user: any) => ({
          userId: user.user_id,
          preferences: { ai_model: toModel }
        }));

        try {
          await userPreferencesRepository.bulkUpdatePreferences(updates);
          migratedCount += batch.length;
        } catch (error) {
          errors.push(`Failed to migrate batch ${i / batchSize + 1}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        affectedUsers: migratedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        affectedUsers: 0,
        errors: [`Migration failed: ${error}`]
      };
    }
  }

  /**
   * Enable/disable fact checking for all users
   */
  async migrateFactChecking(
    enabled: boolean,
    options: PreferenceMigrationOptions = {}
  ): Promise<MigrationResult> {
    try {
      const { dryRun = false, batchSize = 100, targetUsers } = options;
      
      let usersToMigrate;
      if (targetUsers && targetUsers.length > 0) {
        // Get specific users
        const result = await query(
          'SELECT * FROM user_preferences WHERE user_id = ANY($1)',
          [targetUsers]
        );
        usersToMigrate = result.rows;
      } else {
        // Get all users with opposite setting
        usersToMigrate = await userPreferencesRepository.getUsersByPreference('fact_checking_enabled', !enabled);
      }
      
      if (dryRun) {
        return {
          success: true,
          affectedUsers: usersToMigrate.length,
          errors: [],
          details: usersToMigrate.map((user: any) => ({
            userId: user.user_id,
            currentFactChecking: user.fact_checking_enabled,
            newFactChecking: enabled
          }))
        };
      }

      const errors: string[] = [];
      let migratedCount = 0;

      for (let i = 0; i < usersToMigrate.length; i += batchSize) {
        const batch = usersToMigrate.slice(i, i + batchSize);
        const updates = batch.map((user: any) => ({
          userId: user.user_id,
          preferences: { fact_checking_enabled: enabled }
        }));

        try {
          await userPreferencesRepository.bulkUpdatePreferences(updates);
          migratedCount += batch.length;
        } catch (error) {
          errors.push(`Failed to migrate batch ${i / batchSize + 1}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        affectedUsers: migratedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        affectedUsers: 0,
        errors: [`Migration failed: ${error}`]
      };
    }
  }

  /**
   * Reset all user preferences to defaults
   */
  async resetToDefaults(
    userIds: string[],
    options: PreferenceMigrationOptions = {}
  ): Promise<MigrationResult> {
    try {
      const { dryRun = false, batchSize = 100 } = options;
      
      const defaultPreferences: UpdateUserPreferencesInput = {
        perspective: PoliticalPerspective.NEUTRAL,
        tone: WritingTone.PROFESSIONAL,
        language: Language.EN,
        ai_model: AIModel.OPENAI,
        fact_checking_enabled: true,
        propaganda_detection_enabled: true,
        propaganda_sensitivity: PropagandaSensitivity.MEDIUM
      };

      if (dryRun) {
        return {
          success: true,
          affectedUsers: userIds.length,
          errors: [],
          details: userIds.map(userId => ({
            userId,
            newPreferences: defaultPreferences
          }))
        };
      }

      const errors: string[] = [];
      let migratedCount = 0;

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const updates = batch.map(userId => ({
          userId,
          preferences: defaultPreferences
        }));

        try {
          await userPreferencesRepository.bulkUpdatePreferences(updates);
          migratedCount += batch.length;
        } catch (error) {
          errors.push(`Failed to reset batch ${i / batchSize + 1}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        affectedUsers: migratedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        affectedUsers: 0,
        errors: [`Migration failed: ${error}`]
      };
    }
  }

  /**
   * Create missing preferences for users who don't have them
   */
  async createMissingPreferences(options: PreferenceMigrationOptions = {}): Promise<MigrationResult> {
    try {
      const { dryRun = false, batchSize = 100 } = options;
      
      // Find users without preferences
      const result = await query(`
        SELECT u.id as user_id 
        FROM users u 
        LEFT JOIN user_preferences up ON u.id = up.user_id 
        WHERE up.user_id IS NULL
      `);
      
      const usersWithoutPreferences = result.rows;

      if (dryRun) {
        return {
          success: true,
          affectedUsers: usersWithoutPreferences.length,
          errors: [],
          details: usersWithoutPreferences.map((user: any) => ({
            userId: user.user_id,
            action: 'create_default_preferences'
          }))
        };
      }

      const errors: string[] = [];
      let createdCount = 0;

      for (let i = 0; i < usersWithoutPreferences.length; i += batchSize) {
        const batch = usersWithoutPreferences.slice(i, i + batchSize);
        
        try {
          for (const user of batch) {
            await userPreferencesRepository.createCompleteUserPreferences(user.user_id);
            createdCount++;
          }
        } catch (error) {
          errors.push(`Failed to create preferences for batch ${i / batchSize + 1}: ${error}`);
        }
      }

      return {
        success: errors.length === 0,
        affectedUsers: createdCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        affectedUsers: 0,
        errors: [`Migration failed: ${error}`]
      };
    }
  }

  /**
   * Generate preferences migration report
   */
  async generateMigrationReport(): Promise<{
    totalUsers: number;
    usersWithPreferences: number;
    usersWithoutPreferences: number;
    perspectiveDistribution: Record<string, number>;
    toneDistribution: Record<string, number>;
    languageDistribution: Record<string, number>;
    aiModelDistribution: Record<string, number>;
    factCheckingEnabled: number;
    propagandaDetectionEnabled: number;
  }> {
    try {
      // Get total user count
      const totalUsersResult = await query('SELECT COUNT(*) as count FROM users');
      const totalUsers = parseInt(totalUsersResult.rows[0].count);

      // Get users with preferences
      const preferencesCountResult = await query('SELECT COUNT(*) as count FROM user_preferences');
      const usersWithPreferences = parseInt(preferencesCountResult.rows[0].count);

      // Get distribution data
      const perspectiveResult = await query(`
        SELECT perspective, COUNT(*) as count 
        FROM user_preferences 
        GROUP BY perspective
      `);

      const toneResult = await query(`
        SELECT tone, COUNT(*) as count 
        FROM user_preferences 
        GROUP BY tone
      `);

      const languageResult = await query(`
        SELECT language, COUNT(*) as count 
        FROM user_preferences 
        GROUP BY language
      `);

      const aiModelResult = await query(`
        SELECT ai_model, COUNT(*) as count 
        FROM user_preferences 
        GROUP BY ai_model
      `);

      const factCheckingResult = await query(`
        SELECT COUNT(*) as count 
        FROM user_preferences 
        WHERE fact_checking_enabled = true
      `);

      const propagandaDetectionResult = await query(`
        SELECT COUNT(*) as count 
        FROM user_preferences 
        WHERE propaganda_detection_enabled = true
      `);

      return {
        totalUsers,
        usersWithPreferences,
        usersWithoutPreferences: totalUsers - usersWithPreferences,
        perspectiveDistribution: perspectiveResult.rows.reduce((acc: Record<string, number>, row: any) => {
          acc[row.perspective] = parseInt(row.count);
          return acc;
        }, {}),
        toneDistribution: toneResult.rows.reduce((acc: Record<string, number>, row: any) => {
          acc[row.tone] = parseInt(row.count);
          return acc;
        }, {}),
        languageDistribution: languageResult.rows.reduce((acc: Record<string, number>, row: any) => {
          acc[row.language] = parseInt(row.count);
          return acc;
        }, {}),
        aiModelDistribution: aiModelResult.rows.reduce((acc: Record<string, number>, row: any) => {
          acc[row.ai_model] = parseInt(row.count);
          return acc;
        }, {}),
        factCheckingEnabled: parseInt(factCheckingResult.rows[0].count),
        propagandaDetectionEnabled: parseInt(propagandaDetectionResult.rows[0].count)
      };
    } catch (error) {
      throw new Error(`Failed to generate migration report: ${error}`);
    }
  }
}

// Export singleton instance
export const preferenceMigrationUtilities = new PreferenceMigrationUtilities();