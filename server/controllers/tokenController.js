const {
  createToken,
  extendToken,
  removeToken,
  getTokenHandler,
} = require('../handlers/tokenHandlers');

const tokenController = {};

/**
 * Handler for creating user
 */
tokenController.postToken = (req, res) => {
  createToken(req.body, (status = 200, data) => {
    res.status(status).json(data).end();
  });
};

/**
 * Handler for returning one user
 */
tokenController.getToken = (req, res) => {
  getTokenHandler(req.params.id, (status = 200, data) => {
    res.status(status).json(data).end();
  });
};

/**
 * Handler for changing password
 */
tokenController.deleteToken = (req, res) => {
  removeToken(req.params.id, (status = 200, data) => {
    res.status(status).json(data).end();
  });
};

/**
 * Handler for extending token
 */
tokenController.putToken = (req, res) => {
  extendToken(req.params.id, (status = 200, data) => {
    res.status(status).json(data).end();
  });
};

// Export the controller
module.exports = tokenController;
