import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    // Stop retrying after 3 attempts in development to keep logs clean
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  }
});

redisConnection.on('error', (err) => {
  // Silent error for redis to keep logs clean in dev
  if (process.env.NODE_ENV !== 'production') {
    // console.log('Redis connection skipped or failed');
  }
});

export default redisConnection;
