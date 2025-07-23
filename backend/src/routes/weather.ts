import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';

const router = Router();

router.get('/current/:city', weatherController.getCurrentWeather);
router.get('/forecast/:city', weatherController.getForecast);
router.post('/favorites', weatherController.addFavorite);
export default router;