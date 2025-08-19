import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { userPreferencesService } from '../services/userPreferencesService';
import { 
  PoliticalPerspective, 
  WritingTone, 
  Language, 
  AIModel, 
  PropagandaSensitivity 
} from '@ai-news-platform/shared';

const router = Router();

// Validation middleware
const validateUserId = param('userId').isUUID().withMessage('Invalid user ID format');

const validatePreferencesUpdate = [
  body('perspective').optional().isIn(Object.values(PoliticalPerspective)).withMessage('Invalid political perspective'),
  body('tone').optional().isIn(Object.values(WritingTone)).withMessage('Invalid writing tone'),
  body('language').optional().isIn(Object.values(Language)).withMessage('Invalid language'),
  body('aiModel').optional().isIn(Object.values(AIModel)).withMessage('Invalid AI model'),
  body('factCheckingEnabled').optional().isBoolean().withMessage('factCheckingEnabled must be a boolean'),
  body('propagandaDetectionEnabled').optional().isBoolean().withMessage('propagandaDetectionEnabled must be a boolean'),
  body('propagandaSensitivity').optional().isIn(Object.values(PropagandaSensitivity)).withMessage('Invalid propaganda sensitivity')
];

const validateContentFiltersUpdate = [
  body('includedTopics').optional().isArray().withMessage('includedTopics must be an array'),
  body('includedTopics.*').optional().isString().withMessage('includedTopics items must be strings'),
  body('excludedTopics').optional().isArray().withMessage('excludedTopics must be an array'),
  body('excludedTopics.*').optional().isString().withMessage('excludedTopics items must be strings'),
  body('includedPeople').optional().isArray().withMessage('includedPeople must be an array'),
  body('includedPeople.*').optional().isString().withMessage('includedPeople items must be strings'),
  body('excludedPeople').optional().isArray().withMessage('excludedPeople must be an array'),
  body('excludedPeople.*').optional().isString().withMessage('excludedPeople items must be strings'),
  body('includedOrganizations').optional().isArray().withMessage('includedOrganizations must be an array'),
  body('includedOrganizations.*').optional().isString().withMessage('includedOrganizations items must be strings'),
  body('excludedOrganizations').optional().isArray().withMessage('excludedOrganizations must be an array'),
  body('excludedOrganizations.*').optional().isString().withMessage('excludedOrganizations items must be strings')
];

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return null;
};

/**
 * GET /api/v1/users/:userId/preferences
 * Get user preferences
 */
router.get('/:userId', validateUserId, async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { userId } = req.params;
    const sessionId = req.headers['session-id'] as string;

    // Use merged preferences if session ID is provided
    const result = sessionId 
      ? await userPreferencesService.getMergedPreferences(userId, sessionId)
      : await userPreferencesService.getUserPreferences(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to retrieve preferences',
        details: result.errors
      });
    }

    if (!result.data) {
      return res.status(404).json({
        success: false,
        error: 'User preferences not found',
        message: 'No preferences have been set for this user'
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve user preferences'
    });
  }
});

/**
 * POST /api/v1/users/:userId/preferences
 * Create user preferences
 */
router.post('/:userId', [validateUserId, ...validatePreferencesUpdate], async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { userId } = req.params;
    const preferencesInput = req.body;

    // Convert API format to database format
    const dbFormat = {
      perspective: preferencesInput.perspective,
      tone: preferencesInput.tone,
      language: preferencesInput.language,
      ai_model: preferencesInput.aiModel,
      fact_checking_enabled: preferencesInput.factCheckingEnabled,
      propaganda_detection_enabled: preferencesInput.propagandaDetectionEnabled,
      propaganda_sensitivity: preferencesInput.propagandaSensitivity
    };

    const filtersFormat = preferencesInput.contentFilters ? {
      included_topics: preferencesInput.contentFilters.includedTopics,
      excluded_topics: preferencesInput.contentFilters.excludedTopics,
      included_people: preferencesInput.contentFilters.includedPeople,
      excluded_people: preferencesInput.contentFilters.excludedPeople,
      included_organizations: preferencesInput.contentFilters.includedOrganizations,
      excluded_organizations: preferencesInput.contentFilters.excludedOrganizations
    } : undefined;

    const result = await userPreferencesService.createUserPreferences(userId, dbFormat, filtersFormat);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create preferences',
        details: result.errors
      });
    }

    res.status(201).json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create user preferences'
    });
  }
});

