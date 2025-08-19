import { userPreferencesRepository } from '../repositories/userPreferencesRepository';
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
  PropagandaSensitivity,
  BaseUserPreferences,
  isValidPerspective,
  isValidTone,
  isValidLanguage,
  isValidAIModel
} from '@ai-news-platform/shared';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface UserPreferencesServiceResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  message?: string;
}

export class UserPreferencesService {
  /**
   * Validate user preferences input
   */
  private validateUserPreferences(input: Partial<UpdateUserPreferencesInput>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate perspective
    if (input.perspective !== undefined && !isValidPerspective(input.perspective)) {
      errors.push({
        field: 'perspective',
        message: 'Invalid political perspective',
        value: input.perspective
      });
    }

    // Validate tone
    if (input.tone !== undefined && !isValidTone(input.tone)) {
      errors.push({
        field: 'tone',
        message: 'Invalid writing tone',
        value: input.tone
      });
    }

    // Validate language
    if (input.language !== undefined && !isValidLanguage(input.language)) {
      errors.push({
        field: 'language',
        message: 'Invalid language',
        value: input.language
      });
    }

    // Validate AI model
    if (input.ai_model !== undefined && !isValidAIModel(input.ai_model)) {
      errors.push({
        field: 'ai_model',
        message: 'Invalid AI model',
        value: input.ai_model
      });
    }

    // Validate propaganda sensitivity
    if (input.propaganda_sensitivity !== undefined) {
      const validSensitivities = Object.values(PropagandaSensitivity);
      if (!validSensitivities.includes(input.propaganda_sensitivity)) {
        errors.push({
          field: 'propaganda_sensitivity',
          message: 'Invalid propaganda sensitivity level',
          value: input.propaganda_sensitivity
        });
      }
    }

    // Validate boolean fields
    if (input.fact_checking_enabled !== undefined && typeof input.fact_checking_enabled !== 'boolean') {
      errors.push({
        field: 'fact_checking_enabled',
        message: 'fact_checking_enabled must be a boolean',
        value: input.fact_checking_enabled
      });
    }

    if (input.propaganda_detection_enabled !== undefined && typeof input.propaganda_detection_enabled !== 'boolean') {
      errors.push({
        field: 'propaganda_detection_enabled',
        message: 'propaganda_detection_enabled must be a boolean',
        value: input.propaganda_detection_enabled
      });
    }

    return errors;
  }

  /**
   * Validate content filters input
   */
  private validateContentFilters(input: Partial<UpdateContentFiltersInput>): ValidationError[] {
    const errors: ValidationError[] = [];

    const arrayFields = [
      'included_topics', 'excluded_topics', 
      'included_people', 'excluded_people',
      'included_organizations', 'excluded_organizations'
    ];

    arrayFields.forEach(field => {
      const value = (input as any)[field];
      if (value !== undefined) {
        if (!Array.isArray(value)) {
          errors.push({
            field,
            message: `${field} must be an array`,
            value
          });
        } else if (!value.every(item => typeof item === 'string')) {
          errors.push({
            field,
            message: `${field} must be an array of strings`,
            value
          });
        }
      }
    });

    return errors;
  }

  /**
   * Convert database model to API response format
   */
  private convertToApiFormat(
    preferences: UserPreferences | null,
    contentFilters: ContentFilters | null
  ): BaseUserPreferences | null {
    if (!preferences) return null;

    return {
      perspective: preferences.perspective,
      tone: preferences.tone,
      language: preferences.language,
      aiModel: preferences.ai_model,
      factCheckingEnabled: preferences.fact_checking_enabled,
      propagandaDetectionEnabled: preferences.propaganda_detection_enabled,
      propagandaSensitivity: preferences.propaganda_sensitivity,
      contentFilters: contentFilters ? {
        includedTopics: contentFilters.included_topics,
        excludedTopics: contentFilters.excluded_topics,
        includedPeople: contentFilters.included_people,
        excludedPeople: contentFilters.excluded_people,
        includedOrganizations: contentFilters.included_organizations,
        excludedOrganizations: contentFilters.excluded_organizations
      } : {
        includedTopics: [],
        excludedTopics: [],
        includedPeople: [],
        excludedPeople: [],
        includedOrganizations: [],
        excludedOrganizations: []
      }
    };
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    try {
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          errors: [{ field: 'userId', message: 'Valid user ID is required' }]
        };
      }

