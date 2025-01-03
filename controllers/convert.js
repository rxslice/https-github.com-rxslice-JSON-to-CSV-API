const { v4: uuidv4 } = require('uuid');

    function convertJsonToCsv(csvQueue, logger, apiRequests, apiResponseTime, streamText) {
      return async function (req, res) {
        const startTime = Date.now();
        const jsonData = req.body;
        const delimiter = req.query.delimiter || ',';
        const includeHeaders = req.query.includeHeaders !== 'false';
        const options = { header: includeHeaders, delimiter };
        try {
          const jobId = uuidv4();
          await csvQueue.add(jobId, { jsonData, options, userId: req.userId, isSpecial: req.isSpecial });
          res.send({ message: 'CSV conversion started', jobId });
          logger.info('JSON to CSV conversion job added to queue', { userId: req.userId, ip: req.ip, jobId });
        } catch (error) {
          logger.error('Error adding JSON to CSV conversion job to queue', { error, userId: req.userId, ip: req.ip });
          res.status(500).send('Error processing request');
        } finally {
          const duration = (Date.now() - startTime) / 1000;
          apiRequests.inc({ method: req.method, route: req.path, status: res.statusCode });
          apiResponseTime.set({ method: req.method, route: req.path, status: res.statusCode }, duration);
        }
      };
    }

    module.exports = { convertJsonToCsv };
