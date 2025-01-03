const axios = require('axios');

    const instances = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ];

    let currentInstance = 0;
    let failedInstances = new Set();

    function loadBalancer(req, res, next) {
      const tryRequest = (instanceIndex) => {
        const instance = instances[instanceIndex];
        req.loadBalancerInstance = instance;

        if (req.path === '/health' || req.path === '/metrics' || req.path === '/' || req.path.startsWith('/api-docs')) {
          next();
          return;
        }

        axios({
          method: req.method,
          url: `${instance}${req.url}`,
          headers: req.headers,
          data: req.body,
        })
          .then((response) => {
            res.status(response.status).send(response.data);
          })
          .catch((error) => {
            console.error(`Error forwarding request to ${instance}`, error);
            failedInstances.add(instanceIndex);

            if (failedInstances.size < instances.length) {
              tryRequest((instanceIndex + 1) % instances.length);
            } else {
              failedInstances.clear();
              res.status(500).send('Error forwarding request');
            }
          });
      };

      tryRequest(currentInstance);
      currentInstance = (currentInstance + 1) % instances.length;
    }

    module.exports = { loadBalancer };
