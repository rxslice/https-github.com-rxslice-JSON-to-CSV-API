const swaggerUi = require('swagger-ui-express');
    const swaggerJsdoc = require('swagger-jsdoc');

    function setupSwagger(app) {
      const swaggerOptions = {
        swaggerDefinition: {
          openapi: '3.0.0',
          info: {
            title: 'JSON to CSV API',
            version: '2.1.0',
            description: 'Finalized Enterprise-Grade JSON to CSV API',
          },
          components: {
            securitySchemes: {
              apiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'x-api-key',
              },
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
            },
          },
          security: [{ apiKeyAuth: [] }, { bearerAuth: [] }],
        },
        apis: ['index.js', './controllers/*.js'],
      };

      const swaggerDocs = swaggerJsdoc(swaggerOptions);
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    }

    module.exports = { setupSwagger };
