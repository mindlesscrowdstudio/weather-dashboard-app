import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';

const router = Router();

router.get('/current/:city', weatherController.getCurrentWeather);
router.get('/forecast/:city', weatherController.getForecast);
router.post('/favorites', weatherController.addFavorite);
router.get('/favorites', weatherController.getFavorites);
router.delete('/favorites/:id', weatherController.deleteFavorite);
router.get('/history', weatherController.getHistory);
export default router;
