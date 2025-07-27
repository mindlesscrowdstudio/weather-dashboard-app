 /**
   * Helth check route 
 */
import { Router } from 'express';
import { healthController } from '../controllers/healthController';
import { asyncHandler } from '../utils/asyncHandlerUtility';

const router = Router();

router.get('/', asyncHandler(healthController.check));

export default router;

