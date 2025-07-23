import express from 'express';
import weatherRoutes from './routes/weather';

const app = express();

app.use('/api/weather', weatherRoutes);

export default app;
