import express from 'express';
import weatherRoutes from './routes/weather';

const app = express();

// Middleware to parse JSON bodies POST/PUT bodies
app.use(express.json());

app.use('/api/weather', weatherRoutes);

export default app;
