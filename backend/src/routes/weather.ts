import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';
import { requireUser } from '../middleware/auth';

const router = Router();

// Apply the user requirement middleware to all routes in this file.
// This ensures no controller method is called without a valid user ID.
router.use(requireUser);

router.get('/current/:city', weatherController.getCurrentWeather);
router.get('/forecast/:city', weatherController.getForecast);
router.post('/favorites', weatherController.addFavorite);
router.get('/favorites', weatherController.getFavorites);
router.delete('/favorites/:id', weatherController.deleteFavorite);
router.get('/history', weatherController.getHistory);
export default router;
