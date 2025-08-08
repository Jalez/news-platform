import { Router } from 'express';
import healthRoutes from './health';
import apiRoutes from './api';

const router = Router();

// API v1 routes
router.use('/', apiRoutes);
router.use('/health', healthRoutes);

export default router;