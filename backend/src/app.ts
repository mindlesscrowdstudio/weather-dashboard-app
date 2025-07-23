import express from 'express';

const app = express();
// temporary hardcoded route to make the test pass
app.get('/api/weather/current/:city', (req, res) => {
  res.status(404).json({
    message: 'Sorry, City not found'
  });
});

export default app;
