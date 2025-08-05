// Common types and interfaces shared between frontend and backend

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Enum types
export enum PoliticalPerspective {
  CONSERVATIVE = 'conservative',
  LIBERAL = 'liberal',
  DEMOCRATIC = 'democratic',
  PROGRESSIVE = 'progressive',
  NEUTRAL = 'neutral'
}

export enum WritingTone {
  FORMAL = 'formal',
  CASUAL = 'casual',
  ANALYTICAL = 'analytical',
  CONVERSATIONAL = 'conversational',
  PROFESSIONAL = 'professional'
}

export enum Language {
  EN = 'en',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  IT = 'it',
  PT = 'pt'
}

export enum AIModel {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  GROK = 'grok',
  LOCAL = 'local'
}

export enum NewsCategory {
  POLITICS = 'politics',
  TECHNOLOGY = 'technology',
  BUSINESS = 'business',
  SPORTS = 'sports',
  ENTERTAINMENT = 'entertainment',
  HEALTH = 'health',
  SCIENCE = 'science'
}

export enum PropagandaSensitivity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Base interfaces that match OpenAPI schema
export interface BaseUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaseUserPreferences {
  perspective: PoliticalPerspective;
  tone: WritingTone;
  language: Language;
  aiModel: AIModel;
  factCheckingEnabled: boolean;
  propagandaDetectionEnabled: boolean;
  propagandaSensitivity: PropagandaSensitivity;
  contentFilters: ContentFilters;
}

export interface ContentFilters {
  includedTopics: string[];
  excludedTopics: string[];
  includedPeople: string[];
  excludedPeople: string[];
  includedOrganizations: string[];
  excludedOrganizations: string[];
}

export interface BaseNewsTopic {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  trending: boolean;
  publishedAt: string;
  sources: string[];
}

// Error handling
export interface APIError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Validation helpers
export const isValidPerspective = (value: string): value is PoliticalPerspective => {
  return Object.values(PoliticalPerspective).includes(value as PoliticalPerspective);
};

export const isValidTone = (value: string): value is WritingTone => {
  return Object.values(WritingTone).includes(value as WritingTone);
};

export const isValidLanguage = (value: string): value is Language => {
  return Object.values(Language).includes(value as Language);
};

export const isValidAIModel = (value: string): value is AIModel => {
  return Object.values(AIModel).includes(value as AIModel);
};

export const isValidNewsCategory = (value: string): value is NewsCategory => {
  return Object.values(NewsCategory).includes(value as NewsCategory);
};