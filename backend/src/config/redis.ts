import Redis from 'ioredis';

// Get Redis URL from environment variables or use the default for Docker
const redisUrl = process.env.REDIS_URL || 'redis://redis-cache:6379';

console.log(`Attempting to connect to Redis at ${redisUrl}`);

const redisClient = new Redis(redisUrl);

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redisClient;