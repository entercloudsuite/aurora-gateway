export const RedisClient = require('redis').createClient(
  process.env.REDIS_PORT, process.env.REDIS_HOST
);