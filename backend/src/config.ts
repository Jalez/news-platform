export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export function validateEnv(): AppConfig {
  const port = parseInt(process.env.PORT || '3000', 10);
  const nodeEnv = (process.env.NODE_ENV || 'development') as AppConfig['nodeEnv'];
  const corsOrigin = process.env.CORS_ORIGIN || '*';
  const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

  if (isNaN(port) || port <= 0) {
    throw new Error('Invalid PORT environment variable');
  }

  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error('Invalid NODE_ENV environment variable');
  }

  return {
    port,
    nodeEnv,
    corsOrigin,
    rateLimitWindowMs,
    rateLimitMax,
  };
}