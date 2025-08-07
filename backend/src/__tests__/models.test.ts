import { 
  PoliticalPerspective, 
  WritingTone, 
  Language, 
  AIModel, 
  PropagandaSensitivity 
} from '@ai-news-platform/shared';
import { 
  User, 
  UserPreferences, 
  ContentFilters, 
  Session,
  CreateUserInput,
  CreateUserPreferencesInput,
  CreateSessionInput
} from '../models';
import { v4 as uuidv4 } from 'uuid';

describe('Data Model Validation', () => {
  describe('User Model', () => {
    it('should validate user structure', () => {
      const user: User = {
        id: uuidv4(),
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashed_password',
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.password_hash).toBe('hashed_password');
      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
    });

    it('should validate CreateUserInput structure', () => {
      const createUserInput: CreateUserInput = {
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'hashed_password',
      };

      expect(createUserInput.email).toBe('test@example.com');
      expect(createUserInput.username).toBe('testuser');
      expect(createUserInput.password_hash).toBe('hashed_password');
    });
  });

  describe('UserPreferences Model', () => {
    it('should validate user preferences structure', () => {
      const userId = uuidv4();
      const userPreferences: UserPreferences = {
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
        updated_at: new Date(),
      };

      expect(userPreferences.id).toBeDefined();
      expect(userPreferences.user_id).toBe(userId);
      expect(userPreferences.perspective).toBe(PoliticalPerspective.NEUTRAL);
      expect(userPreferences.tone).toBe(WritingTone.PROFESSIONAL);
      expect(userPreferences.language).toBe(Language.EN);
      expect(userPreferences.ai_model).toBe(AIModel.OPENAI);
      expect(userPreferences.fact_checking_enabled).toBe(true);
      expect(userPreferences.propaganda_detection_enabled).toBe(true);
      expect(userPreferences.propaganda_sensitivity).toBe(PropagandaSensitivity.MEDIUM);
    });

    it('should validate CreateUserPreferencesInput with defaults', () => {
      const userId = uuidv4();
      const createInput: CreateUserPreferencesInput = {
        user_id: userId,
      };

      expect(createInput.user_id).toBe(userId);
      expect(createInput.perspective).toBeUndefined(); // Optional, will use DB default
      expect(createInput.tone).toBeUndefined(); // Optional, will use DB default
    });

    it('should validate CreateUserPreferencesInput with all fields', () => {
      const userId = uuidv4();
      const createInput: CreateUserPreferencesInput = {
        user_id: userId,
        perspective: PoliticalPerspective.CONSERVATIVE,
        tone: WritingTone.FORMAL,
        language: Language.ES,
        ai_model: AIModel.ANTHROPIC,
        fact_checking_enabled: false,
        propaganda_detection_enabled: false,
        propaganda_sensitivity: PropagandaSensitivity.LOW,
      };

      expect(createInput.user_id).toBe(userId);
      expect(createInput.perspective).toBe(PoliticalPerspective.CONSERVATIVE);
      expect(createInput.tone).toBe(WritingTone.FORMAL);
      expect(createInput.language).toBe(Language.ES);
      expect(createInput.ai_model).toBe(AIModel.ANTHROPIC);
      expect(createInput.fact_checking_enabled).toBe(false);
      expect(createInput.propaganda_detection_enabled).toBe(false);
      expect(createInput.propaganda_sensitivity).toBe(PropagandaSensitivity.LOW);
    });
  });

  describe('ContentFilters Model', () => {
    it('should validate content filters structure', () => {
      const userId = uuidv4();
      const contentFilters: ContentFilters = {
        id: uuidv4(),
        user_id: userId,
        included_topics: ['politics', 'technology'],
        excluded_topics: ['sports'],
        included_people: ['John Doe'],
        excluded_people: ['Jane Smith'],
        included_organizations: ['NASA'],
        excluded_organizations: ['Example Corp'],
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(contentFilters.id).toBeDefined();
      expect(contentFilters.user_id).toBe(userId);
      expect(contentFilters.included_topics).toEqual(['politics', 'technology']);
      expect(contentFilters.excluded_topics).toEqual(['sports']);
      expect(contentFilters.included_people).toEqual(['John Doe']);
      expect(contentFilters.excluded_people).toEqual(['Jane Smith']);
      expect(contentFilters.included_organizations).toEqual(['NASA']);
      expect(contentFilters.excluded_organizations).toEqual(['Example Corp']);
    });
  });

  describe('Session Model', () => {
    it('should validate session structure', () => {
      const userId = uuidv4();
      const session: Session = {
        id: uuidv4(),
        user_id: userId,
        session_token: 'unique_session_token',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(session.id).toBeDefined();
      expect(session.user_id).toBe(userId);
      expect(session.session_token).toBe('unique_session_token');
      expect(session.expires_at).toBeInstanceOf(Date);
      expect(session.expires_at.getTime()).toBeGreaterThan(Date.now());
    });

    it('should validate CreateSessionInput structure', () => {
      const userId = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const createSessionInput: CreateSessionInput = {
        user_id: userId,
        session_token: 'unique_session_token',
        expires_at: expiresAt,
      };

      expect(createSessionInput.user_id).toBe(userId);
      expect(createSessionInput.session_token).toBe('unique_session_token');
      expect(createSessionInput.expires_at).toBe(expiresAt);
    });
  });

  describe('Enum Validations', () => {
    it('should validate all political perspectives', () => {
      const perspectives = Object.values(PoliticalPerspective);
      expect(perspectives).toContain('conservative');
      expect(perspectives).toContain('liberal');
      expect(perspectives).toContain('democratic');
      expect(perspectives).toContain('progressive');
      expect(perspectives).toContain('neutral');
    });

    it('should validate all writing tones', () => {
      const tones = Object.values(WritingTone);
      expect(tones).toContain('formal');
      expect(tones).toContain('casual');
      expect(tones).toContain('analytical');
      expect(tones).toContain('conversational');
      expect(tones).toContain('professional');
    });

    it('should validate all languages', () => {
      const languages = Object.values(Language);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
      expect(languages).toContain('de');
      expect(languages).toContain('it');
      expect(languages).toContain('pt');
    });

    it('should validate all AI models', () => {
      const models = Object.values(AIModel);
      expect(models).toContain('openai');
      expect(models).toContain('anthropic');
      expect(models).toContain('google');
      expect(models).toContain('grok');
      expect(models).toContain('local');
    });

    it('should validate all propaganda sensitivities', () => {
      const sensitivities = Object.values(PropagandaSensitivity);
      expect(sensitivities).toContain('low');
      expect(sensitivities).toContain('medium');
      expect(sensitivities).toContain('high');
    });
  });
});