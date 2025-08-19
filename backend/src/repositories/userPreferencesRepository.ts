import { query, transaction } from '../config/database';
import { 
  UserPreferences, 
  ContentFilters, 
  CreateUserPreferencesInput, 
  UpdateUserPreferencesInput,
  CreateContentFiltersInput,
  UpdateContentFiltersInput
} from '../models';
import { 
  PoliticalPerspective, 
  WritingTone, 
  Language, 
  AIModel, 
  PropagandaSensitivity 
} from '@ai-news-platform/shared';
import { v4 as uuidv4 } from 'uuid';

export class UserPreferencesRepository {
  /**
   * Get user preferences by user ID
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const result = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Get user content filters by user ID
   */
  async getUserContentFilters(userId: string): Promise<ContentFilters | null> {
    const result = await query(
      'SELECT * FROM content_filters WHERE user_id = $1',
      [userId]
    );
    
    return result.rows[0] || null;
  }

  /**
   * Get complete user preferences with content filters
   */
  async getCompleteUserPreferences(userId: string): Promise<{
    preferences: UserPreferences | null;
    contentFilters: ContentFilters | null;
  }> {
    return transaction(async (client) => {
      const preferencesResult = await client.query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      );
      
      const filtersResult = await client.query(
        'SELECT * FROM content_filters WHERE user_id = $1',
        [userId]
      );

      return {
        preferences: preferencesResult.rows[0] || null,
        contentFilters: filtersResult.rows[0] || null
      };
    });
  }

  /**
   * Create user preferences with default values
   */
  async createUserPreferences(input: CreateUserPreferencesInput): Promise<UserPreferences> {
    const {
      user_id,
      perspective = PoliticalPerspective.NEUTRAL,
      tone = WritingTone.PROFESSIONAL,
      language = Language.EN,
      ai_model = AIModel.OPENAI,
      fact_checking_enabled = true,
      propaganda_detection_enabled = true,
      propaganda_sensitivity = PropagandaSensitivity.MEDIUM
    } = input;

    const result = await query(`
      INSERT INTO user_preferences (
        id, user_id, perspective, tone, language, ai_model,
        fact_checking_enabled, propaganda_detection_enabled, propaganda_sensitivity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      uuidv4(),
      user_id,
      perspective,
      tone,
      language,
      ai_model,
      fact_checking_enabled,
      propaganda_detection_enabled,
      propaganda_sensitivity
    ]);

    return result.rows[0];
  }

  /**
   * Create user content filters with default values
   */
  async createUserContentFilters(input: CreateContentFiltersInput): Promise<ContentFilters> {
    const {
      user_id,
      included_topics = [],
      excluded_topics = [],
      included_people = [],
      excluded_people = [],
      included_organizations = [],
      excluded_organizations = []
    } = input;

    const result = await query(`
      INSERT INTO content_filters (
        id, user_id, included_topics, excluded_topics,
        included_people, excluded_people, included_organizations, excluded_organizations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      uuidv4(),
      user_id,
      included_topics,
      excluded_topics,
      included_people,
      excluded_people,
      included_organizations,
      excluded_organizations
    ]);

    return result.rows[0];
  }

  /**
   * Create complete user preferences (preferences + content filters) in a transaction
   */
  async createCompleteUserPreferences(
    userId: string,
    preferencesInput?: Partial<CreateUserPreferencesInput>,
    filtersInput?: Partial<CreateContentFiltersInput>
  ): Promise<{
    preferences: UserPreferences;
    contentFilters: ContentFilters;
  }> {
    return transaction(async (client) => {
      // Create preferences
      const {
        perspective = PoliticalPerspective.NEUTRAL,
        tone = WritingTone.PROFESSIONAL,
        language = Language.EN,
        ai_model = AIModel.OPENAI,
        fact_checking_enabled = true,
        propaganda_detection_enabled = true,
        propaganda_sensitivity = PropagandaSensitivity.MEDIUM
      } = preferencesInput || {};

      const preferencesResult = await client.query(`
        INSERT INTO user_preferences (
          id, user_id, perspective, tone, language, ai_model,
          fact_checking_enabled, propaganda_detection_enabled, propaganda_sensitivity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        uuidv4(),
        userId,
        perspective,
        tone,
        language,
        ai_model,
        fact_checking_enabled,
        propaganda_detection_enabled,
        propaganda_sensitivity
      ]);

      // Create content filters
      const {
        included_topics = [],
        excluded_topics = [],
        included_people = [],
        excluded_people = [],
        included_organizations = [],
        excluded_organizations = []
      } = filtersInput || {};

      const filtersResult = await client.query(`
        INSERT INTO content_filters (
          id, user_id, included_topics, excluded_topics,
          included_people, excluded_people, included_organizations, excluded_organizations
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        uuidv4(),
        userId,
        included_topics,
        excluded_topics,
        included_people,
        excluded_people,
        included_organizations,
        excluded_organizations
      ]);

      return {
        preferences: preferencesResult.rows[0],
        contentFilters: filtersResult.rows[0]
      };
    });
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, updates: UpdateUserPreferencesInput): Promise<UserPreferences | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      // No fields to update, return current preferences
      return this.getUserPreferences(userId);
    }

    values.push(userId); // Add userId for WHERE clause

    const result = await query(`
      UPDATE user_preferences 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  /**
   * Update user content filters
   */
  async updateUserContentFilters(userId: string, updates: UpdateContentFiltersInput): Promise<ContentFilters | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      // No fields to update, return current filters
      return this.getUserContentFilters(userId);
    }

    values.push(userId); // Add userId for WHERE clause

    const result = await query(`
      UPDATE content_filters 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${paramIndex}
      RETURNING *
    `, values);

    return result.rows[0] || null;
  }

  /**
   * Update user perspective setting
   */
  async updateUserPerspective(userId: string, perspective: PoliticalPerspective): Promise<UserPreferences | null> {
    return this.updateUserPreferences(userId, { perspective });
  }

  /**
   * Update user tone setting
   */
  async updateUserTone(userId: string, tone: WritingTone): Promise<UserPreferences | null> {
    return this.updateUserPreferences(userId, { tone });
  }

  /**
   * Update user language setting
   */
  async updateUserLanguage(userId: string, language: Language): Promise<UserPreferences | null> {
    return this.updateUserPreferences(userId, { language });
  }

  /**
   * Update user AI model setting
   */
  async updateUserAIModel(userId: string, ai_model: AIModel): Promise<UserPreferences | null> {
    return this.updateUserPreferences(userId, { ai_model });
  }

  /**
   * Delete user preferences (and content filters via CASCADE)
   */
  async deleteUserPreferences(userId: string): Promise<boolean> {
    return transaction(async (client) => {
      // Delete preferences (content filters will be deleted via CASCADE)
      const preferencesResult = await client.query(
        'DELETE FROM user_preferences WHERE user_id = $1',
        [userId]
      );

      return preferencesResult.rowCount > 0;
    });
  }

  /**
   * Check if user has preferences set up
   */
  async hasUserPreferences(userId: string): Promise<boolean> {
    const result = await query(
      'SELECT EXISTS(SELECT 1 FROM user_preferences WHERE user_id = $1)',
      [userId]
    );
    
    return result.rows[0].exists;
  }

  /**
   * Get all users with specific preference settings (for analytics/migration)
   */
  async getUsersByPreference(field: keyof UpdateUserPreferencesInput, value: any): Promise<UserPreferences[]> {
    const result = await query(
      `SELECT * FROM user_preferences WHERE ${field} = $1`,
      [value]
    );
    
    return result.rows;
  }

  /**
   * Bulk update preferences for multiple users (for migration utilities)
   */
  async bulkUpdatePreferences(updates: { userId: string; preferences: UpdateUserPreferencesInput }[]): Promise<UserPreferences[]> {
    return transaction(async (client) => {
      const results: UserPreferences[] = [];

      for (const { userId, preferences } of updates) {
        const fields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.entries(preferences).forEach(([key, value]) => {
          if (value !== undefined) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
          }
        });

        if (fields.length > 0) {
          values.push(userId);
          
          const result = await client.query(`
            UPDATE user_preferences 
            SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $${paramIndex}
            RETURNING *
          `, values);

          if (result.rows[0]) {
            results.push(result.rows[0]);
          }
        }
      }

      return results;
    });
  }
}

// Export singleton instance
export const userPreferencesRepository = new UserPreferencesRepository();