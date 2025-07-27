// backend/src/server.ts
import dotenv from 'dotenv';
// Load environment variables from .env file BEFORE any other imports
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
