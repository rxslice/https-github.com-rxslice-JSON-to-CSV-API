const { Pool } = require('pg');

    function setupDatabase(logger) {
      const pool = new Pool({
        user: 'user',
        host: 'localhost',
        database: 'api',
        password: 'password',
        port: 5432,
        max: 100,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 10000,
      });

      pool.on('connect', () => {
        console.log('Connected to PostgreSQL database.');
      });

      // Database initialization
      async function initializeDatabase() {
        const client = await pool.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL
            )
          `);
          await client.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL,
              api_key TEXT UNIQUE NOT NULL,
              hashed_api_key TEXT NOT NULL,
              active BOOLEAN DEFAULT TRUE,
              created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
          `);
          await client.query(`
            CREATE TABLE IF NOT EXISTS usage (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
          `);
          await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
          `);
          await client.query(`
            CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys (api_key);
          `);
          await client.query(`
            CREATE INDEX IF NOT EXISTS idx_usage_user_id ON usage (user_id);
          `);
        } finally {
          client.release();
        }
      }
      initializeDatabase().catch(err => logger.error('Database initialization error:', err));

      return pool;
    }

    module.exports = { setupDatabase };
