const { collectDefaultMetrics, Gauge } = require('prom-client');

    function setupMetrics() {
      collectDefaultMetrics();
      const apiRequests = new Gauge({
        name: 'api_requests_total',
        help: 'Total number of API requests',
        labelNames: ['method', 'route', 'status'],
      });
      const apiResponseTime = new Gauge({
        name: 'api_response_time_seconds',
        help: 'API response time in seconds',
        labelNames: ['method', 'route', 'status'],
      });
      return { apiRequests, apiResponseTime };
    }

    module.exports = { setupMetrics };
