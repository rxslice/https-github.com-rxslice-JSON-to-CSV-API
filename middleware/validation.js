const Joi = require('joi');
    const { body, query, header, validationResult } = require('express-validator');

    const jsonSchema = Joi.array().items(Joi.object()).required();

    function validateJson(req, res, next) {
      const { error } = jsonSchema.validate(req.body);
      if (error) {
        console.error('Invalid JSON input', { error: error.details });
        return res.status(400).send(`Invalid JSON data: ${error.details.map(d => d.message).join(', ')}`);
      }
      next();
    }

    module.exports = { validateJson };
