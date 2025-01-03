const redis = require('redis');

    function setupRedis(logger) {
      const redisClient = redis.createClient();
      redisClient.on('error', (err) => logger.error('Redis Client Error', err));
      redisClient.connect();

      redisClient.setCache = async (key, value, expiry = 3600) => {
        try {
          await redisClient.set(key, JSON.stringify(value), { EX: expiry });
        } catch (error) {
          logger.error('Error setting cache', { error, key });
        }
      };

      redisClient.getCache = async (key) => {
        try {
          const value = await redisClient.get(key);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          logger.error('Error getting cache', { error, key });
          return null;
        }
      };

      redisClient.invalidateCache = async (key) => {
        try {
          await redisClient.del(key);
        } catch (error) {
          logger.error('Error invalidating cache', { error, key });
        }
      };

      return redisClient;
    }

    module.exports = { setupRedis };
