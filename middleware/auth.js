const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = 'your-secret-key';

    function authenticateApiKey(pool, logger) {
      return async function (req, res, next) {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
          logger.warn('Unauthorized access attempt: No API key provided', { ip: req.ip });
          return res.status(401).send('Unauthorized: No API key provided');
        }
        const client = await pool.connect();
        try {
          const result = await client.query('SELECT user_id, hashed_api_key, active FROM api_keys WHERE api_key = $1', [apiKey]);
          if (result.rows.length === 0 || !result.rows[0].active || !(await bcrypt.compare(apiKey, result.rows[0].hashed_api_key))) {
            logger.warn('Unauthorized access attempt: Invalid API key', { apiKey, ip: req.ip });
            return res.status(401).send('Unauthorized: Invalid API key');
          }
          req.userId = result.rows[0].user_id;
          next();
        } finally {
          client.release();
        }
      };
    }

    function jwtAuth(req, res, next) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).send('Unauthorized: No token provided');
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
      } catch (error) {
        return res.status(401).send('Unauthorized: Invalid token');
      }
    }

    function generateToken(userId) {
      return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    }

    function verifyToken(token) {
      try {
        return jwt.verify(token, JWT_SECRET);
      } catch (error) {
        return null;
      }
    }

    module.exports = { authenticateApiKey, jwtAuth, generateToken, verifyToken };
