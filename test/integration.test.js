const request = require('supertest');
    const app = require('../index.js');

    describe('Integration Tests', () => {
      let apiKey;
      let token;

      beforeAll(async () => {
        // Register a user
        const registerResponse = await request(app)
          .post('/v1/register')
          .send({ username: 'integrationuser', password: 'integrationpassword' });
        expect(registerResponse.statusCode).toBe(201);
        token = registerResponse.body.token;

        // Login the user
        const loginResponse = await request(app)
          .post('/v1/login')
          .send({ username: 'integrationuser', password: 'integrationpassword' });
        expect(loginResponse.statusCode).toBe(200);
        token = loginResponse.body.token;

        // Generate an API key
        const apiKeyResponse = await request(app)
          .get('/v1/generate-api-key')
          .set('Authorization', `Bearer ${token}`);
        expect(apiKeyResponse.statusCode).toBe(200);
        apiKey = apiKeyResponse.body.apiKey;
      });

      it('should convert JSON to CSV with a valid API key', async () => {
        const response = await request(app)
          .post('/v1/convert')
          .set('x-api-key', apiKey)
          .send([{ a: 1, b: 2 }]);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('message');
      });
    });