/**
 * PUT /api/v1/users/:userId/preferences
 * Update user preferences
 */
router.put('/:userId', [validateUserId, ...validatePreferencesUpdate], async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { userId } = req.params;
    const updates = req.body;

    // Convert API format to database format
    const dbFormat = {
      ...(updates.perspective && { perspective: updates.perspective }),
      ...(updates.tone && { tone: updates.tone }),
      ...(updates.language && { language: updates.language }),
      ...(updates.aiModel && { ai_model: updates.aiModel }),
      ...(updates.factCheckingEnabled !== undefined && { fact_checking_enabled: updates.factCheckingEnabled }),
      ...(updates.propagandaDetectionEnabled !== undefined && { propaganda_detection_enabled: updates.propagandaDetectionEnabled }),
      ...(updates.propagandaSensitivity && { propaganda_sensitivity: updates.propagandaSensitivity })
    };

    const result = await userPreferencesService.updateUserPreferences(userId, dbFormat);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update preferences',
        details: result.errors
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update user preferences'
    });
  }
});

/**
 * PUT /api/v1/users/:userId/preferences/filters
 * Update user content filters
 */
router.put('/:userId/filters', [validateUserId, ...validateContentFiltersUpdate], async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { userId } = req.params;
    const updates = req.body;

    // Convert API format to database format
    const dbFormat = {
      ...(updates.includedTopics && { included_topics: updates.includedTopics }),
      ...(updates.excludedTopics && { excluded_topics: updates.excludedTopics }),
      ...(updates.includedPeople && { included_people: updates.includedPeople }),
      ...(updates.excludedPeople && { excluded_people: updates.excludedPeople }),
      ...(updates.includedOrganizations && { included_organizations: updates.includedOrganizations }),
      ...(updates.excludedOrganizations && { excluded_organizations: updates.excludedOrganizations })
    };

    const result = await userPreferencesService.updateUserContentFilters(userId, dbFormat);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update content filters',
        details: result.errors
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update content filters'
    });
  }
});

/**
 * PUT /api/v1/users/:userId/preferences/perspective
 * Update user perspective setting
 */
router.put('/:userId/perspective', [
  validateUserId,
  body('perspective').isIn(Object.values(PoliticalPerspective)).withMessage('Invalid political perspective')
], async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { userId } = req.params;
    const { perspective } = req.body;

    const result = await userPreferencesService.updatePerspective(userId, perspective);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update perspective',
        details: result.errors
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update user perspective'
    });
  }
});

/**
 * PUT /api/v1/users/:userId/preferences/tone
 * Update user tone setting
 */
router.put('/:userId/tone', [
  validateUserId,
  body('tone').isIn(Object.values(WritingTone)).withMessage('Invalid writing tone')
], async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { userId } = req.params;
    const { tone } = req.body;

    const result = await userPreferencesService.updateTone(userId, tone);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update tone',
        details: result.errors
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update user tone'
    });
  }
});

/**
 * PUT /api/v1/users/:userId/preferences/language
 * Update user language setting
 */
router.put('/:userId/language', [
  validateUserId,
  body('language').isIn(Object.values(Language)).withMessage('Invalid language')
], async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { userId } = req.params;
    const { language } = req.body;

    const result = await userPreferencesService.updateLanguage(userId, language);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update language',
        details: result.errors
      });
    }

    res.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update user language'
    });
  }
});

/**
 * DELETE /api/v1/users/:userId/preferences
 * Delete user preferences
 */
router.delete('/:userId', validateUserId, async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const { userId } = req.params;

    const result = await userPreferencesService.deleteUserPreferences(userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to delete preferences',
        details: result.errors
      });
    }

    res.json({
      success: true,
      data: { deleted: result.data },
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete user preferences'
    });
  }
});

/**
 * POST /api/v1/users/:userId/preferences/session
 * Store session-based preferences
 */
router.post('/:userId/session', [validateUserId, ...validatePreferencesUpdate], async (req: Request, res: Response) => {
  const validationError = handleValidationErrors(req, res);
  if (validationError) return;

  try {
    const sessionId = req.headers['session-id'] as string;
    const preferences = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID required',
        message: 'Session-ID header is required for session-based preferences'
      });
    }

    userPreferencesService.storeSessionPreferences(sessionId, preferences);

    res.json({
      success: true,
      message: 'Session preferences stored successfully',
      data: { sessionId, stored: true }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to store session preferences'
    });
  }
});

export default router;