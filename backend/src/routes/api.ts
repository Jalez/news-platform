import { Router } from 'express';

const router = Router();

// Main API endpoint
router.get('/', (_req, res) => {
  res.json({
    message: 'AI News Platform API v1',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/api/v1/health',
      docs: '/api/v1/docs',
    },
  });
});

export default router;