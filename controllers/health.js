const { register } = require('prom-client');

    function healthCheck(req, res) {
      res.status(200).send('OK');
    }

    async function metrics(req, res) {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    }

    module.exports = { healthCheck, metrics };
