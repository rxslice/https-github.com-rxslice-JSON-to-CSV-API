const winston = require('winston');

    function setupLogger() {
      return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ filename: 'combined.log' }),
        ],
      });
    }

    module.exports = { setupLogger };
