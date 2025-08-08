import { 
  PoliticalPerspective, 
  WritingTone, 
  Language, 
  AIModel, 
  PropagandaSensitivity 
} from '@ai-news-platform/shared';

// Database model for users table
export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

// Database model for user_preferences table
export interface UserPreferences {
  id: string;
  user_id: string;
  perspective: PoliticalPerspective;
  tone: WritingTone;
  language: Language;
  ai_model: AIModel;
  fact_checking_enabled: boolean;
  propaganda_detection_enabled: boolean;
  propaganda_sensitivity: PropagandaSensitivity;
  created_at: Date;
  updated_at: Date;
}

// Database model for content_filters table
export interface ContentFilters {
  id: string;
  user_id: string;
  included_topics: string[];
  excluded_topics: string[];
  included_people: string[];
  excluded_people: string[];
  included_organizations: string[];
  excluded_organizations: string[];
  created_at: Date;
  updated_at: Date;
}

// Database model for sessions table
export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

// Input types for creating new records (without generated fields)
export interface CreateUserInput {
  email: string;
  username: string;
  password_hash: string;
}

export interface CreateUserPreferencesInput {
  user_id: string;
  perspective?: PoliticalPerspective;
  tone?: WritingTone;
  language?: Language;
  ai_model?: AIModel;
  fact_checking_enabled?: boolean;
  propaganda_detection_enabled?: boolean;
  propaganda_sensitivity?: PropagandaSensitivity;
}

export interface CreateContentFiltersInput {
  user_id: string;
  included_topics?: string[];
  excluded_topics?: string[];
  included_people?: string[];
  excluded_people?: string[];
  included_organizations?: string[];
  excluded_organizations?: string[];
}

export interface CreateSessionInput {
  user_id: string;
  session_token: string;
  expires_at: Date;
}

// Update types (all fields optional except ID)
export interface UpdateUserPreferencesInput {
  perspective?: PoliticalPerspective;
  tone?: WritingTone;
  language?: Language;
  ai_model?: AIModel;
  fact_checking_enabled?: boolean;
  propaganda_detection_enabled?: boolean;
  propaganda_sensitivity?: PropagandaSensitivity;
}

export interface UpdateContentFiltersInput {
  included_topics?: string[];
  excluded_topics?: string[];
  included_people?: string[];
  excluded_people?: string[];
  included_organizations?: string[];
  excluded_organizations?: string[];
}