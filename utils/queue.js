const { Queue, Worker } = require('bullmq');
    const { json2csv } = require('json2csv');

    function setupQueue(redisClient, logger) {
      const csvQueue = new Queue('csv-conversion', { connection: redisClient });

      const csvWorker = new Worker('csv-conversion', async (job) => {
        const { jsonData, options, userId, isSpecial } = job.data;
        try {
          const csv = json2csv(jsonData, options);
          // Simulate database usage
          logger.info('JSON to CSV conversion successful', { userId, jobId: job.id, isSpecial });
          return csv;
        } catch (error) {
          logger.error('Error converting JSON to CSV in background', { error, userId, jobId: job.id });
          throw error;
        }
      }, { connection: redisClient, concurrency: 5,
        limiter: {
          max: 100,
          duration: 5000,
        },
        removeOnComplete: true,
        removeOnFail: 500,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        attempts: 3,
      });

      csvWorker.on('failed', (job, err) => {
        logger.error('Job failed', { jobId: job.id, error: err.message });
      });

      csvWorker.on('error', (err) => {
        logger.error('Worker error', { error: err.message });
      });

      return csvQueue;
    }

    module.exports = { setupQueue };
