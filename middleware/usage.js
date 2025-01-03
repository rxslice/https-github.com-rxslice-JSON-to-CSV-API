const rateLimit = require('express-rate-limit');

    const usagePlans = {
      free: { rateLimit: 100, features: ['basic'] },
      premium: { rateLimit: 1000, features: ['basic', 'advanced', 'priority'] },
      enterprise: { rateLimit: 10000, features: ['basic', 'advanced', 'priority', 'dedicated'] },
    };

    function applyUsagePlan(req, res, next) {
      const plan = req.headers['x-usage-plan'] || 'free';
      const rateLimit = usagePlans[plan]?.rateLimit || usagePlans.free.rateLimit;
      const planLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: rateLimit,
        message: `Too many requests for ${plan} plan, please try again after 15 minutes`,
        handler: (req, res, next, options) => {
          console.warn('Rate limit exceeded for plan', { plan, ip: req.ip });
          res.status(options.statusCode).send(options.message);
        },
      });
      planLimiter(req, res, next);
    }

    module.exports = { applyUsagePlan };
