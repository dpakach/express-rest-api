const {
  createUser,
  getUserHandler,
  changePassword,
} = require('../handlers/userHandler');

const userController = {};

/**
 * Handler for creating user
 */
userController.postUser = (req, res) => {
  createUser(req.body, (status = 200, data) => {
    res.status(status).json(data).end();
  });
};

/**
 * Handler for returning one user
 */
userController.getUser = (req, res) => {
  getUserHandler(req.params.id, (status = 200, data) => {
    if (data && req.user === data.username) {
      res.status(status).json(data).end();
    } else {
      res.status(404).end();
    }
  });
};

/**
 * Handler for changing password
 */
userController.postUserPassword = (req, res) => {
  changePassword(req.params.id, req.body, (status = 200, data) => {
    res.status(status).json(data).end();
  });
};

// Export the controller
module.exports = userController;
