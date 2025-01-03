const request = require('supertest');
    const app = require('../index.js');

    describe('End-to-End Tests', () => {
      it('should register, login, generate API key, and convert JSON to CSV', async () => {
        // Register a user
        const registerResponse = await request(app)
          .post('/v1/register')
          .send({ username: 'e2euser', password: 'e2epassword' });
        expect(registerResponse.statusCode).toBe(201);
        const token = registerResponse.body.token;

        // Login the user
        const loginResponse = await request(app)
          .post('/v1/login')
          .send({ username: 'e2euser', password: 'e2epassword' });
        expect(loginResponse.statusCode).toBe(200);

        // Generate an API key
        const apiKeyResponse = await request(app)
          .get('/v1/generate-api-key')
          .set('Authorization', `Bearer ${token}`);
        expect(apiKeyResponse.statusCode).toBe(200);
        const apiKey = apiKeyResponse.body.apiKey;

        // Convert JSON to CSV
        const convertResponse = await request(app)
          .post('/v1/convert')
          .set('x-api-key', apiKey)
          .send([{ a: 1, b: 2 }]);
        expect(convertResponse.statusCode).toBe(200);
        expect(convertResponse.body).toHaveProperty('message');
      });
    });
