import { Router } from 'express';
import healthRoutes from './health';
import apiRoutes from './api';
import userPreferencesRoutes from './userPreferences';

const router = Router();

// API v1 routes
router.use('/', apiRoutes);
router.use('/health', healthRoutes);
router.use('/users', userPreferencesRoutes);

export default router;