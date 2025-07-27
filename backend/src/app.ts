import express from 'express';
import weatherRoutes from './routes/weather';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Middleware to parse JSON bodies POST/PUT bodies
app.use(express.json());

// All API routes are handled here
app.use('/api/weather', weatherRoutes);

// By placing it last, it catches all errors from the preceding routes.
app.use(errorHandler);

export default app;
