const handlers = {
  notFound: (req, res, next) => {
    res.status(404).json({Error: "Not Found"}).end()
  },

  developmentErrors: (error, req, res, next) => {
    error.stack = error.stack || '';
    console.log(error.stack)
    const errorDetails = {
      message: error.message,
      status: error.status,
      Error: error.stack
    };
    res.status(error.status || 500)
    res.format({
      'application/json': () => res.json(errorDetails)
    });
    next();
  },

  productionErrors: (err, req, res, next) => {
    res.status(err.status || 500)
    res.json({Error: "Internal Server Error"})
    next();
  }
}

module.exports = handlers
