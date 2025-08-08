import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

export default router;