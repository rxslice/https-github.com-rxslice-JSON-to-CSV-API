function simulateHttps(req, res, next) {
      if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== 'development') {
        return res.status(403).send('HTTPS required');
      }
      next();
    }

    module.exports = { simulateHttps };
