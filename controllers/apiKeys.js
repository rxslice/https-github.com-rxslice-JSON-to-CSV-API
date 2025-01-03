const { v4: uuidv4 } = require('uuid');
    const bcrypt = require('bcrypt');

    async function generateApiKey(pool, logger) {
      return async function (req, res) {
        try {
          const apiKey = uuidv4();
          const hashedApiKey = await bcrypt.hash(apiKey, 10);
          const client = await pool.connect();
          try {
            await client.query('INSERT INTO api_keys (user_id, api_key, hashed_api_key) VALUES ($1, $2, $3)', [req.userId, apiKey, hashedApiKey]);
          } finally {
            client.release();
          }
          res.send({ apiKey });
          logger.info('New API key generated', { userId: req.userId, apiKey });
        } catch (err) {
          logger.error('Error generating API key', { error: err.message, userId: req.userId });
          res.status(500).send('Internal server error');
        }
      };
    }

    async function listApiKeys(pool, logger, redisClient) {
      return async function (req, res) {
        const cacheKey = req.cacheKey;
        const cachedData = await redisClient.getCache(cacheKey);
        if (cachedData) {
          logger.info('API keys listed from cache', { userId: req.userId, ip: req.ip });
          return res.send(cachedData);
        }
        const client = await pool.connect();
        try {
          const result = await client.query('SELECT api_key, active, created FROM api_keys WHERE user_id = $1', [req.userId]);
          await redisClient.setCache(cacheKey, result.rows, 60);
          res.send(result.rows);
          logger.info('API keys listed', { userId: req.userId, ip: req.ip });
        } catch (err) {
          logger.error('Error fetching API keys', { error: err.message, userId: req.userId });
          res.status(500).send('Internal server error');
        } finally {
          client.release();
        }
      };
    }

    async function revokeApiKey(pool, logger) {
      return async function (req, res) {
        const apiKey = req.params.apiKey;
        const client = await pool.connect();
        try {
          const result = await client.query('SELECT * FROM api_keys WHERE api_key = $1 AND user_id = $2', [apiKey, req.userId]);
          if (result.rows.length === 0) {
            logger.warn('API key not found for revocation', { apiKey, userId: req.userId, ip: req.ip });
            return res.status(404).send('API key not found');
          }
          await client.query('UPDATE api_keys SET active = false WHERE api_key = $1', [apiKey]);
          res.send('API key revoked');
          logger.info('API key revoked', { apiKey, userId: req.userId, ip: req.ip });
        } catch (err) {
          logger.error('Error revoking API key', { error: err.message, userId: req.userId, apiKey });
          res.status(500).send('Internal server error');
        } finally {
          client.release();
        }
      };
    }

    module.exports = { generateApiKey, listApiKeys, revokeApiKey };
