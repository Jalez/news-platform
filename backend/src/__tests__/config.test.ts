import { validateEnv } from '../config';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnv', () => {
    it('should return default configuration', () => {
      // Set NODE_ENV to development for this test
      process.env.NODE_ENV = 'development';
      
      const config = validateEnv();

      expect(config.port).toBe(3000);
      expect(config.nodeEnv).toBe('development');
      expect(config.corsOrigin).toBe('*');
      expect(config.rateLimitWindowMs).toBe(900000);
      expect(config.rateLimitMax).toBe(100);
    });

    it('should parse environment variables correctly', () => {
      process.env.PORT = '8080';
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGIN = 'https://example.com';
      process.env.RATE_LIMIT_WINDOW_MS = '600000';
      process.env.RATE_LIMIT_MAX = '50';

      const config = validateEnv();

      expect(config.port).toBe(8080);
      expect(config.nodeEnv).toBe('production');
      expect(config.corsOrigin).toBe('https://example.com');
      expect(config.rateLimitWindowMs).toBe(600000);
      expect(config.rateLimitMax).toBe(50);
    });

    it('should throw error for invalid PORT', () => {
      process.env.PORT = 'invalid';

      expect(() => validateEnv()).toThrow('Invalid PORT environment variable');
    });

    it('should throw error for invalid NODE_ENV', () => {
      process.env.NODE_ENV = 'invalid';

      expect(() => validateEnv()).toThrow('Invalid NODE_ENV environment variable');
    });
  });
});