      const { preferences, contentFilters } = await userPreferencesRepository.getCompleteUserPreferences(userId);
      
      const apiFormat = this.convertToApiFormat(preferences, contentFilters);
      
      return {
        success: true,
        data: apiFormat || undefined,
        message: preferences ? 'User preferences retrieved successfully' : 'No preferences found for user'
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'system', message: 'Failed to retrieve user preferences' }]
      };
    }
  }

  /**
   * Create user preferences with validation
   */
  async createUserPreferences(
    userId: string,
    preferencesInput?: Partial<CreateUserPreferencesInput>,
    filtersInput?: Partial<CreateContentFiltersInput>
  ): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    try {
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          errors: [{ field: 'userId', message: 'Valid user ID is required' }]
        };
      }

      // Check if user already has preferences
      const hasPreferences = await userPreferencesRepository.hasUserPreferences(userId);
      if (hasPreferences) {
        return {
          success: false,
          errors: [{ field: 'userId', message: 'User preferences already exist' }]
        };
      }

      // Validate preferences input
      const preferencesErrors = this.validateUserPreferences(preferencesInput || {});
      const filtersErrors = this.validateContentFilters(filtersInput || {});
      
      const allErrors = [...preferencesErrors, ...filtersErrors];
      if (allErrors.length > 0) {
        return {
          success: false,
          errors: allErrors
        };
      }

      // Create preferences
      const { preferences, contentFilters } = await userPreferencesRepository.createCompleteUserPreferences(
        userId,
        preferencesInput,
        filtersInput
      );

      const apiFormat = this.convertToApiFormat(preferences, contentFilters);

      return {
        success: true,
        data: apiFormat!,
        message: 'User preferences created successfully'
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'system', message: 'Failed to create user preferences' }]
      };
    }
  }

  /**
   * Update user preferences with validation
   */
  async updateUserPreferences(
    userId: string,
    updates: UpdateUserPreferencesInput
  ): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    try {
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          errors: [{ field: 'userId', message: 'Valid user ID is required' }]
        };
      }

      // Validate updates
      const errors = this.validateUserPreferences(updates);
      if (errors.length > 0) {
        return {
          success: false,
          errors
        };
      }

      // Update preferences
      const updatedPreferences = await userPreferencesRepository.updateUserPreferences(userId, updates);
      if (!updatedPreferences) {
        return {
          success: false,
          errors: [{ field: 'userId', message: 'User preferences not found' }]
        };
      }

      // Get updated content filters
      const contentFilters = await userPreferencesRepository.getUserContentFilters(userId);
      const apiFormat = this.convertToApiFormat(updatedPreferences, contentFilters);

      return {
        success: true,
        data: apiFormat!,
        message: 'User preferences updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'system', message: 'Failed to update user preferences' }]
      };
    }
  }

  /**
   * Update user content filters with validation
   */
  async updateUserContentFilters(
    userId: string,
    updates: UpdateContentFiltersInput
  ): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    try {
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          errors: [{ field: 'userId', message: 'Valid user ID is required' }]
        };
      }

      // Validate updates
      const errors = this.validateContentFilters(updates);
      if (errors.length > 0) {
        return {
          success: false,
          errors
        };
      }

      // Update content filters
      const updatedFilters = await userPreferencesRepository.updateUserContentFilters(userId, updates);
      if (!updatedFilters) {
        return {
          success: false,
          errors: [{ field: 'userId', message: 'User content filters not found' }]
        };
      }

      // Get current preferences
      const preferences = await userPreferencesRepository.getUserPreferences(userId);
      const apiFormat = this.convertToApiFormat(preferences, updatedFilters);

      return {
        success: true,
        data: apiFormat!,
        message: 'User content filters updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'system', message: 'Failed to update user content filters' }]
      };
    }
  }

  /**
   * Update specific preference settings with convenience methods
   */
  async updatePerspective(userId: string, perspective: PoliticalPerspective): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    return this.updateUserPreferences(userId, { perspective });
  }

  async updateTone(userId: string, tone: WritingTone): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    return this.updateUserPreferences(userId, { tone });
  }

  async updateLanguage(userId: string, language: Language): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    return this.updateUserPreferences(userId, { language });
  }

  async updateAIModel(userId: string, ai_model: AIModel): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    return this.updateUserPreferences(userId, { ai_model });
  }

  /**
   * Delete user preferences
   */
  async deleteUserPreferences(userId: string): Promise<UserPreferencesServiceResult<boolean>> {
    try {
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          errors: [{ field: 'userId', message: 'Valid user ID is required' }]
        };
      }

      const deleted = await userPreferencesRepository.deleteUserPreferences(userId);
      
      return {
        success: true,
        data: deleted,
        message: deleted ? 'User preferences deleted successfully' : 'No preferences found to delete'
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'system', message: 'Failed to delete user preferences' }]
      };
    }
  }

  /**
   * Get or create user preferences (ensures user always has preferences)
   */
  async getOrCreateUserPreferences(userId: string): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    try {
      // Try to get existing preferences first
      const existingResult = await this.getUserPreferences(userId);
      
      if (existingResult.success && existingResult.data) {
        return existingResult;
      }

      // Create default preferences if none exist
      return this.createUserPreferences(userId);
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'system', message: 'Failed to get or create user preferences' }]
      };
    }
  }

  /**
   * Session-based preference storage
   * Store temporary preferences in session without persisting to database
   */
  storeSessionPreferences(sessionId: string, preferences: Partial<BaseUserPreferences>): void {
    // In a real implementation, this would use Redis or another session store
    // For now, we'll use a simple in-memory store
    if (!this.sessionStore) {
      this.sessionStore = new Map();
    }
    
    this.sessionStore.set(sessionId, {
      ...preferences,
      timestamp: Date.now()
    });
  }

  /**
   * Get session-based preferences
   */
  getSessionPreferences(sessionId: string): Partial<BaseUserPreferences> | null {
    if (!this.sessionStore || !this.sessionStore.has(sessionId)) {
      return null;
    }

    const stored = this.sessionStore.get(sessionId);
    
    // Check if session preferences are still valid (1 hour)
    if (Date.now() - stored.timestamp > 60 * 60 * 1000) {
      this.sessionStore.delete(sessionId);
      return null;
    }

    return stored;
  }

  /**
   * Merge session preferences with user preferences
   */
  async getMergedPreferences(userId: string, sessionId?: string): Promise<UserPreferencesServiceResult<BaseUserPreferences>> {
    try {
      // Get user preferences
      const userResult = await this.getOrCreateUserPreferences(userId);
      if (!userResult.success) {
        return userResult;
      }

      let preferences = userResult.data!;

      // Merge with session preferences if available
      if (sessionId) {
        const sessionPrefs = this.getSessionPreferences(sessionId);
        if (sessionPrefs) {
          preferences = {
            ...preferences,
            ...sessionPrefs,
            // Merge content filters specifically
            contentFilters: {
              ...preferences.contentFilters,
              ...sessionPrefs.contentFilters
            }
          };
        }
      }

      return {
        success: true,
        data: preferences,
        message: 'Preferences retrieved and merged successfully'
      };
    } catch (error) {
      return {
        success: false,
        errors: [{ field: 'system', message: 'Failed to merge preferences' }]
      };
    }
  }

  private sessionStore?: Map<string, any>;
}

// Export singleton instance
export const userPreferencesService = new UserPreferencesService();