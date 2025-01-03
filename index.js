const express = require('express');
    const app = express();
    const port = 3000;

    // Import modules
    const { setupLogger } = require('./utils/logger');
    const { setupDatabase } = require('./utils/database');
    const { setupRedis } = require('./utils/redis');
    const { setupQueue } = require('./utils/queue');
    const { setupMetrics } = require('./utils/metrics');
    const { authenticateApiKey, jwtAuth } = require('./middleware/auth');
    const { applyUsagePlan } = require('./middleware/usage');
    const { apiGateway } = require('./middleware/gateway');
    const { validateJson } = require('./middleware/validation');
    const { registerUser, loginUser, refreshToken } = require('./controllers/auth');
    const { convertJsonToCsv } = require('./controllers/convert');
    const { generateApiKey, listApiKeys, revokeApiKey } = require('./controllers/apiKeys');
    const { healthCheck, metrics } = require('./controllers/health');
    const { setupSwagger } = require('./utils/swagger');
    const { simulateHttps } = require('./middleware/https');
    const { backupDatabase } = require('./utils/backup');
    const { loadBalancer } = require('./middleware/loadBalancer');
    const path = require('path');
    const { streamText } = require('./utils/aiWrapper');

    const API_VERSION = '/v1';

    // Setup
    const logger = setupLogger();
    const pool = setupDatabase(logger);
    const redisClient = setupRedis(logger);
    const csvQueue = setupQueue(redisClient, logger);
    const { apiRequests, apiResponseTime } = setupMetrics();
    setupSwagger(app);

    const corsOptions = {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type,Authorization,x-api-key,x-usage-plan,x-api-version',
    };

    app.use(express.json());
    app.use(require('cors')(corsOptions));
    app.use(express.static(path.join(__dirname, 'public')));

    // Middleware
    app.use(simulateHttps);
    app.use(apiGateway);
    app.use(loadBalancer);

    // Routes
    app.post(`${API_VERSION}/register`, registerUser(pool, logger, redisClient));
    app.post(`${API_VERSION}/login`, loginUser(pool, logger, redisClient));
    app.post(`${API_VERSION}/refresh-token`, refreshToken(logger, redisClient));
    app.post(`${API_VERSION}/convert`, applyUsagePlan, authenticateApiKey(pool, logger), validateJson, convertJsonToCsv(csvQueue, logger, apiRequests, apiResponseTime, streamText));
    app.get(`${API_VERSION}/generate-api-key`, jwtAuth, generateApiKey(pool, logger));
    app.get(`${API_VERSION}/api-keys`, jwtAuth, listApiKeys(pool, logger, redisClient));
    app.delete(`${API_VERSION}/api-keys/:apiKey`, jwtAuth, revokeApiKey(pool, logger));
    app.get('/health', healthCheck);
    app.get('/metrics', metrics);

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Database backup
    setInterval(() => backupDatabase(pool, logger), 24 * 60 * 60 * 1000);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
