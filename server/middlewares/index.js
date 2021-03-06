const handlers = {
  /**
   * Middleware to handle routes that doesnot exists
   */
  notFound: (req, res, next) => {
    res.status(404).json({ Error: 'Not Found' }).end();
    next();
  },

  /**
   * Middleware to handle errors that occur in development env
   */
  developmentErrors: (error, req, res, next) => {
    console.log(error.stack);
    const errorDetails = {
      message: error.message,
      status: error.status,
      Error: error.stack || '',
    };
    res.status(error.status || 500);
    res.format({
      'application/json': () => res.json(errorDetails),
    });
    next();
  },

  /**
   * Middleware to handle errors that occur in production env
   */
  productionErrors: (err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ Error: err.code || 'Internal Server Error' });
    next();
  },
};

module.exports = handlers;
