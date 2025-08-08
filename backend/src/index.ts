import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/database';
import { validateEnv } from './config';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

// Validate environment variables
const config = validateEnv();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
});

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(limiter);
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes with versioning
app.use('/api/v1', apiRoutes);

// Legacy health check endpoint for backwards compatibility
app.get('/health', (_req, res) => {
  res.redirect('/api/v1/health');
});

// Catch-all for undefined routes
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    message: 'Please check the API documentation for available endpoints.',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`💾 Database: Connected to PostgreSQL`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await disconnectDB();
  process.exit(0);
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`🚀 Server running on port ${config.port}`);
    console.log(`📖 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${config.port}/api/v1/health`);
    console.log(`🔗 API: http://localhost:${config.port}/api/v1`);
  });
}

startServer();

export default app;