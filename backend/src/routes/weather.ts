import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';

const router = Router();
router.get('/current/:city', weatherController.getCurrentWeather);

export default router;