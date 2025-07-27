import express from 'express';

import helmet from 'helmet';
import morgan from 'morgan';
import weatherRoutes from './routes/weather';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';

const app = express();
// Add security headers
app.use(helmet());
app.use(morgan('dev'));
// Parse JSON request bodies
// Middleware to parse JSON bodies POST/PUT bodies
app.use(express.json());
// health check endpoint - before any auth middleware
app.use('/health', healthRoutes);

// All API routes are handled here
app.use('/api/weather', weatherRoutes);

// Middleware centralized error.
// By placing it last, it catches all errors from the preceding routes.
app.use(errorHandler);

export default app;
